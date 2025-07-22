use std::fs::{read_to_string, write};
use std::path::{PathBuf};

use tauri::{Webview, WebviewWindow};
use tauri::{plugin::{Builder, TauriPlugin}, AppHandle, Manager, Runtime, LogicalSize, LogicalPosition, Window, WindowEvent};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct WindowState {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool,
}

// 自定义保存路径（你可以换成别的）
fn get_state_path() -> PathBuf {
    std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .join("data")
        .join("window-state.json")
}

fn save_state<R: Runtime>(window: &WebviewWindow<R>) {
    if let (Ok(size), Ok(pos), Ok(maximized)) = (
        window.outer_size(),
        window.outer_position(),
        window.is_maximized(),
    ) {
        let state = WindowState {
            width: size.width as f64,
            height: size.height as f64,
            x: pos.x as f64,
            y: pos.y as f64,
            maximized,
        };

        if let Ok(json) = serde_json::to_string_pretty(&state) {
            let _ = std::fs::create_dir_all(get_state_path().parent().unwrap());
            let _ = write(get_state_path(), json);
            println!("窗口状态已保存: {:?}", state);
        }
    }
}

fn restore_state<R: Runtime>(window: &WebviewWindow<R>) {
    if let Ok(contents) = read_to_string(get_state_path()) {
        if let Ok(state) = serde_json::from_str::<WindowState>(&contents) {
            println!("正在恢复窗口状态: {:?}", state);
            
            // 设置窗口大小和位置
            if state.width > 0.0 && state.height > 0.0 {
                let _ = window.set_size(LogicalSize::new(state.width, state.height));
                println!("设置窗口大小: {}x{}", state.width, state.height);
            }
            
            if state.x >= 0.0 && state.y >= 0.0 {
                let _ = window.set_position(LogicalPosition::new(state.x, state.y));
                println!("设置窗口位置: ({}, {})", state.x, state.y);
            }
            
            // 最后设置最大化状态
            if state.maximized {
                let _ = window.maximize();
                println!("窗口已最大化");
            }
        } else {
            println!("解析窗口状态失败");
        }
    } else {
        println!("读取窗口状态文件失败");
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("window_state_custom")
        .setup(|app, _| {
            // 在 setup 阶段直接尝试恢复状态
            if let Some(main_window) = app.get_webview_window("main") {
                let window_clone = main_window.clone();
                app.run_on_main_thread(move || {
                    restore_state(&window_clone);
                });
            }
            Ok(())
        })
        .on_event(|app_handle, event| {
            match event {
                tauri::RunEvent::Ready => {
                    // 应用准备就绪时恢复窗口状态
                    if let Some(main_window) = app_handle.get_webview_window("main") {
                        let window_clone = main_window.clone();
                        app_handle.run_on_main_thread(move || {
                            restore_state(&window_clone);
                        });
                    }
                }
                tauri::RunEvent::WindowEvent {
                    label,
                    event: WindowEvent::CloseRequested { .. },
                    ..
                } => {
                    // 只监听 main 窗口关闭
                    if label == "main" {
                        if let Some(window) = app_handle.get_webview_window(&label) {
                            save_state(&window);
                        }
                    }
                }
                tauri::RunEvent::WindowEvent {
                    label,
                    event: WindowEvent::Resized(_),
                    ..
                } => {
                    // 只监听 main 窗口大小改变
                    if label == "main" {
                        if let Some(window) = app_handle.get_webview_window(&label) {
                            save_state(&window);
                        }
                    }
                }
                tauri::RunEvent::WindowEvent {
                    label,
                    event: WindowEvent::Moved(_),
                    ..
                } => {
                    // 只监听 main 窗口位置改变
                    if label == "main" {
                        if let Some(window) = app_handle.get_webview_window(&label) {
                            save_state(&window);
                        }
                    }
                }
                _ => {}
            }
        })
        .build()
}