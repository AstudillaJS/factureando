@echo off
REM ============================================================================
REM FACTUREANDO - Windows Installation Script (Batch Version)
REM Sistema de Facturación Automática para Monotributistas
REM ============================================================================

REM Verificar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ============================================================================
    echo ERROR: Este script requiere permisos de administrador.
    echo ============================================================================
    echo.
    echo Por favor:
    echo 1. Click derecho en este archivo
    echo 2. Selecciona "Ejecutar como administrador"
    echo.
    pause
    exit /b 1
)

REM Cambiar a directorio del script
cd /d "%~dp0"

echo.
echo ============================================================================
echo FACTUREANDO - INSTALADOR DE WINDOWS
echo ============================================================================
echo.

REM ============================================================================
REM 1. VERIFICAR NODE.JS
REM ============================================================================

echo [PASO 1] Verificando Node.js...
where node >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ Node.js ya está instalado
    node --version
) else (
    echo.
    echo Se recomienda instalar Node.js manualmente desde:
    echo https://nodejs.org/ (Versión LTS recomendada)
    echo.
    echo Alternativamente, usa el script PowerShell:
    echo     .\install.ps1
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM 2. VERIFICAR PYTHON
REM ============================================================================

echo.
echo [PASO 2] Verificando Python...
where python >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ Python ya está instalado
    python --version
) else (
    echo ℹ Python no está instalado (opcional)
)

REM ============================================================================
REM 3. INSTALAR DEPENDENCIAS
REM ============================================================================

echo.
echo [PASO 3] Instalando dependencias del proyecto...

npm install

if %errorLevel% neq 0 (
    echo.
    echo ✗ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✓ Dependencias instaladas correctamente

REM ============================================================================
REM 4. CREAR ARCHIVO .ENV
REM ============================================================================

echo.
echo [PASO 4] Configurando variables de entorno...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✓ Archivo .env creado
    ) else (
        (
            echo # Gemini API Configuration
            echo GEMINI_API_KEY=your_api_key_here
            echo.
            echo # Server Configuration
            echo PORT=3000
            echo NODE_ENV=development
            echo.
            echo # Database
            echo DATA_DIR=./data
        ) > .env
        echo ✓ Archivo .env creado con valores por defecto
    )
    
    echo.
    echo ⚠  IMPORTANTE: 
    echo Edita el archivo .env y reemplaza 'your_api_key_here' 
    echo con tu clave de Gemini API
)

REM ============================================================================
REM 5. INFORMACIÓN FINAL
REM ============================================================================

echo.
echo ============================================================================
echo ✓ INSTALACIÓN COMPLETADA
echo ============================================================================
echo.

echo Proximos pasos:
echo.
echo 1. Obtén tu Gemini API Key en: https://ai.google.dev
echo.
echo 2. Edita el archivo .env con tu configuración
echo.
echo 3. Para iniciar en desarrollo:
echo    npm run dev
echo.
echo 4. Para compilar para producción:
echo    npm run build
echo.
echo 5. Para iniciar en producción:
echo    npm run start
echo.
echo ============================================================================
echo.

pause
