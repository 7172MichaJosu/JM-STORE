# Contratos de continuidad y límites del cambio

**Base**: [contrato HTTP 001](../../001-catalogo-pedidos-whatsapp/contracts/api.openapi.yaml), [interfaz 001](../../001-catalogo-pedidos-whatsapp/contracts/interfaz.md), [WhatsApp 001](../../001-catalogo-pedidos-whatsapp/contracts/whatsapp.md) y código actual. Si un detalle visual histórico de 001 difiere, rige la spec 002; las operaciones, validaciones y protección permanecen.

## Superficies y HTTP sin cambios

| Interfaz actual | Obligación de la feature 002 |
| --- | --- |
| `/` y `/#catalogo` | Catálogo público sin cuenta, todos los productos y mismo orden; añadir composición y tema, sin nuevos parámetros comerciales. |
| `/encargado/ingresar` | Formulario de acceso vigente con nueva apariencia, sin campos ni cuentas nuevas. |
| `/encargado` | Gestión protegida o acceso según sesión; no nuevo dashboard ni ruta adicional. |
| `GET /api/catalogo` | Mantener `{ productos, whatsapp }`, atributos, estados y consulta. |
| `GET /api/productos/:id/imagen` | Mismos BLOB, URL, tipo y respuesta de ausencia; no regenerar imágenes para el rediseño. |
| `GET/POST/DELETE /api/sesion` | Mismas credenciales externas, cookie, comprobación, límites de intentos y cierre. |
| `POST /api/productos` | Mismos cuatro campos multipart, validación, bloqueo y 201 tras persistir producto/imagen. |
| `DELETE /api/productos/:id` | Mismo ID, autorización y 204 tras eliminación; confirmar solo en UI. |
| `https://wa.me/...` | Misma construcción del enlace individual y codificación del texto, sin fetch ni envío automático. |

No nuevo contrato HTTP de apariencia. No duplicar el OpenAPI de la feature anterior con cambios inventados. `src/lib/api.js`, `precio.js` y `whatsapp.js` se reutilizan; sus detalles de comportamiento no dependen del tema.

## Seguridad preservada

- Mantener `Origin` exacto, `X-JM-STORE-Request: 1`, cookies del mismo origen, `cache: no-store`, mensajes seguros y `Retry-After` donde existe. Los componentes visuales no envían solicitudes adicionales al cambiar tema o preferencia de movimiento.
- Mantener cookie HttpOnly/SameSite y Secure en producción, vencimiento de sesión y limitación de intentos actuales. No modificar credenciales, variables externas, hashing, destino comercial, origen, ruta SQLite o política HTTPS.
- Mantener CSP actual: scripts/estilos del propio origen e imágenes propias/`blob:`. Bootstrap y tipografía bajo `/assets`, sin `unsafe-inline`, CDN, scripts remotos ni atributos de estilo generados desde JS. Los SVG de `Icono` conservan su implementación local; la decoración utiliza hojas de estilo externas.
- Ningún texto, precio o fotografía se convierte en HTML ejecutable. No incluir en capturas o evidencia usuario/contraseña reales, cookie, token, ruta privada, información de clientes ni contenido de `.env`.

## Datos e imágenes

Se conservan esquema, ID, orden por ID, importes en céntimos e imágenes WebP de SQLite. No migrar, vaciar, sembrar, copiar datos de ejemplo al catálogo real ni ejecutar recodificación masiva. La selección de fotografía protagonista utiliza el primer objeto recibido, no una marca nueva.

Las operaciones de prueba destructivas se ejecutan exclusivamente contra SQLite temporal creado por las fixtures. Para comprobar conservación de un catálogo previo, el responsable preparará una copia aislada mediante el mecanismo de respaldo seguro correspondiente a SQLite y una relación legible de productos; no copiar un archivo activo de manera inconsistente ni abrir la base real desde las fixtures. No es una función comercial de backup de la aplicación.

La comprobación técnica complementaria puede comparar esquema, ID, orden y SHA-256 de imágenes entre dos estados de esa copia sin altas/eliminaciones. La comprobación de la persona no técnica usa la relación visible y la app. No se usa una prueba de reinicio para inferir que las sesiones deban persistir: el comportamiento actual las revoca, por lo que el encargado vuelve a ingresar.

## Activos nuevos permitidos en la implementación posterior

Solo script inicial de tema versionado, una familia tipográfica local con licencia y las hojas/componentes de presentación previstos. Vite copiará `public/assets` a `dist/assets`; el servidor existente ya expone esa carpeta. Registrar procedencia, revisión y checksum de fuente/licencia al incorporarlas. Una edición del archivo con caché inmutable necesita nombre nuevo.

No se importan las referencias como imágenes de fondo de la tienda, productos, capturas de controles o capas interactivas. Los fixtures visuales autorizados viven solo en pruebas y no se mezclan con la oferta real.

## Verificación de compatibilidad

La batería funcional actual se mantiene, adaptando solo expectativas visuales que hayan quedado históricas. La prueba de contraste deja de depender del sello marfil/verde sin bajar sus umbrales. Se amplía el recorrido básico de Firefox y WebKit dentro de los proyectos actuales para tema, disposición, fotos completas, foco/modal y movimiento reducido; Chromium conserva la batería completa.

Revisar CSP, rutas y activos sobre la compilación servida por Express, porque Vite en desarrollo no acredita la misma política. Se mantienen pendientes WhatsApp real, dispositivo físico y participantes hasta su ejecución autorizada; las intercepciones y emulación no sustituyen esa evidencia.
