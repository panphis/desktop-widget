use tauri::State;
use service::models::{todo::{TodoCreate, TodoUpdate, TodoResponse, TodoFilter }};
use service::queries::todo as todo_queries;
use chrono::{DateTime, Utc};
use crate::AppState;
use serde_json;

// 基本 CRUD 操作

#[tauri::command]
pub async fn get_todos(state: State<'_, AppState>) -> Result<Vec<TodoResponse>, String> {
    todo_queries::get_all_todos(&state.db_conn)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_todo(state: State<'_, AppState>, id: i32) -> Result<Option<TodoResponse>, String> {
    todo_queries::get_todo_by_id(&state.db_conn, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_todo(state: State<'_, AppState>, request: serde_json::Value) -> Result<TodoResponse, String> {
    let request: serde_json::Map<String, serde_json::Value> = request.as_object()
        .ok_or("Invalid request format")?
        .clone();
    
    let title = request.get("title")
        .and_then(|v| v.as_str())
        .ok_or("Missing title parameter")?;
    
    let description = request.get("description")
        .and_then(|v| v.as_str());
    
    let start_date = request.get("start_date")
        .and_then(|v| v.as_str());
    
    let end_date = request.get("end_date")
        .and_then(|v| v.as_str());
    
    let color = request.get("color")
        .and_then(|v| v.as_str());
    
    let todo_data = TodoCreate {
        title: title.to_string(),
        description: Some(description.map(|s| s.to_string()).unwrap_or_default()),
        start_date: Some(start_date
            .map(|s| DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc).to_rfc3339())
            .unwrap_or_default()),
        end_date: Some(end_date
            .map(|s| DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc).to_rfc3339())
            .unwrap_or_default()),
        color: Some(color.map(|s| s.to_string()).unwrap_or_default()),
    };

    todo_queries::create_todo(&state.db_conn, todo_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_todo(state: State<'_, AppState>, request: serde_json::Value) -> Result<Option<TodoResponse>, String> {
    let request: serde_json::Map<String, serde_json::Value> = request.as_object()
        .ok_or("Invalid request format")?
        .clone();
    
    let id = request.get("id")
        .and_then(|v| v.as_i64())
        .ok_or("Missing id parameter")? as i32;
    
    let title = request.get("title")
        .and_then(|v| v.as_str())
        .ok_or("Missing title parameter")?;
    
    let description = request.get("description")
        .and_then(|v| v.as_str());
    
    let start_date = request.get("start_date")
        .and_then(|v| v.as_str());
    
    let end_date = request.get("end_date")
        .and_then(|v| v.as_str());
    
    let color = request.get("color")
        .and_then(|v| v.as_str());
    
    // 将 IEvent 转换为 TodoUpdate
    let todo_data = TodoUpdate {
        title: Some(title.to_string()),
        description: description.map(|s| s.to_string()),
        start_date: start_date
            .map(|s| DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc).to_rfc3339()),
        end_date: end_date
            .map(|s| DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc).to_rfc3339()),
        color: color.map(|s| s.to_string()),
    };
    
    todo_queries::update_todo(&state.db_conn, id, todo_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_todo(state: State<'_, AppState>, id: i32) -> Result<bool, String> {
    todo_queries::delete_todo(&state.db_conn, id)
        .await
        .map_err(|e| e.to_string())
}

// 从旧版本迁移的事件查询命令

#[tauri::command]
pub async fn get_todos_by_date_range(
    state: State<'_, AppState>, 
    request: serde_json::Value
) -> Result<Vec<TodoResponse>, String> {
    let request: serde_json::Map<String, serde_json::Value> = request.as_object()
        .ok_or("Invalid request format")?
        .clone();
    
    let start_date = request.get("start_date")
        .and_then(|v| v.as_str())
        .ok_or("Missing start_date parameter")?;
    let end_date = request.get("end_date")
        .and_then(|v| v.as_str())
        .ok_or("Missing end_date parameter")?;
    
    let start_date = DateTime::parse_from_rfc3339(start_date)
        .map_err(|e| format!("Invalid start date: {}", e))?;
    let end_date = DateTime::parse_from_rfc3339(end_date)
        .map_err(|e| format!("Invalid end date: {}", e))?;

    // 将 FixedOffset 的 DateTime 转换为 Utc 的 DateTime
    let start_date_utc = start_date.with_timezone(&chrono::Utc);
    let end_date_utc = end_date.with_timezone(&chrono::Utc);

    todo_queries::get_todos_by_date_range(&state.db_conn, start_date_utc, end_date_utc)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_todos_by_date(
    state: State<'_, AppState>, 
    date: String
) -> Result<Vec<TodoResponse>, String> {
    let date = DateTime::parse_from_rfc3339(&date)
        .map_err(|e| format!("Invalid date: {}", e))?;
    
    todo_queries::get_todos_by_date(&state.db_conn, date.into())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_todos(
    state: State<'_, AppState>, 
    query: String
) -> Result<Vec<TodoResponse>, String> {
    todo_queries::search_todos(&state.db_conn, &query)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_todos(
    state: State<'_, AppState>, 
    limit: u64
) -> Result<Vec<TodoResponse>, String> {
    todo_queries::get_recent_todos(&state.db_conn, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_upcoming_todos(
    state: State<'_, AppState>, 
    request: serde_json::Value
) -> Result<Vec<TodoResponse>, String> {
    let request: serde_json::Map<String, serde_json::Value> = request.as_object()
        .ok_or("Invalid request format")?
        .clone();
    
    let limit = request.get("limit")
        .and_then(|v| v.as_u64())
        .unwrap_or(10); // 默认限制为 10
    
    todo_queries::get_upcoming_todos(&state.db_conn, limit)
        .await
        .map_err(|e| e.to_string())
}



#[tauri::command]
pub async fn get_todos_with_filter(
    state: State<'_, AppState>, 
    filter: TodoFilter
) -> Result<Vec<TodoResponse>, String> {
    todo_queries::get_todos_with_filter(&state.db_conn, &filter)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cleanup_deleted_todos(state: State<'_, AppState>) -> Result<u64, String> {
    todo_queries::cleanup_deleted_todos(&state.db_conn)
        .await
        .map_err(|e| e.to_string())
}

/// 创建新的待办事项数据 - 简化版本
#[tauri::command]
pub async fn create_todo_simple(
    state: State<'_, AppState>,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    color: Option<String>,
) -> Result<TodoResponse, String> {
    // 解析日期字符串
    let start_date_parsed = if let Some(start_str) = start_date {
        DateTime::parse_from_rfc3339(&start_str)
            .map(|dt| dt.with_timezone(&Utc))
            .ok()
    } else {
        None
    };
    
    let end_date_parsed = if let Some(end_str) = end_date {
        DateTime::parse_from_rfc3339(&end_str)
            .map(|dt| dt.with_timezone(&Utc))
            .ok()
    } else {
        None
    };
    
    let todo_data = TodoCreate {
        title,
        description,
        start_date: start_date_parsed
            .map(|dt| dt.to_rfc3339()),
        end_date: end_date_parsed
            .map(|dt| dt.to_rfc3339()),
        color,
    };
    
    todo_queries::create_todo(&state.db_conn, todo_data)
        .await
        .map_err(|e| e.to_string())
}

/// 批量创建待办事项
#[tauri::command]
pub async fn create_todos_batch(
    state: State<'_, AppState>,
    todos_data: Vec<TodoCreate>
) -> Result<Vec<TodoResponse>, String> {
    let mut results = Vec::new();
    
    for todo_data in todos_data {
        let result = todo_queries::create_todo(&state.db_conn, todo_data)
            .await
            .map_err(|e| e.to_string())?;
        results.push(result);
    }
    
    Ok(results)
}

/// 批量更新待办事项
#[tauri::command]
pub async fn update_todos_batch(
    state: State<'_, AppState>,
    updates: Vec<(i32, TodoUpdate)>
) -> Result<Vec<Option<TodoResponse>>, String> {
    let mut results = Vec::new();
    
    for (id, todo_data) in updates {
        let result = todo_queries::update_todo(&state.db_conn, id, todo_data)
            .await
            .map_err(|e| e.to_string())?;
        results.push(result);
    }
    
    Ok(results)
}

/// 批量删除待办事项
#[tauri::command]
pub async fn delete_todos_batch(
    state: State<'_, AppState>,
    ids: Vec<i32>
) -> Result<Vec<bool>, String> {
    let mut results = Vec::new();
    
    for id in ids {
        let result = todo_queries::delete_todo(&state.db_conn, id)
            .await
            .map_err(|e| e.to_string())?;
        results.push(result);
    }
    
    Ok(results)
}

/// 获取待办事项的详细信息（包括统计信息）
#[tauri::command]
pub async fn get_todo_details(
    state: State<'_, AppState>,
    id: i32
) -> Result<Option<TodoResponse>, String> {
    todo_queries::get_todo_by_id(&state.db_conn, id)
        .await
        .map_err(|e| e.to_string())
}

/// 复制待办事项
#[tauri::command]
pub async fn duplicate_todo(
    state: State<'_, AppState>,
    id: i32
) -> Result<Option<TodoResponse>, String> {
    // 获取原始待办事项
    let original = todo_queries::get_todo_by_id(&state.db_conn, id)
        .await
        .map_err(|e| e.to_string())?;
    
    if let Some(original_todo) = original {
        // 创建新的待办事项数据
        let new_todo_data = TodoCreate {
            title: format!("{} (副本)", original_todo.title),
            description: original_todo.description,
            start_date: original_todo.start_date,
            end_date: original_todo.end_date,
            color: original_todo.color,
        };
        
        // 创建新的待办事项
        let new_todo = todo_queries::create_todo(&state.db_conn, new_todo_data)
            .await
            .map_err(|e| e.to_string())?;
        
        Ok(Some(new_todo))
    } else {
        Ok(None)
    }
}


/// 标记多个待办事项为完成
#[tauri::command]
pub async fn mark_todos_completed(
    state: State<'_, AppState>,
    ids: Vec<i32>,
) -> Result<Vec<Option<TodoResponse>>, String> {
    let mut results = Vec::new();
    
    for id in ids {
        let update_data = TodoUpdate {
            ..Default::default()
        };
        
        let result = todo_queries::update_todo(&state.db_conn, id, update_data)
            .await
            .map_err(|e| e.to_string())?;
        results.push(result);
    }
    
    Ok(results)
}

