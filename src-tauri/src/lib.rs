#[cfg_attr(mobile, tauri::mobile_entry_point)]

mod commands;
use tauri_plugin_autostart::MacosLauncher;

use commands::greet::greet;
use commands::settings::{is_auto_start_enabled,set_enable_auto_start};
use commands::setup::{set_complete,setup};
use tauri::async_runtime::spawn;
use std::sync::Mutex;










pub fn run() {

  let app_handle = tauri::Builder::default()
      .plugin(tauri_plugin_autostart::init(
          MacosLauncher::LaunchAgent,
          Some(vec![]),
      ))
      .manage(Mutex::new(commands::setup::SetupState::new()))
      .setup(|app| {



        if cfg!(debug_assertions) {
          app.handle().plugin(
            tauri_plugin_log::Builder::default()
              .level(log::LevelFilter::Info)
              .build(),
          )?;
        }



        spawn(setup(app.handle().clone()));
            // The hook expects an Ok result
        Ok(())
      })
      .invoke_handler(tauri::generate_handler![
        is_auto_start_enabled,
        set_enable_auto_start,
        set_complete,
        greet
      ]);

    app_handle.run(tauri::generate_context!())
    .expect("运行 tauri 应用程序时出错");
}
