@echo off
REM ============================================================================
REM FACTUREANDO - Setup Gitflow Inicial
REM Este script configura el proyecto para usar Git Flow
REM ============================================================================

echo.
echo ============================================================================
echo FACTUREANDO - SETUP GITFLOW
echo ============================================================================
echo.

REM Verificar si Git está instalado
where git >nul 2>&1
if %errorLevel% neq 0 (
    echo ✗ Git no está instalado en el PATH
    echo Por favor instala Git desde: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✓ Git encontrado
git --version

REM Verificar si el proyecto está en un repositorio Git
if not exist ".git" (
    echo.
    echo ¿Deseas inicializar este como repositorio Git? (S/N)
    set /p init_git="Respuesta: "
    
    if /i "%init_git%"=="S" (
        git init
        echo ✓ Repositorio Git inicializado
    ) else (
        echo ✗ Este no es un repositorio Git
        pause
        exit /b 1
    )
)

REM Configuración de Git Flow
echo.
echo [PASO 1] Configurando Git Flow...
echo.

REM Verificar si existe rama develop
git rev-parse --verify develop >nul 2>&1
if %errorLevel% neq 0 (
    echo Creando rama develop...
    git checkout -b develop
    echo ✓ Rama develop creada
) else (
    echo ✓ Rama develop ya existe
)

REM Verificar si existe rama main o master
git rev-parse --verify main >nul 2>&1
if %errorLevel% neq 0 (
    git rev-parse --verify master >nul 2>&1
    if %errorLevel% equ 0 (
        echo ℹ Rama master encontrada, renombrando a main...
        git branch -m master main
        echo ✓ Rama renombrada: master → main
    ) else (
        echo ℹ Rama main no existe (esperado en primer setup)
    )
)

REM Verificar si .gitignore existe
if not exist ".gitignore" (
    echo.
    echo Creando .gitignore estándar...
    (
        echo node_modules/
        echo build/
        echo dist/
        echo coverage/
        echo .DS_Store
        echo *.log
        echo .env
        echo !.env.example
        echo data/db.json
        echo certs/
    ) > .gitignore
    echo ✓ Archivo .gitignore creado
)

REM Configuración de nombre y email (si no está configurado)
for /f "delims=" %%A in ('git config --global user.name') do set git_user=%%A

if "%git_user%"=="" (
    echo.
    echo [PASO 2] Configuración de usuario Git...
    echo.
    set /p user_name="Nombre de usuario: "
    set /p user_email="Email: "
    
    git config --global user.name "%user_name%"
    git config --global user.email "%user_email%"
    
    echo ✓ Configuración guardada
)

REM Crear branches estándar de gitflow
echo.
echo [PASO 3] Creando ramas estándar de Git Flow...
echo.

REM Feature, bugfix, release, hotfix
for %%B in (feature bugfix release hotfix) do (
    git show-ref --quiet refs/heads/%%B/template
    if %errorLevel% neq 0 (
        echo.
        echo Rama %%B/template no existe, creando estructura...
        REM No es necesario crear ramas template
    )
)

echo ✓ Estructura de Git Flow configurada

REM Crear archivos de documentación
if not exist "CHANGELOG.md" (
    echo.
    echo Creando CHANGELOG.md...
    (
        echo # Changelog
        echo.
        echo Todos los cambios notables en este proyecto serán documentados en este archivo.
        echo.
        echo El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
        echo.
        echo ## [Unreleased]
        echo.
        echo ### Added
        echo - Versión inicial del sistema
        echo.
    ) > CHANGELOG.md
    echo ✓ CHANGELOG.md creado
)

REM Mensaje final
echo.
echo ============================================================================
echo ✓ CONFIGURACIÓN COMPLETADA
echo ============================================================================
echo.

echo Proximos pasos:
echo.
echo 1. Conectar con GitHub:
echo    git remote add origin https://github.com/tuusuario/factureando.git
echo    git push -u origin develop
echo.
echo 2. Seguir la guía en GITFLOW.md para iniciar desarrollo
echo.
echo 3. Leer SETUP_GITHUB.md para proteger ramas en GitHub
echo.
echo 4. Hacer el primer commit:
echo    git add .
echo    git commit -m "chore: setup inicial del proyecto"
echo    git push
echo.

pause
