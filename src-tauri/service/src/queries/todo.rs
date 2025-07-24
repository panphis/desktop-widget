use sea_orm::*;
use crate::entities::{todos, Todos};
use crate::models::{todo::{TodoCreate, TodoUpdate, TodoResponse, TodoFilter}};
use chrono::{DateTime, Utc};

pub async fn get_all_todos(db: &DatabaseConnection) -> Result<Vec<TodoResponse>, DbErr> {
    let todos = Todos::find()
        .all(db)
        .await?;
    
    Ok(todos.into_iter().map(TodoResponse::from).collect())
}

pub async fn get_todo_by_id(db: &DatabaseConnection, id: i32) -> Result<Option<TodoResponse>, DbErr> {
    let todo = Todos::find_by_id(id)
        .one(db)
        .await?;
    
    Ok(todo.map(TodoResponse::from))
}

pub async fn create_todo(db: &DatabaseConnection, todo_data: TodoCreate) -> Result<TodoResponse, DbErr> {
    let todo = todos::ActiveModel {
        title: Set(todo_data.title),
        description: Set(todo_data.description),
        start_date: Set(todo_data.start_date),
        end_date: Set(todo_data.end_date),
        color: Set(todo_data.color),
        status: Set(Some(todo_data.status.unwrap_or("todo".to_string()))),
        ..Default::default()
    };

    let todo = todo.insert(db).await?;
    Ok(TodoResponse::from(todo))
}

pub async fn update_todo(db: &DatabaseConnection, id: i32, todo_data: TodoUpdate) -> Result<Option<TodoResponse>, DbErr> {
    let todo = Todos::find_by_id(id)
        .one(db)
        .await?;

    if let Some(todo) = todo {
        let mut todo: todos::ActiveModel = todo.into();
        
        if let Some(title) = todo_data.title {
            todo.title = Set(title);
        }
        if let Some(description) = todo_data.description {
            todo.description = Set(Some(description));
        }
        if let Some(start_date) = todo_data.start_date {
            todo.start_date = Set(Some(start_date));
        }
        if let Some(end_date) = todo_data.end_date {
            todo.end_date = Set(Some(end_date));
        }
        if let Some(color) = todo_data.color {
            todo.color = Set(Some(color));
        }
        if let Some(status) = todo_data.status {
            todo.status = Set(Some(status));
        }
        

        let todo = todo.update(db).await?;
        Ok(Some(TodoResponse::from(todo)))
    } else {
        Ok(None)
    }
}

pub async fn delete_todo(db: &DatabaseConnection, id: i32) -> Result<bool, DbErr> {
    let todo = Todos::find_by_id(id)
        .one(db)
        .await?;

    if let Some(todo) = todo {
        let todo: todos::ActiveModel = todo.into();
        todo.delete(db).await?;
        Ok(true)
    } else {
        Ok(false)
    }
}

// 删除 toggle_todo_completion 函数，因为新的数据库结构没有 completed 字段

// 从旧版本迁移的事件查询功能

/// 时间范围查询 - 查找与指定时间范围重叠的所有待办事项
pub async fn get_todos_by_date_range(db: &DatabaseConnection, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<TodoResponse>, DbErr> {
    let start_str = start.to_rfc3339();
    let end_str = end.to_rfc3339();
    
    let todos = Todos::find()
        .filter(
            todos::Column::StartDate.gte(start_str.clone())
                .and(todos::Column::StartDate.lte(end_str.clone()))
                .or(todos::Column::EndDate.gte(start_str.clone())
                    .and(todos::Column::EndDate.lte(end_str.clone())))
                .or(todos::Column::StartDate.lte(start_str.clone())
                    .and(todos::Column::EndDate.gte(end_str.clone())))
                .or(todos::Column::StartDate.gte(start_str)
                    .and(todos::Column::EndDate.lte(end_str)))
        )
        .order_by_asc(todos::Column::StartDate)
        .all(db)
        .await?;
    
    Ok(todos.into_iter().map(TodoResponse::from).collect())
}

/// 获取指定日期的待办事项
pub async fn get_todos_by_date(db: &DatabaseConnection, date: DateTime<Utc>) -> Result<Vec<TodoResponse>, DbErr> {
    let start_of_day = date.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let end_of_day = date.date_naive().and_hms_opt(23, 59, 59).unwrap();
    
    let start_date = DateTime::from_naive_utc_and_offset(start_of_day, Utc);
    let end_date = DateTime::from_naive_utc_and_offset(end_of_day, Utc);
    
    get_todos_by_date_range(db, start_date, end_date).await
}

/// 搜索待办事项
pub async fn search_todos(db: &DatabaseConnection, query: &str) -> Result<Vec<TodoResponse>, DbErr> {
    let search_pattern = format!("%{}%", query);
    
    let todos = Todos::find()
        .filter(
            todos::Column::Title.like(search_pattern.clone())
                .or(todos::Column::Description.like(search_pattern))
        )
        .order_by_asc(todos::Column::StartDate)
        .all(db)
        .await?;
    
    Ok(todos.into_iter().map(TodoResponse::from).collect())
}

/// 获取最近创建的待办事项
pub async fn get_recent_todos(db: &DatabaseConnection, limit_count: u64) -> Result<Vec<TodoResponse>, DbErr> {
    let todos = Todos::find()
        .limit(limit_count)
        .all(db)
        .await?;
    
    Ok(todos.into_iter().map(TodoResponse::from).collect())
}

/// 获取即将到来的待办事项
pub async fn get_upcoming_todos(db: &DatabaseConnection, limit_count: u64) -> Result<Vec<TodoResponse>, DbErr> {
    
        // 获取今天当天和未来 24 小时内将要发生的待办事项
        // 只要事件的结束时间与当前时间到未来 24 小时有交集的都算进去
        // 例如：现在时间是五点，某个待办事件开始时间是四点，结束时间是六点，也会被统计进去
        // 7.23 8:00-7.23 10:00
        // 7.23 23:00-7.24 1:00
        // 7.24 8:00-7.24 10:00
        // 7.24 19:00-7.25 1:00
        // 7.25 19:00-7.25 1:00

        //  符合条件的只有 7.23 23:00-7.24 1:00  7.24 8:00-7.24 10:00  7.24 19:00-7.25 1:00 这几条数据
    // 按照注释修改查询条件：只要事件的结束时间与当前时间到未来 24 小时有交集的都算进去
    use chrono::Duration;

    let now_dt = Utc::now();
    let start_dt = now_dt.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let next_24h_dt = now_dt + Duration::hours(24);

    let todos = Todos::find()
        .filter(
            // 只要事件的结束时间与当前时间到未来 24 小时有交集
            // 即：事件的开始时间小于等于未来24小时，且结束时间大于等于当前时间
            todos::Column::StartDate.lte(next_24h_dt)
                .and(todos::Column::EndDate.gte(start_dt))
        )
        .order_by_asc(todos::Column::StartDate)
        .limit(limit_count)
        .all(db)
        .await?;

    Ok(todos.into_iter().map(TodoResponse::from).collect())
}


/// 使用过滤器查询待办事项
pub async fn get_todos_with_filter(db: &DatabaseConnection, filter: &TodoFilter) -> Result<Vec<TodoResponse>, DbErr> {
    let mut query = Todos::find();
    
    // 应用日期范围过滤
    if let (Some(start), Some(end)) = (filter.start_date.as_ref(), filter.end_date.as_ref()) {
        // 假设 start 和 end 都是 String，需要先解析为 DateTime<Utc>
        if let (Ok(start_dt), Ok(end_dt)) = (
            DateTime::parse_from_rfc3339(start).map(|dt| dt.with_timezone(&Utc)),
            DateTime::parse_from_rfc3339(end).map(|dt| dt.with_timezone(&Utc)),
        ) {
            query = query.filter(
                todos::Column::StartDate.gte(start_dt)
                    .and(todos::Column::StartDate.lte(end_dt))
                    .or(
                        todos::Column::EndDate.gte(start_dt)
                            .and(todos::Column::EndDate.lte(end_dt))
                    )
                    .or(
                        todos::Column::StartDate.lte(start_dt)
                            .and(todos::Column::EndDate.gte(end_dt))
                    )
                    .or(
                        todos::Column::StartDate.gte(start_dt)
                            .and(todos::Column::EndDate.lte(end_dt))
                    )
            );
        }
    }
    // 应用搜索过滤
    if let Some(ref search) = filter.search_query {
        let search_pattern = format!("%{}%", search);
        query = query.filter(
            todos::Column::Title.like(search_pattern.clone())
                .or(todos::Column::Description.like(search_pattern))
        );
    }

    // 应用排序
    query = query.order_by_asc(todos::Column::StartDate);
    
    // 应用分页
    if let Some(limit_val) = filter.limit {
        query = query.limit(limit_val);
    }
    
    if let Some(offset_val) = filter.offset {
        query = query.offset(offset_val);
    }
    
    let todos = query.all(db).await?;
    Ok(todos.into_iter().map(TodoResponse::from).collect())
}

/// 清理已删除的待办事项
pub async fn cleanup_deleted_todos(db: &DatabaseConnection) -> Result<u64, DbErr> {
    let result = Todos::delete_many()
        .exec(db)
        .await?;
    
    Ok(result.rows_affected)
} 