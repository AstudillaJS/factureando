# ============================================================================
# FACTUREANDO - Windows Installation Script
# Sistema de Facturación Automática para Monotributistas
# ============================================================================

param(
    [switch]$SkipPython = $false,
    [switch]$SkipNodeSetup = $false
)

$ErrorActionPreference = "Stop"

# Colores para la consola
$colors = @{
    Primary = "Yellow"
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
}

function Write-Header {
    param([string]$text)
    Write-Host "`n" -ForegroundColor $colors.Primary
    Write-Host "=" * 80 -ForegroundColor $colors.Primary
    Write-Host $text -ForegroundColor $colors.Primary
    Write-Host "=" * 80 -ForegroundColor $colors.Primary
    Write-Host ""
}

function Write-Success {
    param([string]$text)
    Write-Host "✓ $text" -ForegroundColor $colors.Success
}

function Write-Info {
    param([string]$text)
    Write-Host "ℹ $text" -ForegroundColor $colors.Info
}

function Write-Error-Custom {
    param([string]$text)
    Write-Host "✗ $text" -ForegroundColor $colors.Error
}

function Test-Command {
    param([string]$command)
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# ============================================================================
# INICIO DE LA INSTALACIÓN
# ============================================================================

Write-Header "FACTUREANDO - INSTALADOR DE WINDOWS"

# ============================================================================
# 1. VERIFICAR PERMISOS DE ADMINISTRADOR
# ============================================================================

Write-Info "Verificando permisos de administrador..."

$isAdmin = [bool]([Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")

if (-not $isAdmin) {
    Write-Error-Custom "Este script requiere permisos de administrador."
    Write-Info "Por favor, ejecuta PowerShell como administrador e intenta nuevamente."
    exit 1
}

Write-Success "Permisos de administrador confirmados."

# ============================================================================
# 2. INSTALAR NODE.JS (SI NO EXISTE)
# ============================================================================

Write-Header "PASO 1: VERIFICANDO NODE.JS"

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js ya está instalado: $nodeVersion"
} else {
    Write-Info "Node.js no encontrado. Iniciando descarga e instalación..."
    
    try {
        $nodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
        $nodeMsi = "$env:TEMP\node-installer.msi"
        
        Write-Info "Descargando Node.js v20.11.1..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -UseBasicParsing
        
        Write-Info "Instalando Node.js..."
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodeMsi`" /quiet /norestart" -Wait
        
        Remove-Item $nodeMsi -Force
        
        # Recargar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        $nodeVersion = node --version
        Write-Success "Node.js instalado correctamente: $nodeVersion"
    }
    catch {
        Write-Error-Custom "Error al instalar Node.js: $_"
        exit 1
    }
}

# ============================================================================
# 3. INSTALAR PYTHON (OPCIONAL)
# ============================================================================

if (-not $SkipPython) {
    Write-Header "PASO 2: VERIFICANDO PYTHON"
    
    if (Test-Command "python") {
        $pythonVersion = python --version
        Write-Success "Python ya está instalado: $pythonVersion"
    } else {
        Write-Info "Python no encontrado. Instalando..."
        
        try {
            $pythonUrl = "https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe"
            $pythonExe = "$env:TEMP\python-installer.exe"
            
            Write-Info "Descargando Python 3.12.1..."
            Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonExe -UseBasicParsing
            
            Write-Info "Instalando Python (esta puede tomar unos minutos)..."
            Start-Process -FilePath $pythonExe -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
            
            Remove-Item $pythonExe -Force
            
            # Recargar PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            $pythonVersion = python --version
            Write-Success "Python instalado correctamente: $pythonVersion"
        }
        catch {
            Write-Error-Custom "Error al instalar Python: $_"
            Write-Info "Continuando sin Python (algunas herramientas pueden no estar disponibles)."
        }
    }
}

# ============================================================================
# 4. INSTALAR GIT (SI NO EXISTE)
# ============================================================================

Write-Header "PASO 3: VERIFICANDO GIT"

if (Test-Command "git") {
    $gitVersion = git --version
    Write-Success "Git ya está instalado: $gitVersion"
} else {
    Write-Info "Git no encontrado. Instalando..."
    
    try {
        $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
        $gitExe = "$env:TEMP\git-installer.exe"
        
        Write-Info "Descargando Git..."
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitExe -UseBasicParsing
        
        Write-Info "Instalando Git..."
        Start-Process -FilePath $gitExe -ArgumentList "/VERYSILENT /NORESTART" -Wait
        
        Remove-Item $gitExe -Force
        
        # Recargar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        $gitVersion = git --version
        Write-Success "Git instalado correctamente: $gitVersion"
    }
    catch {
        Write-Error-Custom "Error al instalar Git: $_"
        Write-Info "Continuando sin Git (necesitarás instalarlo manualmente para gitflow)."
    }
}

# ============================================================================
# 5. INSTALAR DEPENDENCIAS DEL PROYECTO
# ============================================================================

Write-Header "PASO 4: INSTALANDO DEPENDENCIAS DEL PROYECTO"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Push-Location $projectDir
    
    Write-Info "Instalando paquetes NPM..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencias instaladas correctamente."
    } else {
        Write-Error-Custom "Error al instalar dependencias."
        exit 1
    }
    
    Pop-Location
}
catch {
    Write-Error-Custom "Error: $_"
    exit 1
}

# ============================================================================
# 6. CONFIGURAR ARCHIVO .ENV
# ============================================================================

Write-Header "PASO 5: CONFIGURANDO VARIABLES DE ENTORNO"

$envFile = Join-Path $projectDir ".env"
$envExampleFile = Join-Path $projectDir ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExampleFile) {
        Copy-Item $envExampleFile $envFile
        Write-Success "Archivo .env creado desde .env.example"
    } else {
        @"
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATA_DIR=./data
"@ | Out-File $envFile -Encoding UTF8
        Write-Success "Archivo .env creado con valores por defecto"
    }
    
    Write-Info "⚠  IMPORTANTE: Edita el archivo .env y reemplaza 'your_api_key_here' con tu clave de Gemini API"
}

# ============================================================================
# 7. INFORMACIÓN FINAL
# ============================================================================

Write-Header "✓ INSTALACIÓN COMPLETADA"

Write-Success "Todos los componentes han sido instalados correctamente."

Write-Info "Proximos pasos:"
Write-Host ""
Write-Host "1. Edita el archivo .env con tu configuración:" -ForegroundColor $colors.Info
Write-Host "   - GEMINI_API_KEY: Obtén tu clave en https://ai.google.dev" -ForegroundColor $colors.Info
Write-Host ""
Write-Host "2. Para iniciar la aplicación en desarrollo:" -ForegroundColor $colors.Info
Write-Host "   npm run dev" -ForegroundColor $colors.Primary
Write-Host ""
Write-Host "3. Para compilar para producción:" -ForegroundColor $colors.Info
Write-Host "   npm run build" -ForegroundColor $colors.Primary
Write-Host ""
Write-Host "4. Para iniciar en producción:" -ForegroundColor $colors.Info
Write-Host "   npm run start" -ForegroundColor $colors.Primary
Write-Host ""
Write-Host "Documentación completa disponible en:" -ForegroundColor $colors.Info
Write-Host "https://github.com/tuusuario/factureando" -ForegroundColor $colors.Primary
Write-Host ""

Write-Host "=" * 80 -ForegroundColor $colors.Primary

Read-Host "Presiona Enter para terminar"
