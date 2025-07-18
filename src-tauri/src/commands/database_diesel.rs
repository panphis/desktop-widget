use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel::result::Error as DieselError;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use tauri::{AppHandle, Manager};
use std::sync::{Arc, Mutex};
use diesel_migrations::MigrationHarness;

// 数据库表结构定义
table! {
    events (id) {
        id -> Integer,
        title -> Text,
        description -> Text,
        start_date -> Text,
        end_date -> Text,
        color -> Text,
        created_at -> Text,
        updated_at -> Text,
        is_deleted -> Integer,
    }
}

// 事件模型定义
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = events)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Event {
    pub id: i32,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_deleted: i32,
}

// 新事件创建模型
#[derive(Debug, Insertable)]
#[diesel(table_name = events)]
pub struct NewEvent {
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_deleted: i32,
}

// 事件更新模型
#[derive(Debug, AsChangeset)]
#[diesel(table_name = events)]
pub struct UpdateEvent {
    pub title: Option<String>,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub color: Option<String>,
    pub updated_at: Option<String>,
    pub is_deleted: Option<i32>,
}

// 查询过滤器
#[derive(Debug, Clone)]
pub struct EventFilter {
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub search_query: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// 事件统计
#[derive(Debug, Serialize, Deserialize)]
pub struct EventStats {
    pub total_events: i64,
    pub today_events: i64,
    pub upcoming_events: i64,
}

pub struct Database {
    conn: Arc<Mutex<SqliteConnection>>,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        // 获取 app_data_dir 路径
        let app_dir = app_handle.path().app_data_dir()
            .map_err(|e| format!("获取应用数据目录失败: {}", e))?;
        
        // 创建目录
        std::fs::create_dir_all(&app_dir)?;
        
        let db_path = app_dir.join("events.db");
        let mut conn = SqliteConnection::establish(&db_path.to_string_lossy())?;

        // 运行数据库迁移
        let migrations_path = std::path::Path::new("migrations");
        if migrations_path.exists() {
            match conn.run_pending_migrations(diesel_migrations::FileBasedMigrations::from_path(migrations_path)?) {
                Ok(_) => println!("数据库迁移成功"),
                Err(e) => {
                    let error_msg = e.to_string();
                    // 如果迁移失败，检查是否是表已存在的错误
                    if error_msg.contains("table events already exists") {
                        println!("数据库表已存在，跳过迁移");
                    } else {
                        return Err(format!("数据库迁移失败: {}", e).into());
                    }
                }
            }
        } else {
            return Err("迁移目录不存在，请确保 migrations 目录存在并包含正确的迁移文件".into());
        }
        
        Ok(Database { 
            conn: Arc::new(Mutex::new(conn)) 
        })
    }
    
    /// 创建新事件
    pub fn create_event(&self, event_data: &NewEvent) -> Result<i32, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        // 先插入数据
        diesel::insert_into(events)
            .values(event_data)
            .execute(conn)?;
        
        // 使用 Diesel ORM 查询最后插入的ID
        let inserted_id = events
            .order(id.desc())
            .select(id)
            .first::<i32>(conn)?;
        
        Ok(inserted_id)
    }
    
    /// 获取所有未删除的事件
    pub fn get_all_events(&self) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        events
            .filter(is_deleted.eq(0))
            .order(start_date.asc())
            .load::<Event>(conn)
    }
    
    /// 根据ID获取事件
    pub fn get_event_by_id(&self, event_id: i32) -> Result<Option<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        events
            .filter(id.eq(event_id))
            .filter(is_deleted.eq(0))
            .first::<Event>(conn)
            .optional()
    }
    
    /// 更新事件
    pub fn update_event(&self, event_id: i32, update_data: &UpdateEvent) -> Result<usize, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        diesel::update(events)
            .filter(id.eq(event_id))
            .filter(is_deleted.eq(0))
            .set(update_data)
            .execute(conn)
    }
    
    /// 软删除事件
    pub fn soft_delete_event(&self, event_id: i32) -> Result<usize, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        diesel::update(events)
            .filter(id.eq(event_id))
            .set((
                is_deleted.eq(1),
                updated_at.eq(Utc::now().to_rfc3339())
            ))
            .execute(conn)
    }
    
    /// 硬删除事件
    pub fn delete_event(&self, event_id: i32) -> Result<usize, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        diesel::delete(events.filter(id.eq(event_id)))
            .execute(conn)
    }
    
    /// 时间范围查询 - 查找与指定时间范围重叠的所有事件
    pub fn get_events_by_date_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        let start_str = start.to_rfc3339();
        let end_str = end.to_rfc3339();
        
        events
            .filter(is_deleted.eq(0))
            .filter(
                start_date.ge(start_str.clone())
                    .and(start_date.le(end_str.clone()))
                    .or(end_date.ge(start_str.clone())
                        .and(end_date.le(end_str.clone())))
                    .or(start_date.le(start_str.clone())
                        .and(end_date.ge(end_str.clone())))
                    .or(start_date.ge(start_str)
                        .and(end_date.le(end_str)))
            )
            .order(start_date.asc())
            .load::<Event>(conn)
    }
    
    /// 获取指定日期的事件
    pub fn get_events_by_date(&self, date: DateTime<Utc>) -> Result<Vec<Event>, DieselError> {
        let start_of_day = date.date_naive().and_hms_opt(0, 0, 0).unwrap();
        let end_of_day = date.date_naive().and_hms_opt(23, 59, 59).unwrap();
        
        let start_date = DateTime::from_naive_utc_and_offset(start_of_day, Utc);
        let end_date = DateTime::from_naive_utc_and_offset(end_of_day, Utc);
        
        self.get_events_by_date_range(start_date, end_date)
    }
    
    /// 搜索事件
    pub fn search_events(&self, query: &str) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        let search_pattern = format!("%{}%", query);
        
        events
            .filter(is_deleted.eq(0))
            .filter(
                title.like(search_pattern.clone())
                    .or(description.like(search_pattern))
            )
            .order(start_date.asc())
            .load::<Event>(conn)
    }
    
    /// 获取最近创建的事件
    pub fn get_recent_events(&self, limit_count: i64) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        events
            .filter(is_deleted.eq(0))
            .order(created_at.desc())
            .limit(limit_count)
            .load::<Event>(conn)
    }
    
    /// 获取即将到来的事件
    pub fn get_upcoming_events(&self, limit_count: i64) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();
        
        events
            .filter(is_deleted.eq(0))
            .filter(start_date.ge(now))
            .order(start_date.asc())
            .limit(limit_count)
            .load::<Event>(conn)
    }
    
    /// 获取事件统计
    pub fn get_event_stats(&self) -> Result<EventStats, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        // 总事件数
        let total_events: i64 = events
            .filter(is_deleted.eq(0))
            .count()
            .get_result(conn)?;
        
        // 今天的事件数
        let today_events: i64 = {
            let today = Utc::now().date_naive();
            let start_of_day = today.and_hms_opt(0, 0, 0).unwrap();
            let end_of_day = today.and_hms_opt(23, 59, 59).unwrap();
            
            let start_str = DateTime::<Utc>::from_naive_utc_and_offset(start_of_day, Utc).to_rfc3339();
            let end_str = DateTime::<Utc>::from_naive_utc_and_offset(end_of_day, Utc).to_rfc3339();
            
            events
                .filter(is_deleted.eq(0))
                .filter(
                    start_date.ge(start_str.clone())
                        .and(start_date.le(end_str.clone()))
                        .or(end_date.ge(start_str.clone())
                            .and(end_date.le(end_str.clone())))
                        .or(start_date.le(start_str)
                            .and(end_date.ge(end_str)))
                )
                .count()
                .get_result(conn)?
        };
        
        // 即将到来的事件数
        let upcoming_events: i64 = {
            let now = Utc::now().to_rfc3339();
            
            events
                .filter(is_deleted.eq(0))
                .filter(start_date.ge(now))
                .count()
                .get_result(conn)?
        };
        
        Ok(EventStats {
            total_events,
            today_events,
            upcoming_events,
        })
    }
    
    /// 清理已删除的事件
    pub fn cleanup_deleted_events(&self) -> Result<usize, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        diesel::delete(events.filter(is_deleted.eq(1)))
            .execute(conn)
    }
    
    /// 使用过滤器查询事件
    pub fn get_events_with_filter(&self, filter: &EventFilter) -> Result<Vec<Event>, DieselError> {
        use crate::commands::database_diesel::events::dsl::*;
        
        let conn = &mut *self.conn.lock().unwrap();
        
        let mut query = events.filter(is_deleted.eq(0)).into_boxed();
        
        // 应用日期范围过滤
        if let (Some(start), Some(end)) = (filter.start_date, filter.end_date) {
            let start_str = start.to_rfc3339();
            let end_str = end.to_rfc3339();
            
            query = query.filter(
                start_date.ge(start_str.clone())
                    .and(start_date.le(end_str.clone()))
                    .or(end_date.ge(start_str.clone())
                        .and(end_date.le(end_str.clone())))
                    .or(start_date.le(start_str.clone())
                        .and(end_date.ge(end_str.clone())))
                    .or(start_date.ge(start_str)
                        .and(end_date.le(end_str)))
            );
        }
        
        // 应用搜索过滤
        if let Some(ref search) = filter.search_query {
            let search_pattern = format!("%{}%", search);
            query = query.filter(
                title.like(search_pattern.clone())
                    .or(description.like(search_pattern))
            );
        }
        
        // 应用排序
        query = query.order(start_date.asc());
        
        // 应用分页
        if let Some(limit_val) = filter.limit {
            query = query.limit(limit_val);
        }
        
        if let Some(offset_val) = filter.offset {
            query = query.offset(offset_val);
        }
        
        query.load::<Event>(conn)
    }
}

// 辅助函数
impl Database {
    /// 将DateTime转换为字符串
    pub fn datetime_to_string(dt: &DateTime<Utc>) -> String {
        dt.to_rfc3339()
    }
    

    
    /// 创建新事件数据
    pub fn create_new_event_data(
        title: String,
        description: String,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        color: String,
    ) -> NewEvent {
        let now = Utc::now();
        NewEvent {
            title,
            description,
            start_date: Self::datetime_to_string(&start_date),
            end_date: Self::datetime_to_string(&end_date),
            color,
            created_at: Self::datetime_to_string(&now),
            updated_at: Self::datetime_to_string(&now),
            is_deleted: 0,
        }
    }
    
    /// 创建更新事件数据
    pub fn create_update_event_data(
        title: Option<String>,
        description: Option<String>,
        start_date: Option<DateTime<Utc>>,
        end_date: Option<DateTime<Utc>>,
        color: Option<String>,
    ) -> UpdateEvent {
        UpdateEvent {
            title,
            description,
            start_date: start_date.map(|dt| Self::datetime_to_string(&dt)),
            end_date: end_date.map(|dt| Self::datetime_to_string(&dt)),
            color,
            updated_at: Some(Self::datetime_to_string(&Utc::now())),
            is_deleted: None,
        }
    }
} 