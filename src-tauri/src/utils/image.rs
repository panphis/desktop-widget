#[cfg(target_os = "windows")]
pub mod platform {
    use std::{ffi::OsStr, os::windows::ffi::OsStrExt, path::PathBuf};
    use windows::{
        Win32::{
            Foundation::*,
            Graphics::Gdi::*,
            Storage::FileSystem::*,
            UI::{
                Shell::{SHGetFileInfoW, SHFILEINFOW, SHGFI_ICON, SHGFI_LARGEICON},
                WindowsAndMessaging::*,
            },
        },
        core::PCWSTR,
    };
    use base64::engine::general_purpose;
    use base64::Engine;
    use image::{RgbaImage, ImageBuffer};
    use image::codecs::png::PngEncoder;
    use image::ImageEncoder;

    pub fn get_icon(path: String) -> Result<String, String> {
        let path = PathBuf::from(&path);
        if !path.exists() {
            return Err("Path does not exist".to_string());
        }

        let wide: Vec<u16> = OsStr::new(&path)
            .encode_wide()
            .chain(Some(0))
            .collect();

        unsafe {
            let mut file_info = SHFILEINFOW::default();
            let result = SHGetFileInfoW(
                PCWSTR::from_raw(wide.as_ptr()),
                FILE_ATTRIBUTE_NORMAL,
                Some(&mut file_info),
                std::mem::size_of::<SHFILEINFOW>() as u32,
                SHGFI_ICON | SHGFI_LARGEICON,
            );

            // SHGetFileInfoW 返回值为句柄（非0表示成功），而不是 Result 类型
            if result == 0 || file_info.hIcon.0 == 0 {
                return Err("Failed to get icon handle".to_string());
            }

            let mut icon_info = ICONINFO::default();
            if GetIconInfo(file_info.hIcon, &mut icon_info).is_err() {
                let _ = DestroyIcon(file_info.hIcon);
                return Err("GetIconInfo failed".to_string());
            }

            let hdc = GetDC(HWND(0));
            if hdc.is_invalid() {
                let _ = DestroyIcon(file_info.hIcon);
                return Err("Failed to get device context".to_string());
            }

            let mut bmp_info = BITMAP::default();
            if GetObjectW(
                HGDIOBJ(icon_info.hbmColor.0), 
                std::mem::size_of::<BITMAP>() as i32, 
                Some(&mut bmp_info as *mut _ as *mut _)
            ) == 0 {
                ReleaseDC(HWND(0), hdc);
                let _ =DestroyIcon(file_info.hIcon);
                return Err("GetObjectW failed".to_string());
            }

            let width = bmp_info.bmWidth as u32;
            let height = bmp_info.bmHeight as u32;

            if width == 0 || height == 0 {
                ReleaseDC(HWND(0), hdc);
                let _ =DestroyIcon(file_info.hIcon);
                return Err("Invalid bitmap dimensions".to_string());
            }

            let mut buffer = vec![0u8; (width * height * 4) as usize];

            let bmi = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: width as i32,
                    biHeight: -(height as i32), // 负值表示自上而下
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: BI_RGB.0,
                    biSizeImage: 0,
                    biXPelsPerMeter: 0,
                    biYPelsPerMeter: 0,
                    biClrUsed: 0,
                    biClrImportant: 0,
                },
                ..Default::default()
            };

            let res = GetDIBits(
                hdc,
                icon_info.hbmColor,
                0,
                height as u32,
                Some(buffer.as_mut_ptr() as *mut _),
                &bmi as *const _ as *mut _,
                DIB_RGB_COLORS,
            );

            ReleaseDC(HWND(0), hdc);
            DeleteObject(HGDIOBJ(icon_info.hbmColor.0));
            DeleteObject(HGDIOBJ(icon_info.hbmMask.0));
            let _ =DestroyIcon(file_info.hIcon);

            if res == 0 {
                return Err("GetDIBits failed".to_string());
            }

            // 转换 BGRA 到 RGBA
            for pixel in buffer.chunks_exact_mut(4) {
                pixel.swap(0, 2); // 交换 B 和 R
            }

            let img: RgbaImage = ImageBuffer::from_raw(width, height, buffer)
                .ok_or("Failed to build image buffer")?;
            
            // 将图标缩放到更大的尺寸 (128x128)
            let target_size = 128u32;
            let scaled_img = if width != target_size || height != target_size {
                image::imageops::resize(&img, target_size, target_size, image::imageops::FilterType::Lanczos3)
            } else {
                img
            };
            
            let mut buf = Vec::new();
            let encoder = PngEncoder::new(&mut buf);
            encoder.write_image(&scaled_img, target_size, target_size, image::ColorType::Rgba8.into())
                .map_err(|e| e.to_string())?;
            
            Ok(general_purpose::STANDARD.encode(buf))
        }
    }
}

#[cfg(target_os = "macos")]
pub mod platform {
    use base64::engine::general_purpose;
    use base64::Engine;
    use cocoa::foundation::{NSString, NSAutoreleasePool, NSSize};
    use cocoa::base::{nil, id};
    use objc::{class, msg_send, sel, sel_impl};

    pub fn get_icon(path: String) -> Result<String, String> {
        unsafe {
            let _pool = NSAutoreleasePool::new(nil);

            let ns_path: id = NSString::alloc(nil).init_str(&path);
            let ws: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let icon: id = msg_send![ws, iconForFile: ns_path];

            if icon == nil {
                return Err("Failed to get icon".to_string());
            }

            // 设置图标大小为 128x128
            let _: () = msg_send![icon, setSize: NSSize { width: 128.0, height: 128.0 }];
            
            // 获取 TIFF 表示
            let tiff_data: id = msg_send![icon, TIFFRepresentation];
            if tiff_data == nil {
                return Err("Failed to get TIFF representation".to_string());
            }

            // 创建位图图像表示
            let image_rep: id = msg_send![class!(NSBitmapImageRep), imageRepWithData: tiff_data];
            if image_rep == nil {
                return Err("Failed to get image representation".to_string());
            }

            // 获取 PNG 数据
            let png_data: id = msg_send![image_rep, representationUsingType:4 properties:nil];
            if png_data == nil {
                return Err("Failed to get PNG data".to_string());
            }

            let length: usize = msg_send![png_data, length];
            let bytes: *const u8 = msg_send![png_data, bytes];
            let slice = std::slice::from_raw_parts(bytes, length);
            
            Ok(general_purpose::STANDARD.encode(slice))
        }
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub mod platform {
    use base64::engine::general_purpose;
    use base64::Engine;

    pub fn get_icon(path: String) -> Result<String, String> {
        // Linux 和其他平台暂时返回错误
        Err("Icon extraction not supported on this platform".to_string())
    }
}
