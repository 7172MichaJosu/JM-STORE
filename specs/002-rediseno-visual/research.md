# Investigación técnica — Rediseño visual JM-STORE

**Fecha**: 2026-10-26 · **Fase**: Plan / Phase 0 · **Entrada**: [spec y cinco aclaraciones](spec.md).

## Resultado y alcance

Investigación terminada mediante inspección del repositorio y documentación primaria. No quedan decisiones técnicas bloqueantes sin resolver. Se conservan Node 24, React 19.3.1, Vite 8.3.5, Express 5.3.0, better-sqlite3 13.0.3 y el resto de versiones fijadas en `package-lock.json`; no se propone actualizar ni añadir paquetes. Las versiones se obtuvieron de `package.json`, no de supuestos sobre la versión más reciente.

Las tres referencias adjuntas se identifican como RV-01, RV-02 y RV-03 en la spec. Sus composiciones se traducen al [contrato visual](contracts/interfaz-visual.md); no se presupone que las fotografías, tipografía o controles comerciales de las ilustraciones pertenezcan al catálogo real.

## R-01 — Conservar la aplicación y los contratos

**Decisión**: cambiar composición y estilos del frontend, manteniendo las tres rutas documentales, la consulta única del catálogo y todos los contratos de servidor. No añadir router, biblioteca de componentes, gestor de estado, servicio gráfico ni endpoint de tema.

**Motivo**: `src/App.jsx` selecciona pantalla mediante `location.pathname`; `Gestion.jsx` ya conserva formulario, selección y sesión. `server/db.js` devuelve productos con `ORDER BY id`. La portada reutiliza el primer objeto de esa respuesta y las primeras tres tarjetas permanecen dentro del mismo listado. No se añade orden por fecha, bandera de destacados ni segunda consulta.

**Alternativas consideradas**: migrar a un router o rehacer la API ampliaría el cambio sin aportar un requisito aprobado; un dashboard nuevo introduciría módulos excluidos. La [continuidad de contratos](contracts/compatibilidad.md) detalla los límites.

## R-02 — Tema correcto desde la primera presentación

**Decisión**: bootstrap clásico externo `public/assets/tema-inicial-v1.js`, referenciado en `index.html` desde el `head`, antes de contenido y módulo React, sin `async` ni `defer`. Lee exclusivamente la clave `jm-store.tema` y acepta `claro` u `oscuro`; si no existe valor válido consulta el dispositivo y, sin preferencia reconocible, elige claro. Aplica `data-tema` y `data-origen-tema` al elemento `html`. No escribe estilos en atributos ni registra datos.

**Motivo**: el servidor exige `script-src 'self'` y `style-src 'self'` y ya sirve `/assets`. Vite copia el directorio `public` al resultado; no hace falta modificar Express. El nombre se versiona al cambiar el contenido porque esa ruta tiene caché inmutable de un año. CSS usa `color-scheme` y una caída al sistema si falta el atributo; React lee los atributos antes de crear su estado. La ausencia de destello se probará en la compilación servida por Express, incluyendo recursos fríos.

**Alternativas consideradas**: un script inline incumple la CSP; iniciar el tema solo en `useEffect` puede pintar el tema incorrecto; un script clásico bajo `/src` no es una entrada empaquetada válida para este propósito. No se depende de un atributo experimental para bloquear renderizado. Fuentes: [Vite: public directory](https://vite.dev/guide/assets.html#the-public-directory), [HTML script](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script), [CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src).

## R-03 — Estado de apariencia sin perder el trabajo

**Decisión**: un proveedor `ProveedorTema` por documento conserva tema efectivo y origen `sistema`/`manual`. Escucha cambios de `matchMedia` solo para aplicarlos cuando no haya elección manual. Lecturas y escrituras de almacenamiento están protegidas; si fallan, la elección manual sigue en memoria. No añade una tercera opción al interruptor ni sincronización entre pestañas.

**Motivo**: cambiar atributos y variables CSS preserva los nodos React y permite cambiar el diálogo abierto sin perder foco. Nunca usar tema como `key`, remontar la aplicación, volver a consultar datos ni navegar como efecto del selector. `pageshow` con restauración de historial reconcilia el tema vigente; no sustituye la comprobación de sesión ya existente.

**Alternativas consideradas**: una preferencia de usuario en SQLite exigiría datos y cuentas no aprobados; dos árboles para claro y oscuro reiniciarían formularios. Fuentes: [React: preserving state](https://react.dev/learn/preserving-and-resetting-state), [localStorage y restricciones](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [MediaQueryList change](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event), [pageshow](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event).

## R-04 — Sistema visual propio y fotografía auténtica

**Decisión**: variables CSS semánticas por tema, componentes existentes y decoración con CSS y el sistema SVG `Icono` actual. Fotografías reales con `object-fit: contain`, proporción y área reservada; no recortar, retirar fondos ni modificar los BLOB existentes. En celulares y tablets, fotografía pública arriba; en computadora, a la izquierda. La portada usa el mismo recurso del primer producto, sin otra descarga lógica ni copia persistente.

**Motivo**: satisface las dos primeras aclaraciones sin convertir referencias en fondos de interfaz. Reservar recuadros estabiliza el diseño con formatos verticales, cuadrados y horizontales. Luces, plataformas y ondas son decoración separada, sin tapar el producto ni inventar garantías. Los colores cian claros se reservan para decoración o texto sobre oscuro, no texto pequeño sobre blanco.

**Alternativas consideradas**: `cover` recorta y contradice Clarify; filtros globales de inversión degradan imágenes; copiar auriculares de referencia cambia la oferta. Fuentes: [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit), [variables CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties).

## R-05 — Tipografía local con una sola familia

**Decisión**: Manrope variable, pesos 200–800, para toda la interfaz; obtener durante Implement la distribución OFL de Google Fonts `Manrope[wght].ttf` y conservarla sin modificación como `public/assets/manrope-variable-v1.ttf`, acompañada de `manrope-OFL-v1.txt`. Usar pesos 400/500 para lectura, 600/700 para acciones y 800 para títulos; `font-display: swap`, respaldo `system-ui`, y una sola precarga del archivo local si la medición confirma beneficio. No descargar nada en Plan.

**Motivo**: aproxima la tipografía geométrica de las referencias sin agregar paquetes ni conexiones a terceros en ejecución. El CSS actual menciona Inter pero no empaqueta fuente alguna. La elección es una aproximación de diseño, no una identificación de la fuente exacta de las imágenes. Registrar la revisión y el SHA-256 del archivo realmente adquirido junto a su licencia al implementarlo.

**Alternativas consideradas**: continuar solo con la fuente del sistema produce diferencias grandes entre dispositivos; cargar fuentes remotas exige permisos CSP y dependencia de red; convertir formatos añadiría herramientas que no son necesarias para una familia. Se elige expresamente la distribución Google Fonts verificada, no otra edición con condiciones diferentes. Fuentes primarias: [metadatos de Manrope](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/METADATA.pb), [licencia de esa distribución](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt).

## R-06 — Movimiento moderado y una aparición por visita

**Decisión**: entrada de pantalla por opacidad de 200 ms; secciones/tarjetas con `IntersectionObserver`, registro estable de identidades vistas y `unobserve` tras la primera entrada. El contenido es visible por defecto; solo se añade una animación breve al observarlo. Al terminar o cancelarse se elimina la clase transitoria, manteniendo el registro de visto. Ningún formulario, diálogo o zona enfocada se desplaza por estos efectos.

**Motivo**: tema, validación y actualizaciones de otros productos no reinician el registro. Una nueva carga, vuelta por navegación o restauración `pageshow.persisted` inicia nueva visita; una revalidación temporal de sesión no lo hace. Las apariciones iniciales de la primera zona visible se coordinan con la entrada de pantalla para evitar doble efecto. El desmontaje limpia observadores y listeners, también en `StrictMode`.

**Alternativas consideradas**: animar todos los elementos permanentemente, escuchar cada evento de scroll o añadir una librería añade coste y repeticiones. Una entrada CSS en el documento destino conserva las rutas sin depender de View Transitions, router o retrasos artificiales de enlaces. Fuentes: [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [unobserve](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/unobserve), [React useEffect y limpieza](https://react.dev/reference/react/useEffect).

## R-07 — Accesibilidad y movimiento reducido dinámicos

**Decisión**: `prefers-reduced-motion` desactiva animación, transformación interactiva y scroll suave; un listener equivalente detiene observación y deja visibles los elementos pendientes si cambia durante la visita. Pasar de reducido a normal no reproduce apariciones consumidas. Se conservan foco visible, etiquetas, contraste, avisos y estados estáticos.

**Motivo**: la preferencia también puede cambiar con el diálogo abierto. El contraste se verifica para pares semánticos, estados y todos los puntos relevantes de degradados, no solo los colores de marca. Sustituir la prueba histórica de verde/marfil y `.arte-sello` por pares de ambos temas, manteniendo los umbrales de la spec.

**Alternativas consideradas**: bajar opacidad global de controles deshabilitados o usar el mismo cian para texto sobre blanco no permite garantizar contraste. Fuentes: [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## R-08 — Datos, imágenes y seguridad inalterados

**Decisión**: no migraciones, cambios de esquema, limpieza, resembrado, recodificación masiva de imágenes, cambios de autenticación ni credenciales. Se mantienen ID, orden, precio en céntimos y BLOB WebP. El formulario conserva cuatro campos y sus límites reales; el diálogo mantiene confirmación, bloqueo de repetición y foco. No se tocan los formateadores, codificación de WhatsApp ni cabeceras de mutación.

**Motivo**: inspección de `server/db.js`, rutas, `src/lib/api.js`, `FormularioProducto.jsx` y `ConfirmarEliminacion.jsx`. Reiniciar el servidor invalida sesiones en memoria pero conserva productos; la comprobación de persistencia debe volver a autenticar sin confundir ambos resultados. Las bases temporales existentes son adecuadas para regresión; el catálogo real no es una fixture.

**Alternativas consideradas**: reemplazar toda la app o regenerar datos de ejemplo impide comprobar conservación. Los contratos base se referencian en lugar de duplicar y modificar una especificación HTTP.

## R-09 — Evidencia visual, funcional y de tiempos separada

**Decisión**: ampliar las pruebas actuales usando el lanzador aislado; capturas a 1672 × 941 para 28 comprobaciones VR y a 360/768/1366 para ambos temas. Preparar tres fotos autorizadas distinguibles y productos con UUID deterministas solo en fixtures. Las 20 fotos planas actuales prueban lógica pero no fidelidad o encuadre.

**Motivo**: las referencias tienen contenido y controles excluidos; no se usa su bitmap como expectativa de diferencia de píxeles. Primero comparar la matriz y aceptar capturas de la app; después esas capturas sirven para regresión. Capturas con animaciones desactivadas estabilizan composición, pero tiempos, destellos y movimiento se ensayan por separado con animaciones normales. Ampliar el recorrido básico de Firefox/WebKit para tema, encuadre, modal y movimiento reducido.

**Alternativas consideradas**: declarar éxito por una captura estática o por Playwright interceptando WhatsApp no acredita SC-003/SC-011 reales. No se inventan mediciones ni participantes. Fuentes: [Playwright screenshot](https://playwright.dev/docs/api/class-page#page-screenshot), [emulateMedia](https://playwright.dev/docs/api/class-page#page-emulate-media).

## Puerta de salida de investigación

Los cinco principios pasan antes del diseño: solución simple con dependencias existentes; español/soles; alcance limitado a FR/VR; aceptación reproducible desde la app; datos y secretos preservados. La fase 1 puede producir modelo, contratos y guía. La validez visual, tiempos, acceso real a WhatsApp y pruebas presenciales se verificarán después de implementar; esta investigación no los declara aprobados.
