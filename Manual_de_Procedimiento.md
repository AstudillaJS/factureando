# Manual de Procedimiento: Chronos Labor OS (Factureando)

Este manual detalla la estructura, funcionamiento y procedimientos operativos para el desarrollo, compilación y despliegue del sistema de facturación **Chronos Labor OS**.

---

## 1. Arquitectura y Almacenamiento Local

La aplicación está construida como una aplicación híbrida de escritorio usando **Electron** como contenedor, **React (Vite)** para la interfaz y **Express (Node.js)** para el backend local y la lógica de integración con AFIP y Mercado Pago.

### Ubicación de los Datos
Para garantizar la privacidad y permitir un funcionamiento inicial 100% local, el sistema almacena su información en el directorio de datos de usuario de la aplicación:
*   **Ruta en Windows (Producción):** `%APPDATA%\Factureando\` (típicamente `C:\Users\USUARIO\AppData\Roaming\Factureando\`)
*   **Base de datos local:** `db.json` dentro de la ruta anterior. Almacena las configuraciones (`config`), el historial de comprobantes (`invoices`) y el listado de clientes (`clients`).
*   **Certificados AFIP:** `certs/` (almacena el certificado público `.crt` firmado y la clave privada `.key`).
*   **Respaldos automáticos de compilación:** Cada vez que se compila el proyecto (`npm run build`), el script `backup-dist.cjs` crea automáticamente una copia de la carpeta `dist` anterior en la carpeta raíz `Versiones anteriores/dist-backup-FECHA`.

---

## 2. Configuración Fiscal y Emisión en AFIP

El sistema permite la facturación electrónica interactuando directamente con los servidores de la Administración Federal de Ingresos Públicos (ARCA/AFIP).

### Entorno y Certificados
1.  **Modo Homologación vs. Producción:** configurable desde el panel de control. El modo de homologación (pruebas) no tiene validez legal y se utiliza para testear. El modo de producción interactúa con los servidores reales de AFIP.
2.  **Carga de Certificados:** A través de la interfaz "Configuración Fiscal", el usuario puede seleccionar el archivo `.crt` y `.key` directamente. Electron captura la ruta absoluta física y la guarda de forma segura en `db.json`.

### Cierre de Lote (Emisión Masiva de Borradores)
Cuando se finaliza una jornada de trabajo en la terminal, los registros se guardan en la base de datos con el estado `"status": "pending"` (Borradores). Para transformarlos en facturas oficiales de AFIP:
1.  **Ingreso a Historial:** Dirigirse al panel de "Historial de Facturación".
2.  **Selección de Borradores:** La interfaz cuenta con casillas de verificación (checkboxes) que permiten marcar borradores individuales o seleccionar todos para el lote.
3.  **Botón "Cerrar Lote":** Al hacer clic, se inicia un proceso secuencial en segundo plano que consume el endpoint `/api/afip/emit-invoice`.
4.  **Estado de Emisión:** AFIP devuelve el código de autorización electrónica (CAE), su vencimiento y el número de comprobante oficial. El sistema actualiza el estado de la factura a `"status": "emitted"` en `db.json` y almacena estos metadatos.
5.  **Barra de Progreso:** Se muestra visualmente el avance del lote y, al finalizar, un desglose de comprobantes emitidos exitosamente y posibles errores de comunicación.

---

## 3. Personalización y Generación de PDF (A4)

El sistema incluye un generador de PDFs integrado ([pdfGenerator.ts](file:///c:/Users/astud/OneDrive/LYNX/Factureando/src/utils/pdfGenerator.ts)) diseñado para emitir las facturas bajo la normativa oficial, incluyendo los detalles de la empresa, el logotipo personalizado y la marca de la consultora.

1.  **Carga de Logotipo:** En el módulo "Diseño de Factura", el usuario puede subir un logotipo en formato PNG o JPG. Este se almacena en base64 dentro de la configuración de `db.json` (`invoiceLogo`).
2.  **Pie de página Institucional:** Todas las facturas PDF generadas incorporan de forma obligatoria en la sección inferior la leyenda **"Powered by Lynx Consulting"** y el logotipo institucional de la consultora.
3.  **Visualización:** Al hacer clic en "Ver PDF" o "Regenerar PDF", el sistema construye el documento dinámicamente y lo abre en el navegador predeterminado del sistema operativo.

---

## 4. Flujo de Desarrollo y Sincronización en Git

Para garantizar la estabilidad del proyecto y el correcto funcionamiento de las reglas de GitHub, se deben seguir las siguientes normativas de código:

### Gestión de Credenciales y Seguridad (Push Protection)
*   **Regla Estricta:** **Bajo ninguna circunstancia se deben subir tokens de acceso de GitHub (`ghp_...`) al repositorio.**
*   Los scripts de automatización de releases ([publish.cjs](file:///c:/Users/astud/OneDrive/LYNX/Factureando/publish.cjs), [publish-release.cjs](file:///c:/Users/astud/OneDrive/LYNX/Factureando/publish-release.cjs) y [patch-release.cjs](file:///c:/Users/astud/OneDrive/LYNX/Factureando/patch-release.cjs)) están configurados para leer el token dinámicamente desde el entorno usando `process.env.GH_TOKEN`.
*   Para realizar operaciones que requieran privilegios de publicación, define la variable temporalmente en tu consola antes de ejecutar los comandos.

### Flujo de GitFlow
1.  **Rama de Trabajo:** Trabajar y probar las funcionalidades en la rama `develop`.
2.  **Verificación de Tipos:** Antes de commitear, ejecuta el chequeo estático de TypeScript para garantizar que no existan referencias nulas ni errores de importación:
    ```bash
    npx tsc --noEmit
    ```
3.  **Commit y Push:** 
    ```bash
    git add .
    git commit -m "feat/fix: descripción clara del cambio"
    git push origin develop
    ```

---

## 5. Lanzamiento de Actualizaciones (Auto-Updates)

Para notificar y actualizar a todas las personas que tengan instalada la aplicación de escritorio de forma 100% automática:

### Paso 1: Configuración de la Versión
*   Incrementa el número de versión en el archivo [package.json](file:///c:/Users/astud/OneDrive/LYNX/Factureando/package.json) (línea 4, ej. de `1.0.19` a `1.0.20`).

### Paso 2: Ejecución del Release
1.  Abre una consola (CMD o PowerShell).
2.  Establece tu token de GitHub con permisos de escritura en la sesión:
    *   **En CMD:** `set GH_TOKEN=tu_token_de_github_aqui`
    *   **En PowerShell:** `$env:GH_TOKEN="tu_token_de_github_aqui"`
3.  Lanza el proceso de compilación y publicación:
    ```bash
    npm run release
    ```

Este comando compila el bundle de producción de React, empaqueta el servidor Express en `dist/server.cjs`, realiza una copia de seguridad en `Versiones anteriores/` y genera el instalador autoinstalable `.exe` de Windows, subiéndolo automáticamente como un nuevo Release a GitHub en estado público.

### Paso 3: Recepción por parte de los clientes
1.  Al abrir la aplicación instalada, Electron consulta silenciosamente a GitHub si hay una versión superior en las Releases.
2.  Si la encuentra, descarga el instalador en segundo plano de manera imperceptible.
3.  Una vez completada la descarga, lanza un cuadro de diálogo al usuario invitándole a reiniciar para instalar la actualización.
4.  Al aceptar, la aplicación se cierra, instala la nueva versión en segundos y se vuelve a abrir completamente actualizada con todas las bases de datos locales intactas.
