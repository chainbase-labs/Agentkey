$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$uninstallerPath = Join-Path $repoRoot 'scripts/uninstall.ps1'
$uninstaller = [System.IO.File]::ReadAllText($uninstallerPath)
$assignment = [regex]::Match(
    $uninstaller,
    '(?m)^\$managedPattern = ''([^'']+)''$'
)

if (-not $assignment.Success) {
    throw 'Could not find the PowerShell DSH managed marker pattern'
}

$pattern = $assignment.Groups[1].Value
if ($pattern.Contains('^[ \t]*# agentkey:start')) {
    throw 'PowerShell DSH start marker still accepts indentation'
}
if (-not $pattern.Contains('^# agentkey:start') -or -not $pattern.Contains('^# agentkey:end')) {
    throw 'PowerShell DSH marker pattern is not anchored at column 1'
}

$fixture = @'
- insert:
    - id: user-plugin
      name: '@example/plugin'
      config:
        instructions: |
          # agentkey:start
          This is ordinary user prompt text.
          # agentkey:end
        legacyExample: |
          - id: agentkey
            name: '@deepseek-ai/dsh-mcp-client'
            config:
              serverName: example
'@
$updated = [regex]::Replace($fixture, $pattern, '')
if ($updated -cne $fixture) {
    throw 'PowerShell DSH cleanup changed an indented YAML block scalar'
}

Write-Host 'PowerShell DSH block-scalar marker regression: PASS'
