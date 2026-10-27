# Modelo de datos — 003 WhatsApp y carrusel

**Fecha**: 2026-10-27. Diseño para implementación posterior; sin migración de SQLite.

## Producto persistente existente

| Campo SQLite | Proyección pública | Regla vigente |
| --- | --- | --- |
| `id` | `id` | UUID estable, clave primaria; no derivar identidad del nombre. |
| `nombre` | `nombre` | Texto no vacío; máximo 4096 bytes UTF-8. |
| `descripcion` | `descripcion` | Texto no vacío; máximo 32768 bytes UTF-8; conservar caracteres/saltos completos. |
| `precio_centimos` | `precioCentimos` | Entero positivo seguro, de 1 a 9007199254740991. Formato público por helper vigente, sin aritmética flotante nueva. |
| `imagen` | No se incluye en JSON | BLOB WebP de 1 a 10485760 bytes, copia persistente existente. |
| `imagen_mime` | No se incluye en JSON | `image/webp`. |
| Sin columna adicional | `imagenUrl` | Derivada: `/api/productos/{id}/imagen`. |

El método propuesto `obtener(id)` devuelve la misma proyección de `listar()`, o ausencia. Usa consulta preparada por ID y no carga BLOB. El listado sigue ordenado por ID. No se modifican validación de alta, datos, orden, credenciales, sesiones ni eliminación.

## Representaciones derivadas

| Representación | Datos / relación | Persistencia |
| --- | --- | --- |
| Ficha individual | Un UUID → producto y configuración pública de WhatsApp | Ninguna nueva; consulta el registro vigente. |
| URL individual | Origen explícito + `/productos/{id}` | Se calcula, no se guarda ni reemplaza UUID por slug. |
| OG | Nombre, descripción, URL canónica, URL social y alt de ese mismo producto | Se genera por petición HTML; no se almacena como catálogo aparte. |
| JPEG social | BLOB actual → fotografía completa en lienzo 1200×630 | Buffer de respuesta; no reescribe WebP ni guarda archivo nuevo. |
| Borrador WhatsApp | Nombre, descripción íntegra, precio formateado y URL | Transitorio, no representa pedido confirmado o historial. |
| Destino WhatsApp | `{ disponible, destino }` | Configuración pública ya validada; no cuenta nueva ni secreto del cliente. |

Las especificaciones visibles son la descripción existente. No se agregan fichas técnicas estructuradas, atributos, categorías, stock, variantes, cantidades ni selección de destacados.

## Estado de ficha

`cargando` → `listo` con datos; `cargando` → `no-disponible` ante 400/404; `cargando` → `error` ante fallo temporal/red. Reintentar vuelve a cargar. Desmontar aborta la consulta y evita aplicar resultados tardíos. Una fotografía fallida usa reemplazo y no elimina los detalles de un producto vigente.

Una baja conserva su semántica actual: desaparece el registro y su imagen. Acceder después a su ficha/derivado produce ausencia. La aplicación no mantiene redirecciones a otros productos ni historial. Una vista previa ya guardada por WhatsApp puede quedar en caché externa; no se garantiza borrado remoto inmediato.

## Estado transitorio de carrusel

| Campo lógico | Regla |
| --- | --- |
| `productos` | Lista recibida del catálogo, sin copias comerciales ni nuevos ordenamientos. |
| `idActivo` | Primer ID al iniciar; debe pertenecer a la lista mientras no esté vacía. |
| `pausaPuntero`, `pausaFoco`, `pausaTacto` | Indicadores independientes; terminar uno no borra los demás. |
| `movimientoReducido` | Valor actual de matchMedia, con escucha durante la visita. |
| `temporizador` | Referencia de un único timeout; no persistir en localStorage/SQLite. |
| `gesto` | Pointer ID y posición inicial; se descarta al terminar/cancelar. |

Invariantes: ningún cambio de tema reinicia selección; ningún ID aparece dos veces por ciclo completo; con cero elementos no hay seleccionado; con uno no hay avance; con ≥2, ninguna pausa y movimiento normal se programa un cambio después de cinco segundos completos. Cada acción manual reinicia el período. Si cambia la lista recibida, mantener selección si sigue disponible, o elegir el primero. Sin sincronización nueva entre pestañas.

## Transiciones de selección y pausa

| Evento | Resultado |
| --- | --- |
| Tick elegible / flecha siguiente / swipe izquierda | Siguiente ID circular. |
| Flecha anterior / swipe derecha | ID anterior circular. |
| Hover de ratón o activación de miniatura | ID indicado por el botón. |
| Foco/hover/contacto entra | Cancelar avance y conservar selección. |
| Interacción termina | Reanudar solo si no queda otra pausa y movimiento normal; esperar 5000 ms. |
| Movimiento reducido activado | Cancelar avance y transición no esencial; manual disponible. |
| Movimiento normal restaurado | Reevaluar elegibilidad, esperar 5000 ms. |
| Desmontaje | Limpiar temporizador, listener y gesto pendiente. |

## Preservación y datos sensibles

No hay nuevos campos personales. No se serializan credenciales, hash, cookie, configuración completa ni ruta externa de SQLite. Lecturas públicas no escriben filas. Antes de Implement se prepara copia consistente y relación del estado previo; pruebas futuras se ejecutan sobre DB temporal aislada. La aceptación exige comparar los productos/fotos y probar las operaciones existentes desde la app, además de comprobaciones técnicas.
