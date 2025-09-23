@echo off
echo Starting Sherlock Holmes AI Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found. Creating from template...
    copy env.example .env
    echo Please edit .env file and add your Google API key
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt is newer than last install
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/updating dependencies...
pip install -r requirements.txt

echo Starting Flask backend server...
python run_server.py

pause
