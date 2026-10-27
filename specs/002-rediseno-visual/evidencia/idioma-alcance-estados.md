# Estados, idioma y alcance — V-09/V-10

Se revisaron las veinte capturas originales (diez estados por tema), sus mensajes y resultados automatizados. Registros: [claro](estados-claro.json), [oscuro](estados-oscuro.json); PNG individuales en [capturas/estados](capturas/estados/).

| Estado | Claro y oscuro: resultado observado |
| --- | --- |
| Carga | Cargando productos, sin confundir con vacío |
| Vacío | Mensaje propio, sin productos ficticios |
| Consulta fallida | Mensaje seguro y Reintentar |
| Imagen fallida | Reemplazo identificable; demás datos/acción conservados |
| Destino ausente | Pedido deshabilitado y motivo visible; inválido cubierto también en WhatsApp/límites |
| Acceso incorrecto | Error comprensible y acceso cerrado |
| Alta inválida | Errores asociados y foco en el primer campo inválido |
| Guardado fallido | Campos, archivo y preview conservados; sin éxito falso |
| Eliminación fallida | Modal y producto conservados; cancelar/reintentar disponibles |
| Sesión vencida | Gestión oculta, reingreso requerido, sin reenvío automático |

20/20 resultados distinguidos. Contraste mínimo medido de las muestras: claro 5.98:1; oscuro 8.04:1. Se complementa con contraste unitario de controles, foco, degradados, disabled y superficies.

Los textos propios están en español de Perú; nombres de productos de ensayo se tratan como datos. Todos los precios presentados usan soles, espacio y dos decimales; la función de céntimos permanece intacta. Se revisaron las etiquetas de los cuatro campos y los mensajes; no hay solicitudes nuevas de datos de clientes, edición, stock, favoritos, categorías, búsqueda, estadísticas, pagos ni otros módulos excluidos.

La revisión visual se apoyó en las capturas originales y hojas locales de inspección, sin alterar los PNG originales. Lectura asistida y dispositivo físico siguen pendientes en T059.
