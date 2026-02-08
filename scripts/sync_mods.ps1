$ModsDir = "C:\Users\nacho\AppData\Roaming\.minecraft\mods"
$Repo = "UltraXn/CrystalTides-Assets"
$Tag = "mods-v1"
$SqlFile = "insert_mods.sql"
$ErrorActionPreference = "Stop"

Write-Host "Starting Mod Sync..."
Write-Host "Source: $ModsDir"
Write-Host "Target: GitHub Release $Tag in $Repo"

# 1. Create Release if needed
$ReleaseExists = $false
try {
    # Check if release exists. If it fails, it throws an error or returns non-zero.
    # We strip output to avoid clutter.
    gh release view $Tag --repo $Repo | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $ReleaseExists = $true
    }
} catch {
    # Ignore error, it means release doesn't exist
}

if ($ReleaseExists) {
    Write-Host "Release '$Tag' already exists."
} else {
    Write-Host "Creating release '$Tag'..."
    gh release create $Tag --repo $Repo --title "Official Mods Storage" --notes "Storage for launcher mods"
}

# 2. Process Files
$SqlContent = "TRUNCATE TABLE official_mods;`n"
$Files = Get-ChildItem $ModsDir -Filter *.jar

Write-Host "Found $( $Files.Count ) mods."

foreach ($File in $Files) {
    Write-Host "Processing $($File.Name)..." -NoNewline
    
    # Calculate SHA1 with LiteralPath to handle brackets []
    try {
        $Hash = (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA1).Hash.ToLower()
    } catch {
        Write-Host " [Hash Error: $_]" -ForegroundColor Red
        continue
    }
    $Url = "https://github.com/$Repo/releases/download/$Tag/$($File.Name)"
    
    # Escape single quotes in filename for SQL
    $NameSafe = $File.Name.Replace("'", "''")
    $SqlContent += "INSERT INTO official_mods (name, version, url, hash_sha1) VALUES ('$NameSafe', '1.0', '$Url', '$Hash');`n"
    
    # Upload to GitHub
    try {
        # Check if asset exists by listing assets (expensive) or just try upload. 
        # gh release upload fails if file exists without --clobber.
        # We use --clobber to be safe and ensure latest version.
        # Use Start-Process to avoid hanging on output buffer if large
        $proc = Start-Process -FilePath "gh" -ArgumentList "release", "upload", $Tag, "`"$($File.FullName)`"", "--repo", $Repo, "--clobber" -NoNewWindow -PassThru -Wait
        
        if ($proc.ExitCode -eq 0) {
            Write-Host " [Uploaded]" -ForegroundColor Green
        } else {
             Write-Host " [Upload Error]" -ForegroundColor Red
        }
    } catch {
         Write-Host " [Error: $_]" -ForegroundColor Red
    }
}

Set-Content -Path $SqlFile -Value $SqlContent
Write-Host "Done! logical script saved to $SqlFile"
Write-Host "Run this SQL in Supabase via Dashboard or 'psql' to update the database."
