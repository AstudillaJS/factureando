# 🚀 Inicio Rápido - Factureando

Guía rápida para empezar a trabajar en el proyecto.

## ⚡ 5 Pasos para Empezar

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/AstudillaJS/factureando.git
cd factureando
```

### 2️⃣ Instalar Dependencias

#### Opción A: PowerShell (Recomendado)

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\install.ps1
```

#### Opción B: Batch

```bash
install.bat
```

#### Opción C: Manual

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

```bash
copy .env.example .env
```

Luego edita `.env` y agrega tu **GEMINI_API_KEY** (obtén gratis en https://ai.google.dev)

### 4️⃣ Iniciar en Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador

### 5️⃣ Hacer tu Primer Cambio

```bash
# Crear rama
git checkout -b feature/mi-primera-feature

# Hacer cambios
# (Edita algún archivo...)

# Commit
git add .
git commit -m "feat: descripción de mi cambio"

# Push
git push -u origin feature/mi-primera-feature

# Abrir PR en GitHub
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [README.md](README.md) | Información general del proyecto |
| [GITFLOW.md](GITFLOW.md) | Guía completa de Git Flow |
| [GIT_CHEATSHEET.md](GIT_CHEATSHEET.md) | Comandos rápidos de Git |
| [SETUP_COMPLETO.md](SETUP_COMPLETO.md) | Instrucciones de setup final |
| [PROTEGER_RAMAS.md](PROTEGER_RAMAS.md) | Cómo proteger ramas en GitHub |

---

## 🛠️ Comandos Útiles

```bash
# Ver rama actual
git branch

# Actualizar desde develop
git checkout develop
git pull origin develop

# Ver cambios
git status

# Ver último commit
git log --oneline -1

# Compilar para producción
npm run build

# Ver versión
node --version
```

---

## 🆘 Problemas Comunes

### "Port 3000 already in use"

Cambia en `.env`: `PORT=3001`

### "node: command not found"

Instala Node.js desde https://nodejs.org

### "git: command not found"

Instala Git desde https://git-scm.com

### "Cannot find module"

```bash
rm -rf node_modules
npm install
```

---

## 🎯 Próximos Pasos

1. ✅ **Completado**: Clonar, instalar, configurar
2. 🔜 **Siguiente**: Familiarizarte con la estructura del proyecto
3. 🔜 **Luego**: Leer GITFLOW.md para entender el flujo de trabajo
4. 🔜 **Finalmente**: Comenzar a contribuir

---

## 📞 Necesitas Ayuda?

- 📖 Lee [GITFLOW.md](GITFLOW.md) para entender el flujo
- 🔧 Revisa [README.md](README.md) para info del proyecto
- ⚡ Usa [GIT_CHEATSHEET.md](GIT_CHEATSHEET.md) para comandos

---

**¡Bienvenido a Factureando!** 🎉

Happy coding! 💻
