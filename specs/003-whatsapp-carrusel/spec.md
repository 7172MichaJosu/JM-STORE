# Feature Specification: JM-STORE — Pedidos WhatsApp y carrusel de productos

**Feature Branch**: `003-whatsapp-carrusel`

**Created**: 2026-10-27

**Status**: Specify, Clarify, Plan y Tasks completados; implementación recuperada y verificación técnica local completada en laptop. Aceptación externa pendiente (T032–T034); resultados y límites en [evidencia/aceptacion.md](evidencia/aceptacion.md). Feature sin cierre.

**Input**: Mejorar los pedidos por WhatsApp para incluir emojis, nombre, descripción completa, precio en soles y enlace individual del producto; ese enlace debe mostrar fotografía y detalles y preparar vista previa con imagen en WhatsApp mediante metadatos apropiados cuando la tienda esté publicada en Internet. El cliente revisa y envía el mensaje desde WhatsApp. Agregar un carrusel moderno e interactivo en portada con productos existentes, avance automático, miniaturas con cambio al pasar el puntero, flechas y gesto de deslizamiento en celulares. Mantener modos claro y oscuro y preservar productos, fotografías, credenciales, base de datos y funcionalidades actuales.

## Clarifications

### Session 2026-10-27

- Q: Cuando JM-STORE se ejecuta en localhost, ¿qué debe incluir el borrador de WhatsApp como enlace del producto? → A: Usar la URL local; sirve en el mismo equipo. Cuando la tienda esté publicada, se usa la dirección pública.
- Q: ¿Qué debe mostrar WhatsApp cuando el cliente comparte el enlace individual de un producto desde una tienda publicada en Internet? → A: Imagen, nombre y descripción del producto.
- Q: ¿Qué formato de emojis y etiquetas debe usar cada borrador de WhatsApp para presentar el producto? → A: Saludo + 📦 producto, 📝 descripción, 💰 precio y 🔗 enlace.
- Q: ¿Cómo debe avanzar automáticamente el carrusel y qué debe hacer mientras una persona interactúa con él? → A: Cambiar cada 5 segundos y pausar al apuntar, enfocar o tocar; reanudar al terminar la interacción.
- Q: Cuando el dispositivo tiene activada la opción de movimiento reducido, ¿qué debe hacer el carrusel? → A: Detener la rotación automática y conservar flechas, miniaturas y deslizamiento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compartir un producto por WhatsApp (Priority: P1)

Como cliente, quiero abrir una conversación con un borrador claro que identifique el producto y permita consultar su página individual antes de decidir si lo envío.

**Why this priority**: WhatsApp es el canal de pedidos de JM-STORE. Un mensaje completo y un enlace útil reducen la confusión entre productos y facilitan compartir o revisar la oferta.

**Independent Test**: Con tres productos de prueba, cada uno con nombre, descripción larga, fotografía y precio, activar su pedido y comprobar el borrador en WhatsApp sin enviarlo; abrir cada enlace en un navegador y comprobar que presenta los datos e imagen del producto correcto.

**Acceptance Scenarios**:

1. **Given** un producto visible con nombre, descripción, fotografía y precio, **When** el cliente activa «Pedir por WhatsApp», **Then** se abre WhatsApp con un borrador listo para revisar que incluye emojis, nombre, descripción completa, precio en soles con formato `S/ 49.90` y enlace individual de ese producto, sin datos de otro producto.
2. **Given** que WhatsApp muestra el borrador preparado, **When** el cliente no lo modifica y decide enviarlo, **Then** el mensaje solo se envía tras su acción explícita en WhatsApp; abrir la conversación no confirma ni envía un pedido automáticamente.
3. **Given** un enlace individual válido, **When** una persona lo abre, **Then** ve la fotografía, nombre, descripción completa y precio del producto enlazado, incluso al entrar directamente sin haber recorrido previamente la portada.
4. **Given** que la tienda está publicada con una dirección pública segura, **When** una aplicación de mensajería obtiene una vista previa del enlace, **Then** la vista previa identifica el producto y presenta su fotografía representativa y detalles mediante metadatos que pueda interpretar un servicio externo.
5. **Given** que el producto enlazado ya no pertenece al catálogo o no se puede consultar, **When** se abre su dirección individual, **Then** se muestra un estado comprensible de producto no disponible y no se presenta como vigente información distinta o inventada.

---

### User Story 2 - Explorar productos en la portada (Priority: P1)

Como cliente, quiero recorrer visualmente productos reales desde la portada y cambiar el producto protagonista con los controles que me resulten cómodos.

**Why this priority**: La portada debe descubrir productos del catálogo actual y ofrecer navegación cómoda con ratón, controles visibles y tacto.

**Independent Test**: Con cuatro o más productos conocidos, abrir la portada en escritorio y celular, comprobar la rotación y navegar entre elementos por miniaturas, flechas y gesto táctil; repetir en tema claro y oscuro.

**Acceptance Scenarios**:

1. **Given** un catálogo con productos, **When** se abre la portada, **Then** el carrusel presenta automáticamente productos existentes con sus fotografías y datos guardados, cambiando cada 5 segundos mientras no haya interacción, sin crear productos ficticios.
2. **Given** un carrusel con varias miniaturas visibles, **When** el cliente pasa el puntero sobre una miniatura, **Then** esa miniatura selecciona el producto correspondiente y el cambio tiene una transición suave.
3. **Given** un carrusel con más de un producto, **When** el cliente activa una flecha, **Then** se muestra el producto anterior o siguiente según la dirección, y se puede repetir la navegación sin perder el acceso al resto del catálogo.
4. **Given** la portada en un celular con más de un producto, **When** el cliente desliza sobre el carrusel, **Then** cambia al producto contiguo en la dirección del gesto sin activar por error un pedido ni impedir el desplazamiento normal de la página.
5. **Given** el carrusel visible en modo claro o oscuro, **When** el cliente navega sus elementos y controles, **Then** texto, imágenes, indicadores y controles mantienen contraste y legibilidad, y el contenido continúa siendo utilizable en ambos modos.
6. **Given** un catálogo vacío, **When** se abre la portada, **Then** no se muestran elementos ficticios ni controles que impliquen productos disponibles y se presenta un estado vacío coherente con la tienda.

## Edge Cases

- El catálogo contiene un solo producto: se presenta ese producto y la navegación automática o manual no simula un cambio a contenido distinto.
- Una descripción contiene tildes, emojis, símbolos, saltos de línea o texto extenso: el borrador y la página individual conservan el texto completo y legible.
- Un producto carece temporalmente de fotografía o esta no carga: los detalles permanecen accesibles, se muestra un reemplazo identificable y la vista previa no apunta a una fotografía de otro producto.
- La tienda se ejecuta en localhost: el borrador incluye un enlace local que solo sirve en el mismo equipo. Sin dirección pública segura no se afirma que terceros puedan abrirlo ni que exista vista previa externa. Publicada la tienda, se usa su dirección pública HTTPS para el enlace individual y la vista previa.
- Hay cambios en el catálogo durante la visita: el carrusel solo utiliza productos que devuelve el catálogo existente y no duplica un mismo producto en una navegación completa cuando hay elementos suficientes.
- El carrusel recibe gestos cortos, verticales o iniciados sobre un control: solo un gesto horizontal intencional cambia el producto; controles y desplazamiento vertical conservan su comportamiento.
- El usuario activa movimiento reducido: se detiene la rotación automática y no se reproducen transiciones no esenciales; flechas, miniaturas y deslizamiento siguen disponibles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada acción de pedido por WhatsApp DEBE abrir un borrador dirigido al destino comercial existente y correspondiente únicamente al producto seleccionado. La apertura DEBE dejar la revisión y el envío bajo decisión expresa del cliente en WhatsApp.
- **FR-002**: El mensaje preparado DEBE iniciar con un saludo y presentar los campos con este formato y emojis: `📦 Producto: [nombre]`, `📝 Descripción: [descripción completa]`, `💰 Precio: [S/ 49.90]` y `🔗 Enlace: [dirección individual]`. DEBE conservar fielmente tildes, símbolos y caracteres de los datos guardados, sin cortar la descripción ni mezclar otro producto.
- **FR-003**: La dirección individual DEBE permitir consultar la fotografía y los detalles completos del producto asociado sin requerir una visita previa a la portada. Si el producto ya no está disponible, la página DEBE indicarlo claramente y no sustituirlo por otro.
- **FR-004**: Cuando JM-STORE tenga una dirección pública segura, el enlace individual DEBE ofrecer metadatos para que WhatsApp pueda generar una vista previa con fotografía, nombre y descripción del producto. La imagen y los datos DEBEN corresponder al mismo producto enlazado.
- **FR-005**: El carrusel de portada DEBE poblarse exclusivamente con productos existentes en el catálogo vigente, utilizando sus fotografías y detalles, y DEBE recorrerlos automáticamente cada 5 segundos cuando haya más de uno.
- **FR-006**: El cliente DEBE poder seleccionar un producto del carrusel mediante miniaturas al pasar el puntero, flechas de navegación y gesto de deslizamiento en celulares. Cada método DEBE seleccionar el producto que indica y mantener el resto del catálogo accesible.
- **FR-007**: El carrusel DEBE pausar el avance automático mientras una persona apunta a él, lo enfoca o interactúa mediante tacto, y reanudarlo al terminar la interacción. Si el dispositivo indica preferencia de movimiento reducido, DEBE detener la rotación automática y omitir transiciones no esenciales, conservando la navegación manual. En uso normal, los cambios DEBEN usar transiciones suaves que no bloqueen las acciones.
- **FR-008**: El carrusel, sus controles y las páginas individuales DEBEN conservar una presentación legible, moderna y profesional en los modos claro y oscuro y adaptarse a celular, tablet y computadora.
- **FR-009**: Cuando no existan productos, el carrusel DEBE mostrar un estado vacío en lugar de productos de ejemplo. Con un solo producto, no DEBE aparentar que rota a productos diferentes.
- **FR-010**: La funcionalidad DEBE conservar todos los productos, fotografías, credenciales, datos y funcionalidades existentes. No DEBE recrear, borrar, restablecer ni migrar destructivamente datos existentes.
- **FR-011**: Los textos propios de la tienda y los mensajes preparados DEBEN estar en español de Perú; los precios DEBEN expresarse en soles peruanos con el formato `S/ 49.90`.
- **FR-012**: La solución NO DEBE añadir pagos en línea, cuentas de clientes ni solicitar datos personales adicionales para preparar o compartir un pedido.

### Key Entities *(include if feature involves data)*

- **Producto existente**: producto ya gestionado por JM-STORE, con identidad individual, nombre, descripción, fotografía y precio. El carrusel, la página individual, la vista previa y el borrador WhatsApp presentan el mismo registro; esta feature no define atributos comerciales nuevos.
- **Enlace individual de producto**: dirección compartible que permite localizar y consultar un producto específico y se incluye en el mensaje de WhatsApp.
- **Vista previa compartida**: representación externa asociada al enlace, con imagen e identificación del producto cuando exista una dirección pública segura y el servicio externo interprete sus metadatos.
- **Carrusel de portada**: presentación navegable de productos existentes con elemento actual y medios de selección automática, puntero, flechas y gesto táctil. No constituye un catálogo separado ni un inventario de destacados.
- **Borrador de pedido**: mensaje transitorio para WhatsApp con los datos y enlace del producto seleccionado; no representa un pedido enviado, una reserva ni una venta confirmada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 — Borrador correcto**: Con cinco productos de prueba distintos, incluidos nombre y descripción con tildes, símbolos y una descripción de al menos 500 caracteres, se abren cinco borradores. En los cinco aparecen el saludo, las etiquetas con emojis aprobados (`📦`, `📝`, `💰`, `🔗`), el nombre, el 100 % de la descripción, el precio correcto como `S/ 49.90` y el enlace del producto correspondiente, sin enviar automáticamente ningún mensaje.
- **SC-002 — Página de producto**: Al abrir directamente cada uno de diez enlaces de productos de prueba desde una nueva sesión, en los diez casos se identifican nombre, precio y descripción completos y se ve la fotografía correspondiente; cuando se simula un producto retirado, se observa el estado de no disponibilidad y no se muestra otro producto como sustituto.
- **SC-003 — Vista previa externa**: Con la tienda disponible mediante su dirección pública segura, al compartir tres enlaces de productos distintos en WhatsApp, cada vista previa presenta la fotografía, nombre y descripción que corresponden al producto compartido. La comprobación registra el resultado y distingue limitaciones de WhatsApp de los metadatos ofrecidos por JM-STORE.
- **SC-004 — Navegación del carrusel**: Con ocho productos y el carrusel en pantalla, se comprueban diez cambios automáticos separados por cinco segundos y diez selecciones por cada método manual disponible según el dispositivo (miniatura, flecha y deslizamiento); también se verifica que el avance se pausa durante el uso y se reanuda después; el 100 % muestra el producto indicado y conserva acceso al catálogo completo.
- **SC-005 — Catálogo vacío y unitario**: Con cero productos, el carrusel presenta solo el estado vacío; con un producto, lo mantiene visible sin insinuar que existe otro. Con movimiento reducido y varios productos, no hay rotación automática, pero se pueden seleccionar productos manualmente. Estos resultados se comprueban desde la portada en claro y oscuro.
- **SC-006 — Uso adaptable y presentación**: A 360, 768 y 1366 píxeles de ancho, una persona puede identificar el producto actual y cambiarlo mediante los controles disponibles sin superposición, pérdida de legibilidad ni desplazamiento horizontal de página. En ambos modos, todos los controles son visibles y operables; el tiempo de transición normal se mantiene entre 150 y 400 milisegundos. Con movimiento reducido, no hay rotación automática ni transiciones no esenciales, y se completan diez cambios manuales mediante controles disponibles.
- **SC-007 — Conservación de datos y funciones**: Con una relación previa de productos, fotografías y funcionalidades del entorno de comprobación, comparar desde la aplicación antes y después de la funcionalidad. El 100 % de los productos mantiene sus datos e imagen, y las acciones existentes de catálogo y gestión siguen disponibles sin cambios de credenciales ni pérdida de datos.

## Assumptions

- **A-01 — Continuidad del producto**: Rigen [AGENTS.md](../../AGENTS.md), la [Constitution 1.0.0](../../.specify/memory/constitution.md), la [spec base 001](../001-catalogo-pedidos-whatsapp/spec.md) y la [spec de rediseño 002](../002-rediseno-visual/spec.md). Esta feature amplía la solicitud individual por WhatsApp e incorpora navegación de productos en portada; las funcionalidades previas de catálogo, acceso y gestión conservan su vigencia salvo requisitos expresamente modificados aquí.
- **A-02 — URL pública y vista previa**: Durante ejecución local, el borrador usa una dirección local utilizable desde el mismo equipo. En Internet se usa la dirección HTTPS pública estable para que terceros puedan abrir páginas e imágenes. La vista previa de WhatsApp debe mostrar fotografía, nombre y descripción; su aparición depende de que WhatsApp consulte e interprete los metadatos y no puede garantizarse cuando el servicio externo no lo haga.
- **A-03 — Producto individual y pedido**: Cada botón continúa correspondiendo a un solo producto, sin cantidades ni totales. El enlace identifica el producto seleccionado y el mensaje mantiene la revisión y el envío manual en WhatsApp.
- **A-04 — Carrusel**: El orden de productos es el orden actual del catálogo. No hay selección manual de destacados, nuevos campos, productos de demostración ni catálogo separado. Conforme a Clarify, el avance automático ocurre cada cinco segundos, se pausa mientras una persona apunta, enfoca o interactúa mediante tacto y se reanuda al terminar la interacción. Con movimiento reducido se detiene la rotación automática y se conserva la navegación manual.
- **A-05 — Preservación**: Se conservan la base de datos, productos, fotografías, credenciales externas y demás datos y funciones actuales. No se piden datos adicionales de clientes ni se exponen secretos en mensajes, errores o documentación.
- **A-06 — Continuidad SDD**: Specify y Clarify están completados y el diseño técnico se documenta en [plan.md](plan.md) y sus artefactos de fase 0/1. No se han generado Tasks ni ejecutado Implement; la aceptación y las comprobaciones de esta spec permanecen pendientes. La fase Plan conserva las cinco respuestas aprobadas y no incorpora decisiones nuevas de producto.







