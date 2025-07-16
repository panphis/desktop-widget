use tauri::{AppHandle};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::commands::database::{Database, Event as DbEvent};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateEventRequest {
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateEventRequest {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<DbEvent> for EventResponse {
    fn from(event: DbEvent) -> Self {
        EventResponse {
            id: event.id.unwrap_or(0),
            title: event.title,
            description: event.description,
            start_date: event.start_date.to_rfc3339(),
            end_date: event.end_date.to_rfc3339(),
            color: event.color,
            created_at: event.created_at.unwrap_or(Utc::now()).to_rfc3339(),
            updated_at: event.updated_at.unwrap_or(Utc::now()).to_rfc3339(),
        }
    }
}

fn get_database(app: &AppHandle) -> Result<Database, String> {
    Database::new(app).map_err(|e| format!("数据库初始化失败: {}", e))
}

#[tauri::command]
pub async fn create_event(
    app: AppHandle,
    request: CreateEventRequest,
) -> Result<EventResponse, String> {
    let db = get_database(&app)?;
    
    let start_date = DateTime::parse_from_rfc3339(&request.start_date)
        .map_err(|_| "无效的开始日期格式")?
        .with_timezone(&Utc);
    
    let end_date = DateTime::parse_from_rfc3339(&request.end_date)
        .map_err(|_| "无效的结束日期格式")?
        .with_timezone(&Utc);
    
    let event = DbEvent {
        id: None,
        title: request.title,
        description: request.description,
        start_date,
        end_date,
        color: request.color,
        created_at: None,
        updated_at: None,
    };
    
    let id = db.create_event(&event)
        .map_err(|e| format!("创建事件失败: {}", e))?;
    
    let created_event = db.get_event_by_id(id)
        .map_err(|e| format!("获取创建的事件失败: {}", e))?
        .ok_or("创建的事件未找到")?;
    
    Ok(EventResponse::from(created_event))
}

#[tauri::command]
pub async fn get_all_events(
    app: AppHandle,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let events = db.get_all_events()
        .map_err(|e| format!("获取事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn get_event_by_id(
    app: AppHandle,
    id: i64,
) -> Result<Option<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let event = db.get_event_by_id(id)
        .map_err(|e| format!("获取事件失败: {}", e))?;
    
    Ok(event.map(EventResponse::from))
}

#[tauri::command]
pub async fn update_event(
    app: AppHandle,
    request: UpdateEventRequest,
) -> Result<EventResponse, String> {
    let db = get_database(&app)?;
    
    let start_date = DateTime::parse_from_rfc3339(&request.start_date)
        .map_err(|_| "无效的开始日期格式")?
        .with_timezone(&Utc);
    
    let end_date = DateTime::parse_from_rfc3339(&request.end_date)
        .map_err(|_| "无效的结束日期格式")?
        .with_timezone(&Utc);
    
    let event = DbEvent {
        id: Some(request.id),
        title: request.title,
        description: request.description,
        start_date,
        end_date,
        color: request.color,
        created_at: None,
        updated_at: None,
    };
    
    let rows_affected = db.update_event(&event)
        .map_err(|e| format!("更新事件失败: {}", e))?;
    
    if rows_affected == 0 {
        return Err("事件未找到或更新失败".to_string());
    }
    
    let updated_event = db.get_event_by_id(request.id)
        .map_err(|e| format!("获取更新的事件失败: {}", e))?
        .ok_or("更新的事件未找到")?;
    
    Ok(EventResponse::from(updated_event))
}

#[tauri::command]
pub async fn delete_event(
    app: AppHandle,
    id: i64,
) -> Result<bool, String> {
    let db = get_database(&app)?;
    
    let rows_affected = db.delete_event(id)
        .map_err(|e| format!("删除事件失败: {}", e))?;
    
    Ok(rows_affected > 0)
}

#[tauri::command]
pub async fn get_events_by_date_range(
    app: AppHandle,
    start_date: String,
    end_date: String,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let start = DateTime::parse_from_rfc3339(&start_date)
        .map_err(|_| "无效的开始日期格式")?
        .with_timezone(&Utc);
    
    let end = DateTime::parse_from_rfc3339(&end_date)
        .map_err(|_| "无效的结束日期格式")?
        .with_timezone(&Utc);
    
    let events = db.get_events_by_date_range(start, end)
        .map_err(|e| format!("获取日期范围内的事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
} 