#[cfg_attr(mobile, tauri::mobile_entry_point)]

mod commands;
use tauri_plugin_autostart::MacosLauncher;

use commands::greet::greet;
use commands::settings::{is_auto_start_enabled,set_enable_auto_start};
use commands::setup::{set_complete,setup};
use commands::events_diesel::{
    create_event, 
    get_all_events, 
    get_event_by_id, 
    update_event, 
    delete_event, 
    soft_delete_event,
    get_events_by_date_range,
    get_events_by_date,
    search_events,
    get_recent_events,
    get_upcoming_events,
    get_event_stats,
    cleanup_deleted_events,
    get_events_with_filter
};
use tauri::async_runtime::spawn;
use std::sync::Mutex;
use tauri_plugin_window_state::{Builder, StateFlags};
use std::time::Instant;

pub fn run() {
  let start_time = Instant::now();

  let app_handle = tauri::Builder::default()
      .plugin(Builder::default().with_state_flags(StateFlags::default()).build())
      .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
      .manage(Mutex::new(commands::setup::SetupState::new()))
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
        greet,
        // 事件管理命令
        create_event,
        get_all_events,
        get_event_by_id,
        update_event,
        delete_event,
        soft_delete_event,
        get_events_by_date_range,
        get_events_by_date,
        get_events_by_month,
        search_events,
        get_recent_events,
        get_upcoming_events,
        get_event_stats,
        cleanup_deleted_events
      ]);

    app_handle
      .run(tauri::generate_context!())
      .expect("运行 tauri 应用程序时出错");
}
