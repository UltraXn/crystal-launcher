$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$launcherRoot = "f:\Portafolio\crystaltides\apps\launcher"
$installerRoot = "$launcherRoot\installer"
$bootstrapperRoot = "$launcherRoot\bootstrapper"
$nativeRoot = "$launcherRoot\native"

# Add Flutter to PATH (Crucial)
$env:Path += ";F:\tools\flutter\bin"

# Temp Directories on C: (To avoid OS Error 433 on F:)
$tempRoot = "C:\Users\nacho\.crystaltides_build_v2"
$tempLauncher = "$tempRoot\launcher"
$tempInstaller = "$tempRoot\installer"
$tempBootstrapper = "$tempRoot\bootstrapper"

function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

# --- PRE-CHECK ---
Write-Step "Checking environment..."
flutter --version
cargo --version

# --- CLEAN ---
Write-Step "Cleaning temp directories..."
if (Test-Path $tempRoot) { Remove-Item $tempRoot -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

# ==============================================================================
# PHASE 1: BUILD MAIN LAUNCHER (The Game)
# ==============================================================================
Write-Step "PHASE 1: Building Game Client (Main Launcher)..."

# 1.1 Copy Source to C:
Write-Host "Copying Game Source to C:..."
# PHASE 1: BUILD GAME CLIENT (MAIN LAUNCHER)
# ==============================================================================
Write-Step "PHASE 1: Building Game Client..."

$gameDistDir = "$tempLauncher\build\windows\x64\runner\Release"
$payloadAssetDir = "$installerRoot\assets\payload"
if (!(Test-Path $payloadAssetDir)) { New-Item -ItemType Directory -Force -Path $payloadAssetDir | Out-Null }
$localPayloadZip = "$payloadAssetDir\game_payload.zip"

if (Test-Path $localPayloadZip) {
    Write-Host "Skipping Phase 1: Game Payload already exists at $localPayloadZip" -ForegroundColor Cyan
} else {
    # 1.1 Copy Source to C:
    Write-Host "Copying Game Source to C:..."
    New-Item -ItemType Directory -Force -Path $tempLauncher | Out-Null
    
    # Use Robocopy for reliable copy
    robocopy "$launcherRoot" "$tempLauncher" /MIR /XD "build" "ephemeral" ".dart_tool" "pubspec.lock" > $null
    if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with code $LASTEXITCODE" }

    # 1.2 Build
    Set-Location $tempLauncher
    Write-Host "Running flutter build windows..."
    flutter clean
    flutter pub get
    flutter build windows --release
    if (-not $?) { throw "Game Client Build Failed" }

    # 1.3 Zip Payload
    Write-Host "Zipping Game Client..."
    # Rename launcher.exe to crystal_launcher.exe before zipping
    if (Test-Path "$gameDistDir\launcher.exe") {
        Rename-Item "$gameDistDir\launcher.exe" "$gameDistDir\crystal_launcher.exe" -Force
    }
    
    # Compress from C: to F: directly
    Compress-Archive -Path "$gameDistDir\*" -DestinationPath $localPayloadZip -Force
}

# ==============================================================================
# PHASE 2: BUILD INSTALLER UI (The Setup App)
# ==============================================================================
Write-Step "PHASE 2: Building Installer UI..."

# 2.1 Copy Source to C:
Write-Host "Copying Installer Source to C:..."
New-Item -ItemType Directory -Force -Path $tempInstaller | Out-Null
Copy-Item -Recurse "$installerRoot\*" "$tempInstaller" -Force
if (Test-Path "$tempInstaller\build") { Remove-Item "$tempInstaller\build" -Recurse -Force }

# 2.2 Build
Set-Location $tempInstaller
Write-Host "Running flutter build windows (Installer)..."
flutter clean
flutter pub get
flutter build windows --release
if (-not $?) { throw "Installer UI Build Failed" }

# 2.3 Prepare Installer Distribution
$installerDistDir = "$tempInstaller\build\windows\x64\runner\Release"

# Need to include the DLL? 
# Wait, installation_service.dart loads 'installer_native.dll'.
# But typically `flutter_rust_bridge` or explicit build setup handles it.
# In `rebuild_all.ps1`, it manually built Rust and copied it.
# I MUST DO THAT TOO.

# ==============================================================================
# PHASE 2.5: BUILD RUST NATIVE LIBRARY (For Installer FFI)
# ==============================================================================
Write-Step "PHASE 2.5: Building Core Rust Library..."
$tempNative = "$tempRoot\native"
New-Item -ItemType Directory -Force -Path $tempNative | Out-Null
Copy-Item -Recurse "$nativeRoot\*" "$tempNative" -Force

Set-Location $tempNative
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_core"
cargo build --release --lib
if (-not $?) { throw "Core Lib Build Failed" }

# Copy DLL to Installer Distribution
Copy-Item "$env:CARGO_TARGET_DIR\release\CrystalNative.dll" "$installerDistDir\installer_native.dll" -Force
# Also copy to F: for reference/debugging
Copy-Item "$env:CARGO_TARGET_DIR\release\CrystalNative.dll" "$installerRoot\build\windows\x64\runner\Release\installer_native.dll" -Force -ErrorAction SilentlyContinue

# ==============================================================================
# PHASE 3: BUILD BOOTSTRAPPER (The Final EXE)
# ==============================================================================
Write-Step "PHASE 3: Building Bootstrapper..."

# 3.1 Prepare Bootstrapper Source on C:
New-Item -ItemType Directory -Force -Path $tempBootstrapper | Out-Null
Copy-Item -Recurse "$bootstrapperRoot\*" "$tempBootstrapper" -Force

# 3.2 Zip Installer UI into Bootstrapper Payload
Write-Host "Zipping Installer UI into Bootstrapper Payload..."
$finalPayloadZip = "$tempBootstrapper\installer_payload.zip"
Compress-Archive -Path "$installerDistDir\*" -DestinationPath $finalPayloadZip -Force

# 3.3 Ensure Icon
Copy-Item "$nativeRoot\app_icon.ico" "$tempBootstrapper\app_icon.ico" -Force

# 3.4 Build
Set-Location $tempBootstrapper
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_boot"
cargo build --release
if (-not $?) { throw "Bootstrapper Build Failed" }

# ==============================================================================
# PHASE 4: FINALIZE
# ==============================================================================
Write-Step "PHASE 4: Delivery..."
$finalExe = "$env:CARGO_TARGET_DIR\release\crystal_bootstrapper.exe"
$destExe = "$launcherRoot\CTSMP_Installer.exe"

Copy-Item $finalExe $destExe -Force

Write-Host "`n[SUCCESS] Installer available at: $destExe" -ForegroundColor Green
Get-Item $destExe | Select-Object Name, Length, LastWriteTime
