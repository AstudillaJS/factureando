# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- Sistema de instalación automática para Windows
- Documentación completa de Git Flow
- CI/CD con GitHub Actions
- Scripts de instalación PowerShell y Batch
- Configuración de ramas protegidas en GitHub

## [2.3.84] - 2026-05-20

### Added

- Versión inicial del sistema Factureando
- Panel de Control (Dashboard)
- Módulo de Facturación Automática (3 métodos: Mercado Pago, Excel, Manual)
- Integración AFIP/ARCA para certificados digitales
- Integración Mercado Pago con webhooks
- Gestión de Clientes (CRUD completo)
- Gestión de Configuración Local
- Tema oscuro futurista "CHRONOS LABOR OS"
- Selector de tema (Topbar / Floating sidebar)

### Features

#### Dashboard
- Meta de ingresos personalizable
- Proyección de ganancias según monotributo
- Historial de facturas emitidas
- Métricas del sistema en tiempo real

#### Facturación
- Integración con Mercado Pago (webhooks)
- Importación desde Excel/Sheets
- Entrada manual de facturas
- Validación de datos
- Generación de borradores

#### AFIP/ARCA
- Upload de certificados CRT y KEY
- Generación de CSR (Certificate Signing Request)
- Test de conexión
- Almacenamiento seguro en BD local

#### Gestión de Clientes
- Crear, editar, eliminar clientes
- Validación automática de CUIT
- Tarifas horarias personalizables
- Estado activo/inactivo

### Technical

- Frontend: React 19 + TypeScript + Vite
- Backend: Express.js
- Base de datos: JSON local
- UI: Tailwind CSS + Motion (animaciones)
- API: Google Gemini AI

## Notas para Desarrolladores

### Versioning

Este proyecto usa [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles
- **MINOR**: Nuevas características compatibles
- **PATCH**: Correcciones de bugs

### Commit Style

Usa [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: Nueva característica
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato
refactor: Refactorización
perf: Mejoras de rendimiento
test: Cambios en tests
chore: Cambios administrativos
```

### Release Process

1. Crear rama `release/x.y.z` desde `develop`
2. Actualizar versión en `package.json`
3. Actualizar `CHANGELOG.md`
4. Hacer merge a `main` con tag `vx.y.z`
5. Hacer merge a `develop`
6. Eliminar rama `release`

---

**Última actualización**: May 2026
