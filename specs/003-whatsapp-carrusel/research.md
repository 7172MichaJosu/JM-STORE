# Investigación técnica — 003 WhatsApp y carrusel

**Fecha**: 2026-10-27. Investigación de código y fuentes primarias; no es evidencia de implementación. Base revisada: `067d97f`, con Specify/Clarify locales de 003.

## R-01 — Arquitectura y almacenamiento

**Decision**: Ampliar las carpetas actuales con lectura por UUID, ficha React y carrusel propio; ninguna dependencia nueva ni cambio de esquema.

**Rationale**: `src/App.jsx` ya resuelve pantallas por pathname y el catálogo obtiene todos los productos. `server/db.js` contiene identidad UUID, proyección pública y copia WebP. Un nuevo `obtener(id)` mantiene esa proyección sin leer todos los BLOB. La descripción es el contenido de especificaciones ya disponible.

**Alternatives considered**: Router completo, framework SSR, biblioteca de carrusel, nueva clasificación de destacados o nuevas columnas no responden a una necesidad adicional aprobada.

## R-02 — HTML inicial de producto

**Decision**: Express transforma el índice compilado antes de enviarlo en `/productos/:id`; React sigue con `createRoot`. Vite local conserva fallback y proxy API, sin enviar las fichas al servidor de compilación.

**Rationale**: Los metadatos están disponibles en la respuesta inicial incluso sin ejecutar JS. La [integración de backend de Vite](https://vite.dev/guide/backend-integration) diferencia assets de desarrollo/compilados. Reutilizar `dist/index.html` conserva referencias de assets generadas sin una nueva integración SSR. `server/app.js` necesita una ruta explícita antes de su 404.

**Alternatives considered**: Cambiar únicamente el DOM no garantiza metadata en el HTML recibido por terceros. Prerender exige regenerar tras altas/bajas; SSR React añade hidratación y mayor acoplamiento. Proxificar fichas locales a Express perdería las transformaciones/preámbulo React de Vite.

**Detalle**: Reemplazar título y description únicos e insertar OG antes del cierre de head; validar estructura y probar con índice compilado real. Inyectar lector de plantilla para que pruebas HTTP unitarias/integradas no dependan de build. Conservar solo la plantilla en memoria, nunca una copia indefinida de datos retirados.

## R-03 — Origen local y público

**Decision**: Constructor puro recibe origen explícito. Cliente usa `location.origin`; Express utiliza `config.origin` desde `APP_ORIGIN`. Mantener formato del catálogo sin otra variable pública.

**Rationale**: `server/config.js` ya valida origen exacto y HTTPS en producción/fuera de loopback. El ejemplo local usa puerto 5173, distinto del backend. La URL compartida coincide con el origen visitado; OG/canonical no confían en cabeceras Host arbitrarias. Publicar bajo el mismo origen canónico configurado es requisito operativo.

**Alternatives considered**: URL local fija falla al publicar; puerto de API falla durante Vite; dos variables de origen duplican configuración; Host del solicitante no es una fuente canónica confiable.

## R-04 — Mensaje y capacidad externa

**Decision**: Mantener `wa.me/{destino}?text=...`, saludo, cuatro campos aprobados y consulta de disponibilidad; una sola codificación del mensaje íntegro, sin envío automático.

**Rationale**: La [ayuda oficial de WhatsApp](https://faq.whatsapp.com/5913398998672934) documenta teléfono internacional y texto prellenado codificado. La integración y validación telefónica ya existen. No se necesitan WhatsApp Business API ni secretos nuevos.

**Alternatives considered**: Acortador, clipboard fallback, mensajes recortados, carrito o envío automático amplían o contradicen el alcance.

**Riesgo**: El proyecto admite 4 KiB de nombre y 32 KiB de descripción. No se encontró en la fuente consultada un máximo universal que garantice apertura de esas URLs en todos los clientes. Probar construcción íntegra en límites y apertura real con textos largos; documentar cualquier límite como pendiente de aceptación sin truncar silenciosamente ni reducir datos guardados.

## R-05 — Metadatos e imagen social

**Decision**: OG con título, tipo website, URL, imagen, descripción, idioma/sitio y propiedades de imagen. URL absoluta, fotografía y datos del mismo UUID. Descripción íntegra ofrecida, presentación final decidida por WhatsApp.

**Rationale**: El [protocolo Open Graph](https://ogp.me/) define los campos básicos y adicionales para descripción e imagen. Las páginas e imágenes deben poder consultarse públicamente para el ensayo externo; localhost no lo ofrece.

**Alternatives considered**: Metadata genérica identifica la tienda, pero no el producto. Cambiar al primer producto ante una baja induce a error. Incrustar datos sin escape permite inyección. No se añaden etiquetas comerciales de precio/stock no requeridas.

**Decision de fotografía**: JPEG derivado 1200×630 con sharp ya instalado, calidad inicial 80 y `contain` sobre fondo neutro, conservando toda la fotografía y el BLOB original. No guardar derivados ni agregar caché.

**Rationale**: Las copias originales pueden alcanzar 10 MiB y 25 millones de píxeles. Acotar el derivado evita ofrecer siempre ese tamaño a servicios sociales. Las operaciones están documentadas en [resize de sharp](https://sharp.pixelplumbing.com/api-resize/) y [salida JPEG](https://sharp.pixelplumbing.com/api-output/#jpeg). Dimensiones y calidad son decisiones del proyecto, no límites oficiales de WhatsApp.

**Alternatives considered**: WebP original sería más corto pero no acota tamaño; almacenar derivados requiere invalidación; servicio externo agrega infraestructura. No hay evidencia suficiente para afirmar que WhatsApp rechaza WebP.

**Límite de evidencia**: Las páginas específicas de Meta sobre previews/imágenes no pudieron consultarse en la investigación delegada por limitación HTTP 429. No se atribuyen a ellas compatibilidades o límites. Se mantiene el ensayo con WhatsApp real como pendiente; su caché y fragmentos visibles no son controlados por JM-STORE.

## R-06 — Carrusel y limpieza

**Decision**: Componente propio y hook con selección por UUID, recorrido circular completo, un timeout de 5000 ms y pausas independientes por puntero/foco/contacto. Limpiar temporizador y listeners al desmontar; período completo nuevo tras selección o fin de pausa.

**Rationale**: `main.jsx` activa StrictMode; los efectos deben soportar montaje/limpieza repetidos. Hay nombres repetidos y el ID es identidad estable. `useAparicion` ya anima una vez por visita y no debe reutilizarse para autoplay.

**Alternatives considered**: Animación CSS automática no coordina selección y accesibilidad; interval permanente facilita cambios durante interacción; una lista comercial de destacados contradice el alcance.

## R-07 — Tacto, tema y movimiento reducido

**Decision**: Botones nativos para flechas/miniaturas; hover más activación accesible. Pointer Events para gesto en imagen, umbral horizontal ≥40 px y predominio >1.5× vertical, ignorando controles. `pan-y pinch-zoom`, limpieza en cancelación y prevención del clic accidental tras swipe. Fundido 240 ms; matchMedia detiene autoplay bajo movimiento reducido. Selección no depende del tema.

**Rationale**: La [guía WAI de carruseles](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) orienta foco, hover y contenido oculto. La [especificación Pointer Events](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property) define coordinación de gestos con el navegador. La regla de imagen completa, controles 44×44 y contraste procede de 002 y sus pruebas actuales.

**Tradeoff**: APG recomienda reanudación explícita tras foco y control de rotación. Clarify aprobó reanudar al terminar interacción. Se aplica la respuesta aprobada, sin declarar conformidad integral de APG ni introducir nuevos controles sin autorización. Movimiento reducido sí detiene la rotación.

**Alternatives considered**: Solo hover excluye tacto/teclado; bloquear gestos impide scroll/zoom; fotos recortadas contradicen las reglas vigentes.

## Resolución

Todas las decisiones técnicas de este Plan están resueltas. La nota A-04 de la spec se normaliza con Clarify, que ya fija cinco segundos y movimiento reducido. No hay nueva pregunta de producto ni avance a Tasks/Implement. Dominio/HTTPS, participantes, celular y WhatsApp real siguen como dependencias de aceptación, sin declararlas aprobadas.

Fuentes primarias consultadas el 2026-10-27. La lectura del repositorio cubrió configuración, rutas, SQLite, React, CSS y fixtures actuales; las fuentes externas sustentan los protocolos y operaciones, no certifican el resultado futuro.
