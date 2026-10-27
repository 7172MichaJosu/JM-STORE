# Contrato de interfaz y WhatsApp — 003

**Estado**: Contrato implementado y revisado contra el código recuperado el 2026-10-27; complementa SC-001 a SC-007. La comprobación técnica local y los ensayos externos pendientes se registran en [aceptación](../evidencia/aceptacion.md).

## Constructores compartidos

| Interfaz prevista | Entrada / salida |
| --- | --- |
| `rutaProducto(id)` | UUID existente → `/productos/{id}`; sin nombre como slug. |
| `urlProducto(id, origen)` | Origen absoluto explícito → URL individual absoluta. |
| `mensajeWhatsApp(producto, origen)` | Proyección pública y origen → texto completo siguiente. |
| `enlaceWhatsApp(producto, whatsapp, origen)` | Texto codificado una vez → URL wa.me, o `null` si destino ausente/inválido. |

Son helpers puros: no consultan window, DB, reloj ni red. El componente de navegador pasa `location.origin`. El renderer servidor usa el origen de configuración validado. Un origen inválido es error de programación/configuración, no motivo para inventar un enlace; las pruebas lo detectan.

Formato del mensaje, con sustitución íntegra de campos:

```text
Hola, JM-STORE. Me interesa este producto:

📦 Producto: [nombre]
📝 Descripción: [descripción completa]
💰 Precio: S/ 49.90
🔗 Enlace: [URL individual absoluta]

¿Podrían confirmarme su disponibilidad?
```

No modificar tildes, símbolos, saltos ni texto de los datos ya guardados. El constructor no abre WhatsApp ni confirma envío. Un único enlace del botón abre `https://wa.me/{destino}?text={mensaje-codificado}`; el cliente revisa y envía en WhatsApp. Se conserva la indisponibilidad del destino y no se añade un registro de pedido.

Prueba independiente: construir el resultado esperado con datos conocidos, decodificar `text` y comparar exactamente. No usar solo el mismo constructor como oráculo de todas las pruebas. Incluir precio extremo permitido, `& + % #`, emojis, saltos y descripciones de 500 caracteres y límite vigente. El servicio externo puede limitar URLs muy largas; ese ensayo no se sustituye por probar el string.

## Ficha y catálogo

La tarjeta mantiene descripción/precio/botón actuales y añade acceso a ficha mediante el nombre o un enlace independiente. La ficha muestra la fotografía entera y la descripción íntegra, incluso con palabras largas y texto al 200 %. No añade galería, edición, stock o atributos nuevos. Ambos temas usan proveedor de tema y tokens actuales. Solo producto vigente habilita su acción de pedido; error y ausencia no muestran otro producto.

## Contrato del carrusel

Entrada: lista completa de productos y estado de catálogo ya consultados. Salida: un producto activo con fotografía/nombre/precio y acceso a su ficha. Se conserva texto general de portada, CTA «Ver catálogo» y franja informativa. No duplica el listado comercial ni reemplaza todas sus tarjetas.

| Acción / condición | Resultado |
| --- | --- |
| Inicio con ≥2 productos | Primer ID del orden recibido; temporizador 5000 ms si no hay pausas y movimiento normal. |
| Tick | Siguiente ID circular; un cambio por período completo. |
| Miniatura hover de ratón | Selección inmediata del ID indicado; mantiene pausa por hover. |
| Miniatura clic/toque/Enter/Espacio | Misma selección, sin necesitar hover. |
| Flechas | Anterior/siguiente circular; conserva foco en control. |
| Swipe izquierda/derecha | Siguiente/anterior; no dispara pedido/enlace. |
| Foco, hover o contacto activos | Cancelar avance; pausas independientes. |
| Fin de todas las pausas | Reiniciar cinco segundos completos antes del siguiente cambio. |
| Movimiento reducido | Sin autoplay ni transición no esencial; todos los medios manuales disponibles. |
| Tema cambia | Solo apariencia; conservar ID activo, foco y estado del hook. |
| Vacío/carga/error | Estado correspondiente y sin productos ficticios; error con recuperación actual. |
| Solo un producto | Mostrar datos sin temporizador/flechas/miniaturas redundantes. |
| Actualización de lista recibida | Conservar ID si existe o pasar al primero; sin refresco nuevo entre pestañas. |

Los gestos se reconocen solo en la superficie de fotografía, no desde controles/enlaces: distancia horizontal ≥40 px y >1.5× vertical, un puntero principal, cancelación limpia. `touch-action: pan-y pinch-zoom`; vertical/corto/cancelado no cambia selección. Un swipe aceptado no puede terminar activando un enlace.

Semántica: región etiquetada «Productos del catálogo», indicador «Producto N de M» y miniatura activa con `aria-current`. Flechas nativas con nombre accesible, miniaturas con «Ver [nombre]», foco visible; no simular tabs si no se implementa todo su comportamiento. Únicamente el producto actual es interactivo/legible; capas salientes de animación, si existen, son decorativas y no enfocables. No anunciar cada rotación automática con aria-live.

Transición normal: 240 ms, permitida entre 150–400 ms; sin esperar su fin para acciones, mover foco o reiniciar animaciones de aparición una vez por visita. Movimiento reducido detectado también durante la visita: cancelar temporizador y omitir transición inmediatamente. Reanudar normal espera un período nuevo si las demás condiciones permiten.

Diseño adaptable: fotos `object-fit: contain`, miniaturas sin deformación y franja con overflow propio; página sin desplazamiento horizontal. Mantener 44×44 de acción, contraste 4.5:1 en texto normal y 3:1 en texto grande/controles necesarios/foco, según 002. Verificar anchos 360/768/1366 y texto 200 %, ambos temas, sin esconder información esencial tras hover.

## Invariantes de conservación

Ninguna navegación, selección, preview o borrador escribe productos, imágenes o credenciales. El catálogo sigue completo y ordenado como antes. Inicio/cierre de sesión, altas/eliminaciones, validaciones y persistencia conservan sus contratos. Los nuevos helpers no serializan configuración interna. Todos los datos de pruebas provienen de fixtures aislados; no se reinicia la base para mostrar el carrusel.
