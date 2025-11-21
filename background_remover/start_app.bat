@echo off
echo Starting Background Remover App...
cd /d %~dp0

:: Open the browser
start http://localhost:8081

:: Start the server
uvicorn app:app --host 0.0.0.0 --port 8081

pause
