<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FACTUREANDO - Sistema de Facturación Automática

Sistema completo de facturación para monotributistas argentinos con integración AFIP/ARCA y Mercado Pago.

## 🎯 Características

- 📊 **Panel de Control**: Visualiza ingresos, proyecciones y facturas
- 💳 **Facturación Automática**: 3 métodos de entrada (Mercado Pago, Excel, Manual)
- 🔐 **Integración AFIP/ARCA**: Manejo seguro de certificados digitales
- 💰 **Mercado Pago**: Sincronización automática de transacciones
- 👥 **Gestión de Clientes**: CRUD completo con validación de CUIT
- 📈 **Proyecciones**: Cálculo automático de ganancias según monotributo

## 📋 Requisitos Previos

- **Windows 10/11** (64-bit)
- **Conexión a Internet**
- Permisos de administrador (para instalación)

### Componentes que se instalarán automáticamente

- Node.js v20+ (runtime JavaScript)
- Python 3.12+ (herramientas de compilación)
- Git 2.43+ (control de versiones)
- Todas las dependencias del proyecto

## 🚀 Instalación Rápida (Windows)

### Opción 1: PowerShell (Recomendado - Instalación Completa)

1. Descarga y extrae el proyecto
2. Abre **PowerShell como administrador**
3. Navega a la carpeta del proyecto
4. Ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   .\install.ps1
   ```

**Ventajas:**
- Instala Node.js, Python y Git automáticamente
- Configura todo sin intervención manual
- Mejor para usuarios nuevos

### Opción 2: Batch (Instalación Manual de Dependencias)

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/) (LTS recomendada)
2. Abre **Símbolo de sistema como administrador**
3. Navega a la carpeta del proyecto
4. Ejecuta:
   ```bash
   install.bat
   ```

**Nota:** Esta opción requiere que ya tengas Node.js instalado manualmente.

### Opción 3: Instalación Manual

1. Instala [Node.js v20+](https://nodejs.org/)
2. Instala [Python 3.12+](https://www.python.org/) (opcional pero recomendado)
3. Instala [Git](https://git-scm.com/download/win)
4. En la carpeta del proyecto ejecuta:
   ```bash
   npm install
   ```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` y configura:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   PORT=3000
   NODE_ENV=development
   ```

3. Obtén tu **Gemini API Key** en: https://ai.google.dev

## 🏃 Ejecución

### Desarrollo (con Hot Reload)

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador

### Producción

```bash
npm run build
npm run start
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con Vite |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor en modo producción |
| `npm run preview` | Vista previa de compilación |
| `npm run lint` | Verifica tipos con TypeScript |
| `npm run clean` | Limpia archivos compilados |

## 🌳 Gitflow - Flujo de Desarrollo

Este proyecto utiliza **Git Flow** para gestión de ramas:

### Ramas Principales

- **`main`**: Producción (versiones estables)
- **`develop`**: Integración (rama base para desarrollo)
- **`feature/*`**: Nuevas características
- **`bugfix/*`**: Correcciones de bugs
- **`release/*`**: Preparación de releases
- **`hotfix/*`**: Parches de emergencia para producción

### Flujo de Trabajo

#### 1. Crear una nueva característica

```bash
git checkout develop
git pull origin develop
git checkout -b feature/descripcion-corta
# ... hacer cambios ...
git add .
git commit -m "feat: descripción de la característica"
git push origin feature/descripcion-corta
```

Luego crear un **Pull Request** en GitHub hacia `develop`

#### 2. Crear un bugfix

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/descripcion-corta
# ... hacer cambios ...
git add .
git commit -m "fix: descripción del bug"
git push origin bugfix/descripcion-corta
```

#### 3. Preparar un release

```bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
# ... ajustes finales ...
git commit -m "release: v1.0.0"
git push origin release/1.0.0
```

Después de merge a `main` y `develop`:
```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

#### 4. Hotfix para producción

```bash
git checkout main
git pull origin main
git checkout -b hotfix/descripcion
# ... parche ...
git commit -m "hotfix: descripción"
git push origin hotfix/descripcion
```

### Convenciones de Commits

```
feat: Nueva característica
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (no afectan lógica)
refactor: Refactorización de código
perf: Mejoras de rendimiento
test: Agregación de tests
chore: Tareas administrativas
```

## 📦 Estructura del Proyecto

```
factureando/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── Billing.tsx
│   │   ├── FiscalCluster.tsx
│   │   └── ...
│   ├── context/             # Context API
│   │   └── ThemeContext.tsx
│   ├── App.tsx              # App principal
│   └── main.tsx             # Entry point
├── public/                  # Assets estáticos
├── db.ts                    # Funciones de BD local
├── server.ts                # Servidor Express
├── package.json             # Dependencias
├── vite.config.ts           # Configuración Vite
├── tsconfig.json            # Configuración TypeScript
├── .env.example             # Variables de ejemplo
└── install.ps1/install.bat  # Scripts de instalación
```

## 🗄️ Base de Datos

El proyecto usa una base de datos JSON local en `data/db.json`:

```json
{
  "config": {
    "mpToken": "",
    "afipCrtPath": "",
    "afipKeyPath": "",
    "afipCuit": ""
  },
  "invoices": [],
  "clients": []
}
```

## 🔌 APIs Integradas

- **Gemini AI**: Para análisis y recomendaciones
- **AFIP/ARCA**: Integración fiscal argentina
- **Mercado Pago**: Procesamiento de pagos y webhooks

## 🐛 Solución de Problemas

### Node.js no se instala correctamente

1. Descarga manualmente desde: https://nodejs.org/
2. Ejecuta el instalador MSI
3. Reinicia PowerShell

### Error de permisos en PowerShell

Ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Puerto 3000 en uso

Cambia en `.env`:
```env
PORT=3001
```

### Base de datos corrupta

Elimina `data/db.json` y reinicia (se recreará con valores por defecto)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama `feature/*` desde `develop`
3. Commit con mensajes descriptivos
4. Push y abre un Pull Request
5. Espera revisión y merge

## 📄 Licencia

Este proyecto está bajo licencia Apache 2.0

## 📧 Contacto

Para soporte o sugerencias, abre un issue en GitHub

---

**Última actualización**: May 2026
**Versión**: 2.3.84
