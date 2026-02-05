# Crystal Tides Launcher - Technical Roadmap & TODOs

## 🦀 Rust Migration (Performance & Stability)
The goal is to move heavy computational logic and low-level system interactions to Rust, keeping Flutter/Dart strictly for UI/UX.

- [ ] **File Hashing & Verification**
    - Move SHA-1/MD5 calculation of mods and assets to Rust.
    - *Why:* Dart `Isolates` are heavy. Rust can verify hundreds of files in parallel with minimal memory footprint and zero UI freezing.

- [ ] **Modpack Extraction (Unzip)**
    - Implement `.zip` extraction using Rust (`zip` crate or similar).
    - *Why:* Decompressing large modpacks is CPU-intensive. Rust is significantly faster and prevents the "App Not Responding" ghosting on Windows during extraction.

- [ ] **Parallel Download Manager**
    - Create a download engine in Rust using `tokio` + `reqwest`.
    - Features: Pause/Resume, partial content (Range headers), simultaneous connections per file.
    - *Why:* Better control over network resources and disk I/O than Dart's `http` client.

- [ ] **Java Process Management**
    - Handle Minecraft launch arguments and process monitoring via Rust.
    - Use Windows APIs (via `winapi` or `windows-rs`) to ensure the process starts with high priority and correct memory allocation.
    - Accurate Real-time RAM usage monitoring (reading process memory stats directly).

- [ ] **System Hardware Detection**
    - Detect available RAM and GPU info to auto-configure Java arguments.

## 📱 UI/UX (Flutter/Dart)
- [ ] **Settings Integration**
    - Expose the new Rust-based options in the Settings page (e.g., "Max Download Threads").
- [ ] **Real-time Progress Indicators**
    - Bridge Rust events (download progress, unzip percentage) to Dart Streams for smooth progress bars.

## 🧹 Technical Debt
- [ ] Standardize logging across Dart and Rust (stream Rust logs to Dart console/file).
- [ ] Comprehensive Error Handling: Ensure Rust panics are caught and surfaced gracefully to the Flutter UI.
