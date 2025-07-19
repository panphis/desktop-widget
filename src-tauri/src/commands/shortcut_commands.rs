use serde::{Deserialize, Serialize};
use tauri_plugin_dialog::DialogExt;
use tauri::Manager;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShortcutItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub r#type: String,
    pub icon: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateShortcutRequest {
    pub name: String,
    pub path: String,
    pub r#type: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateShortcutRequest {
    pub id: String,
    pub name: Option<String>,
    pub path: Option<String>,
    pub r#type: Option<String>,
}

#[tauri::command]
pub async fn shortcut_get_all(app_handle: tauri::AppHandle) -> Result<Vec<ShortcutItem>, String> {
    println!("shortcut_get_all");
    let shortcuts_store = app_handle.state::<crate::ShortcutStore>();
    let shortcuts_guard = shortcuts_store.shortcuts.lock().unwrap();
    let shortcuts = shortcuts_guard.clone();
    println!("shortcuts: {:?}", shortcuts);
    Ok(shortcuts)
}

#[tauri::command]
pub async fn shortcut_create(
    app_handle: tauri::AppHandle,
    data: CreateShortcutRequest,
) -> Result<ShortcutItem, String> {
    let now = Utc::now().to_rfc3339();
    let shortcut = ShortcutItem {
        id: Uuid::new_v4().to_string(),
        name: data.name.clone(),
        path: data.path.clone(),
        r#type: data.r#type.clone(),
        icon: None,
        created_at: now.clone(),
        updated_at: now,
    };

    let shortcuts = app_handle.state::<crate::ShortcutStore>();
    {
        let mut shortcuts = shortcuts.shortcuts.lock().unwrap();
        shortcuts.push(shortcut.clone());
    }

    // 异步获取图标
    let app_handle_clone = app_handle.clone();
    let shortcut_id = shortcut.id.clone();
    let path_clone = data.path.clone();
    tauri::async_runtime::spawn(async move {
        if let Ok(Some(icon)) = get_file_icon_internal(&path_clone).await {
            let shortcuts = app_handle_clone.state::<crate::ShortcutStore>();
            let mut shortcuts = shortcuts.shortcuts.lock().unwrap();
            if let Some(shortcut) = shortcuts.iter_mut().find(|s| s.id == shortcut_id) {
                shortcut.icon = Some(icon);
            }
        }
    });

    Ok(shortcut)
}

#[tauri::command]
pub async fn shortcut_update(
    app_handle: tauri::AppHandle,
    data: UpdateShortcutRequest,
) -> Result<ShortcutItem, String> {
    let shortcuts = app_handle.state::<crate::ShortcutStore>();
    let mut shortcuts = shortcuts.shortcuts.lock().unwrap();
    
    if let Some(shortcut) = shortcuts.iter_mut().find(|s| s.id == data.id) {
        if let Some(name) = data.name {
            shortcut.name = name;
        }
        if let Some(path) = data.path {
            shortcut.path = path;
        }
        if let Some(r#type) = data.r#type {
            shortcut.r#type = r#type;
        }
        shortcut.updated_at = Utc::now().to_rfc3339();
        
        Ok(shortcut.clone())
    } else {
        Err("Shortcut not found".to_string())
    }
}

#[tauri::command]
pub async fn shortcut_delete(
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<(), String> {
    let shortcuts = app_handle.state::<crate::ShortcutStore>();
    let mut shortcuts = shortcuts.shortcuts.lock().unwrap();
    shortcuts.retain(|s| s.id != id);
    Ok(())
}

#[tauri::command]
pub async fn shortcut_open_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("cmd")
            .args(&["/C", "start", "", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn shortcut_select_file(app_handle: tauri::AppHandle) -> Result<Option<(String, String)>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    let dialog = app_handle.dialog();
    dialog.file()
        .add_filter("所有文件", &["*"])
        .pick_file(move |path| {
            let _ = tx.send(path);
        });

    match rx.recv() {
        Ok(Some(path)) => {
            let path_str = path.to_string();
            let path_buf = std::path::PathBuf::from(&path_str);
            let name = path_buf.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("未知文件")
                .to_string();
            Ok(Some((path_str, name)))
        }
        Ok(None) => Ok(None),
        Err(_) => Err("文件选择被取消".to_string()),
    }
}

#[tauri::command]
pub async fn shortcut_select_folder(app_handle: tauri::AppHandle) -> Result<Option<(String, String)>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    let dialog = app_handle.dialog();
    dialog.file()
        .pick_folder(move |path| {
            let _ = tx.send(path);
        });

    match rx.recv() {
        Ok(Some(path)) => {
            let path_str = path.to_string();
            let path_buf = std::path::PathBuf::from(&path_str);
            let name = path_buf.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("未知文件夹")
                .to_string();
            Ok(Some((path_str, name)))
        }
        Ok(None) => Ok(None),
        Err(_) => Err("文件夹选择被取消".to_string()),
    }
}

#[tauri::command]
pub async fn shortcut_get_file_icon(path: String) -> Result<Option<String>, String> {
    get_file_icon_internal(&path).await
}

async fn get_file_icon_internal(path: &str) -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        let output = Command::new("powershell")
            .args(&[
                "-Command",
                &format!(
                    r#"
                    Add-Type -AssemblyName System.Drawing
                    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('{}')
                    if ($icon) {{
                        $stream = New-Object System.IO.MemoryStream
                        $icon.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
                        $bytes = $stream.ToArray()
                        $stream.Close()
                        [Convert]::ToBase64String($bytes)
                    }}
                    "#,
                    path.replace("'", "''")
                )
            ])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let icon_data = String::from_utf8(output.stdout)
                .map_err(|e| e.to_string())?
                .trim()
                .to_string();
            
            if !icon_data.is_empty() {
                return Ok(Some(format!("data:image/png;base64,{}", icon_data)));
            }
        }
    }

    Ok(None)
} 