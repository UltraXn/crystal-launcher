#![windows_subsystem = "windows"] // Prevent console window from popping up

use std::env;
use std::fs;
use std::io;

use std::process::Command;

fn main() {
    if let Err(e) = run() {
        // En un entorno de GUI, podríamos usar un Message Box, pero por ahora fallamos silenciosamente 
        // o dejamos que el sistema operativo maneje el pánico. 
        // Para debugguear errores críticos, se puede usar el log de eventos o habilitar la consola.
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
