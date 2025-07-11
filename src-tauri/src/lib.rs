#[cfg_attr(mobile, tauri::mobile_entry_point)]

mod commands;
mod window_snap;
use tauri_plugin_autostart::MacosLauncher;
use window_snap::register_snap_handler;


use commands::settings::{is_auto_start_enabled,set_enable_auto_start};

pub fn run() {

  let app_handle = tauri::Builder::default()
      .plugin(tauri_plugin_autostart::init(
          MacosLauncher::LaunchAgent,
          Some(vec![]),
      ))
      .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
      })
      .invoke_handler(tauri::generate_handler![
        is_auto_start_enabled,
        set_enable_auto_start
      ]);

    
    let app_handle = register_snap_handler(app_handle); 
    app_handle.run(tauri::generate_context!())
    .expect("error while running tauri application");
}
