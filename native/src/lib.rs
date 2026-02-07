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

    // Simulate hashing (Real file IO would happen here)
    let mut hasher = Sha1::new();
    hasher.update(path_str.as_bytes()); // Hashing the filename as a dummy test
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

#[unsafe(no_mangle)]
pub extern "C" fn free_string(s: *mut c_char) {
    if s.is_null() { return; }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
