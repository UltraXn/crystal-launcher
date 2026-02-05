// apps/launcher/native/src/bin/bootstrapper.rs
#![windows_subsystem = "windows"] // Prevent console window from popping up

use std::env;
use std::fs;
use std::io;
use std::path::Path;
use std::process::Command;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Embed the payload (The Zipped Flutter Installer)
    // This file must exist at compile time.
    // In CI, we will generate this file before compiling this binary.
    const PAYLOAD: &[u8] = include_bytes!("../../installer_payload.zip");

    // 2. Determine Extraction Path (%TEMP%/CrystalInstaller)
    let temp_dir = env::temp_dir();
    let install_dir = temp_dir.join("CrystalTides_Setup");

    // Clean up previous run if exists to ensure fresh files
    if install_dir.exists() {
        let _ = fs::remove_dir_all(&install_dir);
    }
    fs::create_dir_all(&install_dir)?;

    // 3. Extract Zip
    let reader = std::io::Cursor::new(PAYLOAD);
    let mut zip = zip::ZipArchive::new(reader)?;

    for i in 0..zip.len() {
        let mut file = zip.by_index(i)?;
        let outpath = match file.enclosed_name() {
            Some(path) => install_dir.join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath)?;
            io::copy(&mut file, &mut outfile)?;
        }
    }

    // 4. Launch the Flutter Installer
    let exe_path = install_dir.join("crystal_installer.exe");
    
    if exe_path.exists() {
        Command::new(exe_path)
            .spawn()?; // Fire and forget. The bootstrapper exits, the installer stays running.
    } else {
        // Fallback: If for some reason the exe isn't there (bad zip?), show a message box?
        // For now, just exit silently or panic in debug.
        eprintln!("Installer executable not found in payload!");
    }

    Ok(())
}
