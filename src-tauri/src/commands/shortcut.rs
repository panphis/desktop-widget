use crate::utils::platform;


use tauri::State;
use service::models::{shortcut::{ShortcutCreate, ShortcutResponse }};
use service::queries::shortcut as shortcut_queries;
use crate::AppState;





#[tauri::command]
pub fn open_any_file(path: String) -> Result<(), String> {
    use std::process::Command;

    if !std::path::Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        // 使用系统默认应用打开任意文件（支持中文、空格路径）
        Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}




#[tauri::command]
pub fn get_file_icon_base64(path: String) -> Result<String, String> {
    platform::get_icon(path)
}

#[tauri::command]
pub async fn get_shortcuts(state: State<'_, AppState>) -> Result<Vec<ShortcutResponse>, String> {
    match shortcut_queries::get_all_shortcuts(&state.db_conn).await {
        Ok(shortcuts) => Ok(shortcuts),
        Err(e) => Err(format!("获取快捷方式失败: {}", e)),
    }
}

#[tauri::command]
pub async fn create_shortcut(state: State<'_, AppState>, path: String) -> Result<ShortcutResponse, String> {
    let path = path.to_string();

    let todo_data = ShortcutCreate {
        path: path.to_string(),
    }; 

    shortcut_queries::create_shortcut(&state.db_conn, todo_data)
        .await
        .map_err(|e| e.to_string())
}


#[tauri::command]
pub async fn delete_shortcut(state: State<'_, AppState>, id: i32) -> Result<bool, String> {
    shortcut_queries::delete_shortcut(&state.db_conn, id)
        .await
        .map_err(|e| e.to_string())
}

