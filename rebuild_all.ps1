
# Master Build Script for CrystalTides Installer
$ErrorActionPreference = "Stop"

$launcherRoot = "f:\Portafolio\crystaltides\apps\launcher"
$installerRoot = "$launcherRoot\installer"
$nativeRoot = "$launcherRoot\native"
$env:Path += ";F:\tools\flutter\bin"

$buildTempDir = "C:\Users\nacho\.crystaltides_flutter_build"
$cargoTargetDir = "C:\Users\nacho\.crystaltides_target"

Write-Host ">>> STEP 0: Generating Icons (V7 High-Fidelity PNG-in-ICO)..." -ForegroundColor Cyan
& "$nativeRoot\generate_icons.ps1"
if (-not $?) { throw "Icon generation failed" }

# Distribution
$iconSource = "$nativeRoot\app_icon.ico"
$iconDest2 = "$installerRoot\native\app_icon.ico"
$iconDest3 = "$installerRoot\windows\runner\resources\app_icon.ico"

Copy-Item $iconSource $iconDest2 -Force
Copy-Item $iconSource $iconDest3 -Force

# Redundant copy to root of installer just in case
Copy-Item $iconSource "$installerRoot\app_icon.ico" -Force


Write-Host ">>> STEP 1: Building Flutter (Nuclear Clean)..." -ForegroundColor Cyan
# Nuclear Option: Delete build temp entirely
if (Test-Path $buildTempDir) { Remove-Item $buildTempDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $buildTempDir | Out-Null
Copy-Item -Recurse "$installerRoot\*" "$buildTempDir" -Force

Set-Location $buildTempDir
flutter clean
flutter pub get
flutter build windows --release
if (-not $?) { throw "Flutter build failed on C:" }

# Copy artifacts back
$releaseDest = "$installerRoot\build\windows\x64\runner\Release"
if (-not (Test-Path $releaseDest)) { New-Item -ItemType Directory -Force -Path $releaseDest | Out-Null }
Copy-Item -Recurse "$buildTempDir\build\windows\x64\runner\Release\*" "$releaseDest" -Force

Write-Host ">>> STEP 2: Building Native DLL (Workaround: C: Target)..." -ForegroundColor Cyan
Set-Location $nativeRoot
$env:CARGO_TARGET_DIR = $cargoTargetDir
# Nuclear Clean for Rust
if (Test-Path "$cargoTargetDir\release\deps") { Remove-Item "$cargoTargetDir\release\deps" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "$cargoTargetDir\release\build") { Remove-Item "$cargoTargetDir\release\build" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "$cargoTargetDir\release\examples") { Remove-Item "$cargoTargetDir\release\examples" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "$cargoTargetDir\release\incremental") { Remove-Item "$cargoTargetDir\release\incremental" -Recurse -Force -ErrorAction SilentlyContinue }
# Don't delete everything to save dowload time, but delete build artifacts

cargo build --release --lib
if (-not $?) { throw "Rust lib build failed" }
Copy-Item "$cargoTargetDir\release\CrystalNative.dll" "$releaseDest\installer_native.dll" -Force

Write-Host ">>> STEP 3: Zipping Payload (Workaround: C: Temp)..." -ForegroundColor Cyan
$payloadTemp = "C:\Users\nacho\.crystaltides_payload"
if (Test-Path $payloadTemp) { Remove-Item $payloadTemp -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $payloadTemp | Out-Null
Copy-Item -Recurse "$releaseDest\*" "$payloadTemp" -Force

$zipPathC = "$payloadTemp\installer_payload.zip"
Compress-Archive -Path "$payloadTemp\*" -DestinationPath $zipPathC -CompressionLevel Optimal -Force
Copy-Item $zipPathC "$launcherRoot\installer_payload.zip" -Force

Write-Host ">>> STEP 4: Building Bootstrapper (Isolated Crate)..." -ForegroundColor Cyan
$bootstrapperRoot = "$launcherRoot\bootstrapper"
Set-Location $bootstrapperRoot

# Copy dependencies to isolated crate
Copy-Item "$nativeRoot\app_icon.ico" "$bootstrapperRoot\app_icon.ico" -Force
Copy-Item "$launcherRoot\installer_payload.zip" "$bootstrapperRoot\installer_payload.zip" -Force

# Use specialized target dir to avoid OS 433 errors and cache pollution
$env:CARGO_TARGET_DIR = "C:\Users\nacho\.crystaltides_target_bootstrapper"
# Clean previous build to force resource embedding
if (Test-Path "$env:CARGO_TARGET_DIR\release\crystal_bootstrapper.exe") { 
    Remove-Item "$env:CARGO_TARGET_DIR\release\crystal_bootstrapper.exe" -Force 
}

# Build
cargo build --release
if (-not $?) { throw "Rust isolated bootstrapper build failed" }

Write-Host ">>> STEP 5: Finalizing Setup EXE..." -ForegroundColor Cyan
Copy-Item "$env:CARGO_TARGET_DIR\release\crystal_bootstrapper.exe" "$launcherRoot\CrystalTides_Setup.exe" -Force

Write-Host "!!! BUILD COMPLETE (Stable) !!!" -ForegroundColor Green
Get-Item "$launcherRoot\CrystalTides_Setup.exe" | Select-Object Name, Length, LastWriteTime
