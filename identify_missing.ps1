$missing = Get-Content -Path "missing_mods.json" | ConvertFrom-Json
$identified = @()
$unidentified = @()

foreach ($mod in $missing) {
    $hash = $mod.Hash
    Write-Host "Checking Modrinth for $($mod.Name)..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.modrinth.com/v2/version_file/$hash" -Method Get -ErrorAction Stop
        if ($response) {
            $identified += [PSCustomObject]@{
                name = $response.name
                download_url = $response.files[0].url
                sha1 = $hash
            }
            Write-Host "  Found: $($response.name)"
        }
    } catch {
        Write-Host "  Not found on Modrinth."
        $unidentified += $mod
    }
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 100
}

$identified | ConvertTo-Json | Out-File -FilePath "batch_identified.json" -Encoding utf8
$unidentified | ConvertTo-Json | Out-File -FilePath "batch_unidentified.json" -Encoding utf8
