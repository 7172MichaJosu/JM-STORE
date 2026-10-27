# Implementation Plan: JM-STORE — Pedidos WhatsApp y carrusel

**Branch**: `003-whatsapp-carrusel` | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Especificación y cinco respuestas Clarify de `specs/003-whatsapp-carrusel/spec.md`.

**Estado**: Diseño de Plan completado hasta fase 1. Implementación y aceptación pendientes. Este documento no es un registro de trabajo implementado.

## Summary

Ampliar la aplicación actual con borradores WhatsApp que contienen emojis, descripción íntegra, precio en soles y enlace individual. Agregar una página pública por UUID y entregar sus metadatos Open Graph en el HTML inicial de Express. La portada utilizará todos los productos existentes en un carrusel React con avance cada cinco segundos, miniaturas, flechas, gesto táctil, pausa durante interacción y detención bajo movimiento reducido.

Se mantienen React/Vite, Express, SQLite, imágenes persistentes, temas y gestión existentes. Las decisiones y alternativas se documentan en [research.md](research.md); los contratos concretan el resultado verificable.

## Technical Context

**Language/Version**: JavaScript ES modules y JSX, Node.js 24 LTS; CSS propio.

**Primary Dependencies**: Versiones fijadas en el proyecto: React/React DOM 19.3.1, Vite 8.3.5, Express 5.3.0, better-sqlite3 13.0.3, sharp 0.35.5, libphonenumber-js 1.13.15 y multer 2.5.0. Cero paquetes nuevos o actualizaciones para esta feature.

**Storage**: SQLite persistente externa al repositorio, tabla `productos` e imágenes WebP BLOB actuales. Sin migraciones, tablas, columnas, reimportación ni reescritura de fotografías. Se agrega lectura preparada por ID.

**Testing**: node:test, SQLite temporal real y fixtures actuales; Playwright 1.64.1, Chromium completo y Firefox/WebKit básicos. WhatsApp real, HTTPS público y celular físico requieren validación externa separada.

**Target Platform**: Computadoras, tablets y celulares; laboratorio Windows/PowerShell. Vite en `http://localhost:5173`; compilación local Express en `http://127.0.0.1:3001`; publicación posterior HTTPS con `NODE_ENV=production`.

**Project Type**: Aplicación web cliente/API en un paquete ES modules.

**Performance Goals**: Período elegible de 5000 ms y transición de 240 ms (dentro de SC-006 y del estilo de 002). Mantener primer grupo utilizable en ≤3 s en cuatro de cinco aperturas del laboratorio con 20 productos. La ficha lee un producto sin cargar BLOB de todo el catálogo; el derivado social tiene lienzo 1200×630.

**Constraints**: Español de Perú, `S/ 49.90`, fotografía completa sin recorte/deformación, datos y credenciales preservados. Sin router nuevo, biblioteca de carrusel, servicio de previews, envío automático, pagos, cuentas de cliente ni atributos comerciales nuevos. `APP_ORIGIN` mantiene su validación actual.

**Scale/Scope**: Un catálogo y un encargado; pedido individual sin cantidades. Carrusel de todos los IDs del catálogo, no una selección comercial. Veinte productos es un escenario de prueba, no un límite nuevo. Se conservan nombre de hasta 4096 bytes UTF-8 y descripción de hasta 32768 bytes. «Especificaciones» significa la descripción existente, sin nuevos campos.

**Unknowns resolved**: La investigación resuelve las decisiones técnicas. Dominio/HTTPS y acceso a WhatsApp son dependencias externas de aceptación, no decisiones de arquitectura pendientes.

## Constitution Check

*Gate previo a fase 0 y reevaluado después de fase 1: PASS en ambos momentos.*

| Principio / restricción | Revisión inicial | Resultado de diseño |
| --- | --- | --- |
| I. Simplicidad | PASS: ampliar proyecto existente | Lectura por ID, plantilla HTML, componentes y temporizador; cero dependencias o infraestructura nueva. |
| II. Español y soles | PASS: formato vigente | Mensaje con etiquetas aprobadas, controles en español, precio actual y `es_PE` para OG. |
| III. Cero alcance fantasma | PASS: FR-001 a FR-012 delimitados | Trazabilidad al final; sin carrito, edición, destacados manuales, historial, pagos ni nuevos atributos. |
| IV. Verificable por persona no técnica | PASS: SC-001 a SC-007 | Quickstart define preparación, acciones y resultados observables; pruebas técnicas complementarias. |
| V. Respeto de datos | PASS: sin datos personales nuevos | Proyección pública actual, escape de HTML y configuración externa; ningún secreto en respuestas/documentación. |
| Continuidad | PASS: Constitution, AGENTS y specs 001/002 revisadas | Sin migración destructiva; respaldo consistente y comparación previa/posterior; autenticación y gestión preservadas. |

La rotación automática autorizada por 003 sustituye únicamente el protagonismo estático y el movimiento continuo de esta superficie. La aparición una vez por visita de 002 y sus demás reglas siguen vigentes. La nota A-04 anterior a Clarify se alinea con los cinco segundos ya aprobados. No se requiere excepción constitucional.

## Project Structure

### Documentation (this feature)

```text
specs/003-whatsapp-carrusel/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── productos-http.md
    └── interfaz-whatsapp-carrusel.md
```

### Source Code (repository root)

Archivos previstos para una implementación posterior; este Plan solo genera documentación:

```text
server/
├── app.js                         # Registrar HTML e inyección de lector de plantilla en pruebas
├── db.js                          # Agregar obtener(id), proyección pública actual
├── paginas-producto.js             # Nuevo: escape, título, descripción y OG en índice compilado
├── imagen-social.js                # Nuevo: JPEG derivado con sharp existente
└── routes/
    ├── catalogo.js                 # GET detalle e imagen-social
    └── paginas-producto.js          # Nuevo: HTML 200/404/503
src/
├── App.jsx                         # Resolver /productos/:id sin router adicional
├── pages/
│   ├── Catalogo.jsx                # Pasar listado/estado completos a portada
│   └── Producto.jsx                # Nuevo: ficha, estados y pedido
├── components/
│   ├── PortadaCatalogo.jsx          # Integrar carrusel, conservar texto y franja
│   ├── CarruselProductos.jsx        # Nuevo: elemento actual y controles
│   ├── TarjetaProducto.jsx          # Enlace a ficha
│   └── BotonWhatsApp.jsx            # Origen explícito; ayuda con ID único por instancia
├── hooks/useCarrusel.js             # Nuevo: temporizador, pausas y matchMedia
├── lib/
│   ├── enlaceProducto.js           # Nuevo: ruta/URL pura sin acceso global a window
│   ├── carrusel.js                 # Nuevo: selección circular y clasificación de gesto
│   └── whatsapp.js                 # Formato aprobado y codificación única
└── styles/
    ├── carrusel.css                # Nuevo: adaptación y transición
    └── producto.css                # Nuevo: ficha completa
```

**Structure Decision**: Mantener `server`, `src` y `tests` actuales. Se reutilizan `Marco`, `ImagenProducto`, `formatearPrecio`, `api`, tokens y tema. `index.html`, `vite.config.js`, esquema, proveedor de tema y paquetes no requieren cambio de arquitectura. Pruebas nuevas y ampliaciones se ubican en las carpetas unit/integration/e2e/fixtures existentes.

## Arquitectura y diseño

### Ficha individual, HTTP y metadatos

`db.obtener(id)` usa consulta preparada con los mismos campos públicos que `listar()` y reutiliza `productoPublico`; no obtiene la imagen BLOB. El nuevo `GET /api/productos/:id` devuelve `{ producto, whatsapp }`, sin cambiar `/api/catalogo` ni su orden por ID. La fotografía de pantalla permanece en `/api/productos/:id/imagen`.

`Producto.jsx` consulta el detalle con AbortController, muestra fotografía, nombre, descripción íntegra con saltos y precio; reutiliza el pedido y permite volver al catálogo. Diferencia carga, 404/no disponible y error temporal con reintento. No muestra pedido ante ausencia. Actualiza título durante desarrollo. `App.jsx` conserva su selector por pathname y enlaces normales, sin historial de SPA nuevo. Tarjeta y nombre del producto activo enlazan a la ficha con controles separados, sin enlaces anidados.

En compilación, Express atiende `/productos/:id` antes del 404 global y conserva cabeceras de seguridad. El helper lee `dist/index.html`, reemplaza su único título y meta description e incorpora OG antes de `</head>`. Valida la estructura y usa callbacks de sustitución, evitando que `$&` en datos sea interpretado como patrón. Los datos se escapan para texto/atributos (`&`, `<`, `>`, comillas simples/dobles). No se introduce JSON ni scripts inline ni `dangerouslySetInnerHTML`. La CSP actual permanece.

La plantilla puede cargarse de manera diferida y conservarse en memoria; los productos se leen en cada solicitud. `crearApp` permite inyectar un lector de índice para pruebas HTTP sin build previo. Las E2E también comprueban el índice compilado real. React sigue usando `createRoot`: no se renderiza React en servidor ni se hidrata HTML de componentes.

Ficha ausente/ID mal formado: HTML 404, mensaje comprensible y sin OG de otro producto. Fallo temporal: HTML 503, mensaje genérico y reintento. API: errores JSON 400/404/503 vigentes. Todo el contenido dinámico usa `Cache-Control: no-store`. El contrato [productos-http.md](contracts/productos-http.md) define cuerpos, cabeceras y metadatos.

### Enlaces y WhatsApp

Un helper puro genera `/productos/{id}` y su URL absoluta mediante `new URL`, con origen explícito. `BotonWhatsApp` entrega `location.origin`: puerto de Vite en desarrollo y origen público al visitar la publicación. Express usa `config.origin` desde `APP_ORIGIN` para canonical/OG, nunca Host ni X-Forwarded-Host del solicitante. La publicación debe exponer el mismo origen canónico configurado.

El renderer servidor puede importar el helper puro de `src/lib/enlaceProducto.js`; este módulo no importa React ni APIs del navegador. Se mantiene una sola construcción de la ruta compartida.

`mensajeWhatsApp(producto, origen)` conserva el saludo y consulta de disponibilidad e incluye los cuatro campos con emojis aprobados en líneas separadas. `enlaceWhatsApp(producto, whatsapp, origen)` conserva destino validado y aplica `encodeURIComponent` una sola vez al texto completo. Todos los botones de pedido comparten constructor; el carrusel ofrece consulta de ficha y no crea otra modalidad comercial. Destino ausente/inválido sigue deshabilitando el pedido.

No se publica configuración completa, credenciales ni ruta de SQLite. No se modifican credenciales existentes ni se vuelve a ejecutar su configuración durante implementación. Se mantiene descripción íntegra aunque sea extensa; la capacidad externa de WhatsApp para URLs grandes se verifica y no se promete sin evidencia.

### Imagen social

`GET /api/productos/:id/imagen-social` obtiene el BLOB actual y genera JPEG con sharp existente: fotografía completa centrada mediante `contain`, lienzo neutro 1200×630, calidad inicial 80 y límite de entrada existente de 25 millones de píxeles. Conserva orientación y transparencia se aplana sobre fondo neutro. Declara MIME/dimensiones/alt en OG. No modifica BLOB, no crea archivos persistentes, tabla o caché nueva.

La salida acotada evita ofrecer siempre fotografías de hasta 10 MiB. JPEG es una elección conservadora de salida, no una afirmación de incompatibilidad de WebP. Medir tamaño/tiempo de generación con imágenes permitidas; no atribuir a WhatsApp un límite de bytes no documentado. Fallo de conversión responde seguro, sin fotografía de otro producto.

### Desarrollo y publicación

Vite mantiene fallback de la ficha React y proxy `/api/`; no se proxifica `/productos` a Express en desarrollo. Los enlaces locales de 5173 sirven en el mismo equipo. Los metadatos específicos del HTML inicial se validan en la compilación servida por Express; no se promete preview remoto de localhost.

La publicación posterior debe dirigir fichas, API y assets a Express bajo el mismo HTTPS, sin reemplazar `/productos/:id` por un HTML estático genérico. Configurar `APP_ORIGIN` público y `NODE_ENV=production`; mantener SQLite externa persistente. Este Plan no selecciona proveedor ni despliega. El [protocolo Open Graph](https://ogp.me/) sustenta la cabecera; WhatsApp decide renderizado y caché externos.

### Carrusel

`Catalogo` entrega el listado y sus estados a `PortadaCatalogo`. `CarruselProductos` utiliza UUID seleccionado, fotografía/nombre/precio actuales y orden por ID. Recorrido circular por todos los productos; si cambia el listado recibido, mantiene el ID si existe o elige el primero. No añade polling ni sincronización entre pestañas. Las descripciones completas permanecen en tarjetas y ficha.

`useCarrusel` mantiene pausas independientes por hover, foco interno y contacto táctil. Programa un único timeout de 5000 ms solo con ≥2 productos, movimiento normal y ninguna pausa. Cancela y limpia antes de reprogramar y al desmontar (también bajo StrictMode). Cada acción manual y final de pausa inicia un período completo. Cambiar foco entre controles internos mantiene la pausa.

Los eventos de hover se filtran por puntero de ratón para no dejar una pausa ficticia después de un toque. El tacto y el foco que quede dentro siguen sus propios indicadores.

Miniaturas: botones con selección por hover de ratón y activación por clic, tacto, Enter/Espacio. Flechas: botones «Producto anterior» y «Producto siguiente». Gesto en imagen mediante Pointer Events: ≥40 px horizontal y >1.5× desplazamiento vertical; izquierda avanza y derecha retrocede. Ignorar controles/enlaces, limpiar en pointercancel y evitar clic posterior al swipe. `touch-action: pan-y pinch-zoom` conserva scroll vertical y ampliación. Miniaturas en franja con desplazamiento propio, nunca overflow de página.

Cero productos: identidad neutra y estado vacío; distinguir carga/error y permitir reintento existente. Uno: fotografía/datos sin temporizador ni controles redundantes. Imagen fallida: reemplazo de `ImagenProducto`. No generar contenido comercial ficticio.

Escuchar `prefers-reduced-motion` al montar y durante cambios: detener autoplay inmediatamente, omitir transición no esencial y conservar controles manuales. Al volver a normal, evaluar condiciones y esperar cinco segundos. Tema cambia estilos, conservando selección/ciclo de vida. Fundido 240 ms, sin repetir aparición general, cambiar foco ni dejar controles invisibles enfocables. No anunciar cada cambio automático con región viva. Fotos completas `contain`, Manrope y tokens vigentes, focos visibles, controles ≥44×44 y contraste heredado. Verificar 360/768/1366 y texto 200 % en ambos temas.

La guía APG se usa como referencia, no como declaración de conformidad completa: su recomendación de reanudación explícita tras foco difiere de Clarify, que aprobó reanudar al terminar la interacción. Se respeta la decisión aprobada sin agregar controles comerciales nuevos.

## Estrategia de pruebas

Se define ejecución futura en [quickstart.md](quickstart.md); no se ejecutan pruebas de implementación durante este Plan.

| Nivel | Cobertura necesaria |
| --- | --- |
| Unitarias | Mensaje esperado independiente del constructor, emojis/saltos/símbolos, descripción máxima, precio exacto, origen local/público y codificación una vez. URLs, HTML escapado y sin metadata duplicada, selección por ID/recorrido/gestos, JPEG y dimensiones. |
| HTTP / SQLite temporal | Proyección de detalle, UUID inválido/ausente, errores seguros, HTML inicial sin JS, metadatos exactos, Host ajeno ignorado, imagen social correcta y retirada tras eliminar. Lecturas no alteran filas/BLOB. Inyectar plantilla y ampliar fallos con `obtener`. |
| E2E Chromium | Ficha directa/recarga, enlace y borrador correctos, reloj controlado 4999/5000 ms, diez cambios y selecciones, pausas simultáneas, reanudación, reducido dinámico, tema, cero/uno y fallos. Gestos verticales/cancelados no navegan. |
| Firefox/WebKit | Añadir ficha y navegación manual a `basico.spec.js`; conservar matriz actual. |
| Regresión | Suites actuales de catálogo, acceso/logout/CSRF, altas/bajas, persistencia, imagen completa, contraste y 200 %. Actualizar expectativas del mensaje anterior; solo baselines de tienda afectadas tras revisión visual, sin regeneración automática para ocultar fallos. |
| Manual externa | WhatsApp real sin enviar, tres previews públicos con HTTPS, celular físico, lectura asistida y comparación previa/posterior. Interceptar wa.me no aprueba servicio real. |

Pruebas propuestas: `tests/unit/enlace-producto.test.js`, `carrusel.test.js`, `pagina-producto.test.js`, `imagen-social.test.js`; ampliar `whatsapp.test.js`. Integración: `producto-detalle.test.js`, `producto-html.test.js`, `imagen-social.test.js`, y conservación en fixtures actuales. E2E: `producto.spec.js`, `carrusel.spec.js`; ampliar WhatsApp, movimiento, tema, accesibilidad, presentación y básico.

En `tests/fixtures/navegador.mjs`, ampliar `habilitarDestino` para interceptar también el nuevo detalle JSON sin interceptar las imágenes. El proxy `conFallos` actual ya puede fallar un nuevo método `obtener`; se agregan escenarios, no una ruta pública de fallos. Las pruebas de carrusel deben comprobar asimismo limpieza bajo StrictMode y al navegar fuera.

Antes de Implement, preparar copia consistente de SQLite con la aplicación detenida y mantenerla fuera del repositorio, más relación legible de productos/fotografías y comprobación de acceso sin exponer credenciales. Los fixtures se ejecutan con SQLite temporal; nunca sembrar sobre catálogo real. Comparar el estado desde la aplicación después. Se conservan pendientes de aceptación externa de 001/002.

Si WhatsApp impide abrir una URL con descripción extensa, no truncar ni añadir fallback no aprobado: registrar la limitación y obtener decisión sobre ese comportamiento antes de aceptarlo. Lo mismo aplica a previews no generados por el servicio externo pese a metadatos correctos.

## Trazabilidad

| Requisito | Diseño / aceptación |
| --- | --- |
| FR-001/002 | Constructor común, origen explícito, envío manual; SC-001. |
| FR-003 | Lectura por UUID, ficha directa y estados; SC-002. |
| FR-004 | HTML OG y JPEG derivado; SC-003 y ensayo HTTPS/WhatsApp. |
| FR-005/006 | Listado completo, selección circular y controles; SC-004. |
| FR-007 | Pausas independientes, 5000 ms y matchMedia; SC-004/006. |
| FR-008 | Temas/tokens/adaptación/foto completa; SC-006. |
| FR-009 | Vacío/unitario y estados separados; SC-005. |
| FR-010 | Sin migración, copia y comparación, regresiones; SC-007. |
| FR-011/012 | Formato vigente y español, sin datos/pagos nuevos; regresiones de alcance. |

## Complexity Tracking

Sin violaciones constitucionales. HTML dinámico e imagen social responden a FR-004 y reutilizan dependencias vigentes. No se introduce SSR React, prerender por producto, servicio de imágenes, esquema ni biblioteca de carrusel.
