#![windows_subsystem = "windows"]

use std::env;
use std::fs;
use std::io;
use std::process::Command;

fn main() {
    if let Err(e) = run() {
        eprintln!("CRITICAL ERROR: {}", e);
    }
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    const PAYLOAD: &[u8] = include_bytes!("../uninstaller_payload.zip");

    let temp_dir = env::temp_dir();
    let install_dir = temp_dir.join("CrystalTides_Uninstall_Temp");

    if install_dir.exists() {
        let _ = fs::remove_dir_all(&install_dir);
    }
    fs::create_dir_all(&install_dir)?;

    let reader = io::Cursor::new(PAYLOAD);
    let mut zip = zip::ZipArchive::new(reader)?;

    for i in 0..zip.len() {
        let mut file = zip.by_index(i)?;
        let name = file.name().to_string();
        
        let outpath = install_dir.join(name.replace("\\", "/").trim_start_matches('/'));

        if name.ends_with('/') || name.ends_with('\\') || file.is_dir() {
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

    let exe_path = install_dir.join("crystal_uninstaller.exe");
    
    if exe_path.exists() {
        Command::new(&exe_path)
            .current_dir(&install_dir)
            .arg("--install-dir")
            .arg(env::current_exe().unwrap_or_default().parent().unwrap_or(std::path::Path::new(".")).to_string_lossy().to_string())
            .spawn()?;
    } else {
        return Err(format!("Uninstaller not found at {:?}", exe_path).into());
    }

    Ok(())
}
