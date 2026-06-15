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

:: 3. Start AI Chatbot Backend
echo [*] Launching AI Chatbot Backend (PostgreSQL) on http://127.0.0.1:8080 ...
start "AI Chatbot Backend" cmd /k "cd /d D:\ai-chatbot && .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8080"

echo.
echo [✓] All services have been triggered! 
echo     Keep the newly opened console windows running.
echo =============================================================
pause
