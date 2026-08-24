$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$installerPath = Join-Path $repoRoot 'scripts/install.ps1'
$tempRoot = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) { [System.IO.Path]::GetTempPath() } else { $env:RUNNER_TEMP }
$testRoot = Join-Path $tempRoot "agentkey-dsh-install-target-$([guid]::NewGuid())"
$fakeBin = Join-Path $testRoot 'bin'
$fakeAppData = Join-Path $testRoot 'appdata'
$logPath = Join-Path $testRoot 'npx.log'

New-Item -ItemType Directory -Force -Path $fakeBin, $fakeAppData | Out-Null
Remove-Item -Force -ErrorAction SilentlyContinue $logPath

$fakeNpx = @"
@echo off
echo %*>>"$logPath"
mkdir "%APPDATA%\amp\skills\agentkey" 2>nul
echo # fake skill>"%APPDATA%\amp\skills\agentkey\SKILL.md"
exit /b 0
"@
Set-Content -LiteralPath (Join-Path $fakeBin 'npx.cmd') -Value $fakeNpx -Encoding Ascii

$originalPath = $env:PATH
$originalAppData = $env:APPDATA
$originalDshHome = $env:DSH_HOME
try {
    $env:PATH = "$fakeBin;$originalPath"
    $env:APPDATA = $fakeAppData
    $env:DSH_HOME = Join-Path $testRoot 'dsh-home'

    & $installerPath -Yes -Only dsh -SkipMcp
    if ($LASTEXITCODE -ne 0) {
        throw "PowerShell installer exited with $LASTEXITCODE"
    }
} finally {
    $env:PATH = $originalPath
    $env:APPDATA = $originalAppData
    $env:DSH_HOME = $originalDshHome
}

$log = [System.IO.File]::ReadAllText($logPath)
if ($log -notmatch '(?m)-y skills add chainbase-labs/agentkey -g -a universal -s agentkey -y') {
    throw "DSH-only install did not use the universal global target. npx log: $log"
}
if ($log -match '(?m)skills add .* -a .*dsh') {
    throw "DSH was incorrectly passed to skills add -a. npx log: $log"
}

Write-Host 'PowerShell DSH universal-target regression: PASS'
