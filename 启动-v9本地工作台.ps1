param(
    [switch]$NoBrowser
)

# v9-workbench-startup-entry
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Join-Path $root 'info-workbench-v9'
$entry = Join-Path $appRoot 'dist\server.js'
$dataRoot = Join-Path $appRoot 'data'
$pidFile = Join-Path $dataRoot 'server.pid'
$stdoutLog = Join-Path $dataRoot 'server.stdout.log'
$stderrLog = Join-Path $dataRoot 'server.stderr.log'
$legacyPidFile = Join-Path $root 'workspace-mcp\data\bridge.pid'
$url = 'http://127.0.0.1:17321/'

function Write-Status([string]$Message, [ConsoleColor]$Color = [ConsoleColor]::Cyan) {
    Write-Host $Message -ForegroundColor $Color
}

function Get-WorkbenchHealth {
    try { return Invoke-RestMethod -Uri ($url + 'api/health') -TimeoutSec 1 } catch { return $null }
}

try {
    Write-Host ''
    Write-Status '========================================' DarkCyan
    Write-Status '  v9 信息收集工作台启动器' Cyan
    Write-Status '========================================' DarkCyan
    Write-Host ''

    Write-Status '[1/4] 正在检查运行环境……'
    if (-not (Test-Path -LiteralPath $appRoot -PathType Container)) {
        throw "找不到工作台目录：$appRoot"
    }
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCommand) { throw '未找到 Node.js，请先安装 Node.js 后重试。' }
    Write-Status ("      Node.js：" + (& node --version)) DarkGray

    Write-Status '[2/4] 正在检查本地服务……'
    $health = Get-WorkbenchHealth
    if ($health -and $health.service -ne 'info-workbench-local') {
        if (-not (Test-Path -LiteralPath $legacyPidFile)) { throw '端口 17321 已被其他程序占用。' }
        $legacyPid = [int](Get-Content -LiteralPath $legacyPidFile -Raw)
        $legacyProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $legacyPid" -ErrorAction SilentlyContinue
        if (-not $legacyProcess -or $legacyProcess.CommandLine -notlike '*workspace-mcp*dist*bridge.js*') {
            throw '端口 17321 已被未知程序占用，未自动终止。'
        }
        Write-Status '      正在关闭旧版服务……' Yellow
        Stop-Process -Id $legacyPid
        Remove-Item -LiteralPath $legacyPidFile -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 350
        $health = $null
    }

    if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) {
        Write-Status '      首次运行，正在安装依赖并构建程序……' Yellow
        Push-Location $appRoot
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) { throw 'npm install 执行失败。' }
            & npm run build
            if ($LASTEXITCODE -ne 0) { throw 'npm run build 执行失败。' }
        } finally {
            Pop-Location
        }
    }

    if (-not $health) {
        Write-Status '      正在启动后台服务……' Yellow
        New-Item -ItemType Directory -Path $dataRoot -Force | Out-Null
        $process = Start-Process -FilePath $nodeCommand.Source -ArgumentList @($entry) -WorkingDirectory $appRoot -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru
        Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ascii
        for ($attempt = 0; $attempt -lt 30; $attempt++) {
            Start-Sleep -Milliseconds 150
            $health = Get-WorkbenchHealth
            if ($health -and $health.service -eq 'info-workbench-local') { break }
            if ($process.HasExited) { break }
        }
    } else {
        Write-Status '      服务已经在运行，无需重复启动。' Green
    }

    if (-not $health -or $health.service -ne 'info-workbench-local') {
        $details = ''
        if (Test-Path -LiteralPath $stderrLog) {
            $details = (Get-Content -LiteralPath $stderrLog -Tail 12 -ErrorAction SilentlyContinue) -join [Environment]::NewLine
        }
        if ($details) { throw "v9 本地工作台启动失败。服务日志：`n$details" }
        throw 'v9 本地工作台启动失败，服务没有通过健康检查。'
    }
    Write-Status ("      服务正常，数据版本：" + $health.revision) Green

    Write-Status '[3/4] 正在打开浏览器……'
    if ($NoBrowser) {
        Write-Status '      测试模式：已跳过浏览器。' DarkGray
    } else {
        try {
            Start-Process $url -ErrorAction Stop
            Write-Status '      已发送到默认浏览器。' Green
        } catch {
            Write-Status '      默认浏览器调用失败，正在使用系统方式重试……' Yellow
            Start-Process -FilePath 'explorer.exe' -ArgumentList @($url) -ErrorAction Stop
            Write-Status '      已通过系统方式打开。' Green
        }
    }

    Write-Status '[4/4] 启动完成。' Green
    Write-Host ''
    Write-Host "工作台地址：$url"
    Write-Host '关闭此窗口不会停止工作台。'
    exit 0
} catch {
    Write-Host ''
    Write-Status '[启动失败]' Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ''
    Write-Host "工作台目录：$appRoot" -ForegroundColor DarkGray
    exit 1
}
