# GITFLOW - Guía de Configuración y Uso

## 📋 Introducción a Git Flow

Git Flow es un modelo de ramificación que facilita el trabajo en equipo y el manejo de releases. Define ramas específicas para cada tipo de trabajo.

## 🌳 Estructura de Ramas

```
main (producción)
 └─ origin/main          Versiones estables y releases
 
develop (integración)
 └─ origin/develop       Rama base de desarrollo
    ├─ feature/*         Nuevas características
    ├─ bugfix/*          Correcciones de bugs
    ├─ release/*         Preparación de releases
    └─ hotfix/*          Parches de emergencia
```

## 🔧 Instalación de Git Flow (Opcional)

### En Windows (PowerShell)

```powershell
# Instalar Git Flow
choco install gitflow-avh
```

O descargar desde: https://github.com/petervanderdoes/gitflow-avh/wiki/Windows

### Inicializar Git Flow en el proyecto

```bash
git flow init
```

Responde con valores por defecto presionando Enter en todas las opciones.

## 📝 Convenciones de Commits

Usa commits semánticos para mejor historial:

```
feat: Agregar nueva característica
fix: Corregir un bug
docs: Cambios en documentación
style: Cambios de formato (no afectan lógica)
refactor: Refactorización sin cambios funcionales
perf: Mejoras de rendimiento
test: Agregar o modificar tests
chore: Cambios en config, dependencias, etc
```

### Ejemplos

```bash
git commit -m "feat: agregar módulo de reportes"
git commit -m "fix: corregir validación de CUIT"
git commit -m "docs: actualizar guía de instalación"
```

## 🚀 Flujo de Trabajo Completo

### 1️⃣ Setup Inicial

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/factureando.git
cd factureando

# Instalar dependencias
npm install

# Crear archivo .env
copy .env.example .env

# Actualizar ramas
git fetch origin
git checkout develop
git pull origin develop
```

### 2️⃣ Crear una Nueva Característica

```bash
# Crear rama feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-caracteristica

# Hacer cambios
# ... editar archivos ...

# Commits frecuentes (mejor historial)
git add .
git commit -m "feat: descripción del cambio"
git add .
git commit -m "feat: continuación del cambio"

# Cuando termines, push a remoto
git push origin feature/nombre-caracteristica

# Abrir Pull Request en GitHub
```

#### Flujo de Code Review

1. Abre PR desde tu rama `feature/` hacia `develop`
2. Solicita revisores
3. Realiza cambios según comentarios
4. Cuando sea aprobado: **Merge con "Squash and merge"** (mejor historial)
5. Elimina la rama local y remota

```bash
git checkout develop
git pull origin develop
git branch -d feature/nombre-caracteristica
git push origin --delete feature/nombre-caracteristica
```

### 3️⃣ Corregir un Bug en Desarrollo

```bash
# Crear rama bugfix desde develop
git checkout develop
git pull origin develop
git checkout -b bugfix/nombre-del-bug

# ... hacer cambios ...

git add .
git commit -m "fix: descripción del bug"
git push origin bugfix/nombre-del-bug

# Abrir PR hacia develop
```

### 4️⃣ Preparar un Release (v1.2.0)

```bash
# Crear rama release desde develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Solo cambios menores: bumps de versión, fixes críticos
# Actualizar package.json
# Actualizar CHANGELOG

git add package.json CHANGELOG.md
git commit -m "release: v1.2.0"
git push origin release/1.2.0

# Abrir PR hacia main y develop
```

#### Una vez aprobado el PR

```bash
# Hacer merge a main (sin squash)
git checkout main
git pull origin main
git merge --no-ff release/1.2.0

# Crear tag de release
git tag -a v1.2.0 -m "Version 1.2.0 - Descripción"
git push origin main
git push origin v1.2.0

# Hacer merge a develop
git checkout develop
git pull origin develop
git merge --no-ff release/1.2.0
git push origin develop

# Eliminar rama release
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

### 5️⃣ Hotfix en Producción (1.1.1)

```bash
# Crear hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/1.1.1

# Hacer cambios críticos solamente
# ... editar archivos ...

git add .
git commit -m "hotfix: corrección crítica"
git push origin hotfix/1.1.1

# Abrir PR hacia main y develop
```

#### Una vez aprobado

```bash
# Merge a main
git checkout main
git merge --no-ff hotfix/1.1.1
git tag -a v1.1.1 -m "Hotfix v1.1.1"
git push origin main
git push origin v1.1.1

# Merge a develop (importante!)
git checkout develop
git pull origin develop
git merge --no-ff hotfix/1.1.1
git push origin develop

# Eliminar hotfix
git branch -d hotfix/1.1.1
git push origin --delete hotfix/1.1.1
```

## 🔐 Configuración en GitHub

### 1. Proteger la rama `main`

1. Ve a Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Activa:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Dismiss stale pull request approvals
   - ✅ Require code reviews: 1 approval
4. Save

### 2. Proteger la rama `develop`

1. Add rule para `develop`
2. Activa:
   - ✅ Require a pull request before merging
   - ✅ Require 1 approval (menos estricto que main)
3. Save

### 3. Configurar GitHub Actions (CI/CD)

Crea `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  build:
    runs-on: windows-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm install
    
    - name: Run linter
      run: npm run lint
    
    - name: Build project
      run: npm run build
```

## 📊 Modelo Visual

```
main   ──────────v1.0────────────────v1.1────────────
       │        ╱   ╲             ╱   ╲
       └───────────────────────────────────────────
       
develop ───f1───┬───f2───┬───r1.0───┬───hotf───┬─
              ╱   ╲   ╱   ╲      ╱   ╲      ╱   ╲
                                              

feature/f1  ──────┐
                   └──────(merged)

feature/f2        ──────┐
                         └──────(merged)

release/1.0               ──────┐
                                 └──────(merged)

hotfix/1.1                              ──────┐
                                               └──(merged)
```

## 🎯 Mejores Prácticas

### ✅ DO

- ✅ Mantener ramas **cortas y enfocadas** (1-2 días de trabajo máximo)
- ✅ Hacer **commits frecuentes** con mensajes claros
- ✅ **Rebase** antes de push si hay conflictos
- ✅ Usar **Pull Requests** siempre, incluso en trabajo individual
- ✅ **Documentar** cambios en PR description
- ✅ Eliminar ramas después de merge
- ✅ Usar **tags** para releases

### ❌ DON'T

- ❌ Hacer merge directo a `main` o `develop`
- ❌ Commits con mensajes genéricos ("fix stuff", "changes")
- ❌ Ramas de larga duración (>1 semana)
- ❌ Push a `main` sin pasar por PR
- ❌ Forzar push (`git push -f`) en ramas compartidas
- ❌ Mezclar features en una sola rama

## 🐛 Resolución de Conflictos

### Cuando tienes conflictos en un PR

```bash
# Actualizar rama local
git fetch origin
git rebase origin/develop

# Resolver conflictos en tu editor
# Luego:
git add .
git rebase --continue

# Forzar push a la rama (en la tuya, no en main/develop)
git push -f origin feature/tu-rama
```

## 📚 Recursos Útiles

- [Git Flow CheatSheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow Documentation](https://guides.github.com/introduction/flow/)

## 🤔 Preguntas Frecuentes

**P: ¿Por qué main y develop?**
R: `main` es para producción (estable), `develop` es para integración de features (próxima release).

**P: ¿Qué pasa si me equivoco en un commit?**
R: Usa `git commit --amend` para el último, o `git revert` para revertir cambios.

**P: ¿Cuándo hacer squash?**
R: Siempre al mergear PRs (squash merge) para mantener historial limpio en develop/main.

**P: ¿Puedo trabajar en 2 features simultáneamente?**
R: Sí, pero crea ramas separadas: `feature/f1` y `feature/f2` desde develop.

---

**Última actualización**: May 2026
