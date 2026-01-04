use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use mlua::Lua;
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
pub extern "C" fn run_lua(script_ptr: *const c_char) -> *mut c_char {
    let script = unsafe {
        if script_ptr.is_null() { return std::ptr::null_mut(); }
        CStr::from_ptr(script_ptr)
    };

    let script_str = match script.to_str() {
        Ok(s) => s,
        Err(_) => return CString::new("ERR: INVALID_UTF8").unwrap().into_raw(),
    };

    let lua = Lua::new();
    
    // Injecting a simple print function for demo
    let globals = lua.globals();
    let result: String = match lua.load(script_str).eval() {
        Ok(res) => res,
        Err(e) => format!("LUA ERROR: {}", e),
    };

    CString::new(result).unwrap().into_raw()
}

#[unsafe(no_mangle)]
pub extern "C" fn free_string(s: *mut c_char) {
    if s.is_null() { return; }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
