use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    pub id: Option<i64>,
    pub title: String,
    pub description: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub color: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        // 获取 app_data_dir 路径 - 使用 Tauri 2.x 的正确 API
        let app_dir = app_handle.path().app_data_dir()
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
        
        // 创建目录，处理 std::io::Error 到 rusqlite::Error 的转换
        std::fs::create_dir_all(&app_dir)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
        
        let db_path = app_dir.join("events.db");
        let conn = Connection::open(db_path)?;
        
        // 创建事件表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                color TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        
        Ok(Database { conn })
    }
    
    pub fn create_event(&self, event: &Event) -> Result<i64> {
        let id = self.conn.execute(
            "INSERT INTO events (title, description, start_date, end_date, color, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (
                &event.title,
                &event.description,
                &event.start_date.to_rfc3339(),
                &event.end_date.to_rfc3339(),
                &event.color,
                &Utc::now().to_rfc3339(),
                &Utc::now().to_rfc3339(),
            ),
        )?;
        
        Ok(id as i64)
    }
    
    pub fn get_all_events(&self) -> Result<Vec<Event>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, start_date, end_date, color, created_at, updated_at 
             FROM events 
             ORDER BY start_date ASC"
        )?;
        
        let event_iter = stmt.query_map([], |row| {
            Ok(Event {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                    .unwrap()
                    .with_timezone(&Utc),
                end_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                    .unwrap()
                    .with_timezone(&Utc),
                color: row.get(5)?,
                created_at: Some(
                    DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                        .unwrap()
                        .with_timezone(&Utc)
                ),
                updated_at: Some(
                    DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                        .unwrap()
                        .with_timezone(&Utc)
                ),
            })
        })?;
        
        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        
        Ok(events)
    }
    
    pub fn get_event_by_id(&self, id: i64) -> Result<Option<Event>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, start_date, end_date, color, created_at, updated_at 
             FROM events 
             WHERE id = ?"
        )?;
        
        let mut event_iter = stmt.query_map([id], |row| {
            Ok(Event {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                    .unwrap()
                    .with_timezone(&Utc),
                end_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                    .unwrap()
                    .with_timezone(&Utc),
                color: row.get(5)?,
                created_at: Some(
                    DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                        .unwrap()
                        .with_timezone(&Utc)
                ),
                updated_at: Some(
                    DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                        .unwrap()
                        .with_timezone(&Utc)
                ),
            })
        })?;
        
        Ok(event_iter.next().transpose()?)
    }
    
    pub fn update_event(&self, event: &Event) -> Result<usize> {
        if let Some(id) = event.id {
            let rows_affected = self.conn.execute(
                "UPDATE events 
                 SET title = ?1, description = ?2, start_date = ?3, end_date = ?4, color = ?5, updated_at = ?6
                 WHERE id = ?7",
                (
                    &event.title,
                    &event.description,
                    &event.start_date.to_rfc3339(),
                    &event.end_date.to_rfc3339(),
                    &event.color,
                    &Utc::now().to_rfc3339(),
                    id,
                ),
            )?;
            
            Ok(rows_affected)
        } else {
            Ok(0)
        }
    }
    
    pub fn delete_event(&self, id: i64) -> Result<usize> {
        let rows_affected = self.conn.execute("DELETE FROM events WHERE id = ?", [id])?;
        Ok(rows_affected)
    }
    
    pub fn get_events_by_date_range(&self, start_date: DateTime<Utc>, end_date: DateTime<Utc>) -> Result<Vec<Event>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, start_date, end_date, color, created_at, updated_at 
             FROM events 
             WHERE (start_date >= ?1 AND start_date <= ?2) 
                OR (end_date >= ?1 AND end_date <= ?2)
                OR (start_date <= ?1 AND end_date >= ?2)
             ORDER BY start_date ASC"
        )?;
        
        let event_iter = stmt.query_map(
            (
                &start_date.to_rfc3339(),
                &end_date.to_rfc3339(),
                &start_date.to_rfc3339(),
                &end_date.to_rfc3339(),
                &start_date.to_rfc3339(),
                &end_date.to_rfc3339(),
            ),
            |row| {
                Ok(Event {
                    id: Some(row.get(0)?),
                    title: row.get(1)?,
                    description: row.get(2)?,
                    start_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    end_date: DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    color: row.get(5)?,
                    created_at: Some(
                        DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                            .unwrap()
                            .with_timezone(&Utc)
                    ),
                    updated_at: Some(
                        DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                            .unwrap()
                            .with_timezone(&Utc)
                    ),
                })
            }
        )?;
        
        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        
        Ok(events)
    }
} 