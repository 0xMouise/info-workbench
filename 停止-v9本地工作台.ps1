$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root 'info-workbench-v9\data\server.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Host '没有找到正在运行的 v9 工作台记录。'; exit 0 }
$serverPid = [int](Get-Content -LiteralPath $pidFile -Raw)
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid" -ErrorAction SilentlyContinue
if ($process -and $process.CommandLine -like '*info-workbench-v9*dist*server.js*') {
    Stop-Process -Id $serverPid
    Write-Host 'v9 本地工作台已停止。'
} elseif ($process) {
    throw 'PID 对应的不是 v9 服务，已拒绝终止。'
}
Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
