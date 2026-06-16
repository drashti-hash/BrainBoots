@echo off
echo =============================================================
echo          Starting BrainBoots ^& AI Chatbot Services
echo =============================================================

:: 1. Start BrainBoots Backend
echo [*] Launching BrainBoots Backend (MySQL) on http://127.0.0.1:8000 ...
start "BrainBoots Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe manage.py runserver"

:: 2. Start BrainBoots Frontend
echo [*] Launching BrainBoots Frontend (React) on http://localhost:5173 ...
start "BrainBoots Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [✓] All services have been triggered! 
echo     Keep the newly opened console windows running.
echo =============================================================
pause
