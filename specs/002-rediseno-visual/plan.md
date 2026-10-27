# Implementation Plan: JM-STORE — Rediseño visual claro, oscuro y panel del encargado

**Branch**: `002-rediseno-visual` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: especificación 002 con cinco respuestas de Clarify, Constitution 1.0.0, AGENTS.md, aplicación existente y las tres referencias RV-01/RV-02/RV-03.

**Status**: Plan / Phase 0 y Phase 1 completadas documentalmente. Este documento diseña cambios futuros; no se ha implementado código, ejecutado aceptación ni generado `tasks.md`. La spec aprobada y su checklist se conservan sin cambios.

## Summary

Transformar la tienda pública y el panel existentes con composiciones fieles a las referencias: portada de dos columnas con producto real y luces/degradados, tipografía geométrica, tarjetas profesionales y panel con barra lateral. La presentación clara usa blanco/azul/violeta; la oscura usa azul noche/cian/violeta y acción WhatsApp verde. No se trata de recolorear la interfaz actual: se sustituyen composición, jerarquía, superficies y acabado, conservando el flujo funcional.

Usar React y CSS propio, un proveedor de apariencia, un bootstrap externo del mismo origen para el tema inicial y observación nativa para apariciones. Mantener navegación documental, API, sesiones, procesamiento de imágenes, esquema SQLite y configuración externa. Sin nuevos paquetes, router ni módulos comerciales. Las fotografías se muestran completas en todas las superficies; en celulares/tablets las tarjetas son verticales y el panel apila formulario/listado bajo navegación compacta.

El alcance visual queda definido por el [contrato de interfaz](contracts/interfaz-visual.md), el comportamiento por [estado y navegación](contracts/estado-y-navegacion.md), la conservación por [compatibilidad](contracts/compatibilidad.md) y las pruebas por [quickstart](quickstart.md). Los 20 FR, 12 VR, 33 escenarios y 11 SC permanecen como criterios de aceptación; no se rebajan para acomodar decisiones técnicas.

## Technical Context

**Language/Version**: JavaScript ES modules, JSX, HTML y CSS; Node.js 24 LTS según proyecto, sin TypeScript nuevo ni migración.

**Primary Dependencies**: versiones fijadas actuales: React/React DOM 19.3.1, Vite 8.3.5, plugin React 6.1.2, Express 5.3.0, better-sqlite3 13.0.3, sharp 0.35.5, multer 2.5.0 y libphonenumber-js 1.13.15. Se reutilizan; ninguna dependencia nueva. Manrope local con licencia es un activo estático, no un servicio o paquete adicional.

**Storage**: SQLite existente con BLOB WebP y sesiones en memoria, sin cambio. Única persistencia nueva: `localStorage` con clave `jm-store.tema` y valor `claro|oscuro`; fallback en memoria si está bloqueado. Sin datos personales nuevos.

**Testing**: `node:test` y Playwright 1.64.1 ya presentes; HTTP y SQLite temporal reales. Chromium completo y Firefox/WebKit básicos ampliados. Revisión humana de referencias, teclado/lectura asistida, celular físico y WhatsApp real como complemento, no sustituidos por mocks.

**Target Platform**: navegadores de computadora, tablet y celular en los tres motores actuales de pruebas; anchos principales 360/768/1366 y comparación 1672 × 941. Desarrollo Windows; aplicación web con HTTPS en el entorno de internet ya previsto.

**Project Type**: aplicación web existente de un solo paquete, frontend Vite/React y servidor Express. Rutas `/`, `/encargado`, `/encargado/ingresar`; no segundo proyecto.

**Performance Goals**: primer grupo con nombre/precio/pedido utilizable ≤3 s en ≥4/5 aperturas por tema con 20 productos; tema efectivo ≤0.5 s; transiciones 150–350 ms; ninguna animación bloquea interacción ni desplaza el control durante pulsación. Diseño dirigido a transform/opacidad, sin prometer FPS o capacidad de servidor ajenos a la spec.

**Constraints**: cinco aclaraciones obligatorias; fotos sin recorte; manual prevalece sobre sistema; movimiento reducido dinámico; CSP solo recursos propios, sin inline; no tocar datos/config/secretos ni crear funcionalidades excluidas. Sin migraciones, reseeding o edición de imágenes existentes. El reinicio conserva productos y puede revocar sesiones como ahora.

**Scale/Scope**: tres rutas existentes, dos temas, dos actores y 20 productos de ensayo; todos los productos reales continúan visibles, sin nuevo límite comercial. Once criterios de éxito y 28 comprobaciones visuales. No se introduce escalado, observabilidad o infraestructura para demandas hipotéticas.

## Constitution Check

*GATE: debe pasar antes de investigación y revisarse después del diseño.*

| Principio | Puerta previa a Phase 0 | Comprobación posterior a Phase 1 | Resultado |
| --- | --- | --- | --- |
| I. Simplicidad | Resolver con stack vigente y necesidad escrita. | CSS propio, APIs nativas, componentes justificados por uso actual; sin paquetes, router, servicios ni migraciones nuevos. | Pasa / Pasa. |
| II. Perú e idioma | Mantener español y precios en soles. | Etiquetas y acciones en español de Perú; reutilizar `formatearPrecio` y mensaje WhatsApp actual; V-10. | Pasa / Pasa. |
| III. Cero alcance fantasma | Vincular cada cambio a FR/VR; excluir módulos de muestra. | Matriz de trazabilidad; contratos sin búsqueda/favoritos/stock/edición/estadísticas ni pedidos guardados; no nuevas rutas/API. | Pasa / Pasa. |
| IV. Verificación no técnica | Mantener condiciones, acciones y resultados observables. | V-01 a V-11 corresponden a SC-001 a SC-011; revisión de 28 rasgos, tiempos y participantes; evidencia sin resultados inventados. | Pasa / Pasa. |
| V. Datos con respeto | No nuevos datos personales, acceso a secretos ni pérdida de catálogo. | Preferencia local no personal, CSP conservada, SQLite/BLOB/ID intactos, pruebas aisladas y comparación de copia sin reset. | Pasa / Pasa. |

**Resultado**: sin violaciones ni excepciones pendientes. La aceptación de la aplicación y los ensayos externos siguen pendientes; estas puertas validan el diseño documental, no sus resultados futuros.

## Project Structure

### Documentation (this feature)

```text
specs/002-rediseno-visual/
├── spec.md                          # Aprobada: Specify + cinco aclaraciones, conservada
├── checklists/requirements.md       # Calidad de requisitos, conservada
├── plan.md                          # Este plan
├── research.md                      # Phase 0: decisiones, alternativas y fuentes
├── data-model.md                    # Phase 1: datos preservados y estado visual
├── contracts/
│   ├── interfaz-visual.md            # Composición, tokens, responsive y estados
│   ├── estado-y-navegacion.md        # Bootstrap, tema, movimiento y rutas
│   └── compatibilidad.md             # HTTP, seguridad y datos sin cambios
└── quickstart.md                    # Validación y evidencia futura
```

No se crea `tasks.md` en Plan. La carpeta `evidencia/` solo se utilizará cuando existan resultados reales durante la implementación/validación.

### Source Code (repository root)

Árbol propuesto para la implementación posterior; los archivos nuevos no se crean en esta fase:

```text
index.html                           # Adaptar bootstrap externo y metadatos
public/assets/                       # Nuevo: activos propios versionados
├── tema-inicial-v1.js
├── manrope-variable-v1.ttf
└── manrope-OFL-v1.txt
src/
├── main.jsx                         # Adaptar: montar proveedor una sola vez
├── App.jsx                          # Conservar selección de rutas
├── tema/ProveedorTema.jsx           # Nuevo: tema efectivo/origen y suscripciones
├── hooks/useAparicion.js            # Nuevo: una aparición por visita
├── components/
│   ├── Marco.jsx                    # Adaptar marco público/acceso sin perder children
│   ├── InterruptorTema.jsx          # Nuevo control accesible de dos estados
│   ├── ImagenProducto.jsx           # Nuevo elemento visual compartido
│   ├── PortadaCatalogo.jsx          # Nueva composición de portada y franja
│   ├── NavegacionEncargado.jsx       # Nueva sidebar/franja de destinos existentes
│   ├── TarjetaProducto.jsx          # Adaptar estructura/estados de tarjeta
│   ├── FormularioProducto.jsx       # Adaptar solo presentación, conservar estado
│   ├── ConfirmarEliminacion.jsx     # Adaptar acabado, conservar lógica modal
│   ├── EstadoCatalogo.jsx           # Adaptar estados a los dos temas
│   ├── Icono.jsx                    # Extender solo iconos necesarios
│   └── BotonWhatsApp.jsx            # Estilos; conservar enlace y semántica
├── pages/                           # Catalogo, Gestion e IniciarSesion existentes
├── styles/
│   ├── tokens.css                   # Reemplazar sistema visual histórico
│   ├── base.css                     # Tipografía, controles y accesibilidad
│   ├── movimiento.css               # Nuevo: entrada, aparición y reducción de movimiento
│   └── *.css                        # Adaptar hojas actuales por superficie
└── lib/                             # api, precio y whatsapp preservados
server/                              # Sin cambios por esta feature
tests/                               # Directorio existente; sin renombrarlo
├── unit/                            # Contraste actualizado y bootstrap/tema
├── integration/                     # Regresión actual HTTP/SQLite
├── e2e/                             # Nuevos tema/movimiento/presentacion + actuales
└── fixtures/                        # Fotos/datos de prueba y aislamiento existente
```

**Structure Decision**: mantener el paquete y las carpetas reales; ampliar únicamente presentación/estado visual y pruebas necesarias. La fuente local añade fidelidad sin CDN; el recurso clásico evita tocar CSP/servidor. No nueva capa de repositorios, backend, design system publicado ni actualización de dependencias.

## Diseño de componentes y responsabilidades

| Pieza | Responsabilidad y contrato | Qué preserva |
| --- | --- | --- |
| Bootstrap + `ProveedorTema` | Resolver primer tema, alternar/manual, seguir sistema, storage protegido y reentrada de historial. | Árbol React, claves, foco, formularios, sesión y solicitudes. |
| `InterruptorTema` | Sol/luna, `role=switch`, nombre «Modo oscuro», `aria-checked`, foco y tacto. | Dos valores, sin menú automático nuevo. |
| `Marco` | Identidad, encabezado, enlaces, acceso al contenido, pie y espacio de controles. Composición estable al cambiar tema. | Rutas, links y posición lógica de `children`; no remontar por apariencia. |
| `PortadaCatalogo` | Recibe primer producto o ausencia; compone texto, CTA a catálogo, foto/halo y franja real. | Una sola respuesta del catálogo y ninguna característica inventada. |
| `ImagenProducto` | Mostrar imagen completa/reemplazo con variantes de recuadro, alt y callbacks existentes. | Fuente original; preview sigue validando mediante callbacks de su formulario. No almacena, procesa ni carga otro archivo. |
| `TarjetaProducto` | Foto/datos horizontales en desktop y verticales en móvil/tablet, acabado y acción existente. | ID, datos completos, pedido individual, estados de imagen y prioridades de carga. |
| `NavegacionEncargado` | Sidebar en desktop o franja compacta, gestión activa y vuelta a tienda. | Solo destinos actuales; sin módulos ocultos/ficticios. |
| `Gestion` y formulario | Ubicar título, avisos, formulario y listado conforme a RV-03; conservar subárbol protegido durante revalidaciones. | Validaciones, archivo/blob, bloqueos, avisos, verificación de acceso y cierre. |
| Diálogo | Colores, bordes, tipografía y botones de ambos temas. | `showModal`, ID elegido, Escape/bloqueo, foco inicial y retorno. |
| `useAparicion` + CSS | Presentación breve, registro por visita, limpieza y preferencia reducida en vivo. | Contenido visible por defecto, identidades estables y disponibilidad inmediata. |

Integrar primero los fundamentos visuales/tema y después las composiciones pública/encargado sobre sus componentes existentes; los contratos de negocio no se reescriben. Las pruebas y evidencias se incorporarán junto a las superficies correspondientes. Esta secuencia orienta el diseño; el desglose ejecutable corresponde a una futura fase Tasks.

## Arquitectura visual y comportamiento

### Tema y seguridad desde el arranque

El script clásico local se ejecuta antes de React; la aplicación adopta sus atributos y un único contexto controla actualizaciones. `localStorage` solo contiene la elección; fallos dejan modo manual en memoria. `matchMedia` aplica cambios mientras origen sea sistema, sin refetch ni recarga. El diálogo cambia mediante los mismos tokens, conservando modalidad y foco. Ver [contrato completo](contracts/estado-y-navegacion.md).

El servidor existente solo sirve estáticos bajo `/assets`, por eso los activos nuevos se ubican en `public/assets`; Vite los copia allí. No se usan inline, fuentes de CDN, `style={{...}}` para escalonados ni apertura de CSP. Cambiar un recurso de nombre inmutable exige versión nueva. La verificación final usa Express compilado, no solo Vite.

### Composición y responsive

El contrato visual fija geometría objetivo a 1672 × 941: cabecera 88 px, portada 460 px y 44/56, tarjetas 40/60 con radio 20 px, panel sidebar 17 % y áreas 37/63. Mantener los rangos de la spec. Breakpoints de ancho: <640 móvil, 640–1199 tablet, ≥1200 computadora; ampliar texto nunca habilita clipping.

Primer producto del arreglo = foto de portada; primeras tres tarjetas del mismo listado = protagonismo. No agregar campos, sorting ni duplicar registros. Las fotos siempre completas y las miniaturas/preview tienen el mismo criterio. No eliminar fondos ni recodificar para simular los renderizados de las referencias. Los halos/plataformas son capas CSS decorativas externas al producto.

El panel adopta RV-03 con trabajo claro o su adaptación oscura; solo en computadora conserva sidebar y paneles paralelos. Tablets y celulares usan navegación compacta visible, formulario y luego listado. Acceso, errores, vacío, carga y confirmación reciben acabado equivalente; no limitar el rediseño a la portada.

### Movimiento, navegación y rendimiento

Conservar enlaces/documentos actuales y entrada breve de la pantalla destino, sin retener clicks esperando una salida ni introducir router/View Transitions. El registro de apariciones usa ID de producto y secciones, se consume una vez por visita y se limpia correctamente al salir; `pageshow` restaurado cuenta como otra visita. Revalidar sesión, cambiar tema o validar no lo reinicia.

Las propiedades de opacidad y transformaciones visuales se animan durante 160–220 ms según elemento, dentro del rango 150–350. No mover cajas accionables ni animar formularios/diálogos enfocados. Movimiento reducido cambia en vivo a presentación estática. Evitar loops, filtros grandes animados y suscripciones por cada scroll. Sin soporte de observación se conserva contenido visible.

Reservar áreas de imagen y jerarquía para evitar saltos; reutilizar la URL del primer producto, carga prioritaria actual del primer grupo y carga diferida del resto. Una fuente variable local con respaldo no bloquea el uso de datos/pedido. No optimizar imágenes mediante cambios de servidor o recortes de datos. Los tiempos son objetivos de aceptación pendientes de medir, no resultados de Plan.

## Estrategia de pruebas y aceptación

| Capa | Cobertura significativa prevista |
| --- | --- |
| `node:test`, actual | Lógica, precio, codificación WhatsApp, autorización, límites, HTTP y SQLite temporal sin cambios. |
| `tests/unit/contraste.test.js` | Sustituir pares históricos y dependencia de `.arte-sello` por pares semánticos de ambos temas/estados/degradados; conservar umbrales. |
| `tests/unit/tema.test.js`, previsto | Ejecutar bootstrap real en contexto aislado de Node: preferencia válida/inválida/ausente, sistema, storage que lanza excepción; sin librería de DOM nueva. |
| `tests/e2e/tema.spec.js`, previsto | Tema inicial frío, manual/automático, storage bloqueado, persistencia/reapertura, historial, campos/archivo/foco/modal intactos y cero peticiones por tema. |
| `tests/e2e/movimiento.spec.js`, previsto | Una entrada por visita, no replay por scroll/tema/validación/lista, bfcache, preferencia reducida en vivo y fallback sin observador. Efectos habilitados. |
| `tests/e2e/presentacion.spec.js`, previsto | Fotos autorizadas con encuadre comprobable, layout responsive, tokens/contraste/controles, estados y capturas estables. |
| Recorridos actuales | Mantener catálogo, alta, eliminación, acceso, límites, WhatsApp, accesibilidad y persistencia; adaptar solo selectores/expectativas de presentación que cambiaron legítimamente. |
| `basico.spec.js` | Ampliar comprobaciones transversales para Firefox/WebKit sin afirmar batería completa ni agregar dependencia. |
| Fixtures | Tres fotos distintas con proporciones y bordes reconocibles; UUID deterministas solo de ensayo. La conservación usa caso/copia aislada sin reset entre antes/después. |
| Revisión humana | Matriz de 28 rasgos, lectura asistida, dispositivo físico, cinco participantes y revisión real de borradores sin envío. No sustituir por emulación o capturas. |

No aprobar automáticamente snapshots de una UI que aún no fue revisada. Capturas estáticas estabilizadas permiten comparar composición, pero no prueban fluidez, flash o duración. Esos criterios se ejecutan con animación normal, preferencias cambiantes y condiciones registradas. No ejecutar pruebas destructivas sobre `.env`/SQLite reales.

### Trazabilidad de diseño y validación

| Requisitos | Diseño correspondiente | Criterios/guía |
| --- | --- | --- |
| FR-001, FR-009, FR-010, FR-011 | Componentes existentes de acceso/gestión y contrato de continuidad | SC-004, SC-008, SC-009; V-04/V-08/V-09. |
| FR-002, FR-003, FR-004 | Bootstrap, proveedor, interruptor, estado e historial | SC-002; V-02. |
| FR-005, FR-006, FR-007 | Portada real, listado único, imagen completa y WhatsApp actual | SC-001, SC-003; V-01/V-03. |
| FR-008, FR-019 | Navegación existente, español/soles y exclusiones | SC-010; V-10. |
| FR-012 | Estados y avisos en ambas apariencias | SC-009; V-09. |
| FR-013, FR-014, FR-016 | Tokens, controles, foco, movimiento por visita y reducción dinámica | SC-006; V-06. |
| FR-015 | Matriz 360/768/1366, tarjetas y panel conforme a Clarify | SC-005; V-05. |
| FR-017 | Recursos, carga prioritaria, efectos sin bloqueo | SC-007; V-07. |
| FR-018 | Modelo y copia de comprobación sin reset | SC-008; V-08. |
| FR-020, VR-001 a VR-012 | Contrato visual y comparación de referencias | SC-001, SC-011; V-01/V-11. |

### Riesgos y controles concretos

| Riesgo observado | Control diseñado |
| --- | --- |
| Tema incorrecto antes de React o recurso bloqueado por CSP | Bootstrap externo versionado y prueba de carga fría sobre Express; fallback visible sin atributo. |
| Pérdida de archivo, foco o sesión por reconstruir árboles | Contexto/atributos sin keys por tema; conservar subárbol de Gestión y modal, comprobar antes/después. |
| Aspecto parecido solo con fotos de muestra recortadas | Proporciones diversas, `contain`, imágenes reales completas y revisión por VR. |
| Repetición de animación por actualización o historial | Registro independiente por visita/ID, clases transitorias retiradas y prueba de reentrada. |
| Cian o transparencias ilegibles | Tokens de lectura específicos, pares numéricos y revisión de degradados/estados reales. |
| Dañar catálogo durante evidencia | Temporales para operaciones, caso dedicado sin reset para conservación y ninguna mutación sobre la base real. |
| Aceptar un tema por screenshots pero fallar al usarlo | Separar capturas, eventos, tiempos, flujos y revisión humana; conservar pendientes externos. |

## Entrega de Plan y límites

Investigación y decisiones resueltas en `research.md`; modelo sin migraciones en `data-model.md`; contratos y guía generados. Puertas constitucionales previa y posterior aprobadas documentalmente. No cambia código, configuración externa, credenciales o datos; no se ejecutan tests de la app ni se inventa evidencia. La matriz de trazabilidad enlaza todos los FR y las cinco aclaraciones con resultados comprobables.

Para continuar, el responsable podrá solicitar `$speckit-tasks`. Este Plan no lo ejecuta ni abre Implement, no crea tareas, no hace commit/push/merge y no cierra la feature. La evidencia externa pendiente de la feature 001 sigue pendiente.

## Complexity Tracking

Sin violaciones de la Constitution ni excepciones que justificar. Los únicos componentes/activos nuevos responden al selector aprobado, coherencia fotográfica, composiciones solicitadas y movimiento por visita; los contratos comerciales y el almacenamiento existente se mantienen.
