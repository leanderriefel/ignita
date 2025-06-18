// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_deep_link::DeepLinkExt;
use tauri::Manager;

#[tauri::command]
fn show_window(window: tauri::Window) -> Result<(), String> {
    window
        .show()
        .map_err(|e| format!("Failed to show window: {}", e))?;
    window
        .set_focus()
        .map_err(|e| format!("Failed to set focus: {}", e))?;
    Ok(())
}

fn main() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
                
                // Manual validation for runtime-registered schemes
                for arg in argv.iter() {
                    let arg_str = arg.as_str();
                    if arg_str.starts_with("ignita://") {
                        println!("Valid deep link detected: {}", arg_str);
                        // Focus the existing main window on valid deep-link activation
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.set_focus();
                        }
                        break;
                    }
                }
            }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            {
                app.deep_link().register_all()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!(show_window))
        .expect("error while running tauri application");
}
