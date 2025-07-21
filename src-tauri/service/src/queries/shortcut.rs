use sea_orm::*;
use crate::entities::{shortcuts, Shortcuts};
use crate::models::{shortcut::{ShortcutCreate, ShortcutResponse}};


pub async fn get_all_shortcuts(db: &DatabaseConnection) -> Result<Vec<ShortcutResponse>, DbErr> {
    let shortcuts = Shortcuts::find()
        .all(db)
        .await?;
    
    Ok(shortcuts.into_iter().map(ShortcutResponse::from).collect())
}



pub async fn create_shortcut(db: &DatabaseConnection, shortcut_data: ShortcutCreate) -> Result<ShortcutResponse, DbErr> {
    let shortcut = shortcuts::ActiveModel {
        path: Set(shortcut_data.path),
        ..Default::default()
    };

    let shortcut = shortcut.insert(db).await?;
    Ok(ShortcutResponse::from(shortcut))
}


pub async fn delete_shortcut(db: &DatabaseConnection, id: i32) -> Result<bool, DbErr> {
    let shortcut = Shortcuts::find_by_id(id)
        .one(db)
        .await?;

    if let Some(shortcut) = shortcut {
        let shortcut: shortcuts::ActiveModel = shortcut.into();
        shortcut.delete(db).await?;
        Ok(true)
    } else {
        Ok(false)
    }
}
