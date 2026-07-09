# Starts all services for micro frontend portal mode (Windows PowerShell).
# Run from: Kaunch/office-portal/

$kaunchRoot = Split-Path $PSScriptRoot -Parent
$attendaRoot = Join-Path (Split-Path $kaunchRoot -Parent) "Attenda"

Write-Host "Kaunch root:  $kaunchRoot"
Write-Host "Attenda root: $attendaRoot"
Write-Host ""
Write-Host "Starting 5 services for portal at http://localhost:8080"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$kaunchRoot\backend'; npm run dev"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$kaunchRoot\frontend'; npm run dev:portal"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$attendaRoot\src\Attenda.Api'; dotnet run"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$attendaRoot\client'; npm run dev:portal"
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "Done. Open http://localhost:8080 when all terminals are ready."
