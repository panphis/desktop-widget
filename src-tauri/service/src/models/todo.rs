use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use entity::todos;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoCreate {
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub color: Option<String>,
}

impl Default for TodoUpdate {
    fn default() -> Self {
        Self {
            title: None,
            description: None,
            start_date: None,
            end_date: None,
            color: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoResponse {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoFilter {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub search_query: Option<String>,
    pub limit: Option<u64>,
    pub offset: Option<u64>,
}



impl From<todos::Model> for TodoResponse {
    fn from(todo: todos::Model) -> Self {
        Self {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            start_date: todo.start_date,
            end_date: todo.end_date,
            color: todo.color,
        }
    }
}