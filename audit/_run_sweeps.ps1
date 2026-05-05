# Phase 0.4 — verbatim sweeps from the v2 prompt §3.4
# Run from repo root: pwsh -NoProfile -File audit/_run_sweeps.ps1
$ErrorActionPreference = 'Continue'
$summary = @()

function Run-Sweep {
    param([string]$Name, [string]$OutFile, [scriptblock]$Body)
    Write-Host "=== $Name ===" -ForegroundColor Cyan
    $matches = & $Body
    if ($null -eq $matches) { $matches = @() }
    elseif ($matches -isnot [System.Collections.IEnumerable] -or $matches -is [string]) { $matches = @($matches) }
    $count = ($matches | Measure-Object).Count
    if ($count -gt 0) { $matches | Out-File -Encoding utf8 -FilePath $OutFile }
    else { '' | Out-File -Encoding utf8 -FilePath $OutFile }
    $script:summary += "$Name : $count matches -> $OutFile"
    Write-Host "  $count matches written to $OutFile"
}

# 1. Silent catch blocks
Run-Sweep 'silent_catches' 'audit/silent_catches.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx -Path .\app,.\components,.\hooks,.\lib,.\backend,.\contexts,.\store `
      | Select-String -Pattern 'catch\s*\([^)]*\)\s*\{\s*\}'
}

# 2. "error swallowed" comments
Run-Sweep 'error_swallowed_comments' 'audit/error_swallowed_comments.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern 'error\s+swallowed|swallow.*error'
}

# 3. canSecureDay nested-config bug pattern
Run-Sweep 'required_field_uses' 'audit/required_field_uses.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern '\bt\.required\b'
}

# 4. Hardcoded hex outside design-system
Run-Sweep 'raw_hex' 'audit/raw_hex.txt' {
    Get-ChildItem -Recurse -Include *.tsx,*.ts `
      | Where-Object { $_.FullName -notmatch 'design-system\.ts$' -and $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'coverage' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern '#[0-9A-Fa-f]{6}\b'
}

# 5. tRPC paths not going through TRPC constants
Run-Sweep 'trpc_call_sites' 'audit/trpc_call_sites.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern 'trpc\.[a-z]+\.[a-z]+'
}

# 6. Routes not going through ROUTES constants
Run-Sweep 'raw_route_strings' 'audit/raw_route_strings.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern 'router\.(push|replace)\([''"]\/' `
      | Where-Object { $_.Line -notmatch 'ROUTES\.' }
}

# 7. Direct Supabase clients
Run-Sweep 'supabase_clients' 'audit/supabase_clients.txt' {
    Get-ChildItem -Recurse -Include *.ts -Path .\backend `
      | Select-String -Pattern 'createClient\('
}

# 8. Service-role key usage
Run-Sweep 'service_role_uses' 'audit/service_role_uses.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern 'SUPABASE_SERVICE_ROLE_KEY'
}

# 9. console.log left in production code
Run-Sweep 'console_logs' 'audit/console_logs.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx -Path .\app,.\components,.\hooks,.\lib,.\backend,.\contexts,.\store `
      | Select-String -Pattern 'console\.log\(' `
      | Where-Object { $_.Line -notmatch 'eslint-disable' }
}

# 10. `any` and `as any`
Run-Sweep 'any_uses' 'audit/any_uses.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx -Path .\app,.\components,.\hooks,.\lib,.\backend,.\contexts,.\store `
      | Select-String -Pattern ':\s*any\b|as\s+any\b' `
      | Where-Object { $_.Line -notmatch 'eslint-disable' }
}

# 11. GRIT vs GRIIT typos
Run-Sweep 'grit_typos' 'audit/grit_typos.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md,*.json,*.bat,*.url `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'coverage' -and $_.FullName -notmatch 'package-lock\.json' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern '\bGRIT\b' `
      | Where-Object { $_.Line -notmatch 'GRIIT' }
}

# 12. Accessibility — interactive elements (with 5-line postcontext)
Run-Sweep 'interactive_elements' 'audit/interactive_elements.txt' {
    Get-ChildItem -Recurse -Include *.tsx -Path .\app,.\components `
      | Select-String -Pattern '<(TouchableOpacity|Pressable)' -Context 0,5
}

# 13. FlatList without performance props
Run-Sweep 'flatlist_uses' 'audit/flatlist_uses.txt' {
    Get-ChildItem -Recurse -Include *.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern '<FlatList' -Context 0,10
}

# 14. Image vs expo-image (RN Image imports)
Run-Sweep 'rn_image_uses' 'audit/rn_image_uses.txt' {
    Get-ChildItem -Recurse -Include *.tsx `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern "from\s+['""]react-native['""]" -Context 0,2 `
      | Where-Object { $_.Line -match '\bImage\b' }
}

# 15. Privacy/follow surface
Run-Sweep 'privacy_follow_surface' 'audit/privacy_follow_surface.txt' {
    Get-ChildItem -Recurse -Include *.ts,*.tsx,*.sql `
      | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'audit\\' } `
      | Select-String -Pattern 'account_privacy|is_private|follow_request|isPrivate|privateAccount|friends_only|visibility'
}

Write-Host ""
Write-Host "===== SUMMARY =====" -ForegroundColor Yellow
$summary | ForEach-Object { Write-Host $_ }
$summary | Out-File -Encoding utf8 -FilePath audit/_sweeps_summary.txt
