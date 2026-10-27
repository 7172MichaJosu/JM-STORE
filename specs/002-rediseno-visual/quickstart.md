# Guía de ejecución y validación — Rediseño visual

**Estado**: Implement ejecutado y verificado técnicamente el 2026-10-26; aceptación externa pendiente. **Entrada**: [spec y cinco aclaraciones](spec.md). La guía conserva los criterios aprobados. Resultados reales en [regresión final](evidencia/regresion-final.md) y [aceptación](evidencia/aceptacion.md). No se modificaron secretos ni la base real.

## Preparación y aislamiento

- Trabajar en la rama `002-rediseno-visual` desde `C:\JM-STORE`, con Node 24 y las dependencias fijadas. Conservar `.env`, su ruta SQLite y las credenciales existentes; este rediseño no requiere ejecutar `configurar-acceso` ni recrear la configuración externa.
- Las pruebas automatizadas utilizan los temporales de `tests/fixtures`. El lanzador verifica su ruta antes de limpiar. No sustituir `.playwright-entorno.json` por una ruta real ni reutilizar un servidor de producción.
- El responsable prepara fotos de prueba autorizadas horizontal, vertical y cuadrada, con bordes/corners reconocibles, y productos de textos comparables a las referencias. UUID deterministas solo en fixtures permiten comprobar el primer producto y el orden. Mantener también los 20 productos para rendimiento, nombres largos y dos nombres iguales con ID distinto.
- Para SC-008, preparar una copia aislada y coherente del catálogo previo, su relación legible de datos y una comparación técnica de ID/esquema/checksum de imágenes. No realizar altas o eliminaciones sobre el catálogo real para validar el rediseño.
- Para la revisión humana de WhatsApp se necesita entorno aislado autorizado con destino comercial válido y acceso al servicio ya preparados externamente. Si no está disponible, dejar esa evidencia pendiente; los enlaces interceptados no la aprueban.

## Comandos reales del proyecto

Comandos ejecutados en Implement, con datos aislados:

```powershell
Set-Location -LiteralPath 'C:\JM-STORE'
npm ci
npx playwright install chromium firefox webkit
npm test
npm run test:e2e
```

`npm run test:e2e` compila y ejecuta `tests/fixtures/ejecutar-web.mjs`; usa SQLite temporal, un worker y un servidor propio en 4175. El comando limpia el temporal al terminar. No reemplazarlo por un Playwright directo que omita la limpieza.

Para repetir los casos del rediseño usando el mismo lanzador:

```powershell
npm run test:e2e -- --project=chromium tema.spec.js movimiento.spec.js presentacion.spec.js
```

Esos tres archivos son previstos en este plan y no existen todavía. La batería actual sigue siendo obligatoria. Firefox y WebKit mantienen sus proyectos básicos y se amplía `basico.spec.js` para cubrir los comportamientos transversales; no se afirma que hoy ejecuten la batería completa.

Para una inspección manual de la compilación sin usar `.env` ni la base real, en una terminal separada:

```powershell
npm run build
node tests/fixtures/servidor-web.mjs
```

Abrir `http://localhost:4175` y usar solo las credenciales ficticias del entorno de pruebas, que el responsable toma de `tests/fixtures/entorno.mjs`. El servidor crea un temporal nuevo, no lee el catálogo real y tiene WhatsApp no disponible por defecto. Terminarlo con Ctrl+C antes de ejecutar `test:e2e`; comprobar la limpieza mediante los mecanismos existentes, sin borrar archivos SQLite manualmente. Este recorrido permite inspeccionar UI/gestión; no valida WhatsApp real ni sustituye las fixtures visuales planificadas.

El desarrollo normal conserva `npm run dev:api`, `npm run dev:web` y `http://localhost:5173`; usarlo únicamente con configuración externa de laboratorio previamente verificada. Para la aceptación de CSP/arranque debe probarse también la compilación Express anterior, porque Vite de desarrollo no acredita la política de producción. HTTPS y dispositivo físico se prepararán en el entorno autorizado existente, sin introducir despliegue en esta feature.

## V-01 — Fidelidad frente a las tres imágenes

**Condición**: las imágenes RV-01/RV-02/RV-03 están a la vista; fixtures visuales diferenciadas, viewport 1672 × 941 y fuente local cargada para la captura.

**Acciones**: abrir tienda clara, tienda oscura y panel en ambos temas. Comparar [matriz visual](contracts/interfaz-visual.md) y las 28 comprobaciones de SC-001. Medir cabecera, márgenes, proporción de portada, tarjeta, sidebar y paneles dentro de los rangos aprobados. Comparar jerarquía, familia tipográfica, degradados, luces y botones, omitiendo exclusivamente los módulos excluidos.

**Esperado**: 28/28 rasgos aplicables conformes; interfaz con elementos reales, no capturas incrustadas. Fotos completas y mismas imágenes de los datos. Repetir encuadre en todas las superficies con las tres proporciones a 360/768/1366; en portada el responsable prepara cada foto como primer producto solo en fixtures.

**Evidencia**: captura por superficie/tema, registro por VR con observación y adaptación permitida, y decisión del responsable. Una comparación de píxeles con las ilustraciones originales no es el criterio de aceptación. Solo después de revisar se adoptan las capturas de la app como baselines de regresión, con navegador/SO/fuente/datos constantes.

## V-02 — Tema manual, automático, arranque y almacenamiento

**Condición**: visitas de prueba con y sin preferencia manual; navegador permite cambiar preferencia de color, denegar almacenamiento y registrar la carga inicial.

**Acciones**: en tienda, acceso y gestión alternar dos veces el interruptor. Recorrer tienda → acceso → gestión → recarga → reapertura para ambos temas. En una visita sin selección manual cambiar dispositivo en ambas direcciones; después elegir manualmente y cambiar dispositivo al contrario. Repetir con lectura/escritura de preferencias denegadas y con confirmación de eliminación abierta. Volver usando Atrás para ejercitar `pageshow`.

**Esperado**: SC-002 completo: cambios ≤0.5 s, manual prevalece, campos/archivo/preview/foco/sesión permanecen, ninguna consulta/mutación o aparición se repite por tema. El diálogo permanece modal y no se confirma/cancela por cambiarlo. El recurso `/assets/tema-inicial-v1.js` responde correctamente en dev y compilación, no hay violación CSP y la secuencia inicial no muestra el tema opuesto.

**Evidencia**: resultados de ambos sentidos y las tres pantallas; secuencia de carga fría con animaciones normales, no solo screenshot final. Probar también fallo del recurso: contenido utilizable mediante caída de estilo, sin ocultación permanente.

## V-03 — Pedido individual conservado

**Condición**: tres productos, uno con tildes y `&`/`+`, destino válido y acceso autorizado a WhatsApp para la comprobación humana.

**Acciones**: abrir un borrador por tarjeta en cada tema y revisar destinatario, nombre, descripción y precio; volver sin enviar. Revisar también destino ausente/inválido preparado.

**Esperado**: seis borradores coincidentes, sin envío automático, confirmación ni mezcla de productos; indisponibilidad y botón deshabilitado comprensibles en ambos temas. No enviar mensajes durante la prueba.

**Evidencia**: las intercepciones automatizadas verifican URL/codificación y son complemento. Registrar aparte la inspección real sin datos sensibles; si falta acceso autorizado, marcar SC-003 pendiente, no aprobado por simulación.

## V-04 — Acceso y operaciones del encargado

**Condición**: entorno aislado con dos productos ficticios y acceso ficticio del encargado.

**Acciones**: en ambos temas probar acceso directo sin sesión, credenciales incorrectas y acceso correcto. Agregar con vista previa, validar campos/archivo incorrectos, repetir pulsaciones, simular fallo de guardado; cancelar y confirmar eliminación, probar nombres iguales, fallo y vencimiento de sesión. Cerrar sesión y regresar con Atrás. En medio de cada operación cambiar el tema manual o automáticamente según el estado modal.

**Esperado**: mismos permisos y estados; alta preparada ≤2 min y eliminación ≤30 s; sin duplicados ni éxito falso; cuatro campos, límites actuales, conservación de trabajo ante fallo y foco correcto. Las operaciones HTTP siguen sus cabeceras y respuestas actuales. El cambio de tema no ocasiona nuevas solicitudes de negocio.

**Evidencia**: recorridos de SC-004 y batería HTTP/SQLite existente. No modificar lógica de seguridad para acomodar el diseño.

## V-05 — Disposición adaptable y ampliación

**Condición**: claro/oscuro y anchos de 360, 768, 1366; capturas complementarias en límites 639/640/1199/1200.

**Acciones**: recorrer todas las pantallas y completar las seis acciones de SC-005; ampliar texto al 200 % y repetir. Comprobar todas las tarjetas, el panel, los avisos y el diálogo con textos extensos.

**Esperado**: rejilla de una/dos/tres columnas; tarjetas verticales a 360/768 y horizontales a 1366; en panel a 360/768 navegación compacta arriba, formulario primero y listado después; a 1366 sidebar y dos paneles. Sin superposición, recorte de contenido, controles inaccesibles ni desplazamiento horizontal de página.

**Evidencia**: seis combinaciones principales y sus resultados; emulación no sustituye el recorrido táctil en celular físico. No arreglar una captura ocultando desbordes de la página.

## V-06 — Teclado, lectura asistida, contraste y movimiento

**Acciones**: recorrer con teclado y lectura asistida, identificar interruptor/estado, errores y avisos; abrir/cancelar diálogo y verificar retorno de foco. Revisar áreas accionables y pares de contraste de todos los estados. En movimiento normal recorrer dos veces, cambiar tema, validar y actualizar el listado; luego salir/volver. Activar y desactivar movimiento reducido durante la visita, también con diálogo abierto.

**Esperado**: SC-006 y [contrato de estado](contracts/estado-y-navegacion.md). Cada aparición ocurre una vez por visita; no por tema/validación/actualización ajena. Preferencia reducida elimina movimiento no esencial en vivo y conserva señales estáticas. Texto ≥4.5:1, texto grande/indicadores necesarios ≥3:1, objetivos principales ≥44 × 44. Duraciones normales 150–350 ms y ninguna espera para actuar.

**Evidencia**: informe técnico de pares completos, recorrido humano y prueba de eventos de animación con efectos habilitados. Una captura con `animations: disabled` no demuestra repetición, movimiento reducido, foco ni duración. Comprobar ausencia de soporte de observación: contenido visible y usable.

## V-07 — Rendimiento y estabilidad

**Condición**: 20 productos, mismo dispositivo y conexión estable de laboratorio; registrar navegador, caché y condiciones. Para comparación reproducible usar cinco contextos nuevos por tema, sin throttling añadido entre casos; registrar aparte cualquier ensayo móvil real.

**Acciones**: cronometrar desde abrir hasta que nombre/precio/pedido del primer grupo sean utilizables; recorrer los 20 y pulsar acciones. Medir cambios de tema con animaciones normales. Inspeccionar que la fuente y las decoraciones no desplazan el control durante una pulsación.

**Esperado**: en ≥4/5 aperturas por tema primer grupo utilizable ≤3 s; tema ≤0.5 s. Veinte tarjetas, sin duplicados, saltos al activar ni bloqueos por efectos. Se excluye la autenticación externa de WhatsApp, no el arranque de tema o carga de fuente de la app. No activar esperas de screenshots dentro de esta medición.

## V-08 — Conservación y persistencia

**Condición**: copia aislada del catálogo previo, relación visible y comparación técnica preparadas antes de cambiar presentación. Sin ejecutar reset/seed sobre esa copia.

**Acciones**: comparar antes/después sin alta/eliminación, tras recarga, otra sesión/dispositivo y reinicio preparado. Después agregar solo un producto de prueba, retirar su archivo original del dispositivo y repetir; finalmente eliminar solo ese producto y repetir. Reautenticar después del reinicio si la sesión termina.

**Esperado**: SC-008: 100 % de productos anteriores conserva datos, orden y foto; ID, esquema y hashes no cambian en la comprobación técnica sin operaciones. Producto nuevo una sola vez con copia persistente; el eliminado continúa ausente y los anteriores intactos. No exigir que sobreviva una sesión que el sistema actual revoca al reiniciar.

La fixture `navegador.mjs` restaura su base antes/después de cada caso: no usar ese reset para este escenario de conservación. Preparar un caso dedicado, aislado y sin restauración intermedia, siguiendo el patrón de `persistencia.spec.js`.

## V-09 — Estados y recuperación

Preparar los diez casos de SC-009: carga, vacío, imagen fallida, consulta fallida, acceso incorrecto, sesión vencida, alta inválida, guardado fallido, eliminación fallida y destino ausente/inválido. Repetir cada uno en ambos temas.

**Esperado**: 20 resultados distinguibles con recuperación actual, mensajes en español, sin éxito falso, pérdida de otros productos ni detalles sensibles. Un estado no se sustituye por otro para que una captura se vea mejor.

## V-10 — Idioma, moneda y exclusiones

Recorrer todas las superficies y estados anteriores. Esperado: 100 % de textos propios en español de Perú; todos los precios con `S/` y dos decimales. Cero controles/campos de operaciones excluidas en A-05; ninguna solicitud nueva de datos de clientes, credenciales o pagos. Los contenidos de servicios externos no se presentan como textos propios de la app.

## V-11 — Comprensión y aceptación humana

Con cinco personas nuevas y tres tarjetas, en ambos temas medir reconocimiento de nombre, precio, pedido e interruptor. Esperado: al menos cuatro de cinco lo completan en ≤30 s sin instrucciones. Registrar resultado por persona con identificador ficticio, no datos personales.

Celular físico/otro dispositivo con HTTPS, cinco participantes y WhatsApp real conservan su estado pendiente hasta ejecutarse. No dar por aprobados ensayos aplazados de la feature 001 por generar este plan o por pasar automatización.

## Registro y puerta de aceptación futura

Guardar evidencia de implementación en `specs/002-rediseno-visual/evidencia/` cuando se ejecute: criterio, condiciones, fecha, dispositivo/navegador, pasos, resultado observado, pasa/falla/pendiente y enlace a captura/reporte. No crear resultados ficticios en Plan.

V-01 a V-11 se corresponden con SC-001 a SC-011. La aceptación necesita conformidad de todos los FR/VR y evidencia correspondiente, además de `npm test` y `test:e2e` pertinentes; las comprobaciones técnicas complementan las de la persona no técnica. Al fallar, corregir la implementación y repetir lo afectado sin rebajar spec, umbrales o imágenes de referencia. Esta guía no genera `tasks.md` ni autoriza avanzar a Implement.


## Resultado de Implement — 2026-10-26

Implement fue autorizado por la solicitud actual del usuario. Se ejecutaron los recorridos técnicos: 33/33 pruebas Node, 140/140 E2E y, después de revisar las cuatro capturas de referencia, 4/4 comparaciones de baseline. El código de la app no cambió entre ambas ejecuciones E2E. El HTML corresponde a la última ejecución; repetir la batería completa regenera su informe.

Para visualizar la tienda con su configuración externa actual, ejecutar `npm run dev:api` y `npm run dev:web` en terminales separadas y abrir http://localhost:5173. El rediseño no requiere reconfigurar acceso ni sustituir la ruta SQLite. Las pruebas no necesitan .env real.

Comprobaciones adicionales reproducibles:

```powershell
npm run test:e2e -- --project=chromium estados-visuales.spec.js
npm run test:e2e -- --project=chromium presentacion.spec.js --grep=composici.n
node specs/002-rediseno-visual/evidencia/verificar-dev.mjs
```

El último comando usa 5176 libre y sesión ficticia interceptada para comprobar Vite/StrictMode y activos; termina sus propios procesos y no abre SQLite. Las capturas estáticas de baseline se separan de los casos normales de movimiento/rendimiento.

Evidencia: [regresión final](evidencia/regresion-final.md), [fidelidad](evidencia/fidelidad-final.md), [datos](evidencia/us4-pruebas.md), [accesibilidad/movimiento](evidencia/accesibilidad-movimiento.md), [rendimiento](evidencia/rendimiento.md), [archivos](evidencia/archivos-modificados.md) y [decisión pendiente](evidencia/aceptacion.md).

T024/T046/T059/T065/T067 siguen pendientes de las condiciones externas descritas en V-03/V-08/V-05/V-06/V-11. No se alteran sus umbrales ni se aprueban con simulaciones. No se avanzó a otra fase del laboratorio ni se realizó commit/push/merge/cierre.
