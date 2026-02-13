#![windows_subsystem = "windows"] // Prevent console window from popping up

use std::env;
use std::fs;
use std::io;

use std::process::Command;

use windows::core::PCWSTR;
use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, MB_OK, MB_ICONERROR};

fn main() {
    if let Err(e) = run() {
        let title: Vec<u16> = "CrystalTides Bootstrapper Error\0".encode_utf16().collect();
        let message = format!("CRITICAL ERROR:\n{}\n\nPlease contact support.", e);
        let message_wide: Vec<u16> = message.encode_utf16().chain(std::iter::once(0)).collect();

        unsafe {
            MessageBoxW(None, PCWSTR(message_wide.as_ptr()), PCWSTR(title.as_ptr()), MB_OK | MB_ICONERROR);
        }
        eprintln!("CRITICAL ERROR: {}", e);
    }
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    const PAYLOAD: &[u8] = include_bytes!("../installer_payload.zip");

    let temp_dir = env::temp_dir();
    let install_dir = temp_dir.join("CrystalTides_Setup");

    if install_dir.exists() {
        let _ = fs::remove_dir_all(&install_dir);
    }
    fs::create_dir_all(&install_dir)?;

    let reader = io::Cursor::new(PAYLOAD);
    let mut zip = zip::ZipArchive::new(reader)?;

    for i in 0..zip.len() {
        let mut file = zip.by_index(i)?;
        let name = file.name().to_string();
        
        // Clean name for Windows
        let outpath = install_dir.join(name.replace("\\", "/").trim_start_matches('/'));

        if name.ends_with('/') || name.ends_with('\\') || file.is_dir() {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| {
                format!("Failed to create {:?}: {}", outpath, e)
            })?;
            io::copy(&mut file, &mut outfile)?;
        }
    }

    let exe_path = install_dir.join("crystal_installer.exe");
    
    if exe_path.exists() {
        Command::new(&exe_path)
            .current_dir(&install_dir)
            .spawn()?;
    } else {
        return Err(format!("Installer not found at {:?}", exe_path).into());
    }

    Ok(())
}
