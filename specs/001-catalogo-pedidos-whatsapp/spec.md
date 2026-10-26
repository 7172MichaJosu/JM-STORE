# Feature Specification: JM-STORE — Catálogo y pedidos por WhatsApp

**Feature Branch**: `001-catalogo-pedidos-whatsapp`

**Created**: 2026-10-26

**Status**: Clarify completado; dos aclaraciones registradas. Aceptación en la aplicación pendiente.

**Input**: Crear una tienda virtual JM-STORE con catálogo visual, alta y eliminación persistentes de productos, solicitudes individuales por WhatsApp, diseño moderno, interactivo y adaptable, español de Perú y precios en soles. Respetar AGENTS.md y la Constitution. En este paso elaborar únicamente la especificación funcional.

## Clarifications

### Session 2026-10-26

- Q: ¿La gestión para agregar y eliminar productos se usará solo en un entorno controlado del laboratorio o deberá estar protegida para una tienda accesible por internet? → A: Opción B: tienda accesible por internet; inicio de sesión obligatorio para que únicamente el encargado agregue o elimine productos. Los clientes consultan y solicitan productos sin cuenta.
- Q: ¿Cómo debe proporcionar el encargado la imagen de cada producto? → A: Opción A: subir un archivo desde su dispositivo; la tienda conserva una copia propia aunque se elimine el archivo original.

## User Scenarios & Testing *(mandatory)*

Los actores son el **cliente**, que consulta el catálogo público e inicia una conversación por WhatsApp sin cuenta, y el **encargado**, que inicia sesión para agregar y eliminar productos y puede cerrar su sesión. Las comprobaciones siguientes se ejecutarán en la aplicación durante implement; su inclusión aquí no significa que ya se hayan probado.

### User Story 1 - Consultar el catálogo desde cualquier dispositivo (Priority: P1)

Como cliente, quiero reconocer los productos de JM-STORE por su imagen, nombre, descripción y precio para decidir cuál solicitar.

**Why this priority**: El catálogo permite conocer la oferta y es el punto de entrada a los pedidos.

**Independent Test**: Con tres productos de prueba previamente cargados, abrir el catálogo en celular, tablet y computadora y comparar cada tarjeta con los datos entregados por el encargado.

**Acceptance Scenarios**:

1. **Given** tres productos guardados, **When** el cliente abre el catálogo, **Then** ve la identidad JM-STORE y una tarjeta por producto, con su imagen, nombre, descripción, precio con dos decimales —por ejemplo, `S/ 49.90`— y el botón «Pedir por WhatsApp».
2. **Given** un catálogo sin productos, **When** se abre, **Then** aparece «Por el momento no hay productos disponibles» y no se muestran tarjetas ficticias ni botones de pedido sin producto.
3. **Given** el mismo catálogo, **When** se consulta a anchos de 360, 768 y 1366 píxeles, **Then** las tarjetas se reorganizan, los textos y botones se pueden leer y usar, y no existe desplazamiento horizontal de la página ni contenido superpuesto.
4. **Given** un nombre o descripción extensos, **When** se consulta la tarjeta, **Then** se puede leer el contenido completo sin que tape el precio o el botón, incluso al ampliar el texto al 200 %.
5. **Given** una imagen que dejó de estar disponible, **When** se consulta el producto, **Then** se muestra un reemplazo con el texto «Imagen no disponible» y se conservan legibles sus datos y su botón de pedido.
6. **Given** una carga en curso o una carga del catálogo que falla, **When** el cliente observa la página, **Then** distingue respectivamente «Cargando productos…» o «No pudimos cargar los productos»; el error permite reintentar y no se confunde con un catálogo vacío.
7. **Given** el catálogo y la gestión, **When** una persona recorre sus controles con teclado o pantalla táctil, **Then** puede activar las acciones; el foco es visible, los campos tienen etiquetas y ninguna información necesaria depende de pasar el puntero sobre un elemento.
8. **Given** los controles y tarjetas, **When** se interactúa con ellos, **Then** comparten colores, tipografía y jerarquía visual coherentes, muestran estados de interacción y transiciones sin parpadeos; si el dispositivo solicita movimiento reducido, se suprimen las animaciones no esenciales.

---

### User Story 2 - Solicitar un producto por WhatsApp (Priority: P1)

Como cliente, quiero iniciar una conversación con la tienda desde la tarjeta del producto y encontrar un mensaje preparado para evitar copiar sus datos manualmente.

**Why this priority**: WhatsApp es el único canal de pedido previsto y completa el objetivo comercial del catálogo.

**Independent Test**: Con un producto y el destino comercial de prueba preparados, pulsar «Pedir por WhatsApp» y revisar el destinatario y el borrador sin enviarlo.

**Acceptance Scenarios**:

1. **Given** un producto llamado «Taza & café + plato», descripción «Cerámica, color azul» y precio `S/ 49.90`, **When** se pulsa su botón de pedido, **Then** se abre WhatsApp, o su pantalla de acceso disponible en ese dispositivo, con el destinatario comercial configurado y un mensaje preparado que corresponde a ese producto.
2. **Given** el acceso a WhatsApp disponible, **When** se revisa el mensaje preparado, **Then** conserva el nombre, la descripción y el precio visibles en la tarjeta, incluidos tildes, espacios y signos como `&` y `+`, y está en español de Perú.
3. **Given** dos productos distintos, **When** se abre sucesivamente el botón de cada tarjeta, **Then** cada borrador contiene únicamente la información del producto pulsado.
4. **Given** el borrador abierto, **When** el cliente decide no enviarlo y regresa a JM-STORE, **Then** el catálogo sigue disponible y la tienda no presenta el pedido como enviado, confirmado o pagado.
5. **Given** un destino comercial ausente o inválido detectado por JM-STORE, **When** se consulta el producto, **Then** se indica «Los pedidos por WhatsApp no están disponibles por el momento» y no se habilita un enlace hacia un destinatario incorrecto.

---

### User Story 3 - Agregar un producto y conservarlo (Priority: P2)

Como encargado, quiero registrar un producto para incorporarlo a la oferta sin modificar manualmente el catálogo.

**Why this priority**: Permite mantener la oferta con las operaciones expresamente solicitadas.

**Independent Test**: Iniciar sesión como encargado, agregar un producto con datos ficticios desde la gestión, recargar el catálogo y abrirlo en una nueva sesión de navegación sin autenticar para comprobar que sigue presente. Comprobar además los escenarios de acceso H3.6 a H3.9.

**Acceptance Scenarios**:

1. **Given** el encargado con sesión iniciada en la gestión, **When** registra nombre y descripción, sube un archivo de imagen desde su dispositivo que puede visualizar al registrar, ingresa un precio válido y guarda, **Then** recibe confirmación de éxito y el producto aparece una sola vez con esos datos al consultar el catálogo actualizado.
2. **Given** campos obligatorios vacíos o con solo espacios, una imagen no utilizable al registrar o un precio no numérico, cero, negativo o con más de dos decimales, **When** intenta guardar, **Then** no se crea el producto y se señala en español qué datos debe corregir, conservando los demás datos ingresados.
3. **Given** un producto guardado correctamente, **When** se recarga, se cierra y vuelve a abrir el navegador o se consulta después de un reinicio de la aplicación preparado por el responsable del laboratorio, **Then** el producto sigue disponible con los mismos datos.
4. **Given** un guardado en curso, **When** se intenta pulsar nuevamente «Guardar», **Then** la acción permanece bloqueada mientras se resuelve y no se crean duplicados por esa repetición.
5. **Given** un fallo de guardado preparado por el responsable de la prueba, **When** se intenta agregar el producto, **Then** se informa que no se pudo guardar, no se anuncia éxito, se conservan los datos ingresados y se permite reintentar sin alterar los productos existentes.
6. **Given** una sesión de navegación sin autenticar, **When** se intenta abrir directamente la gestión, **Then** se solicita iniciar sesión y no se permite agregar ni eliminar productos; el catálogo público sigue disponible.
7. **Given** el acceso válido del único encargado preparado por el responsable, **When** inicia sesión, **Then** puede acceder a la gestión y completar altas y eliminaciones.
8. **Given** datos de acceso incorrectos, **When** se intenta iniciar sesión, **Then** se informa que no se pudo iniciar sesión, no se concede acceso a la gestión y los productos conservan sus datos.
9. **Given** una sesión iniciada como encargado, **When** se cierra sesión y se intenta volver a la gestión, incluso con la opción de retroceder del navegador, **Then** se solicita iniciar sesión nuevamente y no se permite agregar ni eliminar productos.
10. **Given** un producto guardado con una imagen de prueba subida desde el dispositivo, **When** se elimina el archivo original de prueba de ese dispositivo y se consulta el catálogo en otro dispositivo, tras recargar y después de un reinicio preparado por el responsable, **Then** la misma imagen continúa visible desde la copia conservada por la tienda, junto con los demás datos del producto.

---

### User Story 4 - Eliminar un producto del catálogo (Priority: P2)

Como encargado, quiero retirar un producto para que deje de ofrecerse a los clientes.

**Why this priority**: Completa el mantenimiento básico solicitado sin incorporar edición ni otras operaciones comerciales.

**Independent Test**: Con la sesión del encargado iniciada y dos productos preparados, cancelar una eliminación y luego confirmar la eliminación de uno; recargar el catálogo y verificar que solo permanece el otro.

**Acceptance Scenarios**:

1. **Given** el encargado con sesión iniciada y un producto en la gestión, **When** se elige «Eliminar», **Then** se solicita confirmación indicando su nombre y se permite cancelar sin retirarlo.
2. **Given** la confirmación de eliminación, **When** el encargado la acepta y la operación termina correctamente, **Then** recibe confirmación de éxito y el producto deja de aparecer en la gestión y en las nuevas consultas o recargas del catálogo.
3. **Given** un producto eliminado, **When** se vuelve a abrir el navegador o se consulta después de un reinicio de la aplicación preparado por el responsable del laboratorio, **Then** continúa ausente y los demás productos conservan sus datos.
4. **Given** un fallo de eliminación preparado para la prueba, **When** se confirma la acción, **Then** se informa que no se pudo eliminar, no se anuncia éxito y el producto sigue disponible al recargar.
5. **Given** que solo queda un producto, **When** se elimina correctamente, **Then** el catálogo muestra el estado vacío descrito en la historia 1.

### Edge Cases

- **EC-01 — Datos extensos o caracteres especiales**: nombres y descripciones se muestran como texto, sin ejecutar contenido ingresado; se preservan sus caracteres en la tarjeta y en el borrador de WhatsApp. Ver historias 1.4 y 2.2.
- **EC-02 — Imagen perdida después del alta**: si la copia conservada por la tienda deja de estar disponible, mostrar el reemplazo previsto sin ocultar el resto del producto; no confundir este caso con la validación del archivo al agregarlo. Eliminar el archivo original del dispositivo no debe afectar a la copia de la tienda. Ver H1.5, H3.2 y H3.10.
- **EC-03 — Fallos de lectura o escritura**: distinguir error de catálogo vacío; informar el fallo sin exponer datos personales ni detalles internos y permitir reintentar. Ver historias 1.6, 3.5 y 4.4.
- **EC-04 — Pulsaciones repetidas**: bloquear nuevas confirmaciones de la misma operación mientras esté en curso; la eliminación tampoco debe afectar a otro producto.
- **EC-05 — Tarjeta abierta antes de una eliminación**: el producto desaparece en la siguiente consulta o recarga; no se exige actualizar otras pestañas en tiempo real. Una conversación ya preparada en WhatsApp no se retira ni confirma disponibilidad.
- **EC-06 — WhatsApp no accesible**: el botón dirige al servicio externo y puede requerir que el cliente acceda allí; si el servicio o el dispositivo impiden continuar, JM-STORE no debe afirmar que se envió un pedido. No se exige detectar el estado de sesión o entrega de WhatsApp.
- **EC-07 — Privacidad y pagos**: recorrer catálogo, gestión, acceso del encargado y borrador sin encontrar solicitudes de datos personales del cliente, tarjetas o credenciales bancarias. Los errores preparados para la prueba, incluidos los de inicio de sesión, no revelan secretos ni datos personales.
- **EC-08 — Gestión sin autorización**: intentar acceder directamente a la gestión sin sesión, con datos de acceso incorrectos o después de cerrar sesión no permite agregar ni eliminar productos. La protección debe impedir también operaciones solicitadas directamente sin una sesión válida, aunque no se utilicen los controles de la página. Ver H3.6 a H3.9 y SC-009.

## Requirements *(mandatory)*

### Functional Requirements

Los identificadores de historias y escenarios se expresan como H1.1, H2.1, etc., según su numeración anterior.

- **FR-001**: El sistema DEBE identificar la tienda como JM-STORE y mostrar todos los productos guardados, una tarjeta por producto, con imagen, nombre, descripción, precio y acción de pedido. **Aceptación**: H1.1.
- **FR-002**: El sistema DEBE distinguir los estados de carga, catálogo vacío y error de carga, ofreciendo reintento en este último. **Aceptación**: H1.2, H1.6.
- **FR-003**: Los nombres y descripciones DEBEN poder leerse completos; una imagen que no cargue DEBE tener un reemplazo identificable sin impedir consultar o solicitar el producto. **Aceptación**: H1.4, H1.5; EC-01 y EC-02.
- **FR-004**: Todo texto propio de JM-STORE visible para clientes y encargado, incluidas validaciones, confirmaciones y el mensaje preparado, DEBE estar en español de Perú. Todos los precios DEBEN usar soles, el prefijo `S/`, un espacio y dos decimales, como `S/ 49.90`. **Aceptación**: H1.1, H2.2, H3.2 y SC-006.
- **FR-005**: Cada producto DEBE ofrecer «Pedir por WhatsApp», que inicia en una sola activación la apertura de WhatsApp hacia el destino comercial común. **Aceptación**: H2.1.
- **FR-006**: El mensaje preparado DEBE contener el nombre, descripción y precio del producto seleccionado, conservar sus caracteres y no mezclar información de otros productos. El formato de referencia es: «Hola, JM-STORE. Me interesa este producto: [nombre]. Descripción: [descripción]. Precio: [precio]. ¿Podrían confirmarme su disponibilidad?». Los textos entre corchetes se sustituyen por los datos visibles. **Aceptación**: H2.1 a H2.3.
- **FR-007**: JM-STORE DEBE dejar el envío bajo decisión del cliente en WhatsApp y no presentar la apertura como pedido enviado, venta confirmada, reserva o pago. **Aceptación**: H2.4; EC-05 y EC-06.
- **FR-008**: Cuando falte el destino comercial o se detecte que no tiene un formato telefónico internacional válido, el sistema DEBE informar la indisponibilidad y deshabilitar la acción de pedido. Esta validación no garantiza que el número tenga una cuenta activa en el servicio externo. **Aceptación**: H2.5.
- **FR-009**: La tienda DEBE permitir consultar el catálogo público y solicitar productos sin cuenta de cliente. El único encargado DEBE disponer de una gestión diferenciada, accesible únicamente con sesión iniciada, para agregar y eliminar productos. El catálogo del cliente DEBE presentar únicamente acciones de consulta y pedido. **Aceptación**: H1.1, H2.1, H3.1, H3.6, H3.7 y H4.1; A-02.
- **FR-010**: Para agregar un producto se DEBEN solicitar únicamente nombre, descripción, un archivo de imagen subido desde el dispositivo y precio; no se incluye ingreso mediante enlaces externos. Nombre y descripción DEBEN contener texto distinto de espacios; la imagen DEBE poder visualizarse al registrar; el precio DEBE ser un importe numérico mayor que cero con hasta dos decimales. Los datos inválidos DEBEN impedir guardar y tener mensajes asociados a los campos por corregir. **Aceptación**: H3.1, H3.2 y H3.10.
- **FR-011**: Las altas y eliminaciones DEBEN conservarse de forma persistente. Al agregar se DEBE conservar una copia propia de la imagen subida, visible también desde otros dispositivos y aunque se elimine el archivo original del dispositivo del encargado. Solo se DEBE anunciar éxito después de conservar el cambio y, en el alta, la imagen; una recarga, nueva sesión de navegación o reinicio de la aplicación no DEBE revertirlo. **Aceptación**: H3.3, H3.10, H4.2, H4.3 y SC-003.
- **FR-012**: Antes de eliminar se DEBE identificar el producto y pedir confirmación. Cancelar DEBE conservarlo; confirmar correctamente DEBE retirar solo ese producto. **Aceptación**: H4.1 a H4.3 y H4.5.
- **FR-013**: Durante un alta o eliminación en curso se DEBEN impedir confirmaciones repetidas de esa operación. Si falla, se DEBE informar sin anunciar éxito ni cambiar los demás productos; al agregar se DEBEN conservar los datos para reintentar. **Aceptación**: H3.4, H3.5, H4.4; EC-04.
- **FR-014**: Catálogo y gestión DEBEN ser utilizables en celular, tablet y computadora; a anchos de 360, 768 y 1366 píxeles no DEBEN presentar superposiciones, controles inaccesibles ni desplazamiento horizontal de página. **Aceptación**: H1.3 y SC-005.
- **FR-015**: La presentación DEBE mantener una paleta y tipografía coherentes, jerarquía que distinga nombre, descripción, precio y acción principal, tarjetas alineadas y estados visibles de interacción. Las animaciones y transiciones DEBEN acompañar las acciones sin parpadeos y respetar la preferencia de movimiento reducido. **Aceptación**: H1.8 y SC-007.
- **FR-016**: Los controles DEBEN poder utilizarse con teclado y tacto, con foco visible y etiquetas comprensibles. Ampliar el texto al 200 % no DEBE impedir completar las acciones. La información necesaria no DEBE depender únicamente del color, de animaciones o de pasar el puntero. **Aceptación**: H1.4, H1.7, H1.8 y SC-005.
- **FR-017**: El catálogo y el inicio del pedido NO DEBEN exigir cuenta ni solicitar o guardar nombre, teléfono, dirección u otros datos personales del cliente. Los errores NO DEBEN exponer datos personales, secretos o detalles internos. **Aceptación**: H2.1, H3.5, H4.4; EC-07.
- **FR-018**: La aplicación NO DEBE incluir pagos en línea, pasarelas de pago ni campos de datos de tarjetas o credenciales bancarias. **Aceptación**: EC-07 y SC-006.
- **FR-019**: La gestión y cada operación de alta o eliminación DEBEN exigir una sesión válida del único encargado, incluidas las operaciones solicitadas directamente. Los datos de acceso incorrectos NO DEBEN conceder acceso ni modificar productos. El encargado DEBE poder iniciar y cerrar sesión; tras cerrarla, una nueva operación DEBE requerir autenticación. No se incluye registro público ni administración de cuentas. Las credenciales se suministrarán mediante configuración externa y NO DEBEN aparecer en código, archivos versionados, registros ni mensajes de error. **Aceptación**: H3.6 a H3.9; EC-07, EC-08 y SC-009.

### Key Entities *(include if feature involves data)*

- **Producto**: artículo ofrecido por JM-STORE, distinguible de los demás incluso si comparten nombre. Tiene nombre, descripción, una copia propia de la imagen subida desde el dispositivo del encargado y precio en soles. Se conserva al agregarlo y deja de formar parte del catálogo al eliminarlo correctamente. Su imagen no depende del archivo original del dispositivo ni de un enlace a otro sitio web. No se definen existencias, variantes, categorías ni historial.
- **Acceso del encargado**: acceso único para la persona responsable de agregar y eliminar productos. Requiere iniciar sesión y permite cerrarla; no representa una cuenta de cliente ni habilita registro público. Sus credenciales se suministran externamente.
- **Destino comercial de WhatsApp**: único número de contacto de la tienda, común a todos los productos. Es una dependencia de configuración; esta versión no exige una pantalla para administrarlo.
- **Solicitud preparada de producto**: texto construido con el producto elegido para iniciar una conversación por WhatsApp. Es transitorio; no representa un pedido confirmado ni se guarda como entidad comercial en JM-STORE.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Estas comprobaciones se realizarán con datos ficticios y sin enviar mensajes reales. Cada resultado se registrará durante implement indicando dispositivo, condiciones, acción y resultado observado. El responsable del laboratorio prepara los datos, fallos y reinicios cuando corresponda; la persona que acepta el producto verifica los resultados desde la aplicación, sin consultar código ni la base de datos.

- **SC-001 — Catálogo completo**: Con 20 productos de prueba y conexión estable del laboratorio, al abrir el catálogo se pueden consultar los 20 sin omisiones ni duplicados; el primer grupo de tarjetas tiene nombre, precio y botón utilizables en hasta 3 segundos en al menos 4 de 5 aperturas cronometradas bajo las mismas condiciones.
- **SC-002 — Solicitud correcta**: Con tres productos distintos, incluido «Taza & café + plato» a `S/ 49.90`, al activar una vez el botón de cada uno se accede al destino comercial de prueba y se revisa un borrador con nombre, descripción y precio coincidentes en los tres casos, sin envío automático. Se cuenta con acceso a WhatsApp; el tiempo de inicio de sesión externo no forma parte de la comprobación.
- **SC-003 — Alta persistente**: Con la sesión del encargado iniciada y los datos de un producto ya preparados, incluida una imagen de prueba en su dispositivo, el encargado lo agrega desde la gestión sin ayuda en hasta 2 minutos. Después elimina el archivo original de prueba del dispositivo, recarga, abre otra sesión y consulta el catálogo desde otro dispositivo y después de un reinicio preparado por el responsable. En todas las consultas el producto aparece exactamente una vez, con nombre, descripción, precio y la misma imagen visible.
- **SC-004 — Eliminación persistente**: Con la sesión del encargado iniciada y dos productos presentes, el encargado cancela primero la eliminación de uno y verifica que ambos siguen; después elimina ese producto en hasta 30 segundos. Tras recargar y consultar después de un reinicio preparado por el responsable, el eliminado sigue ausente y el otro conserva todos sus datos.
- **SC-005 — Uso adaptable y accesible**: A anchos de 360, 768 y 1366 píxeles, se completan consulta, apertura del borrador, inicio y cierre de sesión del encargado, alta y eliminación sin superposiciones ni desplazamiento horizontal de página. En una computadora se repiten las acciones solo con teclado y con texto ampliado al 200 %, sin controles inaccesibles; en un celular se completan mediante tacto.
- **SC-006 — Idioma, moneda y límites**: Al recorrer consulta, solicitud, alta, eliminación y acceso del encargado, incluidos sus estados vacío, carga, validación, confirmación y error, el 100 % de los textos propios del producto está en español y el 100 % de los precios usa `S/ 49.90` como patrón. No aparece ningún paso de pago, cuenta de cliente ni solicitud de sus datos personales.
- **SC-007 — Comprensión y presentación**: Con tres tarjetas visibles, al menos 4 de 5 personas que no hayan usado JM-STORE identifican el nombre, precio y acción de pedido de un producto en hasta 30 segundos, sin instrucciones adicionales. La revisión de catálogo y gestión encuentra la misma paleta, tipografía y jerarquía; al activar movimiento reducido se pueden completar las mismas acciones sin animaciones no esenciales.
- **SC-008 — Límites y fallos**: Con los casos preparados de catálogo vacío, imagen perdida, datos inválidos, lectura fallida, guardado fallido, eliminación fallida y destino comercial ausente o inválido, al realizar la acción correspondiente se obtiene en los siete casos el resultado de aceptación definido, sin mensajes de éxito falsos, pérdida de otros productos ni datos sensibles visibles.
- **SC-009 — Gestión protegida y catálogo público**: Con los datos de acceso de prueba del único encargado preparados, en una sesión de navegación sin autenticar se consulta el catálogo y se abre el borrador de WhatsApp sin cuenta. Se intenta abrir directamente la gestión sin sesión y luego con datos de acceso incorrectos: en ambos casos se impide modificar productos. Con el acceso correcto se agrega y elimina un producto ficticio. Al cerrar sesión y volver a la gestión, incluso retrocediendo en el navegador, se vuelve a solicitar autenticación y no se permiten altas ni eliminaciones; el catálogo público continúa disponible.

## Assumptions

- **A-01 — Unidad del pedido**: Cada botón solicita un solo producto. No se seleccionan cantidades ni se calcula un total; precio y descripción corresponden a lo mostrado al iniciar la solicitud. La disponibilidad y los acuerdos comerciales se coordinan en la conversación.
- **A-02 — Encargado y entorno**: Decisión confirmada en clarify: la tienda será accesible por internet, con catálogo y solicitudes sin cuenta de cliente. La gestión estará protegida mediante inicio de sesión del único encargado y permitirá cerrar sesión. No se incluye registro público ni administración de cuentas. La forma técnica de autenticar y mantener la sesión se definirá en plan conforme a FR-019; las credenciales se suministrarán externamente.
- **A-03 — Imágenes y contenido**: Decisión confirmada en clarify: el encargado sube una imagen por producto desde su celular o computadora; la tienda conserva una copia propia, independiente del archivo original del dispositivo. El encargado proporciona nombre y descripción en español. El almacenamiento técnico de la copia se definirá en plan conforme a FR-010 y FR-011, sin añadir galería ni edición de imágenes.
- **A-04 — Destino externo**: Antes de probar la apertura de pedidos, el responsable proporciona un número comercial de WhatsApp válido como configuración externa. No se presupone ni inventa un número real en la especificación. Se requiere conexión y acceso al servicio externo para revisar el borrador completo; sus pantallas y mensajes no son textos propios de JM-STORE.
- **A-05 — Restricciones heredadas**: Por instrucción expresa del usuario y de [AGENTS.md](../../AGENTS.md), la implementación posterior utilizará **React con Vite y SQLite**; altas y eliminaciones se conservarán en esa base de datos. Se registra esta restricción existente sin elegir arquitectura, bibliotecas adicionales, contratos ni estructura de código. Todavía no existen comandos de arranque o pruebas de la aplicación.
- **A-06 — Gobernanza y alcance**: Rige la [Constitution 1.0.0](../../.specify/memory/constitution.md). Quedan fuera de esta versión edición de productos, carrito, pagos en línea, cuentas de clientes, inventario, categorías, búsqueda, filtros, promociones, envíos, historial o seguimiento de pedidos y actualización en tiempo real entre pestañas. Los secretos que pudieran ser necesarios se suministrarán externamente y no se incluirán en archivos versionados.
- **A-07 — Continuidad SDD**: Clarify completado con dos respuestas registradas e integradas y revisión documental de calidad. La siguiente fase es plan, seguida de tasks e implement; no se han generado plan ni tasks ni se ha implementado la aplicación. La aceptación en la aplicación permanece pendiente hasta implement.
