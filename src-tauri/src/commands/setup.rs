
use tauri::{AppHandle, Manager, State};
use std::sync::Mutex;

// Create a struct we'll use to track the completion of
// setup related tasks
pub struct SetupState {
  pub frontend_task: bool,
  pub backend_task: bool,
}

impl SetupState {
    pub fn new() -> Self {
        Self {
            frontend_task: false,
            backend_task: false,
        }
    }
}

#[tauri::command]
pub async fn set_complete(
    app: AppHandle,
    state: State<'_, Mutex<SetupState>>,
    task: String,
) -> Result<(), String> {
    // Lock the state without write access
    let mut state_lock = state.lock().unwrap();
    match task.as_str() {
        "frontend" => state_lock.frontend_task = true,
        "backend" => state_lock.backend_task = true,
        _ => return Err(format!("Invalid task: {}", task)),
    }
    // Check if both tasks are completed
    if state_lock.backend_task && state_lock.frontend_task {
        // Setup 完成，可以从启动窗口切换到主窗口
        if let Some(splash_window) = app.get_webview_window("splashscreen") {
            if let Some(_main_window) = app.get_webview_window("main") {
                // 在开发环境中，直接关闭启动窗口，主窗口已经可见
                splash_window.close().unwrap();
            }
        }
    }
    Ok(())
}

// An async function that does some heavy setup task
// pub async fn setup(app: AppHandle) -> Result<(), String> {
//   // 在开发环境中，立即完成后端任务
//   set_complete(
//       app.clone(),
//       app.state::<Mutex<SetupState>>(),
//       "backend".to_string(),
//   )
//   .await?;
//   Ok(())
// }
