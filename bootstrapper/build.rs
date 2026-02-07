fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default() == "windows" {
        let mut res = winres::WindowsResource::new();
        // Force icon for the binary
        res.set_icon(&format!("{}/app_icon.ico", std::env::var("CARGO_MANIFEST_DIR").unwrap()));
        
        // Request Administrator Code (UAC)
        res.set_manifest(r#"
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
<trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
        <requestedPrivileges>
            <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
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
