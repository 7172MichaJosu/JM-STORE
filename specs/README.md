# Estado del producto — JM-STORE

**Actualizado**: 2026-10-26

La aplicación está implementada localmente conforme a [Constitution 1.0.0](../.specify/memory/constitution.md), [AGENTS.md](../AGENTS.md) y la [spec vigente](001-catalogo-pedidos-whatsapp/spec.md). La feature permanece abierta, en fase Implement; la aceptación total aún no está aprobada.

| Funcionalidad | Estado efectivo |
| --- | --- |
| Catálogo público | Tarjetas con copia de imagen, textos completos, soles y estados de carga/vacío/error/reintento. |
| WhatsApp individual | Enlace directo con tres datos y caracteres preservados; deshabilitado ante configuración ausente/inválida. Validación real del servicio pendiente. |
| Acceso del encargado | Credenciales externas scrypt, cookie protegida, sesión revocable/caducable, logout y protección HTTP directa/CSRF. |
| Alta e imagen | Cuatro campos, previsualización, validación servidor/cliente y copia WebP persistente en SQLite. |
| Eliminación | Confirmación por ID, cancelación, control de foco y persistencia junto con retirada de la imagen. |
| Presentación | CSS propio marfil/verde/acento cálido, adaptable, teclado, texto 200 % y movimiento reducido verificados en navegador. |

Los comandos reales están en [README](../README.md) y la [guía de validación](001-catalogo-pedidos-whatsapp/quickstart.md). El [registro de tareas](001-catalogo-pedidos-whatsapp/tasks.md) conserva las casillas pendientes de evidencia externa. No se modificaron la spec, el plan, los contratos ni las listas de calidad para adaptar la aceptación al resultado.

El responsable indicó que los ensayos presenciales se realizarán después: celular físico/otro dispositivo con HTTPS y cinco participantes nuevos. También falta destino comercial autorizado/acceso real a WhatsApp para revisar tres borradores sin enviarlos. Las pruebas automatizadas los complementan; no los sustituyen. No se elige proveedor de alojamiento ni se despliega.

Únicamente fase Implement: sin commit, push, merge o cierre de la feature. Las decisiones históricas de Spec/Plan/Tasks se conservan en sus artefactos.
