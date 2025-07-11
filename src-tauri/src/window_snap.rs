use tauri::{Builder, Manager, PhysicalSize, Window, WindowEvent, Emitter};

#[derive(Debug, Clone, Copy)]
pub enum SnapEdge {
    Top,
    Bottom,
    Left,
    Right,
}

impl SnapEdge {
    pub fn as_str(&self) -> &'static str {
        match self {
            SnapEdge::Top => "top",
            SnapEdge::Bottom => "bottom",
            SnapEdge::Left => "left",
            SnapEdge::Right => "right",
        }
    }
}

pub struct SnapHandler;

impl SnapHandler {
    pub fn handle_event<F>(&self, event: &WindowEvent, window: &Window, mut on_snap: F)
    where
        F: FnMut(SnapEdge),
    {
        if let WindowEvent::Moved(pos) = event {
            if let Some(monitor) = window.current_monitor().ok().flatten() {
                let size = monitor.size();
                let width = size.width as i32;
                let height = size.height as i32;
                let x = pos.x;
                let y = pos.y;
                let threshold = 10;
                let margin = 50;

                let edge = if y <= threshold {
                    Some(SnapEdge::Top)
                } else if height - y - margin <= threshold {
                    Some(SnapEdge::Bottom)
                } else if x <= threshold {
                    Some(SnapEdge::Left)
                } else if width - x - margin <= threshold {
                    Some(SnapEdge::Right)
                } else {
                    None
                };

                if let Some(e) = edge {
                    on_snap(e);
                }
            }
        }
    }
}

pub fn register_snap_handler(builder: Builder<tauri::Wry>) -> Builder<tauri::Wry> {
    let handler = SnapHandler;
    builder.on_window_event(move |window, event| {
        handler.handle_event(event, window, |edge| {
            let _ = window.emit("window-edge-hide", edge.as_str());
        });
    })
}
