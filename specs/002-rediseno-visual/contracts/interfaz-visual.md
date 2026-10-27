# Contrato de interfaz visual — JM-STORE

**Normativo para Implement**: [FR-001 a FR-020, VR-001 a VR-012 y Clarify](../spec.md). Las tres imágenes RV-01/RV-02/RV-03 de la conversación son las referencias principales. Este contrato concreta la implementación visual sin añadir operaciones comerciales.

## Composición y medidas de referencia

La revisión principal se realiza con viewport 1672 × 941, texto 100 % y fotografías/textos de prueba comparables a las referencias. A otros anchos y con ampliación prevalecen lectura completa, adaptación y accesibilidad. No se fijan alturas que recorten contenido.

| Superficie/elemento | Objetivo técnico | Relación |
| --- | --- | --- |
| Cabecera pública | Altura objetivo 88 px; marca a la izquierda, navegación central en cápsula/activo luminoso, interruptor a la derecha. Márgenes públicos 7 % en referencia. | VR-001; RV-01/RV-02. |
| Portada | Alto objetivo 460 px; texto 44 % y composición 56 % del ancho útil. Fondo se extiende al ancho de pantalla; contenido alineado con catálogo. | VR-004; tolerancias de spec 420–500 px y texto 40–50 %. |
| Texto principal | Antetítulo espaciado; título 64 px, peso 800, interlineado 1.02–1.10; énfasis azul/violeta o cian/violeta según tema; descripción 18 px y llamada «Ver catálogo». | VR-004/009. |
| Escena de producto | Primer producto real, imagen completa en recuadro con proporción reservada; plataforma/halo, formas suaves en claro y luces cian/violeta en oscuro. No texto de características no registrado. | VR-005; RV-01/RV-02. |
| Franja informativa | Banda de tres mensajes, iconos del mismo sistema y separadores: Explora, Elige, Pide por WhatsApp. Puede solaparse solo con el área decorativa inferior, nunca con texto/acciones. | VR-006. |
| Catálogo | Antetítulo, título «Productos destacados» 32 px, descripción del flujo real; una única rejilla con todos los productos. Primeras tres tarjetas protagonistas sin insignias. | FR-006; VR-007/009. |
| Tarjeta de computadora | Radio 20 px, separación 16 px; recuadro fotográfico 40 % y contenido 60 % del ancho interno disponible, precio 22 px y botón de ancho del bloque de datos. | VR-007/008; rangos de la spec. |
| Panel de computadora | Barra lateral objetivo 17 % del viewport; región de trabajo independiente de `.contenedor` público. Cabecera y título, banda de resultado, paneles en proporción 37/63 excluyendo separación. | VR-010/012; RV-03. |
| Formulario y listado | Paneles redondeados de radio 20 px, icono/título; cuatro campos actuales y archivo con vista previa; filas con miniatura, texto, precio y eliminar. | VR-011/012. |

Navegación pública: Inicio → `/`, Catálogo → `/#catalogo`, Acceso del encargado → `/encargado`. Panel: gestión activa y regreso a tienda; cierre de sesión donde ya corresponde. No copiar búsqueda, corazones, categorías, inventario, edición, estadísticas, filtros, notificaciones, paginación ni menús de operaciones inexistentes. No dejar espacios o botones falsos para esos módulos.

## Tokens semánticos y temas

Declarar tokens en `src/styles/tokens.css`, con valores claros por defecto, atributo explícito `[data-tema]` y caída al dispositivo cuando no hay atributo. El sistema sustituye la paleta histórica verde/marfil, incluidas reglas con colores fijos en cada hoja. Evitar una capa de overrides que conserve dos diseños simultáneos.

| Token semántico | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--fondo` | `#F4F7FF` | `#050B1B` | Página y zonas exteriores. |
| `--superficie` | `#FFFFFF` | `#0D1830` | Tarjetas, formulario y avisos base. |
| `--superficie-elevada` | `#F4F7FF` | `#142442` | Recuadros de imagen, hover secundario, controles. |
| `--texto` | `#071126` | `#F5F8FF` | Texto principal. |
| `--texto-secundario` | `#475569` | `#B7C5DF` | Descripción y ayudas. |
| `--texto-atenuado` | `#5F6F86` | `#A6B6D0` | Texto menos intenso; también debe cumplir contraste. |
| `--borde-decorativo` | `#D8E2F3` | `#243B61` | Separadores no esenciales. |
| `--borde-control` | `#7B8CA5` | `#5F789F` | Límites necesarios de campos/controles. |
| `--foco` | `#0057D9` | `#00D4FF` | Anillo con separación y respaldo de superficie. |
| Acentos de marca | Azul `#0066FF`, violeta `#7C3AED`, cian `#00D4FF` | Mismas familias | Decoración, bordes y gradientes; no asumir contraste de texto. |
| Acción principal | Degradado azul `#0066FF` → violeta `#7C3AED`, texto blanco | Mismo degradado para acciones generales | Guardar y navegación destacada. |
| Pedido individual | Degradado azul/violeta, texto blanco | Verde `#00D99B`, texto `#031915` | Solo «Pedir por WhatsApp». |

`color-scheme: light` u `dark` se declara en CSS según el tema para campos nativos. Tema del navegador (`meta theme-color`) sigue el fondo efectivo sin alterar el contenido comercial. La barra lateral sigue azul noche también en tema claro; sus textos usan pares oscuros accesibles.

Valores auxiliares: radios 12/16/20/24 px, espaciado 8/12/16/24/32/48 px, sombra clara difusa y halo oscuro moderado. No usar `filter: invert`, una imagen de referencia como fondo ni blur grande animado. Las decoraciones llevan `aria-hidden`, no capturan puntero y no cambian el tamaño del contenido.

### Contraste y degradados

Comprobación numérica preparatoria de pares sólidos, redondeada; no representa aceptación de una interfaz aún no construida:

| Par | Razón aproximada |
| --- | --- |
| Texto claro sobre blanco | 18.80:1 |
| Texto secundario claro sobre blanco | 7.58:1 |
| Texto atenuado claro sobre fondo azulado | 4.77:1 |
| Borde de control claro sobre blanco | 3.42:1 |
| Blanco sobre azul/violeta de acción | 4.83:1 / 5.70:1 |
| Texto principal del tema oscuro sobre su superficie | 16.59:1 |
| Texto secundario del tema oscuro sobre su superficie | 10.14:1 |
| Borde de control oscuro sobre superficie elevada | 3.43:1 |
| Texto del pedido sobre verde oscuro | 9.88:1 |

En implementación comprobar también superficies elevadas, hover, error, éxito, aviso, disabled, precios, foco y puntos de cada degradado/transparencia real. No bajar opacidad global de controles para deshabilitarlos: usar colores de estado explícitos que mantengan lectura. Texto en degradado sobre claro usa azul oscuro/violeta (`#005BD8`/`#6D28D9`); cian claro sobre blanco no sirve como texto pequeño. Foco mínimo 3:1 en ambos lados de su anillo; si atraviesa gradiente usar un respaldo sólido, no solo glow. Texto normal ≥4.5:1 y texto grande/indicadores necesarios ≥3:1, como FR-016.

## Tipografía, imágenes e iconos

- Familia Manrope variable local, respaldo `system-ui`, sin síntesis de pesos inexistentes. Las medidas se expresan en unidades relativas/clamp para respetar ampliación; objetivos de referencia: portada 64 px, sección 32 px, lectura 16–18 px, auxiliares 14 px y precio 22 px. En móvil el título se adapta sin truncarse. La fuente y licencia se incorporarán desde la distribución definida en [R-05](../research.md), no desde una CDN.
- Todas las imágenes comerciales, incluida la portada, usan `object-fit: contain` y proporción original dentro de un recuadro reservado. Nunca `cover`, `background-size: cover`, máscara del producto o eliminación de fondos. Las esquinas redondean el recuadro sin recortar el contenido fotográfico; dejar padding cuando sea necesario.
- Portada: primera imagen de la respuesta actual; sin producto, ilustración neutra JM hecha con formas/identidad. Si falla la foto de portada, reemplazo identificable, sin saltar a otro producto ni alterar el listado.
- Tarjetas: primeros tres recursos con carga inmediata según el patrón vigente; resto diferido. Reutilizar URL de portada/tarjeta. No precargar todo el catálogo. Miniaturas y preview reservan su espacio; reemplazo «Imagen no disponible» identificable también en gestión.
- Mantener `Icono.jsx` y añadir solo trazos requeridos para sol/luna, Inicio o catálogo. Los iconos decorativos no repiten texto para lectores; los controles solo con icono tienen nombre y objetivo accionable ≥44 × 44 px. No nueva biblioteca de iconos.

## Adaptación por ancho disponible

Decisión técnica: móvil hasta 639 px; tablet 640–1199 px; computadora desde 1200 px. La tipología se decide por ancho CSS disponible, no por agente de usuario. Las pruebas anclan 360/768/1366 y comparan referencias a 1672. Añadir verificaciones de borde 639/640/1199/1200 para evitar saltos o desbordes. Al ampliar texto, permitir crecimiento de filas y bloques; nunca recortar para conservar una altura estética.

| Elemento | Móvil, incluido 360 | Tablet, incluido 768 | Computadora, 1366 y 1672 |
| --- | --- | --- | --- |
| Portada | Texto/CTA y después composición; sin alto fijo | Texto/CTA y después composición; sin alto fijo | Dos columnas y medidas de referencia cuando corresponda. |
| Rejilla pública | Una columna | Dos columnas | Tres columnas. |
| Interior de tarjeta | Imagen completa arriba, datos/precio/pedido debajo | Igual disposición vertical | Imagen izquierda, datos/pedido derecha. |
| Franja de mensajes | Apilada | Reorganizable sin cortar texto | Tres mensajes horizontales. |
| Panel del encargado | Navegación compacta arriba; formulario y listado debajo | Igual; sin sidebar ni paneles paralelos | Sidebar y paneles 37/63. |
| Listado de gestión | Miniatura, textos, precio y eliminar en filas que pueden crecer | Misma información y acciones, sin columnas nuevas | Filas profesionales de RV-03. |

La navegación compacta usa enlaces visibles y reflujo, sin nuevo cajón, búsqueda ni menú de funciones vacías. El interruptor y salir siguen identificables. Los elementos de trabajo usan `min-width: 0`, envoltura de palabras, filas sin altura fija y márgenes móviles de 16 px. No resolver desbordes con `overflow-x: hidden` sobre la página ocultando contenido. Un encabezado que crezca por ampliación no tapa el contenido ni el foco; se prefiere flujo normal a una cabecera fija adicional.

## Estados y respuesta interactiva

| Estado | Resultado |
| --- | --- |
| Reposo | Acción principal inequívoca; texto, bordes y sombras de su tema. |
| Hover, solo puntero preciso | Color/borde/sombra y elevación visual muy sutil en la capa decorativa de tarjeta; sin mover la caja clicable. |
| Foco | Anillo visible independiente del hover; no trasladar controles ni depender de una animación. |
| Pulsación | Desplazamiento visual interior de 1 px o respuesta equivalente, sin alterar área accionable; no opera si disabled/ocupado. |
| Ocupado | Etiqueta actual «Guardando…»/«Cerrando sesión…», bloqueo vigente; sin spinner infinito necesario para entenderlo. |
| Disabled | Estado visible con motivo cuando corresponda; texto legible y sin apariencia engañosa de habilitado. |
| Éxito/error/aviso | Texto e icono, contraste por tema y anuncio existente; no solo color ni desaparición automática antes de leer. |

Duraciones: respuesta de controles 160–180 ms; tema 180 ms; entrada de pantalla 200 ms; aparición de elementos 220 ms, todas dentro de 150–350 ms. Usar propiedades específicas; no `transition: all`. Desplazamientos máximos de aparición 8 px y sin escalado de fotografías. No paralaje, partículas, brillo permanente o carruseles. Hover y pulsación transforman el acabado interno, no el rectángulo del botón ni el flujo de la página. El [contrato de estado](estado-y-navegacion.md) define repetición, foco y reducción de movimiento.

## Matriz de fidelidad y evidencia

Mantener las 28 comprobaciones de SC-001: 8 para tienda clara, 8 para oscura, 6 para panel claro y 6 para su adaptación oscura. Evaluar las familias de colores, las proporciones y los rasgos VR frente a cada imagen original, con capturas de la app del mismo tamaño. No exigir identidad de píxeles entre productos/contenidos diferentes ni aceptar la mera presencia de un degradado como fidelidad suficiente.

La revisión anota por VR: referencia, superficie/tema, captura, medida o rasgo observado, adaptación permitida y resultado pendiente/pasa/falla. Las capturas posteriores aprobadas por el responsable sirven como referencia de regresión del producto; no se generan baselines aprobadas automáticamente. Ninguna comprobación visual ha sido ejecutada en Plan.
