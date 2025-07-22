#[cfg_attr(mobile, tauri::mobile_entry_point)]

mod commands;
mod db;
mod utils;
mod plugins;

use tauri_plugin_autostart::MacosLauncher;
use tauri::Manager;
use std::sync::Mutex;
use std::time::Instant;


use service::sea_orm::DatabaseConnection;
use db::setup_database;

use plugins::window_state_custom;

use commands::settings::{is_auto_start_enabled,set_enable_auto_start};
use commands::setup::set_complete;
use commands::todo::{
    // 基本 CRUD 操作
    get_todos,
    get_todo,
    create_todo,
    update_todo,
    delete_todo,
    get_todos_by_date_range,
    get_todos_by_date,
    search_todos,
    get_recent_todos,
    get_upcoming_todos,
    get_todos_with_filter,
    cleanup_deleted_todos,
    // 新增的辅助命令
    create_todo_simple,
    create_todos_batch,
    update_todos_batch,
    delete_todos_batch,
    get_todo_details,
    duplicate_todo,
    mark_todos_completed,
};
use commands::shortcut::{open_any_file, get_file_icon_base64,
     get_shortcuts, create_shortcut, delete_shortcut};
use commands::greet::greet;



pub struct AppState {
    pub db_conn: DatabaseConnection,
}

#[tokio::main]
pub async fn run() {
  let start_time = Instant::now();
  println!("Starting Tauri application...");

    // db
    let db_conn = setup_database().await;
    println!("Database connection established");
    
    let app_handle = tauri::Builder::default()
        .manage(AppState { db_conn, })
      .manage(Mutex::new(commands::setup::SetupState::new()))
      .plugin(tauri_plugin_notification::init())
      .plugin(window_state_custom::init())
      .plugin(tauri_plugin_dialog::init())
      .plugin(tauri_plugin_opener::init())
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
        println!("Setting up application...");

        // 简化处理，直接标记后端任务完成
        let state = app.state::<Mutex<commands::setup::SetupState>>();
        if let Ok(mut state_lock) = state.lock() {
            state_lock.backend_task = true;
            println!("Backend task marked as completed");
        }

        // 记录启动时间
        let elapsed = start_time.elapsed();
        println!("Tauri 应用启动耗时: {:?}", elapsed);
        
        // The hook expects an Ok result
        Ok(())
      })
      .invoke_handler(tauri::generate_handler![
        // 基本 CRUD 操作
        get_todos,
        get_todo,
        create_todo,
        update_todo,
        delete_todo,
        get_todos_by_date_range,
        get_todos_by_date,
        search_todos,
        get_recent_todos,
        get_upcoming_todos,
        get_todos_with_filter,
        cleanup_deleted_todos,
        create_todo_simple,
        create_todos_batch,
        update_todos_batch,
        delete_todos_batch,
        get_todo_details,
        duplicate_todo,
        mark_todos_completed,

        // 快捷方式
        open_any_file,
        get_file_icon_base64,
        get_shortcuts,
        create_shortcut,
        delete_shortcut,

        // 基本设置
        is_auto_start_enabled,
        set_enable_auto_start,
        set_complete,
        // 测试通信
        greet
      ]);

    println!("Starting Tauri application...");
    if let Err(e) = app_handle.run(tauri::generate_context!()) {
        eprintln!("运行 tauri 应用程序时出错: {:?}", e);
        std::process::exit(1);
    }
}

