# Estado del producto — JM-STORE

**Actualizado**: 2026-10-27

La aplicación conserva la [base funcional 001](001-catalogo-pedidos-whatsapp/spec.md) y aplica el [rediseño visual 002](002-rediseno-visual/spec.md), conforme a [Constitution 1.0.0](../.specify/memory/constitution.md) y [AGENTS.md](../AGENTS.md). El usuario autorizó el cierre Git de 002; su aceptación total sigue abierta y no está aprobada.

| Funcionalidad | Estado efectivo |
| --- | --- |
| Catálogo público | Tarjetas con copia de imagen, textos completos, soles y estados de carga/vacío/error/reintento. |
| WhatsApp individual | Enlace directo con tres datos y caracteres preservados; deshabilitado ante configuración ausente/inválida. Validación real del servicio pendiente. |
| Acceso del encargado | Credenciales externas scrypt, cookie protegida, sesión revocable/caducable, logout y protección HTTP directa/CSRF. |
| Alta e imagen | Cuatro campos, previsualización, validación servidor/cliente y copia WebP persistente en SQLite. |
| Eliminación | Confirmación por ID, cancelación, control de foco y persistencia junto con retirada de la imagen. |
| Presentación | Identidad azul/violeta/cian, Manrope local, temas claro/oscuro, portada y panel rediseñados; responsive, teclado, texto 200 % y movimiento reducido verificados técnicamente. |

Los comandos reales están en [README](../README.md) y la [guía de validación](001-catalogo-pedidos-whatsapp/quickstart.md). El [registro de tareas](001-catalogo-pedidos-whatsapp/tasks.md) conserva las casillas pendientes de evidencia externa. No se modificaron la spec, el plan, los contratos ni las listas de calidad para adaptar la aceptación al resultado.

El responsable indicó que los ensayos presenciales se realizarán después: celular físico/otro dispositivo con HTTPS y cinco participantes nuevos. También falta destino comercial autorizado/acceso real a WhatsApp para revisar tres borradores sin enviarlos. Las pruebas automatizadas los complementan; no los sustituyen. No se elige proveedor de alojamiento ni se despliega.

La fase Implement se entregó originalmente sin commit, push, merge o cierre. Las decisiones históricas de Spec/Plan/Tasks se conservan en sus artefactos; las solicitudes Git posteriores se registran a continuación.

## Nueva feature — 002 Rediseño visual

La [spec de rediseño visual](002-rediseno-visual/spec.md) se desarrolló en la rama `002-rediseno-visual`, con Specify y Clarify completados y [lista de calidad documental](002-rediseno-visual/checklists/requirements.md) revalidada. Clarify registra cinco respuestas aprobadas sobre fotografías completas, tarjetas verticales en celulares/tablets, aparición animada una vez por visita, seguimiento del tema del dispositivo hasta una elección manual y panel apilado con navegación compacta en tablets. Define la tienda clara, oscura y el panel del encargado a partir de las tres referencias adjuntas por el usuario. Mantiene la spec 001 como base funcional y conserva todos los productos e imágenes existentes.

Specify, Clarify, [Plan](002-rediseno-visual/plan.md) y [Tasks](002-rediseno-visual/tasks.md) se completaron antes de implementar. Implement registra 62 tareas completas y cinco pendientes de aceptación externa: WhatsApp real, copia previa, dispositivos/lectura asistida, participantes y decisión final. Resultado: 33/33 pruebas Node, 140/140 E2E y cuatro baselines revisadas verificadas. Consultar [evidencia final](002-rediseno-visual/evidencia/aceptacion.md) y [quickstart](002-rediseno-visual/quickstart.md). Se conservan las aceptaciones pendientes de 001; no hubo commit, push, merge ni cierre.

Solicitud posterior a Implement: el usuario autorizó commit y push de todos los cambios pendientes a `002-rediseno-visual`. La rama conserva el estado de aceptación descrito; en aquella solicitud no se pidió su cierre ni fusión con `main`.

Solicitud del 2026-10-27: cierre Git de `002-rediseno-visual`, con fusión `--no-ff` en `main`, eliminación de ambas ramas de la feature y subida de `main`, condicionado a pruebas correctas. La aceptación funcional continúa pendiente: T024, T046, T059, T065 y T067 permanecen sin marcar. Consultar [registro de revisión y pruebas de cierre](002-rediseno-visual/evidencia/cierre-git.md).

## Feature en revisión — 003 WhatsApp y carrusel

La rama `003-whatsapp-carrusel` recupera el avance `eae656f`: mensaje individual con emojis, descripción íntegra, precio y enlace; ficha por UUID con HTML Open Graph e imagen social JPEG; carrusel de productos existentes con avance cada cinco segundos, controles manuales, pausas y movimiento reducido. No cambia el esquema SQLite ni añade dependencias.

La continuación en laptop del 2026-10-27 revisa el código y los documentos SDD, repite las pruebas y completa las verificaciones locales pendientes. El [registro de aceptación](003-whatsapp-carrusel/evidencia/aceptacion.md) y [tasks.md](003-whatsapp-carrusel/tasks.md) son la referencia del resultado. T032, T033 y T034 requieren todavía HTTPS público, WhatsApp real y validación presencial con celular/lectura asistida; los ensayos técnicos no los aprueban. Se mantienen también las aceptaciones pendientes de 001/002.

Resultado local: 33/36 tareas completas; T029, T030, T031, T035 y T036 completadas en esta revisión. Se corrigió una superposición a texto 200 % y se añadieron siete pruebas: Node 41/41, compilación aprobada y regresión E2E final 171/171 (163 Chromium, 4 Firefox, 4 WebKit), manteniendo las baselines existentes.

Por instrucción expresa, esta continuación conserva productos, fotografías, `.env`, credenciales y SQLite, y no realiza commit, push, merge ni cierre de la feature.
