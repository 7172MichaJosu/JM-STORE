# Guía de arranque y validación — JM-STORE

**Fecha**: 2026-10-26 | **Estado**: aplicación implementada localmente; aceptación externa parcial y feature abierta.

Los comandos siguientes existen en `package.json`. La ejecución y los resultados de Implement se registran al final de esta guía. Las secciones V-01 a V-09 conservan las acciones y resultados esperados para una revisión desde la aplicación, sin conocimientos técnicos. Los ensayos presenciales se realizarán después, por indicación del responsable; no se presenta la aceptación global como terminada.

Referencias: [plan](plan.md), [modelo](data-model.md), [API](contracts/api.openapi.yaml), [interfaz](contracts/interfaz.md), [WhatsApp](contracts/whatsapp.md) y [spec vigente](spec.md).

## Preparación — responsable técnico

Esta sección es para quien prepara el entorno. La persona que acepta el producto utiliza únicamente las acciones de V-01 a V-09 y no necesita terminal, código ni acceso a SQLite.

Prerrequisitos de ejecución:

- Node.js 24 LTS y npm; código implementado con `package-lock.json` y scripts del cuadro siguiente.
- Directorio SQLite persistente fuera del código y `dist/`, con permisos de escritura para archivo y diario. Nunca usar una base de producción para pruebas.
- Configuración externa de acceso y número comercial de prueba autorizado. Ningún secreto se incorpora a Git ni a variables `VITE_*`.
- Navegador de computadora y celular; acceso a WhatsApp para revisar borradores sin enviarlos. Servir mediante HTTPS para pruebas de acceso en otro dispositivo o por internet.
- Para la aceptación: dos sesiones de navegación independientes, imágenes ficticias JPEG/PNG/WebP, acceso de encargado de prueba y cinco participantes nuevos para SC-007.

### Configuración externa

| Variable | Finalidad y validación |
| --- | --- |
| `NODE_ENV` | `development` o `production`; modo HTTP local solo en desarrollo. |
| `APP_ORIGIN` | Origen exacto del navegador, sin ruta. Local previsto `http://localhost:5173`; para internet, origen HTTPS del entorno. No derivarlo de cabeceras no confiables. |
| `PORT` | Puerto del servidor, previsto `3001` en desarrollo. |
| `SQLITE_PATH` | Ruta absoluta a SQLite persistente; no versionada ni servida públicamente. |
| `ADMIN_USERNAME` | Acceso único del encargado, suministrado externamente. |
| `ADMIN_PASSWORD_HASH` | Registro scrypt completo con parámetros/salt/derivado; nunca contraseña en claro. |
| `WHATSAPP_NUMBER` | Número comercial canónico internacional con `+`; ausente/inválido deshabilita pedidos, sin detener catálogo. No incluir un número real en archivos de ejemplo. |

Credenciales ausentes/mal formadas deben impedir un arranque que deje la gestión abierta; comunicar solo un error de configuración seguro. Destino comercial ausente/inválido tiene un resultado distinto: permite catálogo y acceso, con pedidos deshabilitados, según FR-008.

### Comandos disponibles

Ejecutar desde la raíz del proyecto en PowerShell:

```powershell
npm ci
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
npm run configurar-acceso
```

`configurar-acceso` es una utilidad local interactiva: solicita usuario/contraseña sin eco, genera scrypt y escribe usuario/hash en `.env` excluido de Git. No usa contraseña como argumento ni la imprime. El responsable completa los demás valores externos de la tabla. Los scripts del servidor cargan `.env` mediante soporte nativo de Node, sin exponerlo a Vite. El preparador conserva las otras variables y admite el BOM de Windows.

| Propósito | Script real | Comportamiento |
| --- | --- | --- |
| API de desarrollo | `npm run dev:api` | Servidor local en puerto 3001; crea esquema solo si no existe y conserva registros al reiniciar. |
| Web de desarrollo, segunda terminal | `npm run dev:web` | Vite en puerto 5173; `/api/` pasa por proxy conservando origen. |
| Compilar web | `npm run build` | Genera `dist/`, sin secretos del servidor en los recursos. |
| Servir compilación | `npm start` | Un servidor sirve `dist/`, las tres rutas web y API. Para HTTP local usar `APP_ORIGIN=http://127.0.0.1:3001` y `NODE_ENV=development`; para internet, HTTPS y production. |
| Pruebas de lógica/HTTP/SQLite | `npm test` | Runner `node:test`; directorios y archivos temporales aislados, sin modificar el catálogo real. |
| Navegador | `npm run test:e2e` | Playwright verifica recorridos con datos ficticios y servidor de pruebas independiente. |

Tras instalar dependencias, preparar los navegadores de pruebas:

```powershell
npx playwright install chromium firefox webkit
```

La batería completa usa Chromium; Firefox y WebKit comprueban el recorrido básico. Para aceptación en otro dispositivo utilizar un entorno HTTPS preparado; la cookie Secure no debe desactivarse en un entorno público. El puerto/dominio concreto se registrará junto con esa evidencia pendiente. No se configuró un proveedor.

### Datos y fallos de laboratorio

Preparar mediante la gestión implementada o fixtures exclusivos de pruebas, nunca con endpoints públicos de simulación:

- 20 productos distinguibles, tres de referencia con datos conocidos y al menos dos de igual nombre con ID distinto. Incluir «Taza & café + plato», descripción «Cerámica, color azul», precio `S/ 49.90`.
- Un producto con textos largos, tildes, `&`, `+`, saltos y texto que parezca HTML; debe verse como texto y poder leerse completo.
- Imágenes de prueba válidas y archivos corruptos/no imagen; elegir una imagen original descartable para comprobar su eliminación del dispositivo.
- Entorno vacío y siete condiciones de V-08. Los fallos de lectura/escritura se inducen en un servidor de pruebas aislado mediante dependencias/fixtures controlados; nunca agregar rutas, parámetros o interruptores públicos al producto.
- Para imagen no disponible, preparar una respuesta de imagen fallida en el entorno de pruebas manteniendo el resto del producto, sin cambiar el archivo original del celular como sustituto del caso.
- Para comprobar permanencia, el responsable detiene y arranca el servidor con el mismo `SQLITE_PATH`, sin borrar/recrear datos. La sesión del encargado puede terminar al reiniciar; eso no afecta al catálogo persistente.

## V-01 — Catálogo completo y carga (SC-001; H1.1–H1.2, H1.6)

**Condición**: 20 productos y conexión estable; el responsable entrega una relación visible de referencia, sin datos de clientes.

**Acciones**: abrir el catálogo sin iniciar sesión; recorrerlo y comparar los 20 productos. Repetir cinco aperturas bajo las mismas condiciones, cronometrando desde abrir hasta que el primer grupo tenga nombre, precio y botón utilizables.

**Resultado esperado**: 20 tarjetas sin omisiones ni duplicados; imagen, nombre, descripción, `S/` y acción por producto; primer grupo utilizable en ≤3 s en al menos 4 de 5 aperturas. Registrar los cinco tiempos y condiciones de red/caché. En el entorno vacío, aparece «Por el momento no hay productos disponibles», sin tarjetas ficticias.

## V-02 — Borradores correctos (SC-002; H2.1–H2.4, EC-05–EC-06)

**Condición**: tres productos de referencia, incluido «Taza & café + plato» a `S/ 49.90`, destino comercial de prueba y acceso a WhatsApp.

**Acciones**: activar una sola vez el pedido de cada tarjeta; revisar destinatario y texto sin enviar. Comparar nombre, descripción y precio con la tarjeta. Regresar al catálogo. Repetir el regreso en la situación preparada donde el servicio externo no permite continuar.

**Resultado esperado**: los tres borradores corresponden a sus productos, conservan tildes, espacios, `&` y `+`, y van al destino común. El catálogo permanece disponible al regresar; JM-STORE no anuncia envío, confirmación, reserva ni pago. No se cuenta el tiempo de acceso externo. Una tarjeta antigua de un producto eliminado no garantiza disponibilidad ni elimina una conversación ya preparada.

## V-03 — Alta e imagen persistentes (SC-003; H3.1–H3.3, H3.10)

**Condición**: sesión de encargado iniciada; nombre, descripción, precio e imagen de prueba ya preparados. Archivo original descartable.

**Acciones**: registrar los cuatro campos sin ayuda y medir el tiempo. Tras el éxito, el responsable comprueba con la persona que solo existe una tarjeta. Eliminar el original de prueba del dispositivo; recargar, abrir otra sesión de navegación sin autenticar y consultar desde otro dispositivo. Después del reinicio preparado, volver a consultar.

**Resultado esperado**: alta en ≤2 min; mensaje de éxito solo al terminar. En todas las consultas aparece una sola vez con mismos textos/precio e imagen visible. El reinicio puede pedir nuevo acceso para gestión, pero no pierde el producto. No basta con que siga visible una previsualización local.

## V-04 — Eliminación persistente (SC-004; H4.1–H4.3, H4.5)

**Condición**: sesión iniciada y dos productos conocidos.

**Acciones**: elegir eliminar uno; comprobar que el diálogo lo identifica; cancelar y verificar ambos. Volver a eliminarlo, confirmar y medir el tiempo. Recargar y consultar después del reinicio preparado. En otra ronda eliminar el último producto.

**Resultado esperado**: cancelar conserva ambos. La eliminación confirmada tarda ≤30 s, retira solo el elegido y continúa ausente tras reinicio; el otro mantiene todos sus datos. Al eliminar el último aparece el estado vacío.

## V-05 — Adaptación y accesibilidad (SC-005; H1.3–H1.4, H1.7)

**Condición**: tarjetas con textos largos, las tres vistas y diálogos disponibles. Responsable prepara anchos 360, 768 y 1366 px.

**Acciones**: en cada ancho completar consulta, borrador, login/logout, alta y eliminación. En computadora repetir usando solo teclado y ampliando el texto al 200 %; en celular real repetir mediante tacto. Leer los textos largos completos y cancelar el diálogo con teclado antes de confirmar.

**Resultado esperado**: sin superposición ni desplazamiento horizontal de página; todos los controles accesibles, etiquetas y foco visibles, errores asociados y texto completo. No se necesita hover. El foco se mantiene en el diálogo y vuelve a un lugar útil al cerrarlo. Registrar dispositivo/navegador y evidencias por ancho.

## V-06 — Español, soles y límites (SC-006; EC-07)

**Condición**: estados normal, carga, vacío, validación, confirmación y error preparados, incluido acceso incorrecto.

**Acciones**: recorrer catálogo, solicitud, acceso, alta y eliminación en esos estados; revisar todos los textos propios y precios.

**Resultado esperado**: 100 % de textos propios en español y precios con `S/ `, punto y dos decimales. Ningún paso de pago, registro de cliente, tarjeta bancaria ni solicitud de nombre/teléfono/dirección del cliente. No aparecen credenciales, valores de entrada sensibles o errores internos. Los textos externos de WhatsApp se excluyen de la revisión del idioma propio.

## V-07 — Comprensión y presentación (SC-007; H1.8)

**Condición**: tres tarjetas visibles, cinco personas que no hayan usado la tienda; sin instrucciones de ubicación de controles.

**Acciones**: pedir a cada persona identificar nombre, precio y acción de pedido de un producto; medir hasta 30 s. Comparar paleta, tipografía y jerarquía entre catálogo y gestión. Activar la preferencia de movimiento reducido y repetir las acciones.

**Resultado esperado**: al menos cuatro de cinco identifican los tres elementos en ≤30 s. Presentación coherente, controles con estados visibles y sin parpadeos. Con movimiento reducido se completan las mismas acciones sin animaciones no esenciales. Registrar solo etiquetas de participante A–E y tiempos, sin datos personales.

## V-08 — Siete condiciones de límite y fallo (SC-008)

El responsable prepara cada condición en entorno aislado; la persona realiza la acción y observa:

| Condición | Acción | Resultado esperado |
| --- | --- | --- |
| 1. Catálogo vacío | Abrir catálogo. | Mensaje vacío específico, sin tarjetas ficticias. |
| 2. Imagen no disponible | Consultar su tarjeta. | «Imagen no disponible»; texto/precio/pedido operativos. |
| 3. Datos inválidos | Intentar altas con vacíos/espacios, archivo corrupto, tipo/límite no admitido, precio no numérico, cero, negativo y tres decimales. | Ninguna alta; errores de campo españoles; conserva demás datos. |
| 4. Lectura fallida | Abrir y luego reintentar cuando el responsable restablezca lectura. | «No pudimos cargar los productos» distinto del vacío; reintento recupera catálogo. |
| 5. Guardado fallido antes del commit | Guardar y reintentar tras recuperar escritura. | Sin falso éxito ni alta parcial; conserva datos/archivo; otros productos intactos; reintento correcto crea uno. |
| 6. Eliminación fallida | Confirmar y recargar. | Sin falso éxito; producto continúa y otros intactos. |
| 7. Destino ausente o inválido | Consultar en cada variante de configuración. | Mensaje de indisponibilidad y pedido deshabilitado, sin destino incorrecto. |

Durante alta/baja en curso, pulsar varias veces, doble toque y Enter: confirmación bloqueada, una sola petición por operación activa, sin duplicados por esa repetición ni eliminación de otro producto. Comprobar que un `201/204` seguido de error al recargar no se presenta como escritura fallida ni invita a repetirla.

## V-09 — Catálogo público y gestión protegida (SC-009; H3.6–H3.9, EC-08)

**Condición**: sesión nueva sin autenticar, acceso correcto de prueba preparado y dos productos ficticios.

**Acciones**: consultar catálogo y abrir borrador sin cuenta. Abrir directamente gestión; intentar acceso incorrecto y revisar que no cambia el catálogo. Ingresar correctamente, agregar/eliminar un producto ficticio. Cerrar sesión y volver a gestión con historial y con dirección directa. Repetir con sesión vencida y tras reinicio preparado.

**Resultado esperado**: consulta/pedido siempre públicos. Sin sesión, con datos incorrectos, tras logout, expiración o reinicio no se permite alta/baja; se solicita acceso. Con acceso correcto sí se permiten las dos operaciones. Ningún error revela secretos ni diferencia cuentas existentes. El catálogo conserva sus productos después del reinicio.

El responsable complementa con pruebas HTTP directas, sin exigir estas herramientas a la persona que acepta:

- POST/DELETE sin cookie vigente y con cookie revocada: `401`, sin cambios.
- Mutación con cookie válida pero `Origin` ausente/distinto o cabecera personalizada ausente: `403`, sin cambios. También para login/logout y alta multipart.
- Sesión válida antes de subir que vence/se revoca durante decodificación: impedir commit.
- Sexto acceso incorrecto dentro de la ventana: `429`; posibilidad de reintentar pasado el plazo.
- Revisar que los recursos compilados, respuestas y registros no incluyen contraseña/hash/token ni valores personales. El token solo viaja en cookie protegida y nunca en JSON.

## Evidencias y criterio de aceptación

### Registro de Implement — fundamentos, 2026-10-26

- T001–T012: paquete ES modules instalado con Node 24.15.0/npm 11.12.1. Lockfile generado; instalación informó cero vulnerabilidades. React 19, Vite 8.3, Express 5 y dependencias del plan, sin bibliotecas adicionales de producto.
- `npm run build`: compilación correcta del esqueleto inicial.
- `node --test tests/integration/base.test.js`: primero 3 fallos esperados por comportamiento aún no implementado; después 3/3 conformes. Configuración inválida rechazada, SQLite STRICT reabierto sin pérdida, tres rutas HTML, archivos privados inaccesibles y mutaciones ajenas rechazadas con 403.
- `.specify/extensions.yml` leído con parser YAML: before/after implement solo registran Git commit opcional; sin hooks obligatorios. No se modifica la lista de calidad.
- Estos resultados no aprueban todavía ningún criterio funcional SC.

### US1 — consulta pública

- T013–T022: `node --test tests/integration/base.test.js tests/integration/catalogo.test.js tests/unit/precio.test.js`: 6/6 conformes. Listado de 20 por ID, nombres iguales conservados, respuesta sin BLOB, WebP público, 400/404/503 seguros y precio extremo exacto.
- `npx playwright test tests/e2e/catalogo.spec.js --project=chromium`: 6/6 conformes. Chromium en Windows; 20 tarjetas, HTML aparente mostrado como texto, teclado con enlace de salto, carga/error/reintento/vacío e imagen fallida.
- A 360, 768 y 1366 px con texto 200 % y movimiento reducido: sin desbordamiento horizontal; animación de tarjeta suprimida. Se corrigió la prueba de aumento de texto para usar la propiedad de estilo del documento, respetando CSP.
- `npm run build` correcto. Consulta H1 automatizada; SC-001 completo y apertura externa quedan para US2.

### US2 — enlaces de WhatsApp

- T023–T027 completos. Pruebas unitarias y de configuración 2/2; US1+US2 en Chromium 9/9. Tres navegaciones externas interceptadas: un enlace por activación, borrador exacto y regreso sin anuncio de envío. Número reservado ficticio solo en pruebas; ningún mensaje enviado.
- SC-001 local: 20 tarjetas y primer botón habilitado en cinco aperturas: **222, 107, 105, 103 y 111 ms**. Windows/Chromium, localhost sin limitación de red, mismo contexto/caché; 5/5 bajo 3 s. No extrapolar a un alojamiento o celular real.
- T028 permanece parcial: falta número comercial autorizado/acceso a WhatsApp para revisar tres borradores reales, sin enviar. Catálogo y gestión se siguen implementando; esa carencia externa no sustituye ni aprueba SC-002.

### US3 — acceso, alta y copia de imagen

- T029–T044: `node --test --test-concurrency=1 tests/unit/auth.test.js tests/unit/productos.test.js tests/integration/sesion.test.js tests/integration/alta-producto.test.js`: **12/12 conformes**. Primero 8 fallos de funcionalidad ausente en acceso/validación; después pruebas de HTTP y SQLite reales. CSRF, cookie HTTPS, caducidad y revocación durante decodificación, sexto intento, límites multipart, rollback, persistencia al reabrir, imagen corrupta/SVG/animada/excesiva y orientación/metadatos.
- Se corrigió el fixture animado: dos cuadros idénticos se optimizaban como estáticos; ahora se comprueba que contiene dos cuadros distintos antes de probar el rechazo.
- E2E acceso+alta Chromium: **5/5 conformes**. Acceso directo/incorrecto/correcto, logout e historial, verificación/cierre fallidos, validación y foco, previsualización, repetición bloqueada, archivo/campos conservados ante fallo, recarga fallida posterior al 201 y reingreso sin reenvío automático.
- Alta preparada automatizada: **350 ms**, una petición. Tras borrar el archivo original descartable, una sesión pública independiente muestra una sola tarjeta e imagen cargada desde el servidor.
- T045 conserva evidencia pendiente de uso sin ayuda y otro dispositivo físico; reinicio de proceso se complementará antes del informe final. La medición automatizada no acredita un ensayo con una persona.

### US4 — eliminación

- T046–T052: integración HTTP/SQLite **2/2 conformes**; E2E Chromium **3/3 conformes**. ID exacto aun con nombres iguales, 400/401/403/404/503, revocación/caducidad, imagen retirada junto con fila y otro producto conservado al reabrir.
- Diálogo identificado; Cancelar/Escape sin petición, confirmación repetida bloqueada y una sola eliminación. Medición automatizada: **615 ms**. Se corrigió el confinamiento explícito de Tab/Shift+Tab porque el diálogo nativo permitía desplazar el foco hacia el navegador. Foco restaurado al cancelar.
- Fallo sin retirada optimista, 404 diferenciado, 204 con recarga fallida mantiene éxito; último producto deja vacío. Otra pestaña y HTTP directo rechazan la cookie después de logout.
- T053/T054 se consolidarán con reinicio de proceso y recorrido transversal; los ensayos externos pendientes siguen sin aprobarse.

### Verificación transversal y ejecución reproducible

- T053/T055/T057/T059: reinicio real de `server/index.js` desde el navegador conserva el producto y la imagen, incluso sin original, mantiene ausente el eliminado y conserva el otro producto. La cookie anterior deja de autorizar tras el reinicio. Cancelar conserva ambos; eliminar el último muestra vacío.
- Seis recorridos completos con teclado: **360, 768 y 1366 px**, cada uno con texto **100 % y 200 %**, movimiento reducido, consulta/pedido interceptado/login/alta/diálogo/baja/logout. Sin desbordamiento horizontal; controles visibles de al menos 44 px. Selector de archivo preparado por automatización; esto no sustituye tacto físico ni el diálogo del sistema operativo.
- V-08: **7/7 casos conformes** en navegador: vacío, imagen perdida, datos inválidos, lectura fallida/reintento, guardado fallido/reintento, eliminación fallida/reintento y destino no disponible. El 201/204 seguido de lectura fallida mantiene el resultado de escritura; una operación nueva retira el anuncio anterior para evitar confusión.
- Prueba adicional de SQLite real mediante triggers que abortan: alta sin fila parcial y baja conserva fila/imagen, sin detalles internos. Cuerpo chunked >11 MiB rechazado con 413. JPEG válido de aproximadamente 6.5 MiB cuya copia WebP superaría 10 MiB rechazado con error de imagen.
- Configurador probado en terminal Windows interactiva con datos ficticios: usuario/contraseña sin eco, hash válido, acceso correcto, sin contraseña en claro y otra variable conservada. Se corrigió el BOM de Windows. No hay credenciales predeterminadas. La limpieza posterior de su carpeta de laboratorio quedó bloqueada por revisión automática, como se detalla abajo.
- `npm ci`: **correcto, 105 paquetes, cero vulnerabilidades reportadas**. Un primer intento limpio activó compilación nativa y falló por falta de toolset C++. `.npmrc` usa `ignore-scripts=true`; las dependencias fijadas funcionan con sus binarios incluidos. SQLite **3.53.4** y Sharp **0.35.5** cargados y comprobados después de reinstalar. El [manifest oficial de better-sqlite3](https://github.com/WiseLibs/better-sqlite3/blob/master/package.json) consultado declara prebuilds y `gypfile: false`; no se instaló un compilador ni se cambió la arquitectura.
- `npm run dev:api` + `npm run dev:web`: **correctos**. Vite en `http://localhost:5173`; GET por proxy 200; origen correcto conserva el cierre de gestión sin configurar (503) y origen incorrecto da 403. Procesos de verificación detenidos.
- `npm start`: **correcto**, probado con configuración temporal sin credenciales y base independiente. Las tres rutas HTML y `/api/catalogo` responden 200; `/.env` y `/server/config.js` dan 404. Configuración temporal retirada al terminar.
- `npm run build`: **correcto**; producción genera aproximadamente 244 kB JS (76 kB gzip) y 15 kB CSS (4 kB gzip). Vite tiene `envDir: false`: la configuración del servidor no cambia el modo de compilación del cliente. Recursos examinados sin hash/contraseña/token, rutas SQLite ni acceso ficticio de pruebas.
- `npm test`: **28/28 conformes** después de `npm ci`, cero omitidas. Última ronda de lógica/HTTP/SQLite: **19.72 s**, en paralelo con el navegador. No se fija un porcentaje de cobertura inexistente; la trazabilidad FR/SC está en `tasks.md`.
- `npm run test:e2e`: **37/37 conformes**, cero omitidas: 35 Chromium y un recorrido básico en Firefox y WebKit, **1.1 min** en la última ronda con compilación de producción. Informe y capturas en `playwright-report/index.html`. Se corrigieron las esperas de las pruebas de imagen válida/fallida: las imágenes diferidas se comprueban después de desplazarlas a la vista y esperar carga/error, en lugar de consultarlas antes de que el navegador las solicite. No se agregó un reintento que oculte fallos de pruebas.
- Última ronda SC-001: **212, 99, 99, 101 y 98 ms**; **5/5** bajo 3 s. Imágenes ficticias estáticas de 320×240 px y condiciones locales descritas. Alta técnica preparada **354 ms**; eliminación técnica **581 ms**. Son mediciones de automatización, no tiempos de participantes.
- El ejecutor `npm run test:e2e` retira la base temporal después de que Playwright detenga su servidor, también en Windows. Fixtures sin rutas ni interruptores públicos de simulación.
- Presentación revisada visualmente en capturas de catálogo, gestión y acceso: paleta/tipografía comunes, textos completos y foco visible. Contraste de pares reales ≥4.5:1; se oscureció el sello cálido de portada. Textos propios revisados en español y precios con soles/dos decimales; sin campos de cliente, pagos, pedidos almacenados ni funcionalidades fuera del alcance.
- El responsable respondió: **«Los ensayos presenciales se realizarán después»**. Celular físico, otro dispositivo con HTTPS y cinco participantes A–E quedan pendientes. No hay número comercial autorizado/acceso real a WhatsApp proporcionado en esta ejecución; no se enviaron mensajes ni se aprobaron esos borradores.

Versiones fijadas: Node **24.15.0**, npm **11.12.1**, React/React DOM **19.3.1**, Vite **8.3.5**, plugin React **6.1.2**, Express **5.3.0**, better-sqlite3 **13.0.3**, Multer **2.5.0**, Sharp **0.35.5**, libphonenumber-js **1.13.15** y Playwright **1.64.1**. Navegadores del paquete verificado: Chromium **156.0.8078.4**, Firefox **157.0** y WebKit **27.2**. Sistema: Windows x64. Las revisiones de diseño y contratos se mantienen; no se publicaron cambios ni se cerró la feature.

Revisión posterior de `.specify/extensions.yml` con parser YAML: `after_implement` contiene únicamente `git / speckit.git.commit`, habilitado, opcional y sin condición. Se informó su disponibilidad y se omitió; no hay hooks obligatorios. Constitución, alcance y checklist comprobados; 54 tareas completas y seis parciales documentadas. Sin aprobación global de SC, commit, push, merge o cierre de feature.

**Limpieza operativa pendiente**: la última batería retiró su SQLite temporal y `.playwright-entorno.json` correctamente. Los procesos de desarrollo/compilación se detuvieron y el `.env` temporal de la raíz se retiró. La revisión automática rechazó retirar 19 carpetas antiguas de laboratorio en `%TEMP%`, tanto mediante rutas verificadas como con nombres literales; solo devolvió `blocked by policy`, sin motivo adicional. Incluyen `jm-store-web-*`, dos `jm-store-test-*` y las carpetas de verificación de acceso/desarrollo/compilación, con datos ficticios. No se intentó eludir el bloqueo. No son el catálogo de uso real; T060 mantiene esta limpieza pendiente junto con la aceptación externa.

Resultados observados con datos ficticios. «Conforme técnico» acredita la ejecución descrita, sin inventar participación humana o acceso externo. La aceptación global permanece pendiente.

| Escenario | Condiciones, dispositivo y navegador | Acción y medición | Resultado observado / evidencia | Estado actual |
| --- | --- | --- | --- | --- |
| V-01 / SC-001 | Windows/Chromium, localhost, misma caché, sin limitar red | 20 tarjetas; ronda final: 212, 99, 99, 101, 98 ms | 5/5 bajo 3 s con primer enlace utilizable; informe Playwright | Conforme local; no extrapolar a internet |
| V-02 / SC-002 | Tres productos y destino reservado ficticio; navegación interceptada | Una activación por producto, comparar mensaje y regresar | Nombre/descripción/precio y caracteres exactos; sin envío | Parcial: falta WhatsApp real autorizado |
| V-03 / SC-003 | Chromium, copia en SQLite temporal y contexto público nuevo | Alta automatizada, borrar original, recargar y reiniciar proceso | Una tarjeta, misma imagen/datos; medición técnica final de alta 354 ms | Parcial: persona sin ayuda y otro dispositivo aplazados |
| V-04 / SC-004 | Chromium, dos productos, base mantenida al reiniciar | Cancelar y confirmar uno; probar último producto | Cancelar conserva dos; eliminación técnica final 581 ms, persistente; otro intacto; último deja vacío | Conforme técnico en app |
| V-05 / SC-005 | Chromium 360/768/1366 px; texto 100/200 % | Recorrido completo con teclado y movimiento reducido | Sin desbordamiento; controles/foco/diálogo utilizables | Parcial: tacto en celular físico aplazado |
| V-06 / SC-006 | Vistas y estados de pruebas, revisión visual y recursos compilados | Revisar idioma, soles, datos y límites | Textos propios españoles; soles/dos decimales; sin pagos, datos de cliente o secretos publicados | Conforme técnico y visual |
| V-07 / SC-007 | Capturas y preferencia de movimiento reducido | Comparar presentación y repetir acciones | Estilos coherentes; acciones completas sin movimiento no esencial | Parcial: cinco participantes aplazados; no hay tiempos A–E |
| V-08 / SC-008 | Chromium y fallos aislados de lectura/escritura/imagen | Siete condiciones, reintentos y bloqueos | 7/7 conformes; sin falso éxito o pérdida de otros productos | Conforme técnico en app |
| V-09 / SC-009 | Chromium/HTTP directo y reinicio real | Acceso incorrecto/correcto, alta/baja, logout/historial/caducidad | Gestión cerrada sin sesión y tras revocar/reiniciar; catálogo público | Conforme gestión; borrador real pendiente junto a V-02 |

Registrar además resultado real de `npm test`, `npm run test:e2e` y `npm run build`, versiones instaladas y comandos definitivos. Ocultar contraseñas/cookies y no adjuntar capturas con datos personales. Una aceptación exige resultados observables de los nueve criterios y resolución de fallos que contradigan la spec o Constitution; la revisión técnica los complementa.
