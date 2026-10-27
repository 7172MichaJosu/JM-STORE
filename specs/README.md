# Estado del producto — JM-STORE

**Actualizado**: 2026-10-26

La aplicación conserva la [base funcional 001](001-catalogo-pedidos-whatsapp/spec.md) y aplica el [rediseño visual 002](002-rediseno-visual/spec.md), conforme a [Constitution 1.0.0](../.specify/memory/constitution.md) y [AGENTS.md](../AGENTS.md). La feature 002 permanece abierta en Implement; su aceptación total aún no está aprobada.

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

Únicamente fase Implement: sin commit, push, merge o cierre de la feature. Las decisiones históricas de Spec/Plan/Tasks se conservan en sus artefactos.

## Nueva feature — 002 Rediseño visual

La [spec de rediseño visual](002-rediseno-visual/spec.md) está en la rama `002-rediseno-visual`, con Specify y Clarify completados y [lista de calidad documental](002-rediseno-visual/checklists/requirements.md) revalidada. Clarify registra cinco respuestas aprobadas sobre fotografías completas, tarjetas verticales en celulares/tablets, aparición animada una vez por visita, seguimiento del tema del dispositivo hasta una elección manual y panel apilado con navegación compacta en tablets. Define la tienda clara, oscura y el panel del encargado a partir de las tres referencias adjuntas por el usuario. Mantiene la spec 001 como base funcional y conserva todos los productos e imágenes existentes.

Specify, Clarify, [Plan](002-rediseno-visual/plan.md) y [Tasks](002-rediseno-visual/tasks.md) se completaron antes de implementar. Implement registra 62 tareas completas y cinco pendientes de aceptación externa: WhatsApp real, copia previa, dispositivos/lectura asistida, participantes y decisión final. Resultado: 33/33 pruebas Node, 140/140 E2E y cuatro baselines revisadas verificadas. Consultar [evidencia final](002-rediseno-visual/evidencia/aceptacion.md) y [quickstart](002-rediseno-visual/quickstart.md). Se conservan las aceptaciones pendientes de 001; no hubo commit, push, merge ni cierre.

Solicitud posterior a Implement: el usuario autorizó commit y push de todos los cambios pendientes a `002-rediseno-visual`. La rama conserva el estado de aceptación descrito; no se solicitó su cierre ni fusión con `main`.
