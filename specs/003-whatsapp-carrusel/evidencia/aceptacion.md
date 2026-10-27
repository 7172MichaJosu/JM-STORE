# Evidencia de implementación — 003

**Fecha**: 2026-10-27. Continuación del avance recuperado en laptop; verificación técnica local completada. Este registro separa resultados locales de aceptación externa.

## Preservación previa recuperada — T001

Los puntos siguientes pertenecen al registro de la PC anterior; la comprobación independiente de esta laptop se detalla más adelante.

- No había servidores escuchando en los puertos 3001/5173.
- Copia consistente de SQLite creada fuera del repositorio usando conexión de solo lectura.
- Inventario privado externo: 2 productos y 2 fotografías, con sus datos y hashes de imagen.
- Catálogo y ambas fotografías comprobados mediante la API original con repositorio de solo lectura.
- Control externo del archivo SQLite y `.env` preparado para comparar al finalizar.
- No se alteraron credenciales, productos ni imágenes; no se guardan rutas privadas o secretos aquí.

## Preparación — T002

- Lector de índice compilado inyectable en `crearApp`; fixture HTML controlada para integración.
- Las pruebas mantienen SQLite temporal; los checklists de requisitos permanecen intactos (16/16).

## Pendientes externos

- T032: URL pública HTTPS y vista previa real en WhatsApp.
- T033: destino comercial autorizado y revisión real de borradores.
- T034: celular físico y lectura asistida presencial.

## Punto de partida y revisión en laptop

- Rama `003-whatsapp-carrusel`, avance recuperado `eae656f` (`WIP: avance parcial de WhatsApp y carrusel`). Working tree limpio al iniciar; no se rehízo la implementación ni se cambiaron dependencias.
- T001–T028 estaban marcadas; T029–T036 estaban abiertas. Las evidencias JSON/capturas recuperadas no equivalen por sí solas a una revisión actual ni a aceptación externa.
- Revisados Constitution 1.0.0, estado del producto, spec, plan, research, modelo de datos, ambos contratos, quickstart, tareas, servidor, React, CSS y soporte de pruebas. Sin pagos, cuentas de clientes, datos nuevos ni migración de SQLite.
- Checklist `requirements.md`: 16/16, sin modificar sus marcadores. `.gitignore` protege `.env`, SQLite, dependencias y resultados locales; paquete privado, sin necesidad de `.npmignore` para publicación.
- El precheck resolvía 001 por el contexto local de Spec Kit. Se corrigió la referencia local a `specs/003-whatsapp-carrusel` y se repitió `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`, obteniendo la ruta absoluta de 003 y sus cinco grupos documentales.
- Entorno: Windows x64, Node.js 24.15.0, npm 11.12.1, Playwright 1.64.1; versiones de dependencias vigentes conservadas. Navegadores del paquete: Chromium 156.0.8078.4, Firefox 157.0 y WebKit 27.2.

## Verificación técnica y corrección — T029–T031

| Ejecución | Resultado en esta laptop |
| --- | --- |
| `npm test` | 41/41 aprobadas, 0 fallos/omitidas; unitarias, HTTP y SQLite temporal real. |
| `npm run build` | Aprobada; compilación Vite con 51 módulos. |
| Primera repetición de `npm run test:e2e` | 164/164 aprobadas en 6.8 min: Chromium 156, Firefox 4, WebKit 4. Confirma el reporte de la PC anterior en esta laptop. |
| Siete casos adicionales, antes de ampliar la comprobación de superposición | 7/7 aprobados. La revisión visual posterior encontró una deficiencia que esos primeros asserts no comprobaban. |
| Regresión específica de superposición a 360 px/texto 200 % | Falló antes del arreglo (`distintivosCubrenControles = true`) y pasó después (1/1). |
| Regresión completa tras el arreglo: `npm run test:e2e` | 171/171 aprobadas en 6.9 min: Chromium 163, Firefox 4, WebKit 4; 0 fallos/omitidas. Incluye los siete casos nuevos y las cuatro baselines existentes. |

La revisión visual detectó que los distintivos decorativos cubrían el indicador y las flechas con texto al 200 %. Se cambió únicamente el espacio superior en `src/styles/carrusel.css` a `calc(3rem + 24px)` y, en celular, `calc(2rem + 28px)`. A tamaño normal conserva los 72/60 px previos; al ampliar texto reserva el espacio que necesitan los distintivos. No cambia datos, temporizador ni comportamiento comercial.

`tests/e2e/aceptacion-carrusel.spec.js` añade siete casos: ciclo circular de ocho productos con diez avances de 4999/5000 ms; diez selecciones por hover, teclado, flechas y Pointer Events horizontales en ambos temas y preferencias de movimiento; pausa combinada de tacto/foco con cancelación y reanudación; diez fichas en contextos nuevos. Comprueba objetivos 44×44, foco, `pan-y pinch-zoom`, ausencia de overflow y superposición decorativa a 360/768/1366 con texto al 200 %. Las capturas de esta revisión viven en [capturas/laptop](capturas/laptop/).

Las baselines de tienda recuperadas ya corresponden al carrusel. Se revisaron claro y oscuro y las cuatro comparaciones de tienda/panel aprobaron sin regenerarlas. Se conservan las baselines del panel; no se usó `--update-snapshots`.

Mediciones locales actualizadas: [carga clara](rendimiento-claro.json), [carga oscura](rendimiento-oscuro.json), [imagen social límite](imagen-social-limite.json). Las diez aperturas con veinte fotografías quedaron entre 439 y 559 ms, todas bajo 3 s; son mediciones de localhost sin limitación de red. El ensayo sintético de 25 millones de píxeles produjo JPEG 1200×630 de 7129 bytes en 137 ms; no representa todas las fotografías ni un límite oficial de WhatsApp.

## Desarrollo y conservación — T035

- [Desarrollo en laptop](desarrollo-laptop.json): Vite real con API/SQLite temporales y tres productos ficticios; ficha directa, recarga, fotografía y enlace con el origen de Vite comprobados. El destino ficticio se usó para inspeccionar el enlace; no se abrió WhatsApp ni se enviaron mensajes.
- [Conservación en laptop](conservacion-laptop.json): dos productos/dos fotografías existentes leídos mediante conexión SQLite de solo lectura. Desde el navegador se compararon catálogo y fichas en claro/oscuro con ese inventario y los bytes de fotografía con cada BLOB. Sin altas/bajas en el catálogo real.
- Huellas SHA-256 de `.env` y SQLite tomadas al iniciar y comparadas al finalizar: archivos idénticos byte por byte; credenciales preservadas. Las huellas y rutas privadas no se publican.
- Login/logout, alta/baja, cancelación, persistencia tras reinicio y conservación de veinte filas/imágenes se verificaron con datos ficticios en SQLite temporal; [inventario de fixture](conservacion-fixture.json). No se volvió a ejecutar `configurar-acceso`.
- Límite histórico: el inventario privado y la copia externa originales de T001 no se validaron físicamente en esta laptop. El registro recuperado [preservacion-real.json](preservacion-real.json) afirma conservación de dos productos; la comparación actual asegura preservación desde el comienzo de esta sesión, sin atribuirle una comparación independiente con el respaldo privado anterior.

## Revisión documental — T036

La guía y ambos contratos corresponden a las rutas/helpers implementados, al mensaje completo, OG inicial, JPEG derivado, pausas y gesto. Se actualizaron sus estados para dejar de describir esas funciones como futuras; también se enlazó 003 desde los README. Spec y tareas mantienen el alcance aprobado; plan/research conservan su carácter histórico de diseño. Se mantienen las aceptaciones abiertas de 001/002.

## Aceptación externa pendiente — T032–T034

| Criterio | Alcance de la evidencia actual |
| --- | --- |
| SC-001 | Mensaje y codificación comprobados técnicamente, incluyendo texto extenso; cinco borradores reales aún pendientes. |
| SC-002 | Diez fichas en sesiones nuevas, datos/fotografía y estado retirado/error comprobados localmente. |
| SC-003 | Metadatos e imagen social comprobados localmente; tres previews públicos reales pendientes. |
| SC-004 | Diez avances de cinco segundos sobre ocho productos y diez selecciones por método comprobados técnicamente; tacto físico pendiente. |
| SC-005 | Vacío/unitario y movimiento reducido comprobados en ambos temas. |
| SC-006 | Adaptación, texto 200 %, controles, foco y movimiento comprobados técnicamente; lectura asistida/uso físico pendientes. |
| SC-007 | Preservación desde el inicio de esta sesión y regresiones con datos temporales comprobadas; respaldo privado de la otra PC no inspeccionado aquí. |

| Tarea | Parte comprobada localmente | Lo que falta y cómo aceptarlo |
| --- | --- | --- |
| T032 | HTML inicial con OG/canonical del UUID correcto, escape, estados, origen configurado y JPEG local. | Entorno HTTPS público autorizado, accesible desde otra red: abrir tres fichas e imágenes sin sesión y revisar tres tarjetas de WhatsApp. La configuración actual usa HTTP local. Registrar navegador/dispositivo, fecha, resultado por producto y cualquier caché/límite del servicio. No se despliega ni abre túnel en esta tarea. |
| T033 | Constructor íntegro, símbolos/emojis, descripción hasta 32 KiB, codificación única y enlaces interceptados. | Destino comercial autorizado y acceso real a WhatsApp: revisar tres borradores sin enviarlos, uno con descripción larga, comprobando destinatario, texto y URL. SC-001 pide cinco productos: completar también cinco para aceptar ese criterio. Si el servicio rechaza una URL larga, registrar el límite y pedir decisión de producto; no truncar ni añadir fallback. No se prueba el servicio solo por existir un número configurado. |
| T034 | Teclado/foco, nombres y roles accesibles, ambos temas, movimiento reducido inicial/dinámico, tamaños 360/768/1366, texto 200 %, gestos/cancelación simulados y `touch-action`. | Celular físico para diez deslizamientos, gestos verticales/cortos, scroll y zoom; sesión presencial de lectura asistida en computadora, por ejemplo Narrador/NVDA, en ambos temas y preferencias de movimiento. Registrar lo anunciado, orden de navegación y capacidad de operar controles sin perder foco. No se ha escuchado un lector real ni realizado ensayo físico; la automatización no los sustituye. |

T032–T034 permanecen sin marcar. No se declara aceptación total, cumplimiento presencial ni vista previa real de WhatsApp a partir de mocks.

## Hooks y operaciones Git

`.specify/extensions.yml` se analizó como YAML válido. `before_implement` y `after_implement` solo registran el hook opcional `speckit.git.commit`; se omite por instrucción expresa de no hacer commit. No hay hooks obligatorios aplicables. Sin commit, push, merge, borrado de ramas, despliegue ni cierre de feature en esta continuación.

## Estado entregado

33/36 tareas completas. Esta continuación completa T029, T030, T031, T035 y T036; T032–T034 permanecen pendientes. Se conservan productos, fotografías, `.env`, credenciales, SQLite, rama y commit de partida. El [resumen de pruebas de laptop](pruebas-laptop.json) registra los recuentos; el informe HTML de la ejecución final está en `playwright-report/index.html` (local, ignorado por Git). `git diff --check` sin errores. No hay aceptación total ni cierre de feature.
