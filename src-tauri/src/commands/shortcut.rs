use crate::utils::platform;






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