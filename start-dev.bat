@echo off
echo ==========================================
echo    CrystalTides SMP - Dev Environment
echo ==========================================

echo [1/3] Building Backend...
docker-compose build backend
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    exit /b %errorlevel%
)

echo [2/3] Building Frontend...
docker-compose build frontend
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    exit /b %errorlevel%
)

echo [3/3] Starting Services...
docker-compose up -d

echo ==========================================
echo    Server Started Successfully!
echo    Logs: docker-compose logs -f
echo ==========================================
pause
