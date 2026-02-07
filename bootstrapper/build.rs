fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default() == "windows" {
        let mut res = winres::WindowsResource::new();
        let icon_path = std::path::Path::new(&std::env::var("CARGO_MANIFEST_DIR").unwrap()).join("app_icon.ico");
        res.set_icon(icon_path.to_str().unwrap());
        
        // Request Administrator Code (UAC)
        res.set_manifest(r#"
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
<trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
        <requestedPrivileges>
            <requestedExecutionLevel level="asInvoker" uiAccess="false" />
        </requestedPrivileges>
    </security>
</trustInfo>
</assembly>
"#);
        
        res.compile().unwrap();
    }
    println!("cargo:rerun-if-changed=installer_payload.zip");
    println!("cargo:rerun-if-changed=app_icon.ico");
}
