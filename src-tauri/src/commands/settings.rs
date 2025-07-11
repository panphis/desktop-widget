use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
pub async fn set_enable_auto_start(enable: bool, app: tauri::AppHandle) -> Result<(), String> {
    let autostart = app.autolaunch();

    if enable {
        autostart.enable().map_err(|e| e.to_string())?;
    } else {
        autostart.disable().map_err(|e| e.to_string())?;
    }

    Ok(())
}


#[tauri::command]
pub fn is_auto_start_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    let autostart = app.autolaunch();
    autostart.is_enabled().map_err(|e| e.to_string())
}



