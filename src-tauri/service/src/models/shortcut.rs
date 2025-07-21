use serde::{Deserialize, Serialize};
use entity::shortcuts;
#[derive(Debug, Serialize, Deserialize)]
pub struct ShortcutCreate {
    pub path: String,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct ShortcutResponse {
    pub id: i32,
    pub path: String,
}


impl From<shortcuts::Model> for ShortcutResponse {
    fn from(shortcuts: shortcuts::Model) -> Self {
        Self {
            id: shortcuts.id,
            path: shortcuts.path,
        }
    }
}