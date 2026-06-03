# Manual de Procedimiento: Chronos Labor OS (Factureando)

Este manual detalla la estructura, funcionamiento y procedimientos operativos para el desarrollo, compilación y despliegue del sistema de facturación **Chronos Labor OS**.

---

## 1. Arquitectura y Almacenamiento Local

La aplicación está construida como una aplicación híbrida de escritorio usando **Electron** como contenedor, **React (Vite)** para la interfaz y **Express (Node.js)** para el backend local y la lógica de integración.

### Ubicación de los Datos
Para garantizar la privacidad y permitir un funcionamiento inicial 100% local, el sistema almacena su información en el directorio del proyecto:
*   **Base de datos local:** `data/db.json` (Guarda configuraciones, historial de facturas y tokens).
*   **Certificados AFIP:** `data/certs/` (Almacena los archivos `.crt` y `.key` subidos por el cliente).
*   **Respaldos automáticos de compilación:** Cada vez que se compila el proyecto (`npm run build`), el script `backup-dist.cjs` guarda una copia de la carpeta `dist` previa en `Versiones anteriores/dist-backup-FECHA`.

---

## 2. Flujo de Trabajo en Desarrollo

Para trabajar en el código respetando la filosofía de **GitFlow**:

1.  **Ramas de Desarrollo:** Toda nueva característica o corrección debe realizarse en ramas derivadas de `develop` (ej. `feature/nueva-funcion` o `hotfix/error-afip`).
2.  **Pruebas locales:** Para iniciar el entorno de desarrollo conjunto (Vite + Express Server + Electron) ejecuta:
    ```bash
    npm run dev
    ```
    *Nota: Si estás usando PowerShell, asegúrate de correrlo desde una terminal CMD o tener las políticas de ejecución de scripts habilitadas.*

3.  **Integración:** Una vez probado el código, se fusiona a `develop` y finalmente a `main` cuando esté listo para producción.

---

## 3. Guía de Lanzamiento y Actualizaciones Automáticas (Auto-Updates)

Para responder a tu pregunta de **¿Cómo notificar y actualizar a todas las personas que lo tengan instalado automáticamente?**, este es el procedimiento detallado paso a paso usando la vinculación con **GitHub Releases**:

### Configuración Única (Preparación del canal de actualizaciones)
1.  **Repositorio en la nube:** Asegúrate de que el código esté en un repositorio público o privado en tu GitHub.
2.  **Actualizar package.json:** Reemplaza `"TuUsuarioDeGitHub"` por tu usuario real de GitHub en la sección:
    ```json
    "publish": [
      {
        "provider": "github",
        "owner": "TuUsuarioDeGitHub",
        "repo": "factureando"
      }
    ]
    ```

### Procedimiento para lanzar una nueva versión (Paso a MAIN)

Cuando decidas lanzar una actualización y quieras que les llegue la notificación a tus clientes:

#### Paso 1: Fusionar cambios y actualizar versión
1. Fusiona tu rama `develop` a la rama `main` de producción.
2. Incrementa el número de versión en el archivo `package.json` (ej: cambiar `"version": "1.0.0"` por `"version": "1.0.1"`).

#### Paso 2: Configurar tu Token de Acceso (GH_TOKEN)
Para que el compilador pueda subir el archivo `.exe` directamente a tu cuenta de GitHub, necesitas proveerle un token temporal en tu terminal de comandos (se genera en GitHub -> Settings -> Developer Settings -> Personal Access Tokens).
*   **En Windows CMD (Terminal):**
    ```cmd
    set GH_TOKEN=tu_token_secreto_aqui
    ```
*   **En PowerShell:**
    ```powershell
    $env:GH_TOKEN="tu_token_secreto_aqui"
    ```

#### Paso 3: Compilar y Publicar en GitHub
Ejecuta el script de lanzamiento que creamos:
```bash
npm run release
```
Este comando realizará las siguientes tareas automáticamente:
1. Creará un backup de la versión anterior en la carpeta `Versiones anteriores`.
2. Compilará el código React y el servidor Express (`npm run build`).
3. Creará el instalador `.exe` optimizado para Windows.
4. **Subirá el instalador `.exe` directamente a tu repositorio de GitHub como un borrador de Release (Draft Release).**

#### Paso 4: Publicar el Release en GitHub
1. Entra a tu repositorio en GitHub y ve a la sección de **Releases**.
2. Verás la nueva versión (ej. `v1.0.1`) guardada como Borrador con el archivo `.exe` adjunto.
3. Haz clic en **Edit** y luego en **Publish Release** (Publicar).

---

## 4. ¿Cómo reciben la alerta los clientes?

El sistema de actualización que programamos en `electron-main.cjs` funciona de la siguiente manera:

1.  **Detección:** Cada vez que un usuario abre la aplicación instalada, Electron consulta de manera silenciosa a GitHub si hay una versión superior a la que tiene instalada (compara el número de versión).
2.  **Notificación de Descarga:** Si detecta una nueva versión (ej: `1.0.1`), muestra una ventana emergente en pantalla:
    > *"¡Nueva versión de CHRONOS LABOR OS disponible! Descargando..."*
3.  **Descarga en segundo plano:** El sistema descarga automáticamente la actualización en segundo plano sin interrumpir el trabajo del usuario.
4.  **Instalación:** Una vez finalizada la descarga, el sistema le muestra un mensaje claro al usuario:
    > *"Una nueva versión ha sido descargada. ¿Deseas reiniciar la aplicación para aplicar las actualizaciones ahora?"*
5.  **Reinicio:** Si el usuario acepta, la aplicación se cierra sola, instala la nueva versión en segundos y vuelve a abrirse actualizada. Todo esto ocurre de forma transparente y sin que el usuario tenga que volver a descargar manualmente el instalable de internet.
