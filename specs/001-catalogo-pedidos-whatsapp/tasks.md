---
description: "Tareas de implementación de JM-STORE según la especificación y el plan aprobados"
---

# Tasks: JM-STORE — Catálogo y pedidos por WhatsApp

**Fecha**: 2026-10-26  
**Funcionalidad**: `001-catalogo-pedidos-whatsapp`  
**Entrada**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [HTTP](contracts/api.openapi.yaml), [interfaz](contracts/interfaz.md), [WhatsApp](contracts/whatsapp.md) y [quickstart.md](quickstart.md).  
**Gobernanza**: [AGENTS.md](../../AGENTS.md) y [Constitution 1.0.0](../../.specify/memory/constitution.md).

**Estado**: Implementación funcional local realizada. 54/60 tareas completas; T028, T045, T054, T056, T058 y T060 permanecen parciales por aceptación externa o presencial pendiente. El responsable aplazó expresamente los ensayos presenciales. No se declara aceptación global ni cierre de la feature. La evidencia reproducible se registra en quickstart.md.

**Organización**: preparación → fundamentos → US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → verificación transversal. Inicio/cierre de sesión e imágenes pertenecen a US3 conforme a H3.6–H3.10; US4 reutiliza su autorización.

**Pruebas**: se incluyen conforme a la spec, Constitution, solicitud del usuario y R-09 del plan: `node:test`, Playwright y aceptación manual. Escribir los casos antes del comportamiento que cubren, comprobar que detectan la funcionalidad ausente y ejecutarlos después de implementarla. Un entorno roto no constituye un fallo funcional esperado.

## Formato y rutas

- Formato: `- [ ] Tnnn [P opcional] [USn cuando corresponda] descripción con ruta`.
- `[P]` permite trabajar en paralelo sobre archivos diferentes cuando se cumplan sus dependencias; no elimina las puertas de fase.
- `Dep.` enumera prerrequisitos explícitos y acumulativos, siempre anteriores. Sin marca `[P]`, mantener la secuencia de integración indicada.
- Todas las rutas son relativas a `C:/JM-STORE`. Un solo paquete npm con `src/`, `server/`, `scripts/` y `tests/`, según Plan.
- Las actualizaciones operativas de documentos y las evidencias siguientes son trabajo futuro de Implement. Durante Tasks solo se crea este archivo.
- Registrar evidencias en `specs/001-catalogo-pedidos-whatsapp/quickstart.md` con condición inicial, acción, resultado real, dispositivo/navegador y estado; datos ficticios y sin secretos ni información personal.

## Fase 1: Preparación del proyecto

**Objetivo**: inicializar las herramientas y estructura aprobadas. Actualmente no existen aplicación ni comandos ejecutables del producto.

- [X] T001 Inicializar `package.json` y `package-lock.json` como un paquete JavaScript ES modules con Node.js 24 LTS, React 19, Vite 8.3, plugin oficial React, Express 5, better-sqlite3 13, Multer 2, Sharp 0.35, libphonenumber-js y Playwright; verificar parches compatibles al instalar y fijarlos en el lockfile. Definir `dev:api`, `dev:web`, `build`, `start` y `configurar-acceso` según quickstart, cargando configuración del servidor mediante soporte nativo de Node. Sin ORM, router, biblioteca visual ni gestor global de estado. Dep.: ninguna.
- [X] T002 [P] Crear `index.html`, `vite.config.js`, `src/main.jsx` y `src/App.jsx` con `es-PE`, identidad JM-STORE y composición mínima; preparar selección por ruta para `/`, `/encargado/ingresar` y `/encargado` sin router adicional. Vite en 5173 y proxy `/api/` a `http://127.0.0.1:3001` conservando Origin, sin adelantar pantallas funcionales. Dep.: T001.
- [X] T003 [P] Preparar `.env.example` y `.gitignore` con variables documentadas y valores ficticios/no operativos; excluir `.env` y variantes con secretos, SQLite/diarios, dependencias, compilación e informes de pruebas. Sin credenciales ni número comercial real en ejemplos o `VITE_*`; base fuera del código y `dist/`. Dep.: T001.
- [X] T004 [P] Preparar `tests/fixtures/entorno.mjs`, `tests/fixtures/productos.mjs`, `tests/fixtures/fallos.mjs` y `tests/fixtures/imagenes.mjs`: SQLite temporal real, arranque/parada aislados y fallos controlados de lectura/escritura/imagen. Generar imágenes ficticias válidas/corruptas, 20 productos, nombres repetidos con distinto ID y textos largos/especiales, incluida «Taza & café + plato» a `S/ 49.90`. Sin datos reales ni endpoints/interruptores públicos de simulación. Dep.: T001.
- [X] T005 Configurar `playwright.config.js` y scripts `test`/`test:e2e` en `package.json` para `node:test` y servidor de navegador con base temporal; preparar Chromium para batería completa y Firefox/WebKit para recorridos básicos. Separar puertos/configuración del catálogo real y limpiar recursos de pruebas. Dep.: T002, T003, T004.

**Punto de control**: herramientas, esqueleto y fixtures preparados; todavía no hay historias entregadas.

## Fase 2: Fundamentos que bloquean todas las historias

**Objetivo**: configuración segura, esquema persistente, servidor del mismo origen y bases de interfaz. Ninguna historia empieza antes de T012.

- [X] T006 [P] Escribir `tests/integration/base.test.js` para configuración inválida, esquema estricto/reapertura sin pérdida, errores españoles sin detalles internos, rechazo de origen/cabecera y recarga de las tres rutas web. Comprobar que SQLite/configuración no se sirven como archivos estáticos. Usar fixtures, sin pruebas que solo copien la estructura del código. Dep.: T005.
- [X] T007 Implementar `server/config.js` para `NODE_ENV`, `APP_ORIGIN`, `PORT`, `SQLITE_PATH` y configuración externa del encargado/WhatsApp, sin publicarla ni registrarla. Exigir origen exacto sin ruta, HTTPS en producción y SQLite absoluto persistente fuera del código/dist; credenciales ausentes mantienen gestión cerrada y T034 completa validación scrypt. WhatsApp respeta «número canónico con `+`, prefijo internacional y dígitos, hasta 15» y «Validar plan numérico con metadatos `max`; no verificar cuenta activa». Producir `{ disponible: true, destino: <digitos> }` o `{ disponible: false, destino: null }` sin divulgar valor defectuoso ni detener catálogo por ese destino. Dep.: T006.
- [X] T008 [P] Crear en `server/db.js` conexión y única tabla funcional `productos` con SQL preparado, tipos STRICT (`id TEXT PRIMARY KEY`, `nombre TEXT`, `descripcion TEXT`, `precio_centimos INTEGER`, `imagen BLOB`, `imagen_mime TEXT`), campos no nulos, `journal_mode=DELETE`, `synchronous=FULL` y espera de bloqueo de 5 s; no recrear datos al arrancar. Reglas literales: `id`, «UUID generado por servidor; inmutable. Identifica incluso nombres repetidos.»; `nombre`, «Texto distinto de espacios; quitar espacios exteriores, conservar caracteres internos. ≤4096 bytes UTF-8.»; `descripcion`, «Texto distinto de espacios; quitar espacios exteriores, conservar tildes, signos y saltos internos. ≤32768 bytes UTF-8.»; `precio_centimos`, «Mayor que cero y ≤9007199254740991, límite de entero seguro de JavaScript. Moneda fija PEN; no hay campo de moneda editable.»; `imagen`, «Copia WebP decodificada/normalizada por la aplicación; no vacía y ≤10485760 bytes. No es enlace ni ruta al dispositivo.»; `imagen_mime`, «Valor `image/webp` correspondiente a la copia, definido por servidor.». Aplicar restricciones SQL representables; normalización/decodificación se completa en US3. Sin unicidad del nombre ni tablas de usuarios/pedidos. Dep.: T006.
- [X] T009 Implementar `server/app.js` y `server/index.js` como un proceso Express, factoría utilizable por pruebas, estáticos de `dist/` y tres rutas web recargables; no convertir errores `/api/` en HTML. Centralizar `codigo`/`mensaje`/`campos` según OpenAPI, límites por ruta y CSRF en toda mutación con Origin exacto y `X-JM-STORE-Request: 1`; rechazar Origin ausente/null/distinto y sin CORS externo. `no-store` en catálogo/imagen/sesión; no registrar cuerpos, credenciales, cookies, borradores, imágenes ni datos personales. Confiar en proxy solo si el entorno identifica el proxy concreto. Dep.: T007, T008.
- [X] T010 [P] Crear `src/lib/api.js` con fetch/cookies del mismo origen, cabecera de mutación y manejo seguro de JSON, `204`, errores de campo, `401` y red. El navegador establece Origin y boundary multipart; sin reintentos automáticos de escrituras ni almacenamiento del navegador para datos/sesiones. Dep.: T005.
- [X] T011 [P] Crear `src/styles/tokens.css` y `src/styles/base.css` e importarlos en `src/main.jsx`: marfil, texto oscuro, verde profundo/acento cálido, tipografía de sistema y jerarquía/espaciado comunes; contraste normal ≥4.5:1. Foco visible, objetivos táctiles ≥44 px, texto al 200 %, palabras largas y transiciones 150–200 ms; `prefers-reduced-motion` elimina movimiento no esencial. Sin información dependiente solo de color/hover. Dep.: T005.
- [X] T012 Ejecutar `tests/integration/base.test.js` y arranque/compilación disponibles, corregir fundamentos y registrar resultados/comandos reales en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`, sin aprobar todavía SC funcionales. Revisar conformidad con Constitution y ausencia de dependencias ajenas al plan antes de abrir historias. Dep.: T006, T007, T008, T009, T010, T011.

**Punto de control obligatorio**: fundamentos verificados; acceso incompleto siempre cerrado.

## Fase 3: US1 — Consultar el catálogo desde cualquier dispositivo (P1)

**Objetivo**: consulta pública completa, legible y adaptable, estados de carga/vacío/error y reemplazo de imagen. FR-001–FR-004, FR-009 y FR-014–FR-017.

**Prueba independiente**: con tres productos cargados por fixtures, comparar tarjetas a 360/768/1366 px; repetir con textos largos al 200 %, imagen fallida, vacío y lectura fallida/reintento. El control de pedido se compone visualmente aquí; US2 conecta la navegación externa. La consulta no depende de acceso a WhatsApp ni del alta de US3.

### Pruebas de US1

- [X] T013 [P] [US1] Escribir `tests/integration/catalogo.test.js` para GET `/api/catalogo` y GET `/api/productos/{id}/imagen`: lista completa ordenada por ID, vacío `200`, nombres repetidos, proyección sin BLOB, WhatsApp válido/deshabilitado, `imagenUrl` relativa, WebP con `nosniff`/`no-store`, ID mal formado `400`, ausente `404` y lectura fallida `503` segura. Ambas rutas sin sesión. Dep.: T012.
- [X] T014 [P] [US1] Escribir `tests/unit/precio.test.js` para formatear 1, 4990 y 9007199254740991 céntimos: prefijo exacto `S/ `, punto, dos decimales, sin agrupadores y precisión en todo el rango. Dep.: T012.
- [X] T015 [P] [US1] Escribir `tests/e2e/catalogo.spec.js` para H1.1–H1.8: 20 tarjetas sin duplicados, HTML aparente como texto, contenido extenso completo, estados/reintento, imagen fallida, teclado/foco, anchos, texto al 200 % y movimiento reducido. Catálogo sin alta/eliminación; el enlace externo se verifica en US2. Dep.: T012.

### Implementación de US1

- [X] T016 [US1] Añadir a `server/db.js` listado preparado por `id` sin seleccionar BLOB y lectura de copia por ID, devolviendo solo campos públicos y `imagenUrl` del mismo origen. Distinguir vacío, ID ausente y fallo de lectura. Dep.: T013.
- [X] T017 [US1] Crear `server/routes/catalogo.js` y conectarlo en `server/app.js` para ambos GET públicos según OpenAPI; entregar disponibilidad validada e imagen con MIME/cabeceras del servidor, sin rutas locales, sesión ni paginación/filtros añadidos. Dep.: T016.
- [X] T018 [P] [US1] Implementar `src/lib/precio.js` respetando «Formar parte entera y dos dígitos de céntimos desde el entero; no depender de convertir a decimal binario y aplicar `toFixed`, que puede perder precisión en el extremo del rango». Compartir después con WhatsApp, sin biblioteca monetaria. Dep.: T014.
- [X] T019 [P] [US1] Crear `src/components/TarjetaProducto.jsx` y `src/styles/productos.css` con clave por ID, imagen/espacio reservado/`object-fit: contain`, alt identificable y «Imagen no disponible» sin bucle de reintentos. Mostrar textos completos como JSX y precio común; prop `accionPedido` para componer el control accesible «Pedir por WhatsApp» que conecta T027. Sin truncar ni interpretar HTML. Dep.: T015, T018.
- [X] T020 [P] [US1] Crear `src/components/EstadoCatalogo.jsx` con «Cargando productos…», «Por el momento no hay productos disponibles», «No pudimos cargar los productos» y «Reintentar»; estados anunciables y no dependientes del color. Sin tarjetas ficticias ni confundir vacío/error. Dep.: T015.
- [X] T021 [US1] Implementar `src/pages/Catalogo.jsx` y `src/styles/catalogo.css` y conectarlos en `src/App.jsx`: consultar sin cuenta, todas las tarjetas, reintento, Grid sin desbordamiento y prioridad del primer grupo de imágenes. Preparar composición del pedido de US2 y separar gestión del cliente. Dep.: T017, T019, T020.
- [X] T022 [US1] Ejecutar pruebas de US1 y comprobar H1.1–H1.8 en su parte de consulta; registrar en `specs/001-catalogo-pedidos-whatsapp/quickstart.md` las 20 tarjetas, tres anchos, 200 %, teclado y estados/fallos; corregir defectos. No aprobar apertura de pedido ni SC-001 con botón operativo: esos resultados se completan en T028. Dep.: T013, T014, T015, T021.

**Punto de control**: incremento de consulta verificable con fixtures sin US3/US4; acción comercial pendiente de la siguiente historia P1.

## Fase 4: US2 — Solicitar un producto por WhatsApp (P1)

**Objetivo**: una activación abre el borrador del producto hacia el destino común, sin envío automático ni almacenamiento de pedidos. FR-004–FR-008, FR-017 y FR-018.

**Prueba independiente**: con tres productos preparados, incluido «Taza & café + plato» a `S/ 49.90`, abrir tres borradores sin enviar; comparar destinatario y campos, regresar sin anuncio de envío. Destino ausente/inválido deshabilita pedido y conserva catálogo.

### Pruebas de US2

- [X] T023 [P] [US2] Escribir `tests/unit/whatsapp.test.js` y `tests/integration/whatsapp-config.test.js` para tres productos/nombres repetidos: mensaje exacto, tildes, `&`, `+`, saltos, precio extremo y codificación UTF-8 una sola vez. Probar número canónico, máximo 15 dígitos/primero no cero/validez con metadatos max y configuración ausente/incorrecta que produce destino null sin publicar cadena inválida. Dep.: T022.
- [X] T024 [P] [US2] Escribir `tests/e2e/whatsapp.spec.js` para enlace directo con una activación, explicación accesible/botón sin enlace ante destino ausente/inválido, tres tarjetas sin mezclar datos y regreso sin anuncio de envío. Interceptar navegación externa; comprobar ausencia de endpoint de pedidos/datos de cliente y tarjeta antigua tras eliminación como borrador sin garantía de disponibilidad. Dep.: T022.

### Implementación de US2

- [X] T025 [P] [US2] Crear `src/lib/whatsapp.js` usando precio común y producto visible: «Hola, JM-STORE. Me interesa este producto: [nombre]. Descripción: [descripción]. Precio: [precio]. ¿Podrían confirmarme su disponibilidad?». Sustituir solo esos campos y construir `https://wa.me/<destino>?text=<mensaje-codificado>` codificando todo una vez; sin consulta de red ni guardar borrador. Dep.: T023.
- [X] T026 [US2] Crear `src/components/BotonWhatsApp.jsx`: enlace directo «Pedir por WhatsApp» sin popup/confirmación intermedia; no disponible implica control deshabilitado sin href y «Los pedidos por WhatsApp no están disponibles por el momento». Sin destinatario inventado ni anuncio de envío/venta/reserva/pago. Dep.: T024, T025.
- [X] T027 [US2] Conectar `BotonWhatsApp` como `accionPedido` en `src/pages/Catalogo.jsx` y `src/components/TarjetaProducto.jsx` con el objeto concreto/configuración pública de esa consulta; mantener pedido ante imagen fallida. Completar acción visual de US1 sin cuenta ni petición previa a navegar. Dep.: T026.
- [ ] T028 [US2] Ejecutar pruebas US1/US2 y V-01/V-02 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: tres borradores reales sin envío, destino/campos, regreso y servicio externo inaccesible; variantes de configuración. Con 20 productos y botón operativo, registrar cinco aperturas: primer grupo utilizable ≤3 s en al menos 4 de 5 bajo iguales condiciones de red/caché. Si falta acceso externo, dejar su evidencia pendiente. Dep.: T023, T024, T027.

**Punto de control**: MVP comercial público US1 + US2 con datos de laboratorio, independiente de gestión y sin pedidos persistidos.

## Fase 5: US3 — Agregar un producto y conservarlo (P2)

**Objetivo**: acceso/cierre del único encargado y alta de cuatro datos con copia de imagen persistente y autorización de servidor. FR-009–FR-011, FR-013–FR-017 y FR-019.

**Prueba independiente**: sin sesión/acceso incorrecto no se modifica catálogo; acceso correcto permite alta preparada ≤2 min, una tarjeta y mismos datos/imagen al eliminar original, recargar, usar otra sesión/otro dispositivo y reiniciar. Logout/historial exige ingresar otra vez. US4 completa la eliminación de SC-009.

### Pruebas de US3

- [X] T029 [P] [US3] Escribir `tests/unit/auth.test.js` y `tests/integration/sesion.test.js` para GET/POST/DELETE `/api/sesion`: configuración externa/scrypt mal formado, credenciales incorrectas sin enumeración, cuerpo ≤4 KiB, sexto fallo en 15 min `429` con Retry-After y reintento tras plazo. Cookie por entorno, token nunca en JSON, ocho horas absolutas con reloj controlado, token nuevo, logout revocable/idempotente, reinicio y CSRF login/logout. Sin secretos reales. Dep.: T028.
- [X] T030 [P] [US3] Escribir `tests/integration/alta-producto.test.js` para POST `/api/productos`: `201` solo después de commit datos+BLOB; campos/partes repetidos o extra rechazados y `400/401/403/413/422/503` según contrato. Verificar sesión antes de procesar multipart, CSRF, expiración/revocación durante decodificación, rollback de escritura fallida, ninguna alta parcial y persistencia al reabrir SQLite. Dep.: T028.
- [X] T031 [P] [US3] Escribir `tests/unit/productos.test.js`: vacíos/espacios, límites UTF-8 4096/32768 y excesos, caracteres internos, precio punto/coma exacto, cero/negativos/exponente/NaN/tres decimales/fuera de rango; JPEG/PNG/WebP válidos, MIME fingido, SVG, animación, corrupción, >10 MiB, >25000000 píxeles y copia excesiva. Comprobar orientación/metadatos y ausencia de recorte/redimensionamiento. Dep.: T028.
- [X] T032 [P] [US3] Escribir `tests/e2e/acceso.spec.js` y `tests/e2e/alta-producto.spec.js` para H3.1–H3.10: acceso directo/incorrecto/correcto, logout/historial/foco, validación/previsualización, doble toque/Enter bloqueados, conservar campos+archivo ante fallo y sesión vencida sin reenvío automático. Diferenciar `201` seguido de recarga fallida; comprobar copia en otro contexto tras retirar archivo original ficticio. Dep.: T028.

### Implementación de US3

- [X] T033 [P] [US3] Crear `scripts/configurar-acceso.mjs` local/interactivo, sin registro público: usuario/contraseña sin eco ni argumentos, salt aleatorio ≥16 bytes y scrypt N=131072/r=8/p=1/derivado de 64 bytes; escribir solo usuario/hash en `.env` ignorado, preservando otras variables. Respetar «Registro `scrypt$131072$8$1$<saltBase64>$<derivadoBase64>`, con salt de 16 bytes o más y derivado de 64 bytes. El servidor valida algoritmo, parámetros y longitudes antes de aceptar configuración. Solo servidor, excluido de Git.»; no imprimir secretos ni guardar contraseña en claro. Dep.: T029.
- [X] T034 [US3] Implementar `server/auth.js` y completar `server/config.js`: `ADMIN_USERNAME` respeta «Identificador del único encargado; no se publica como parte del catálogo ni se registra al fallar.»; validar algoritmo/parámetros/longitudes del hash antes de habilitar gestión, scrypt asíncrono/memoria suficiente y comparación temporalmente constante. `tokenHash`: «Clave de `Map`; derivada de 32 bytes aleatorios. El token original solo viaja en cookie protegida.»; `expiresAt`: «Ocho horas desde emisión; validar en cada operación, no depender del reloj del navegador.». Token nuevo, revocación/expiración/limpieza y contadores temporales cinco fallos/15 min sin registrar red; sin JWT, localStorage ni tabla de usuarios. Dep.: T029, T033.
- [X] T035 [US3] Crear `server/routes/sesion.js` y conectarlo en `server/app.js`: GET solo autenticado, POST JSON ≤4 KiB y cookie `__Host-jm_session` HttpOnly/Secure/SameSite=Strict/Path=/ sin Domain/Max-Age≤28800 en producción; HTTP local usa `jm_session` sin Secure. DELETE revoca antes de `204` y vence cookie aun sin sesión; CSRF, no-store y respuestas OpenAPI sin token en JSON. Dep.: T034.
- [X] T036 [P] [US3] Añadir a `server/db.js` alta con UUID de servidor e inserción preparada atómica de los seis campos; nombres iguales permitidos, éxito posterior al commit y rollback ante fallo. Sin transacción abierta durante decodificación asíncrona ni persistir blob URL local. Dep.: T030.
- [X] T037 [P] [US3] Implementar en `server/productos.js` validación de textos con reglas literales T008, espacios exteriores/bytes UTF-8 y rechazo de exceso sin recorte. `precio` respeta «cadena decimal con dígitos, opcionalmente punto o coma y una o dos cifras decimales; sin separadores de miles, signo, símbolo monetario ni exponente. Quitar espacios exteriores.». Convertir por partes a céntimos enteros y comprobar 1..9007199254740991 antes de insertar, sin redondear `49.999`; errores españoles por campo. Dep.: T031.
- [X] T038 [US3] Añadir en `server/productos.js` el único archivo: «Un solo archivo del dispositivo; JPEG, PNG o WebP estático. Original ≤10 MiB y ≤25000000 píxeles.». Sharp decodifica completamente con límite de píxeles, rechaza advertencias de corrupción/animación y no confía en MIME/extensión; orientar, retirar metadatos y generar WebP sin recortar/redimensionar, comprobando copia no vacía ≤10485760 bytes. Si falla, error imagen y ningún alta. Dep.: T037.
- [X] T039 [US3] Crear `server/routes/productos.js` y conectarlo en `server/app.js` para POST autenticado antes de Multer: memoria limitada, imagen + tres campos de texto/cuatro partes, cuerpo 11 MiB y límites específicos 10 MiB/4096/32768 bytes; rechazar partes/campos repetidos o extra. Revalidar sesión tras decodificación inmediatamente antes de commit; `201` con Producto público solo después, o `400/401/403/413/422/503` seguros. Dep.: T030, T035, T036, T038.
- [X] T040 [P] [US3] Crear `src/pages/IniciarSesion.jsx` y `src/styles/acceso.css`: usuario/contraseña, etiquetas, contraseña oculta, mensajes españoles exactos del contrato, errores/foco, bloqueo mientras verifica y espera/reintento `429`. Conectar ruta en `src/App.jsx`; éxito lleva a gestión, sin registro/recuperación/datos de cliente. Dep.: T032, T035.
- [X] T041 [US3] Crear `src/pages/Gestion.jsx` y `src/styles/gestion.css` y conectar ruta en `src/App.jsx`: verificar sesión antes de controles y al entrar/recuperar foco/pageshow, ocultarlos mientras revalida y fallar cerrado con reintento. Listado/cierre; limpiar estado y navegar solo tras revocación confirmada, sin afirmar cierre ante error de red. Borrador solo en memoria/oculto sin sesión, sin persistir ni reenviar automáticamente. Dep.: T040.
- [X] T042 [P] [US3] Crear `src/components/FormularioProducto.jsx` y `src/styles/formulario.css`: solo Nombre, Descripción, Imagen, Precio (S/), ayudas de todos los límites, validaciones españolas asociadas, teclado decimal y previsualización utilizable. Reglas T008/T037; bloquear Guardar/Enter/doble toque desde inicio y conservar campos+archivo ante fallo. Liberar blob URL al descartar/reemplazar, sin enlace externo. Dep.: T032, T038.
- [X] T043 [US3] Integrar formulario/API en `src/pages/Gestion.jsx`: multipart una vez, errores por campo/sesión, «Producto agregado correctamente»/limpieza solo tras `201` y nueva consulta del listado. Recarga posterior fallida conserva éxito y explica actualización fallida sin invitar a guardar otra vez; fallo previo al commit conserva borrador para reintentar. Dep.: T039, T041, T042.
- [X] T044 [US3] Ejecutar `tests/unit/auth.test.js`, `tests/unit/productos.test.js`, `tests/integration/sesion.test.js`, `tests/integration/alta-producto.test.js` y ambos E2E de US3; corregir defectos y registrar en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`. Confirmar HTTP directo sin sesión/CSRF, revocación durante imagen, límites, rollback y reapertura de SQLite. Dep.: T029, T030, T031, T032, T043.
- [ ] T045 [US3] Ejecutar V-03 y acceso/alta de V-09 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md` desde la app: alta preparada ≤2 min, una tarjeta; eliminar original descartable y comprobar imagen/textos/precio en recarga, otra sesión pública, otro dispositivo y reinicio con misma base. Registrar login inválido, logout/historial y expiración; no aprobar eliminación de SC-009 antes de US4. Dep.: T044.

**Punto de control**: alta/imagen persistentes y acceso revocable. Reinicio puede terminar sesiones; conserva productos.

## Fase 6: US4 — Eliminar un producto del catálogo (P2)

**Objetivo**: confirmación identificada, cancelación sin cambios y eliminación de producto/imagen exactos con persistencia. FR-011–FR-019 aplicables a eliminación.

**Prueba independiente**: con dos productos y sesión válida, cancelar conserva ambos; confirmar uno ≤30 s, recargar/reiniciar y comprobar que el otro mantiene sus datos. Fallo de escritura conserva producto sin éxito falso; eliminar último muestra vacío.

### Pruebas de US4

- [X] T046 [P] [US4] Escribir `tests/integration/eliminacion-producto.test.js` para DELETE `/api/productos/{id}`: `204` tras commit, fila+BLOB ausentes al reabrir, otro producto intacto aun con igual nombre, `400` UUID inválido, `404` ID ausente, `401` sin sesión/vencida/revocada, `403` CSRF y `503` rollback. Sin cuerpo ni modificación de otras filas. Dep.: T045.
- [X] T047 [P] [US4] Escribir `tests/e2e/eliminacion-producto.spec.js` para H4.1–H4.5: diálogo identificado, Cancelar/Escape sin DELETE, foco contenido/restaurado, repeticiones bloqueadas, fallo sin éxito/retirada optimista, último producto vacío, `404` diferenciado y `204` seguido de recarga fallida conservando resultado confirmado. Cubrir pestaña antigua y mutación rechazada tras logout. Dep.: T045.

### Implementación de US4

- [X] T048 [US4] Añadir en `server/db.js` eliminación preparada por ID exacto, atómica junto con BLOB, comprobando fila afectada/commit; ID ausente no afecta a otro y fallo conserva datos. Sin borrado lógico/historial/deduplicación por nombre. Dep.: T046.
- [X] T049 [US4] Añadir DELETE autenticado en `server/routes/productos.js` con CSRF, UUID y sesión vigente inmediatamente antes de escribir; `204` sin cuerpo solo tras commit o errores `400/401/403/404/503` según OpenAPI. Reutilizar autorización US3. Dep.: T048.
- [X] T050 [P] [US4] Crear `src/components/ConfirmarEliminacion.jsx` y `src/styles/dialogo.css`: «¿Eliminar “[nombre]”?», Cancelar/Eliminar, foco inicial en cancelación, confinamiento/restauración y Escape antes de confirmar. Fijar ID durante operación, «Eliminando…» y bloqueo de repeticiones sin cambiar producto. Dep.: T047.
- [X] T051 [US4] Integrar acción/diálogo en `src/pages/Gestion.jsx`: cancelar no envía petición; confirmar no retira antes de `204`; éxito actualiza listado, fallo mantiene datos/reintento, `404` indica «El producto ya no está disponible» sin atribuir eliminación propia. Distinguir recarga fallida tras éxito, mostrar vacío al eliminar último y tratar `401` como en alta. Dep.: T049, T050.
- [X] T052 [US4] Ejecutar `tests/integration/eliminacion-producto.test.js` y `tests/e2e/eliminacion-producto.spec.js`, verificar HTTP directo/persistencia al reabrir, corregir fallos y registrar en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`. Confirmar repeticiones, rollback, otro producto intacto y recarga fallida tras `204` sin falso fallo de eliminación. Dep.: T046, T047, T051.
- [X] T053 [US4] Ejecutar V-04 desde la app y registrar en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: cancelar conserva ambos, confirmar ≤30 s retira solo elegido; tras recarga/reinicio sigue ausente y el otro conserva imagen/textos/precio. Repetir último producto y fallo de escritura preparado. Dep.: T052.
- [ ] T054 [US4] Completar V-09/SC-009 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: catálogo/borrador públicos, gestión directa sin sesión, acceso incorrecto, correcto con alta/baja, logout/historial/dirección directa, expiración/reinicio. Registrar resultados visibles y complemento HTTP directo sin exigir terminal a quien acepta. Dep.: T053.

**Punto de control**: cuatro historias verificables; nuevas consultas reflejan eliminación sin sincronización en tiempo real ni modificar conversaciones externas.

## Fase 7: Pulido y verificación transversal

**Objetivo**: aceptar FR-001–FR-019 y SC-001–SC-009 sin nuevas funciones. Tras T054; recursos externos/participantes ausentes dejan evidencia pendiente, nunca inventada.

- [X] T055 Escribir `tests/e2e/accesibilidad.spec.js` y `tests/e2e/limites.spec.js` para consulta/pedido/login/logout/alta/baja a 360/768/1366 px, teclado, texto 200 %, movimiento reducido y errores. Reutilizar fixtures para siete condiciones V-08, doble activación y recarga fallida tras `201/204`; revisar mensajes/moneda y ausencia de pagos/datos de cliente. Sin capturas que solo repliquen componentes. Dep.: T054.
- [ ] T056 Ejecutar `tests/e2e/accesibilidad.spec.js` y V-05/SC-005 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: tres anchos, todas las acciones con teclado/200 % y tacto en celular real. Verificar foco/diálogo, etiquetas, texto completo, contraste/44 px y sin superposición/desplazamiento horizontal; corregir archivos de `src/styles/` y componentes afectados, identificándolos en evidencia. Dep.: T055.
- [X] T057 Ejecutar `npm run build` y V-06/SC-006 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: 100 % de textos propios españoles/precios `S/ ` con dos decimales en todas las vistas/estados, sin pagos/datos de cliente. Revisar recursos generados desde `src/` y respuestas/registros de `server/app.js`: sin secretos/datos sensibles; cookie HTTPS de producción y ningún hash/contraseña/token en JSON o recursos web. Corregir archivos responsables y registrar evidencia sin copiar secretos. Dep.: T056.
- [ ] T058 Ejecutar V-07/SC-007 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: cinco personas nuevas A–E, al menos cuatro identifican nombre/precio/pedido ≤30 s. Comparar paleta/tipografía/jerarquía y repetir acciones con movimiento reducido sin animaciones no esenciales; corregir `src/styles/tokens.css`, `src/styles/base.css` y estilos del componente afectado sin añadir alcance. Dep.: T057.
- [X] T059 Ejecutar `tests/e2e/limites.spec.js` y V-08/SC-008 en `specs/001-catalogo-pedidos-whatsapp/quickstart.md`: vacío, imagen perdida, alta inválida, lectura fallida, guardado fallido, eliminación fallida y destino ausente/inválido. Registrar reintentos, repeticiones bloqueadas y recarga fallida tras commit sin falso fallo de escritura, pérdida de otros productos o datos sensibles; resolver defectos. Dep.: T058.
- [ ] T060 Cerrar validación en `specs/001-catalogo-pedidos-whatsapp/quickstart.md` con `npm test`, `npm run test:e2e` y `npm run build`; Chromium completo y recorridos básicos Firefox/WebKit. Consolidar V-01–V-09 con resultados/versiones/tiempos y entorno HTTPS/disco persistente suministrado por responsable. Actualizar comandos reales comprobados en `AGENTS.md` y estado efectivo en `specs/README.md`; revisar Constitution/alcance, resolver fallos pendientes y no aprobar si falta algún SC. Sin elegir proveedor ni automatizar despliegue. Dep.: T059.

**Punto de control final**: los nueve SC deben tener resultados observados conformes junto con pruebas técnicas pertinentes. Las tareas permanecen pendientes durante Tasks.

## Dependencias y orden de ejecución

| Fase / historia | Prerrequisito | Resultado |
| --- | --- | --- |
| Preparación T001–T005 | Documentos aprobados | Herramientas, estructura, fixtures |
| Fundamentos T006–T012 | T005 | Servidor/esquema/configuración verificados |
| US1 / P1, T013–T022 | T012 | Consulta pública; enlace externo pendiente |
| US2 / P1, T023–T028 | T022 | MVP comercial con borradores |
| US3 / P2, T029–T045 | T028 | Acceso y alta con copia persistente |
| US4 / P2, T046–T054 | T045 | Eliminación protegida/persistente |
| Transversal T055–T060 | T054 | Aceptación y comandos documentados |

~~~mermaid
flowchart LR
  S["Preparación T001–T005"] --> F["Fundamentos T006–T012"]
  F --> U1["US1 P1: catálogo"]
  U1 --> U2["US2 P1: WhatsApp"]
  U2 --> U3["US3 P2: acceso + alta + imagen"]
  U3 --> U4["US4 P2: eliminación"]
  U4 --> V["Verificación transversal T055–T060"]
~~~

US2 reutiliza tarjeta/formateador de US1; US3 reutiliza catálogo/API/esquema; US4 reutiliza sesión/gestión de US3. El orden conserva P1 antes de P2 y evita cambios simultáneos en `server/db.js`, `server/app.js`, `src/App.jsx` y `src/pages/Gestion.jsx`. Cada historia se prueba con fixtures sin requerir otras operaciones de gestión para preparar datos.

Dentro de las fases: pruebas → validación/modelo → servicio/ruta → integración → ejecución/evidencia. T033 precede T034 por formato del hash; T036 y T038 se reúnen en T039, que revalida sesión antes de escribir.

### Oportunidades y ejemplos de trabajo en paralelo

| Momento y prerrequisitos cumplidos | Ejemplo de tareas paralelas | Archivos distintos |
| --- | --- | --- |
| Tras T001 | T002 + T003 + T004 | Web; ejemplos/Git; fixtures |
| Tras T005 | T006 + T010 + T011 | Pruebas base; API cliente; estilos |
| Tras T006 | T007 + T008 | Configuración servidor; esquema |
| US1, tras T012 | T013 + T014 + T015 | HTTP; precio unitario; navegador |
| US1, tras sus pruebas y T018 | T019 + T020, mientras avanza T016→T017 | Tarjeta; estados; servidor |
| US2, tras T022 | T023 + T024 | Mensaje/configuración; navegación |
| US2, tras T023 | T025 mientras se termina T024 | Helper de enlace; prueba web |
| US3, tras T028 | T029 + T030 + T031 + T032 | Sesión; alta HTTP; validación; web |
| US3, tras pruebas respectivas | T033 + T036 + T037 | Preparador; inserción; validación |
| US3, tras T035 y T038 | T039 + T040 + T042 | Ruta servidor; acceso/App; formulario |
| US4, tras T045 | T046 + T047 | Contrato DELETE; navegador |
| US4, tras pruebas respectivas | T048→T049 mientras avanza T050 | SQLite/ruta; diálogo |

Los 28 marcadores `[P]` representan oportunidades condicionadas, no 28 tareas listas simultáneamente. T026 espera T024 y T025; T043 espera las ramas de servidor/gestión/formulario; T051 espera ruta y diálogo. Las integraciones y evidencias que comparten archivos se realizan secuencialmente. Estos ejemplos describen posibilidades futuras de implementación; Tasks no ejecuta trabajo paralelo ni Implement.

## Trazabilidad y cobertura

| Requisito | Construcción / comprobación principal | Aceptación |
| --- | --- | --- |
| FR-001 | T013, T015–T022, T027–T028 | H1.1; V-01 / SC-001 |
| FR-002 | T013, T015, T020–T022, T059 | H1.2/H1.6; V-01/V-08 |
| FR-003 | T015, T019, T022, T056, T059 | H1.4/H1.5; EC-01/EC-02 |
| FR-004 | T014, T018, T023, T025, T057 | V-06 / SC-006 |
| FR-005 | T024, T026–T028 | H2.1; V-02 / SC-002 |
| FR-006 | T023, T025, T027–T028 | H2.1–H2.3; V-02 |
| FR-007 | T024, T026, T028, T057 | H2.4; EC-05/EC-06 |
| FR-008 | T007, T023–T024, T026, T028, T059 | H2.5; V-08 |
| FR-009 | T015, T021, T029, T035, T040–T041, T054 | Catálogo público/gestión separada |
| FR-010 | T008, T030–T031, T037–T039, T042–T045 | H3.1/H3.2/H3.10; V-03/V-08 |
| FR-011 | T008, T030, T036, T038–T039, T045–T046, T048, T053 | V-03/V-04; SC-003/SC-004 |
| FR-012 | T046–T053 | H4.1–H4.3/H4.5; V-04 |
| FR-013 | T030, T032, T042–T044, T047, T050–T052, T059 | Repeticiones/fallos; EC-04 |
| FR-014 | T011, T015, T019, T021, T040–T042, T050, T055–T056 | V-05 / SC-005 |
| FR-015 | T011, T015, T019, T055–T058 | H1.8; V-07 / SC-007 |
| FR-016 | T011, T015, T040–T042, T047, T050, T055–T056 | V-05 / SC-005 |
| FR-017 | T003, T007, T009–T010, T024–T028, T057, T059 | V-06/V-08; EC-07 |
| FR-018 | T024, T025, T055, T057 | V-06 / SC-006 |
| FR-019 | T003, T007, T009, T029–T035, T039–T046, T049, T054, T057 | H3.6–H3.9; EC-08; SC-009 |

Siete operaciones HTTP: catálogo/imagen en T013; consulta/inicio/cierre de sesión en T029; alta en T030; eliminación en T046. Una tabla de productos con BLOB, credenciales externas, sesiones en memoria, destino configurado y borradores transitorios sin almacenamiento, conforme al modelo.

| Criterio de éxito | Tarea que registra resultado completo |
| --- | --- |
| SC-001: 20 tarjetas; ≤3 s en 4 de 5 aperturas | T028 |
| SC-002: tres borradores correctos sin envío | T028 |
| SC-003: alta ≤2 min y copia persistente/otro dispositivo/reinicio | T045 |
| SC-004: cancelar, eliminar ≤30 s y persistencia | T053 |
| SC-005: anchos, teclado, 200 % y tacto | T056 |
| SC-006: español, soles, privacidad y sin pagos | T057 |
| SC-007: cuatro de cinco personas ≤30 s y movimiento reducido | T058 |
| SC-008: siete condiciones de límite/fallo | T059 |
| SC-009: público sin cuenta, gestión protegida y logout | T054 |

T060 consolida evidencias; no sustituye aceptación en la app ni convierte revisión documental en ejecución.

## Estrategia de implementación posterior

1. Completar T001–T012 y verificar fundamentos.
2. Entregar US1 como primer incremento de consulta con fixtures; validar datos/estados/adaptación sin depender de gestión ni WhatsApp.
3. Completar US2 para el **MVP comercial recomendado: US1 + US2**, porque WhatsApp es el único canal de pedido; medir SC-001 con acción operativa. Este hito aún no representa la tienda completa solicitada.
4. Incorporar US3: contratos/autorización/atomicidad antes de aceptar acceso/alta/imagen desde la app.
5. Incorporar US4 reutilizando acceso; validar cancelación, ID exacto y permanencia sin romper historias anteriores.
6. Ejecutar T055–T060 y cerrar solo con nueve SC conformes; recursos/participantes ausentes mantienen evidencia pendiente.

No añadir edición, carrito, cantidades, pagos, cuentas de clientes, inventario, categorías, búsqueda/filtros, promociones, envíos, historial/seguimiento, actualización en tiempo real ni infraestructura o despliegue no especificados.

## Registro de Implement — 2026-10-26

Se ejecutaron las fases técnicas en orden, con pruebas escritas antes del comportamiento correspondiente, fallos iniciales observados y correcciones verificadas. T001–T027, T029–T044, T046–T053, T055, T057 y T059 están completos. No se redujo la construcción al MVP: las cuatro historias y las diez capacidades solicitadas tienen implementación y pruebas locales. El aplazamiento expreso de los ensayos presenciales permite continuar la verificación técnica dependiente sin convertir esa aceptación pendiente en aprobada.

| Tarea pendiente | Trabajo ejecutado | Evidencia que todavía falta |
| --- | --- | --- |
| T028 | Enlaces, tres navegaciones interceptadas, caracteres, regreso, destino inválido y cinco mediciones locales con 20 tarjetas. | Número comercial autorizado y tres borradores reales en WhatsApp, sin envío; regreso ante servicio real inaccesible. |
| T045 | Alta desde la app, original descartable eliminado, imagen en otra sesión y reinicio real de proceso conservando SQLite. | Ensayo sin ayuda de una persona y consulta desde otro dispositivo físico. Aplazado por el responsable. |
| T054 | Público sin cuenta; acceso incorrecto/correcto, alta/baja, logout/historial, expiración/reinicio, HTTP directo y CSRF. | Completar el borrador público real de V-09/SC-009 junto con T028. |
| T056 | Seis recorridos completos: 360/768/1366 px con texto 100/200 %, teclado, foco, diálogo, controles ≥44 px, contraste y movimiento reducido. | Tacto en celular físico con HTTPS. Aplazado por el responsable. |
| T058 | Coherencia visual revisada en capturas y movimientos no esenciales suprimidos. | Cinco participantes nuevos A–E; al menos cuatro identifican nombre/precio/pedido ≤30 s. Aplazado por el responsable. |
| T060 | Instalación limpia, compilación, pruebas, comandos reales y estado del producto documentados. | Consolidar los nueve SC sin pendientes y registrar el entorno HTTPS/persistente suministrado por el responsable. Limpieza de temporales antiguos de laboratorio fuera del repo bloqueada por revisión automática (`blocked by policy`); detalle en quickstart.md. |

`quickstart.md` contiene resultados y condiciones; el informe HTML local de Playwright incluye capturas y mediciones. No se modifican las casillas de checklists ni los criterios aprobados. Hooks Git opcionales revisados y omitidos. Sin commit, push, merge, despliegue ni cierre de feature.

## Resumen y revisión documental de Tasks

| Grupo | Cantidad | Intervalo |
| --- | ---: | --- |
| Preparación | 5 | T001–T005 |
| Fundamentos | 7 | T006–T012 |
| US1 — Catálogo (P1) | 10 | T013–T022 |
| US2 — WhatsApp (P1) | 6 | T023–T028 |
| US3 — Acceso, alta e imagen (P2) | 17 | T029–T045 |
| US4 — Eliminación (P2) | 9 | T046–T054 |
| Transversal | 6 | T055–T060 |
| **Total** | **60** | **T001–T060** |

Revisión documental de salida realizada: 60 IDs consecutivos, casillas pendientes, rutas concretas, etiquetas US en sus fases, dependencias existentes sin ciclos, 28 oportunidades marcadas de paralelismo sin colisión, cobertura de 19 FR/9 SC, enlaces de entrada válidos y reglas literales del modelo. No se ejecuta la aplicación ni se marca ninguna tarea como realizada durante Tasks.

