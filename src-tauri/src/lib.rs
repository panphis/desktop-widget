#[cfg_attr(mobile, tauri::mobile_entry_point)]

mod commands;
mod db;
mod jobs;


use tauri_plugin_autostart::MacosLauncher;

use commands::greet::greet;
use commands::settings::{is_auto_start_enabled,set_enable_auto_start};
use commands::setup::{set_complete,setup};


use tauri::async_runtime::spawn;
use std::sync::Mutex;
use tauri_plugin_window_state::{Builder, StateFlags};
use std::time::Instant;
use service::sea_orm::DatabaseConnection;

use db::setup_database;
use jobs::{ setup_jobs_database};


pub struct AppState {
    db_conn: DatabaseConnection,
}

#[tokio::main]
pub async fn run() {
  let start_time = Instant::now();

    // db
    let db_conn = setup_database().await;
    // jobs
    let pool = setup_jobs_database().await;
    let app_handle = tauri::Builder::default()
        .manage(AppState { db_conn, })
      .manage(Mutex::new(commands::setup::SetupState::new()))
      .plugin(tauri_plugin_notification::init())
      .plugin(tauri_plugin_updater::Builder::new().build())
      .plugin(Builder::default().with_state_flags(StateFlags::default()).build())
      .plugin(tauri_plugin_dialog::init())
      .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
      .plugin(
          tauri_plugin_log::Builder::default()
              .target(tauri_plugin_log::Target::new(
                  tauri_plugin_log::TargetKind::Stdout,
              ))
              .target(tauri_plugin_log::Target::new(
                  tauri_plugin_log::TargetKind::LogDir {
                      file_name: Some("logs".to_string()),
                  },
              ))
              .level_for("tauri", log::LevelFilter::Error)
              .level_for("hyper", log::LevelFilter::Off)
              .level_for("tracing", log::LevelFilter::Info)
              .level_for("sea_orm", log::LevelFilter::Info)
              .level_for("sqlx", log::LevelFilter::Off)
              .level_for("tao", log::LevelFilter::Off)
              .build(),
      )
      .setup(move |app| {
        if cfg!(debug_assertions) {
          app.handle().plugin(
            tauri_plugin_log::Builder::default()
              .level(log::LevelFilter::Info)
              .build(),
          )?;
        }
        
        spawn(setup(app.handle().clone()));
        
        // 记录启动时间
        let elapsed = start_time.elapsed();
        println!("Tauri 应用启动耗时: {:?}", elapsed);
        
        // The hook expects an Ok result
        Ok(())
      })
      .invoke_handler(tauri::generate_handler![
        is_auto_start_enabled,
        set_enable_auto_start,
        set_complete,
        greet
      ]);

    if let Err(e) = app_handle.run(tauri::generate_context!()) {
        eprintln!("运行 tauri 应用程序时出错: {:?}", e);
        std::process::exit(1);
    }
}

