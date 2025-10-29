@echo off
REM Windows batch script for Azure TTS audio generation

echo ======================================================================
echo Azure TTS Audio Generation - Hablas Project
echo ======================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found
    echo Please install Python 3.7 or higher
    exit /b 1
)

echo [OK] Python found

REM Check if Azure credentials are set
if "%AZURE_SPEECH_KEY%"=="" (
    echo.
    echo Error: AZURE_SPEECH_KEY environment variable not set
    echo.
    echo Set your Azure credentials:
    echo   set AZURE_SPEECH_KEY=your-key-here
    echo   set AZURE_SPEECH_REGION=eastus
    echo.
    echo Or in PowerShell:
    echo   $env:AZURE_SPEECH_KEY = "your-key-here"
    echo   $env:AZURE_SPEECH_REGION = "eastus"
    echo.
    echo Get credentials from: https://portal.azure.com
    exit /b 1
)

echo [OK] Azure credentials configured
echo.

REM Check if requirements are installed
python -c "import azure.cognitiveservices.speech" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r scripts\azure-audio-requirements.txt
    echo.
)

echo [OK] Dependencies installed
echo.

REM Check if we should run test first
if "%1"=="--test" (
    echo Running configuration test...
    python scripts\test-azure-audio.py
    exit /b %errorlevel%
)

REM Run the audio generation
echo Starting audio generation...
echo.
python scripts\generate-azure-audio.py

echo.
echo ======================================================================
echo Generation complete!
echo ======================================================================
echo Output: public\audio\
echo Metadata: public\audio\metadata.json
