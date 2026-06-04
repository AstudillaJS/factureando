# 🔐 Proteger Ramas en GitHub - Guía Visual

Este documento te guía paso a paso para proteger las ramas `main` y `develop` en GitHub.

## ⚠️ ¿Por qué proteger ramas?

- ✅ Evitar pushes directos a producción
- ✅ Requerir revisión de código (Pull Requests)
- ✅ Ejecutar tests automáticos antes de merge
- ✅ Mantener historial limpio

## 🔧 Proteger `main` (Producción)

### Paso 1: Ir a Configuración de Protecciones

1. **URL**: https://github.com/AstudillaJS/factureando/settings/branches
2. O desde el repo: **Settings** → **Branches**

### Paso 2: Crear Nueva Regla

1. Click botón verde: **Add rule**
2. En "Branch name pattern" escribe: `main`

### Paso 3: Configurar Requisitos

Marca las siguientes opciones:

```
✅ Require a pull request before merging
   └─ ✅ Require approvals
       └─ Número de aprobaciones: 1
   └─ ✅ Dismiss stale pull request approvals when new commits are pushed
   └─ ✅ Require code reviews before merging

✅ Require status checks to pass before merging
   └─ ✅ Require branches to be up to date before merging

✅ Include administrators
```

### Paso 4: Guardar

Click en **Create** para guardar la regla.

---

## 🔧 Proteger `develop` (Integración)

Repite los pasos anteriores pero con:

1. Branch name pattern: `develop` (menos restrictivo que main)
2. Requisitos:

```
✅ Require a pull request before merging
   └─ ✅ Require approvals: 1
   └─ ✅ Dismiss stale pull request approvals

✅ Require status checks to pass before merging
```

---

## 🔑 Configurar Secrets (API Keys)

### Paso 1: Ir a Secrets

1. **URL**: https://github.com/AstudillaJS/factureando/settings/secrets/actions
2. O desde el repo: **Settings** → **Secrets and variables** → **Actions**

### Paso 2: Crear Secret

1. Click botón verde: **New repository secret**
2. **Name**: `GEMINI_API_KEY`
3. **Value**: Tu clave de Gemini API (ver pasos abajo)
4. Click: **Add secret**

### Obtener tu Gemini API Key

1. Ve a: https://ai.google.dev
2. Click: **Get API Key**
3. Copia la clave
4. Pégala en GitHub Secrets

### (Opcional) Mercado Pago

Si usas Mercado Pago, agrega también:

- **Name**: `MERCADOPAGO_TOKEN`
- **Value**: Tu token de Mercado Pago

---

## 📊 Verificar Configuración

### Ver Protecciones

1. Ve a: **Settings** → **Branches**
2. Deberías ver:
   - `main` con regla de protección ✅
   - `develop` con regla de protección ✅

### Ver Secrets

1. Ve a: **Settings** → **Secrets and variables** → **Actions**
2. Deberías ver:
   - `GEMINI_API_KEY` ✅
   - (Opcional) `MERCADOPAGO_TOKEN` ✅

### Ver Workflows

1. Ve a: **Actions**
2. Deberías ver el workflow **CI/CD Pipeline** ✅

---

## 🧪 Probar la Configuración

### Test 1: Intentar Push Directo a main

```bash
git checkout main
echo "test" > test.txt
git add test.txt
git commit -m "test: intentar push directo"
git push origin main
```

**Resultado esperado**: ❌ Error (no se permite push directo)

### Test 2: Crear PR Correctamente

```bash
git checkout develop
git pull origin develop
git checkout -b feature/test
echo "test" > test.txt
git add test.txt
git commit -m "feat: test feature"
git push origin feature/test
```

**Luego**: Abre PR en GitHub de `feature/test` → `develop`

**Resultado esperado**: ✅ PR abierto, esperando aprobación

### Test 3: Verificar CI/CD

1. Ve a la PR que creaste
2. Baja hasta "Checks"
3. Deberías ver: **CI/CD Pipeline** en proceso o completado

---

## ✅ Checklist de Configuración

- [ ] Rama `main` protegida
- [ ] Rama `develop` protegida
- [ ] `GEMINI_API_KEY` agregado en Secrets
- [ ] GitHub Actions CI/CD ejecutándose
- [ ] Rama por defecto es `develop` (opcional)
- [ ] Colaboradores invitados

---

## 🆘 Troubleshooting

### Error: "Permission denied"

**Causa**: Rama protegida

**Solución**: 
- Crea una rama feature desde develop
- Abre un PR en lugar de push directo

### Error: "Branch is not up to date"

**Causa**: Hay cambios más nuevos en la rama destino

**Solución**:
```bash
git fetch origin
git rebase origin/develop
git push -f origin feature/mi-rama
```

### Los checks no corren

**Causa**: GitHub Actions puede estar deshabilitado

**Solución**:
1. Ve a **Actions** en tu repo
2. Si ves "Workflows are disabled", click en **Enable workflows**

### No puedo aprobar mi propio PR

**Causa**: GitHub no permite que apruebes PRs que creaste

**Solución**: Pedir a otro colaborador que lo revise

---

## 📚 Información Adicional

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Última actualización**: May 2026

Una vez completados estos pasos, tu repositorio estará completamente protegido y listo para colaboración en equipo! 🎉
