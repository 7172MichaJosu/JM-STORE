# Modelo de datos y estado — Rediseño visual

**Fase**: Plan / Phase 1 · **Entrada**: [spec](spec.md) · **Decisiones**: [research](research.md).

## Persistencia comercial: conservar el modelo existente

La feature no añade tablas, columnas, migraciones, cuentas, pedidos guardados ni operaciones de mantenimiento de datos. El esquema vigente en `server/db.js` y el contrato público se conservan.

| Entidad/campo | Representación actual | Regla preservada |
| --- | --- | --- |
| Producto `id` | UUID en texto, clave primaria | Identidad estable incluso con nombres iguales; no regenerar. |
| `nombre` | Texto UTF-8 | Distinto de espacios; máximo 4096 bytes. |
| `descripcion` | Texto UTF-8 | Distinto de espacios; máximo 32768 bytes; mostrar completo y como texto. |
| `precio_centimos` | Entero SQLite | Entre 1 y 9007199254740991; vista pública `precioCentimos`. No convertir a precio decimal almacenado. |
| `imagen` | BLOB WebP propio | Entre 1 y 10485760 bytes; no sustituir ni recodificar los existentes. |
| `imagen_mime` | Texto `image/webp` | Servir por la ruta de imagen actual, no por URL remota. |
| `imagenUrl` | Campo público derivado | `/api/productos/:id/imagen`; no columna nueva. |

El alta sigue aceptando JPEG, PNG o WebP estático de hasta 10 MiB y 25 millones de píxeles, con orientación y copia WebP mediante el procesamiento vigente. La presentación completa se resuelve en el navegador; no cambia el archivo guardado. Precio de entrada admite coma o punto decimal, hasta dos decimales, sin exponentes ni separadores de miles. El rediseño no aplica los límites de ejemplo de RV-03.

**Relación y orden**: un producto tiene una copia propia de imagen. La lista conserva `ORDER BY id` del servidor. Portada = primer objeto devuelto si existe; protagonismo inicial = primeras tres tarjetas del mismo arreglo. No existen entidad, bandera o persistencia de «destacado».

**Transiciones vigentes**: alta válida confirmada → producto persistente; alta fallida → conservar formulario, sin producto anunciado; eliminación cancelada → mismo producto; eliminación confirmada y exitosa → retirar solo ese ID y su imagen; fallo → mantener producto y recuperación. Reiniciar puede revocar la sesión, no los productos.

## Preferencia local de apariencia

Única persistencia nueva: un valor no personal en el navegador. No viaja a la API, no se registra ni se mezcla con cookies de acceso.

| Dato | Dominio | Duración y origen |
| --- | --- | --- |
| `jm-store.tema` | `claro` u `oscuro` | `localStorage` cuando esté disponible; ausencia/valor inválido significa sin elección manual válida. |
| `temaEfectivo` | `claro` / `oscuro` | Estado en memoria y `html[data-tema]`; se inicializa antes de React. |
| `origenTema` | `sistema` / `manual` | Memoria y `html[data-origen-tema]`; no exige guardar un tercer valor. |
| Preferencia del dispositivo | Oscuro / no oscuro / no reconocible | Consulta `matchMedia`; en ausencia reconocible, claro. |

**Prioridad**: elección manual válida en memoria o almacenada → preferencia del dispositivo → claro. Si guardar falla, se mantiene `manual` y la elección efectiva durante la pantalla actual. No se añade opción «Automático», cuenta, sincronización entre pestañas, vencimiento ni configuración en SQLite.

| Estado inicial/evento | Resultado |
| --- | --- |
| Valor manual válido disponible al abrir | Aplicarlo antes de la presentación; origen manual. |
| Sin valor válido y dispositivo claro/oscuro | Aplicar y seguir al dispositivo; origen sistema. |
| Evento del dispositivo con origen sistema | Cambiar tema sin perder datos, foco ni operación. |
| Pulsación del interruptor | Alternar tema, marcar manual, intentar conservar; error de almacenamiento no bloqueante. |
| Evento del dispositivo con origen manual | Conservar elección manual. |
| Restauración de historial | Reconciliar elección almacenada disponible y sistema; si el almacenamiento falla, preservar la elección manual en memoria de ese documento. |

## Visita, aparición y movimiento: solo memoria

| Estado | Identidad/duración | Regla |
| --- | --- | --- |
| Visita de pantalla | Por entrada documental o regreso real de navegación | Reiniciar al abrir/volver; incluye restauración de historial. |
| Elementos vistos | Conjunto de ID lógico estable por visita | Producto identificado por UUID; sección por ID semántico, no índice ni tema. |
| Aparición activa | Clase transitoria en elemento | Una vez; retirarla al terminar/cancelar manteniendo el ID visto. |
| Movimiento reducido | Preferencia actual del dispositivo | Desactivar movimiento en vivo; mostrar pendientes y no reproducir apariciones consumidas al desactivarlo. |

Actualizar tema, validar, agregar otro producto o revalidar una sesión temporalmente no crea otra visita ni borra los elementos vistos. Un producto nuevo puede consumir su primera aparición, sin repetir las anteriores. No se persiste el registro de animación ni se almacena información de navegación del cliente.

## Estado de trabajo preservado

- **Catálogo**: resultado actual y estados cargando/listo/vacío/error; no refetch por tema. No ocultar productos reales si falla la foto de portada.
- **Acceso**: campos, error y solicitud pendiente conservados durante cambios de tema. El proveedor no accede a contraseñas ni sesión.
- **Alta**: valores actuales, `File`, URL `blob:` de vista previa, validaciones y bloqueo de repetición permanecen en `FormularioProducto`. Se revoca el blob al cambiar archivo/desmontar como ahora, no al cambiar tema.
- **Gestión**: sesión verificada, productos, avisos y selección para eliminar siguen bajo su propietario actual. Mantener el subárbol montado que `Gestion` oculta durante revalidación.
- **Diálogo**: producto por ID, origen del foco, error y estado ocupado permanecen; el cambio automático de tema solo altera estilos. Mantener `showModal()`, cancelación y restauración del foco vigentes.
- **WhatsApp**: destino externo y borrador transitorio conservan formato y codificación; no se crea entidad comercial de pedido.

Estas reglas se concretan en [estado y navegación](contracts/estado-y-navegacion.md) y se prueban mediante [V-02/V-04/V-08](quickstart.md).
