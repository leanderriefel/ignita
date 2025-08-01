// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
// use tauri_plugin_updater::UpdaterExt;

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
                use tauri_plugin_deep_link::DeepLinkExt;
                if let Err(e) = app.deep_link().register_all() {
                    eprintln!("Failed to register deep links: {e}");
                }
            }
            Ok(())
        })
        // .plugin(tauri_plugin_updater::Builder::new().build())
        // .setup(|app| {
        //     let handle = app.handle().clone();
        //     tauri::async_runtime::spawn(async move {
        //       update(handle).await.unwrap();
        //     });
        //     Ok(())
        //   })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
//     if let Some(update) = app.updater()?.check().await? {
//       let mut downloaded =
//       // alternatively we could also call update.download() and update.install() separately
//       update
//         .download_and_install(
//           |chunk_length, content_length| {
//             downloaded += chunk_length;
//             println!("downloaded {downloaded} from {content_length:?}");
//           },
//           || {
//             println!("download finished");
//           },
//         )
//         .await
//       println!("update installed");
//       app.restart();

//     Ok(())
//   }
// }
