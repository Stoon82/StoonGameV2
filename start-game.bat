@echo off
echo Starting StoonGameV2...

:: Create data directory if it doesn't exist
if not exist "data" (
    echo Creating data directory...
    mkdir "data"
)

:: Start backend server
echo Starting backend server...
cd backend
:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
start "Backend" cmd /k "npm run dev"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5

:: Start frontend server
echo Starting frontend...
cd ../frontend
:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start "Frontend" cmd /k "npm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo.
echo Press any key to close all services...
pause

:: Cleanup - close all started processes
echo Closing all services...
taskkill /FI "WindowTitle eq Backend*" /T /F
taskkill /FI "WindowTitle eq Frontend*" /T /F
