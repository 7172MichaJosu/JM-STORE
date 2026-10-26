# Contrato de interfaz — JM-STORE

Diseño para FR-001–FR-004, FR-009–FR-019. Rutas y estados futuros; no se crean pantallas en Plan.

## Reglas comunes

- Documento con idioma `es-PE`, identidad JM-STORE y textos propios en español de Perú. Precio uniforme `S/ 49.90` en tarjeta y borrador.
- Paleta compartida: fondo marfil, superficies claras, verde profundo principal, texto oscuro y acento cálido. Tipografía de sistema, escala/espaciado coherentes y jerarquía nombre → descripción → precio → acción. Comprobar contraste de texto normal ≥4.5:1 y controles/foco distinguibles; acento no se usa como único portador de información.
- Tarjetas alineadas mediante Grid adaptable, sin altura fija de descripción ni texto truncado. Imagen con proporción reservada y `object-fit: contain`, para no ocultar partes del producto. Reorganización a 360, 768 y 1366 px sin desplazamiento horizontal de página ni superposición.
- Campos con etiquetas visibles; controles nativos, foco visible, estados de interacción y objetivos táctiles de al menos 44 px. Teclado y tacto completan todas las acciones. No depender de hover, color o animación. Texto al 200 % sin controles inaccesibles.
- Transiciones de 150–200 ms para color, foco y aparición breve, sin parpadeos. `prefers-reduced-motion: reduce` elimina movimiento no esencial; nunca oculta contenido ni bloquea acciones.
- Mensajes de resultado en región anunciable, errores de campo asociados a su control, primer error accesible por foco. No mostrar trazas, nombres internos de archivos, SQL, credenciales ni datos personales.
- Las validaciones propias sustituyen mensajes automáticos del navegador que puedan aparecer en otro idioma. El selector conserva accesibilidad nativa, con etiquetas/estado visibles propios en español; las ventanas del sistema para elegir archivo son externas a JM-STORE.

## `/` — Catálogo público

Consulta sin cuenta, con solo acciones de consulta/pedido dentro del catálogo. El acceso del encargado tiene ruta diferenciada; no se muestran botones de alta o eliminación en las tarjetas públicas.

| Estado | Presentación y acción |
| --- | --- |
| Cargando | «Cargando productos…»; no confundir con vacío. |
| Listo con productos | Una tarjeta por ID con imagen, nombre, descripción, precio y «Pedir por WhatsApp». Todos los productos son consultables, sin filtros ni paginación funcional añadida. |
| Listo sin productos | «Por el momento no hay productos disponibles»; sin tarjetas ficticias ni botones de pedido. |
| Error de lectura | «No pudimos cargar los productos» y «Reintentar»; no mostrar estado vacío. |
| Imagen fallida | Reemplazo con «Imagen no disponible», conservando texto, precio y pedido. No repetir indefinidamente la petición rota. |
| Destino ausente/inválido | «Los pedidos por WhatsApp no están disponibles por el momento»; botón deshabilitado sin enlace activo, con explicación accesible. Los productos siguen visibles. |

Nombre/descripción se representan como texto, incluidos caracteres que parezcan HTML. Deben leerse completos mediante el desplazamiento vertical normal. Cada imagen utiliza texto alternativo que identifica el producto. Las imágenes inferiores pueden cargarse de forma diferida; el primer grupo se prioriza para SC-001.

Una activación de «Pedir por WhatsApp» navega al enlace del producto, según [whatsapp.md](whatsapp.md). No se solicita dato alguno del cliente ni se añade confirmación intermedia. Al regresar, el catálogo sigue disponible; sin mensaje de pedido enviado.

## `/encargado/ingresar` — Acceso

Campos «Usuario» y «Contraseña» y botón «Iniciar sesión». Contraseña oculta; sin registro público, recuperación ni elección de roles.

- Datos vacíos: «Ingresa tu usuario» / «Ingresa tu contraseña» asociados al campo.
- Mientras verifica: «Iniciando sesión…», sin segunda petición concurrente.
- Credenciales incorrectas: «No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo». No indicar si el usuario existe ni repetir valores.
- Límite temporal: «Espera unos minutos antes de volver a intentarlo»; permitir reintento tras el plazo indicado por el servidor.
- Error técnico: «No pudimos iniciar sesión. Inténtalo de nuevo»; sin detalles internos.
- Éxito: acceder a gestión. Un acceso ya autenticado puede dirigirse directamente a esa vista.

## `/encargado` — Gestión protegida

Antes de habilitar controles, `GET /api/sesion` debe confirmar autenticación. Durante la comprobación: «Verificando acceso…». Sin sesión o con sesión vencida: acceso, sin alta/eliminación activas. Un error al verificar no concede acceso y permite reintentar.

La gestión incluye listado de productos, formulario para agregar y «Cerrar sesión». Sin edición ni otras operaciones comerciales. Revalidar al entrar, recuperar foco de la ventana o restaurar desde historial; ocultar controles durante la revalidación. El servidor protege siempre cada operación aunque una tarjeta antigua siga en una pestaña.

### Alta

Solo «Nombre», «Descripción», «Imagen» y «Precio (S/)». Imagen desde selector del dispositivo, sin opción para enlaces. Texto de ayuda: JPEG, PNG o WebP estático; máximo 10 MiB y 25 millones de píxeles. Mostrar previsualización utilizable antes de guardar. Límites de nombre 4 KiB y descripción 32 KiB informados; no cortar textos al escribir.

Precio con teclado decimal cuando exista; ayuda «Usa hasta dos decimales, sin separadores de miles». Aceptar punto o coma decimal; mostrar siempre importes con punto. Validación completa en servidor además de controles del navegador.

| Estado | Comportamiento |
| --- | --- |
| Editando | Se pueden revisar campos y previsualización. |
| Inválido | Señalar campos por corregir, conservar los demás; no enviar alta inválida. Ejemplos: «Ingresa un nombre», «Ingresa una descripción», «Selecciona una imagen válida», «Ingresa un precio mayor que cero con hasta dos decimales». |
| Guardando | «Guardando…»; bloquear Guardar y nuevos envíos inmediatamente, incluidos Enter y doble toque. |
| Guardado | «Producto agregado correctamente» solo tras `201`; actualizar listado mediante nueva consulta; limpiar formulario después del éxito. |
| Fallo | «No pudimos guardar el producto. Inténtalo de nuevo»; sin éxito ni cambio optimista; conservar campos y archivo para reintentar. |
| Sesión inválida | «Tu sesión terminó. Inicia sesión para continuar»; no reenviar automáticamente después de ingresar. Borrador solo en memoria y oculto mientras no exista sesión. |

Los errores `413/422` se asocian al campo pertinente, con formatos/límites concretos. Si solo falla la recarga del listado tras un `201`, conservar la confirmación del alta y explicar el error de actualización; no ofrecer repetir un guardado que ya fue confirmado.

### Eliminación

Acción «Eliminar» vinculada al ID concreto. Abrir diálogo «¿Eliminar “[nombre]”?», con «Cancelar» y «Eliminar». El foco inicial permite cancelar, se mantiene dentro del diálogo y vuelve al control de origen al cerrar si existe. Escape cancela antes de iniciar la operación.

- Cancelar: ninguna petición de eliminación, datos intactos.
- Confirmar: «Eliminando…», bloquear nuevas confirmaciones de esa operación. No retirar otro ID ni reutilizar el ID de una tarjeta seleccionada posteriormente.
- `204`: «Producto eliminado correctamente», cerrar diálogo y actualizar listado. Si era el último, estado vacío.
- Fallo de escritura: «No pudimos eliminar el producto. Inténtalo de nuevo»; sin éxito; permanece en la siguiente consulta.
- `404`: «El producto ya no está disponible», recargar listado; no afirmar que esta petición lo eliminó.
- Si falla la actualización posterior a un `204`, informar el fallo de carga, conservando el resultado ya confirmado de la eliminación.

### Cierre de sesión

«Cerrar sesión» llama al servidor; solo tras revocación confirmada se limpia gestión y se dirige al acceso. Si ya no hay sesión, el cierre puede completarse igualmente. Un error de comunicación muestra «No pudimos confirmar el cierre de sesión. Inténtalo de nuevo» y no afirma éxito.

Volver con historial, visitar la ruta directamente o repetir una petición con una cookie revocada nunca permite modificar productos. El catálogo sigue siendo público. No se confía en ocultar controles como sustituto de autorización.

## Verificación vinculada

H1.1–H1.8, H2.1–H2.5, H3.1–H3.10 y H4.1–H4.5 se verifican mediante V-01–V-09 de [../quickstart.md](../quickstart.md). Todos los estados anteriores requieren revisión de idioma/moneda, teclado, anchos y datos sensibles. La aceptación sigue pendiente de Implement.
