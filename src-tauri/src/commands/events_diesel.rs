use tauri::AppHandle;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::commands::database_diesel::{
    Database, Event as DbEvent, NewEvent, UpdateEvent, EventStats, EventFilter
};

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
    pub id: i32,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub id: i32,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DateRangeRequest {
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DateRequest {
    pub date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MonthRequest {
    pub year: i32,
    pub month: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchRequest {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LimitRequest {
    pub limit: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FilterRequest {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub search_query: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

impl From<DbEvent> for EventResponse {
    fn from(event: DbEvent) -> Self {
        EventResponse {
            id: event.id.unwrap_or(0),
            title: event.title,
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            color: event.color,
            created_at: event.created_at,
            updated_at: event.updated_at,
        }
    }
}

fn get_database(app: &AppHandle) -> Result<Database, String> {
    Database::new(app).map_err(|e| format!("数据库初始化失败: {}", e))
}

fn parse_datetime(date_str: &str) -> Result<DateTime<Utc>, String> {
    DateTime::parse_from_rfc3339(date_str)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|_| format!("无效的日期格式: {}", date_str))
}

#[tauri::command]
pub async fn create_event(
    app: AppHandle,
    request: CreateEventRequest,
) -> Result<EventResponse, String> {
    let db = get_database(&app)?;
    
    let start_date = parse_datetime(&request.start_date)?;
    let end_date = parse_datetime(&request.end_date)?;
    
    // 验证日期逻辑
    if start_date >= end_date {
        return Err("开始时间必须早于结束时间".to_string());
    }
    
    let new_event = Database::create_new_event_data(
        request.title,
        request.description,
        start_date,
        end_date,
        request.color,
    );
    
    let id = db.create_event(&new_event)
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
    id: i32,
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
    
    let start_date = parse_datetime(&request.start_date)?;
    let end_date = parse_datetime(&request.end_date)?;
    
    // 验证日期逻辑
    if start_date >= end_date {
        return Err("开始时间必须早于结束时间".to_string());
    }
    
    let update_data = Database::create_update_event_data(
        Some(request.title),
        Some(request.description),
        Some(start_date),
        Some(end_date),
        Some(request.color),
    );
    
    let rows_affected = db.update_event(request.id, &update_data)
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
    id: i32,
) -> Result<bool, String> {
    let db = get_database(&app)?;
    
    let rows_affected = db.delete_event(id)
        .map_err(|e| format!("删除事件失败: {}", e))?;
    
    Ok(rows_affected > 0)
}

#[tauri::command]
pub async fn soft_delete_event(
    app: AppHandle,
    id: i32,
) -> Result<bool, String> {
    let db = get_database(&app)?;
    
    let rows_affected = db.soft_delete_event(id)
        .map_err(|e| format!("软删除事件失败: {}", e))?;
    
    Ok(rows_affected > 0)
}

#[tauri::command]
pub async fn get_events_by_date_range(
    app: AppHandle,
    request: DateRangeRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let start = parse_datetime(&request.start_date)?;
    let end = parse_datetime(&request.end_date)?;
    
    // 验证日期逻辑
    if start >= end {
        return Err("开始时间必须早于结束时间".to_string());
    }
    
    let events = db.get_events_by_date_range(start, end)
        .map_err(|e| format!("获取日期范围内的事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn get_events_by_date(
    app: AppHandle,
    request: DateRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let date = parse_datetime(&request.date)?;
    
    let events = db.get_events_by_date(date)
        .map_err(|e| format!("获取指定日期的事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn search_events(
    app: AppHandle,
    request: SearchRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    if request.query.trim().is_empty() {
        return Err("搜索查询不能为空".to_string());
    }
    
    let events = db.search_events(&request.query)
        .map_err(|e| format!("搜索事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn get_recent_events(
    app: AppHandle,
    request: LimitRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let events = db.get_recent_events(request.limit)
        .map_err(|e| format!("获取最近事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn get_upcoming_events(
    app: AppHandle,
    request: LimitRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let events = db.get_upcoming_events(request.limit)
        .map_err(|e| format!("获取即将到来的事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
}

#[tauri::command]
pub async fn get_event_stats(
    app: AppHandle,
) -> Result<EventStats, String> {
    let db = get_database(&app)?;
    
    let stats = db.get_event_stats()
        .map_err(|e| format!("获取事件统计失败: {}", e))?;
    
    Ok(stats)
}

#[tauri::command]
pub async fn cleanup_deleted_events(
    app: AppHandle,
) -> Result<usize, String> {
    let db = get_database(&app)?;
    
    let rows_affected = db.cleanup_deleted_events()
        .map_err(|e| format!("清理已删除事件失败: {}", e))?;
    
    Ok(rows_affected)
}

#[tauri::command]
pub async fn get_events_with_filter(
    app: AppHandle,
    request: FilterRequest,
) -> Result<Vec<EventResponse>, String> {
    let db = get_database(&app)?;
    
    let mut filter = EventFilter {
        start_date: None,
        end_date: None,
        search_query: request.search_query,
        limit: request.limit,
        offset: request.offset,
    };
    
    // 解析日期范围
    if let (Some(start_str), Some(end_str)) = (request.start_date, request.end_date) {
        filter.start_date = Some(parse_datetime(&start_str)?);
        filter.end_date = Some(parse_datetime(&end_str)?);
    }
    
    let events = db.get_events_with_filter(&filter)
        .map_err(|e| format!("使用过滤器查询事件失败: {}", e))?;
    
    Ok(events.into_iter().map(EventResponse::from).collect())
} 