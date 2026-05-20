# 📚 Git Flow - Referencia Rápida

Hoja de trucos con los comandos más comunes de Git Flow.

## 🚀 Inicio Rápido

```bash
# Clonar proyecto
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

---

## 🔧 Comandos Esenciales

### 📍 Ver Estado

```bash
# Ver rama actual
git branch

# Ver todas las ramas (local + remoto)
git branch -a

# Ver estado de cambios
git status

# Ver historial de commits
git log --oneline -10

# Ver cambios sin commitear
git diff
```

### 📦 Crear Feature

```bash
# Opción 1: Manual
git checkout develop
git pull origin develop
git checkout -b feature/mi-feature
git push -u origin feature/mi-feature

# Opción 2: Con git flow (si está instalado)
git flow feature start mi-feature
git flow feature publish mi-feature
```

### 💾 Commits

```bash
# Agregar cambios
git add .
git add archivo.ts                    # Archivo específico

# Commit
git commit -m "feat: descripción"

# Commit con descripción larga
git commit -m "feat: título" -m "Descripción detallada"

# Modificar último commit
git commit --amend

# Deshacer cambios no guardados
git restore archivo.ts                # Archivo específico
git restore .                         # Todos
```

### 🔄 Actualizar Rama

```bash
# Antes de push
git fetch origin
git rebase origin/develop

# Resolver conflictos y continuar
# (edita archivo)
git add .
git rebase --continue

# O si prefieres abortar
git rebase --abort
```

### 🚀 Push & Pull Request

```bash
# Subir cambios
git push
git push -u origin feature/mi-feature  # Primera vez

# Actualizar
git pull origin develop

# Forzar push (solo en tus ramas, NUNCA en main/develop)
git push -f origin feature/mi-feature
```

---

## 🔀 Flujos de Trabajo

### ✨ Nueva Característica

```bash
# 1. Crear rama
git checkout develop
git pull origin develop
git checkout -b feature/nueva-cosa

# 2. Hacer cambios
echo "codigo" > archivo.ts

# 3. Commits
git add .
git commit -m "feat: agregar algo nuevo"
git commit -m "feat: mejorar implementación"

# 4. Push
git push origin feature/nueva-cosa

# 5. Abrir PR en GitHub (→ develop)
# 6. Cuando se apruebe, merge en GitHub
# 7. Limpiar
git checkout develop
git pull origin develop
git branch -d feature/nueva-cosa
git push origin --delete feature/nueva-cosa
```

### 🐛 Corregir Bug

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/correccion-bug

# ... hacer cambios ...

git add .
git commit -m "fix: descripción del bug"
git push origin bugfix/correccion-bug

# Abrir PR hacia develop
```

### 🏷️ Release

```bash
# 1. Crear rama
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# 2. Actualizar versión
# Editar: package.json
# Editar: CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "release: v1.2.0"
git push origin release/1.2.0

# 3. Abrir PRs a main y develop en GitHub
# 4. Merge a main

git checkout main
git pull origin main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Version 1.2.0"
git push origin main
git push origin v1.2.0

# 5. Merge a develop
git checkout develop
git pull origin develop
git merge --no-ff release/1.2.0
git push origin develop

# 6. Limpiar
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

### 🚨 Hotfix de Emergencia

```bash
# 1. Desde main
git checkout main
git pull origin main
git checkout -b hotfix/1.1.1

# 2. Corregir
# ... cambios urgentes ...

git add .
git commit -m "hotfix: corrección crítica"
git push origin hotfix/1.1.1

# 3. Merge a main
git checkout main
git merge --no-ff hotfix/1.1.1
git tag -a v1.1.1 -m "Hotfix 1.1.1"
git push origin main v1.1.1

# 4. Merge a develop
git checkout develop
git pull origin develop
git merge --no-ff hotfix/1.1.1
git push origin develop

# 5. Limpiar
git branch -d hotfix/1.1.1
git push origin --delete hotfix/1.1.1
```

---

## 🆘 Solución de Problemas

### ❌ Cambios sin guardar

```bash
# Ver cambios no guardados
git status

# Descartar cambios
git restore archivo.ts
git restore .

# O guardar en stash (para usar después)
git stash
git stash list
git stash pop
```

### ❌ Commit al que no pertenece

```bash
# Deshacer último commit (guardar cambios)
git reset --soft HEAD~1

# Deshacer último commit (descartar cambios)
git reset --hard HEAD~1

# Agregar cambios al commit anterior
git add .
git commit --amend --no-edit
```

### ❌ Conflictos en merge

```bash
# Ver conflictos
git diff

# Editar archivos con conflictos
# Luego...
git add .
git commit -m "Resolver conflictos"
```

### ❌ Cambios en rama equivocada

```bash
# Guardar cambios en stash
git stash

# Cambiar a rama correcta
git checkout rama-correcta

# Aplicar cambios
git stash pop
```

### ❌ Branch desincronizado

```bash
# Actualizar a última versión de develop
git fetch origin
git checkout develop
git pull origin develop

# En tu rama
git rebase origin/develop

# O merge si prefieres
git merge origin/develop
```

---

## 📝 Mensajes de Commit Estándares

### Formato

```
<tipo>(<scope>): <descripción>

<cuerpo>

<pie>
```

### Tipos

```
feat:     Nuevas características
fix:      Correcciones de bugs
docs:     Documentación
style:    Formato (no afecta lógica)
refactor: Refactorización
perf:     Optimizaciones
test:     Tests
chore:    Config, dependencias
ci:       CI/CD
```

### Ejemplos

```bash
git commit -m "feat: agregar validación de CUIT"
git commit -m "fix: corregir error en cálculo de impuestos"
git commit -m "docs: actualizar README"
git commit -m "style: formatear código con Prettier"
git commit -m "refactor: simplificar componente Dashboard"
git commit -m "test: agregar tests para ClientManagement"
```

---

## 🔗 Enlaces Útiles

- [Git Official Docs](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)

---

## ⌨️ Alias Útiles

Agrega estos a tu configuración global de Git:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'restore --staged'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
```

Uso:
```bash
git st          # En lugar de git status
git co develop  # En lugar de git checkout develop
git ci -m "msg" # En lugar de git commit -m "msg"
```

---

**Última actualización**: May 2026
