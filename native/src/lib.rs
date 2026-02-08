// Force Rebuild v1.0.8-fix
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use rusqlite::Connection;
use sha1::{Sha1, Digest};
// Global State (Thread-Safe would require lazy_static or OnceLock, simplifying for PoC)
// For a real production DLL, we'd pass a context pointer back to the host.

#[unsafe(no_mangle)]
pub extern "C" fn init_core() -> i32 {
    // 1. Initialize SQLite
    match Connection::open_in_memory() {
        Ok(_) => {
            println!("[Rust Core] SQLite Memory Initialized.");
            1 // Success
        },
        Err(e) => {
            println!("[Rust Core] DB Error: {}", e);
            0 // Fail
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn calculate_sha1(path_ptr: *const c_char) -> *mut c_char {
    let c_str = unsafe {
        if path_ptr.is_null() { return std::ptr::null_mut(); }
        CStr::from_ptr(path_ptr)
    };

    let path_str = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => return CString::new("INVALID_UTF8").unwrap().into_raw(),
    };

    // Real file hashing
    let mut file = match std::fs::File::open(path_str) {
        Ok(f) => f,
        Err(_) => return CString::new("FILE_NOT_FOUND").unwrap().into_raw(),
    };

    let mut hasher = Sha1::new();
    let mut buffer = [0; 8192]; // 8KB buffer

    loop {
        let count = match std::io::Read::read(&mut file, &mut buffer) {
            Ok(c) => c,
            Err(_) => return CString::new("READ_ERROR").unwrap().into_raw(),
        };
        if count == 0 { break; }
        hasher.update(&buffer[..count]);
    }

    let result = hasher.finalize();
    let hex_hash = hex::encode(result);

    CString::new(hex_hash).unwrap().into_raw()
}




#[unsafe(no_mangle)]
pub extern "C" fn extract_archive(archive_path: *const c_char, output_path: *const c_char) -> i32 {
    let archive_str = unsafe {
        if archive_path.is_null() { return -1; }
        match CStr::from_ptr(archive_path).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let output_str = unsafe {
        if output_path.is_null() { return -1; }
        match CStr::from_ptr(output_path).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let file = match std::fs::File::open(archive_str) {
        Ok(f) => f,
        Err(_) => return -3, // File not found
    };

    let mut archive = match zip::ZipArchive::new(file) {
        Ok(a) => a,
        Err(_) => return -4, // Bad archive
    };

    for i in 0..archive.len() {
        let mut file = match archive.by_index(i) {
            Ok(f) => f,
            Err(_) => continue,
        };

        let outpath = match file.enclosed_name() {
            Some(path) => std::path::Path::new(output_str).join(path),
            None => continue,
        };

        // Fix: Explicitly check is_dir() OR trailing separator (both / and \)
        // This solves "OS Error 123" where directories were treated as files on Windows.
        if file.is_dir() || (*file.name()).ends_with('/') || (*file.name()).ends_with('\\') {
             let _ = std::fs::create_dir_all(&outpath);
        } else {
            // It's a file
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    match std::fs::create_dir_all(p) {
                        Ok(_) => {},
                        Err(_) => return -52, // Directory Create Error
                    }
                }
            }
            let mut outfile = match std::fs::File::create(&outpath) {
                Ok(f) => f,
                Err(_) => return -55, // File Create Error
            };
            if std::io::copy(&mut file, &mut outfile).is_err() {
                 return -56; // Copy Error
            }
        }
    }

    1 // Success
}


use std::io::Write; // Needed for file writing

#[unsafe(no_mangle)]
pub extern "C" fn install_neoforge(
    neo_version_ptr: *const c_char,
    game_dir_ptr: *const c_char,
    java_path_ptr: *const c_char
) -> i32 {
    // 1. Convert C Strings to Rust Strings
    let neo_version = unsafe {
        if neo_version_ptr.is_null() { return -1; }
        match CStr::from_ptr(neo_version_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let game_dir = unsafe {
        if game_dir_ptr.is_null() { return -1; }
        match CStr::from_ptr(game_dir_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let java_path = unsafe {
        if java_path_ptr.is_null() { return -1; }
        match CStr::from_ptr(java_path_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    // 2. Construct Download URL and Paths
    let file_name = format!("neoforge-{}-installer.jar", neo_version);
    let url = format!(
        "https://maven.neoforged.net/releases/net/neoforged/neoforge/{}/{}",
        neo_version, file_name
    );
    let installer_path = std::path::Path::new(game_dir).join(&file_name);

    println!("[Rust] Downloading NeoForge from: {}", url);

    // 3. Download File (Blocking)
    let response = match reqwest::blocking::get(&url) {
        Ok(res) => res,
        Err(e) => {
            println!("[Rust] Download Request Failed: {}", e);
            return -10;
        }
    };

    if !response.status().is_success() {
        println!("[Rust] Download Failed Status: {}", response.status());
        return -11;
    }

    let content = match response.bytes() {
        Ok(b) => b,
        Err(e) => {
             println!("[Rust] Failed to read bytes: {}", e);
             return -12;
        }
    };

    let mut file = match std::fs::File::create(&installer_path) {
        Ok(f) => f,
        Err(e) => {
            println!("[Rust] Failed to create installer file: {}", e);
            return -13;
        }
    };

    if let Err(e) = file.write_all(&content) {
        println!("[Rust] Failed to write to file: {}", e);
        return -14;
    }
    
    // Flush to ensure it's written before Java tries to read it
    let _ = file.flush();
    drop(file); // Close file handle

    println!("[Rust] Download Complete. Running Installer...");

    // 4. Run Java Installer
    // java -jar installer.jar --installClient gameDir
    let output = std::process::Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("--installClient")
        .arg(game_dir)
        .current_dir(game_dir)
        .output();

    let exit_code = match output {
        Ok(out) => {
            if !out.status.success() {
                println!("[Rust] Installer Failed: {}", String::from_utf8_lossy(&out.stderr));
                -20
            } else {
                println!("[Rust] Installer Success: {}", String::from_utf8_lossy(&out.stdout));
                1 // Success
            }
        },
        Err(e) => {
            println!("[Rust] Failed to launch Java: {}", e);
            -21
        }
    };

    // 5. Cleanup
    if installer_path.exists() {
        let _ = std::fs::remove_file(installer_path);
    }

    exit_code
}

#[unsafe(no_mangle)]
pub extern "C" fn free_string(s: *mut c_char) {
    if s.is_null() { return; }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
