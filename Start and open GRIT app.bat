@echo off
cd /d "%~dp0"
echo Starting GRIT app...
echo.
start "GRIT Server" cmd /k "cd /d "%~dp0" && npm start"
echo Waiting 25 seconds for the server to start...
timeout /t 25 /nobreak >nul
start http://localhost:8081
echo.
echo Browser should open now. If you see a blank or error page, wait 10 more seconds and refresh (F5).
echo Keep the "GRIT Server" window open while using the app.
pause
