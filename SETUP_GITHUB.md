# SETUP - Configuración Inicial de GitHub para Gitflow

Este documento guía la configuración del repositorio GitHub para usar Git Flow.

## 📋 Pasos Previos

Asegúrate de tener:
- ✅ Repositorio creado en GitHub
- ✅ Permisos de administrador en el repo
- ✅ Git instalado localmente

## 🔧 1. Configuración de Ramas

### 1.1 Crear rama `develop`

En GitHub (si no existe):

```bash
# Local
git checkout -b develop
git push -u origin develop
```

### 1.2 Proteger rama `main`

1. Ve a: **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Configura:

```
✅ Require a pull request before merging
   └─ Require approvals: 1
   └─ Dismiss stale pull request approvals: ✅

✅ Require status checks to pass before merging
   └─ Require branches to be up to date before merging: ✅
   └─ Require code reviews before merging: ✅

✅ Require conversation resolution before merging
✅ Include administrators: ✅
```

4. Save changes

### 1.3 Proteger rama `develop`

1. Add another rule para `develop`
2. Branch name pattern: `develop`
3. Configura:

```
✅ Require a pull request before merging
   └─ Require approvals: 1
   └─ Dismiss stale pull request approvals: ✅

✅ Require status checks to pass before merging
   └─ Require branches to be up to date before merging: ✅
```

4. Save changes

### 1.4 Configurar ramas permitidas (feature/*, bugfix/*, etc)

1. Add rule para `feature/*`
2. Branch name pattern: `feature/*`
3. Sin restricciones (puede hacer merge directo para desarrollo)
4. Save

Repite para:
- `bugfix/*`
- `release/*`
- `hotfix/*`

## 🔑 2. Configuración de Secrets (API Keys)

1. Ve a: **Settings → Secrets and variables → Actions**
2. Click "New repository secret"
3. Agrega:

```
Name: GEMINI_API_KEY
Value: tu_clave_aqui
```

4. Repite para otros secrets necesarios

## 📊 3. Configurar GitHub Actions

Ya incluido en `.github/workflows/ci-cd.yml`

### Verificar Actions

1. Ve a: **Actions tab**
2. Verifica que los workflows estén activos
3. Los pipelines correrán automáticamente en:
   - Pushes a `main`, `develop`
   - Pull Requests a `main`, `develop`

## 🏷️ 4. Configurar Tags y Releases

### Crear release automáticas

Las releases se crean automáticamente cuando haces push de un tag:

```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

Esto:
- Crea un release en GitHub
- Adjunta archivos compilados (dist/)
- Genera notas automáticas

## 👥 5. Configurar Equipos y Permisos

### Agregar colaboradores

1. Ve a: **Settings → Collaborators → Add people**
2. Asigna roles:
   - `main`: Solo lectores + PR reviews
   - `develop`: Colaboradores
   - `feature/*`: Todos pueden crear

### Teams (si usas organización)

1. Ve a: **Settings → Teams**
2. Crea equipo `devs`
3. Agrega permisos en ramas

## 📝 6. Configurar Labels y Plantillas

### Labels

1. Ve a: **Issues → Labels**
2. Crea labels estándar:

```
- bug (rojo)
- enhancement (azul)
- documentation (verde)
- urgent (naranja)
- wontfix (gris)
```

### Pull Request Template

Crea `.github/pull_request_template.md`:

```markdown
## 📋 Descripción

Describe brevemente los cambios realizados.

## 🔗 Relacionado con

Cierra #(issue_number)

## 🧪 Cambios

- [ ] Cambio 1
- [ ] Cambio 2

## ✅ Checklist

- [ ] Código testeado localmente
- [ ] Sin conflictos con develop
- [ ] Documentación actualizada
- [ ] Commits con mensajes claros
```

### Issue Template

Crea `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
## 🐛 Descripción del Bug

Describe el problema...

## 📋 Pasos para Reproducir

1. ...
2. ...

## ✅ Comportamiento Esperado

...

## ❌ Comportamiento Actual

...

## 📸 Screenshots

Si aplica, agrega capturas...
```

## 🔄 7. Configurar Merge Strategy

1. Ve a: **Settings → General**
2. Pull Requests:
   - ✅ Allow squash merging
   - ✅ Allow rebase merging
   - ✅ Allow auto-merge
3. Merge button:
   - ☑ Automatically delete head branches

## 📬 8. Configurar Notificaciones

1. Ve a: **Settings → Notifications**
2. Configura:
   - ✅ Watch: All Activity
   - ✅ PR Reviews: Enabled
   - ✅ Comments: Enabled

## 🚀 9. Primer Release

```bash
# Asegúrate de estar en develop
git checkout develop
git pull origin develop

# Crear rama release
git checkout -b release/1.0.0

# Actualizar versión en package.json
# Luego:
git add package.json
git commit -m "release: v1.0.0"
git push origin release/1.0.0

# Abrir PR hacia main en GitHub
# Merge y luego:
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## ✅ Checklist Final

- [ ] Rama `main` protegida
- [ ] Rama `develop` protegida
- [ ] GitHub Actions configurado
- [ ] Secrets añadidos
- [ ] Labels creados
- [ ] PR Templates creadas
- [ ] Primeros colaboradores invitados
- [ ] Documentación actualizada

## 🆘 Troubleshooting

### Los workflows no corren

1. Ve a **Actions → Workflows**
2. Si está deshabilitado, haz click en "Enable"
3. Verifica que `ci-cd.yml` exista en `.github/workflows/`

### Error en protección de ramas

1. Asegúrate de ser **Owner** o tener permisos admin
2. Algunos tipos de repos no permiten protecciones
3. Intenta deshabilitar y reactivar

### Tags no aparecen en releases

```bash
# Asegúrate que el tag sea semántico
git tag -a v1.0.0 -m "Release 1.0.0"  # ✅ Correcto
git tag -a 1.0.0 -m "Release"         # ❌ Incorrecto (falta 'v')
```

---

**Última actualización**: May 2026

¡Listo! Tu GitHub está configurado para Git Flow 🎉
