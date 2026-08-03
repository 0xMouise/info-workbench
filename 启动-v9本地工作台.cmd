@echo off
setlocal
title v9 Information Workbench Launcher
cls

set "START_SCRIPT="
for %%F in ("%~dp0*.ps1") do (
    findstr /m /c:"v9-workbench-startup-entry" "%%~fF" >nul 2>&1 && set "START_SCRIPT=%%~fF"
)

if not defined START_SCRIPT (
    echo [ERROR] Startup PowerShell script was not found.
    echo Press any key to close this window...
    pause >nul
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%START_SCRIPT%"
set "START_EXIT_CODE=%ERRORLEVEL%"

if not "%START_EXIT_CODE%"=="0" (
    echo.
    echo [ERROR] The workbench failed to start. See the message above.
    echo Press any key to close this window...
    pause >nul
    exit /b %START_EXIT_CODE%
)

echo.
echo This launcher will close in 3 seconds. The service will keep running.
powershell.exe -NoProfile -Command "Start-Sleep -Seconds 3"
exit /b 0
