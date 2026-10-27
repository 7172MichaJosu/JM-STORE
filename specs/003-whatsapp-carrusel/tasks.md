# Tasks: JM-STORE — Pedidos WhatsApp y carrusel

**Input**: Documentos aprobados en `/specs/003-whatsapp-carrusel/`.
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, Constitution 1.0.0 y `AGENTS.md`.
**Prioridad**: US1 y US2 son P1. MVP sugerido: US1 (mensaje y ficha); US2 (carrusel) puede ejecutarse en paralelo.
**Pruebas**: Requeridas por la spec y la solicitud. Escribirlas por historia antes del código y comprobar que fallan por capacidad ausente. Usar SQLite temporal y productos ficticios, nunca la base real.
**Formato**: `- [ ] T### [P?] [US?] acción y archivo`. `[P]` señala tareas independientes, sin archivos en conflicto.

## Phase 1: Setup — preservación

- [X] T001 Con la aplicación detenida, preparar copia consistente del archivo configurado localmente como `SQLITE_PATH` y relacionar productos, fotos y funciones actuales; anotar fecha y comprobación en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md` sin registrar rutas privadas, credenciales ni cookies.

## Phase 2: Foundational — soporte de pruebas

- [X] T002 Permitir inyectar solo en pruebas el lector de `dist/index.html` al crear la app en `server/app.js` y conectarlo a una plantilla controlada desde `tests/fixtures/entorno.mjs`; conservar la carga compilada predeterminada y SQLite temporal.

**Checkpoint**: Completar T001–T002 antes de empezar US1 y US2 en paralelo.

## Phase 3: User Story 1 — Compartir producto por WhatsApp (Priority: P1, MVP)

**Goal**: Preparar mensaje individual completo y ficha compartible con Open Graph al publicar en HTTPS.

**Independent Test**: Con tres productos ficticios con nombre, descripción larga, foto y precio, abrir cada borrador sin enviarlo y cada URL en una sesión nueva; verificar ficha e imagen correctas.

### Pruebas US1 — primero

- [X] T003 [P] [US1] Escribir expectativa independiente para saludo, 📦 📝 💰 🔗, nombre, descripción íntegra, precio, URLs local/pública, símbolos, saltos y codificación única en `tests/unit/whatsapp.test.js`.
- [X] T004 [P] [US1] Probar detalle por UUID, proyección sin BLOB, ausencia, ID inválido y errores en `tests/integration/producto-detalle.test.js`.
- [X] T005 [P] [US1] Probar HTML inicial sin JS, metadatos únicos, origen inmune a Host, escape de `<script>` y `$&`, estados 404/503 en `tests/integration/producto-html.test.js`.
- [X] T006 [P] [US1] Probar JPEG social 1200×630, foto correcta `contain`, orientación, errores y WebP original intacto en `tests/integration/imagen-social.test.js`.
- [X] T007 [P] [US1] Probar E2E de ficha directa/recarga, borrador correspondiente, foto fallida, producto retirado y navegación en `tests/e2e/producto.spec.js`.

Antes de T008–T019, correr pruebas con datos temporales y confirmar que fallan por funciones ausentes.

### Implementación US1

- [X] T008 [P] [US1] Agregar lectura preparada `obtener(id)` con la misma proyección pública, sin BLOB, migración ni cambios a `listar` en `server/db.js`.
- [X] T009 [US1] Añadir `GET /api/productos/:id` con respuesta `{ producto, whatsapp }`, UUID validado, estados 400/404 y cabeceras actuales en `server/routes/catalogo.js` (depende de T008).
- [X] T010 [P] [US1] Crear derivado JPEG en memoria con sharp existente, límite de entrada actual, fondo neutro, lienzo 1200×630 y fotografía `contain`; no guardar ni reemplazar el WebP en `server/imagen-social.js`.
- [X] T011 [US1] Añadir ruta `GET /api/productos/:id/imagen-social`, MIME JPEG y errores seguros, conservando endpoint original en `server/routes/catalogo.js` (depende de T009/T010).
- [X] T012 [P] [US1] Crear helper puro para `/productos/{id}` y URL absoluta desde origen explícito en `src/lib/enlaceProducto.js`.
- [X] T013 [US1] Crear renderer que inserta title, description, canonical y Open Graph en el HTML compilado; escapar valores, usar `config.origin` y no añadir scripts inline en `server/paginas-producto.js` (depende de T008/T010/T012).
- [X] T014 [US1] Crear ruta HTML con estados 200/404/503, `no-store` y sin metadatos de otro producto en `server/routes/paginas-producto.js` (depende de T013).
- [X] T015 [US1] Registrar ruta de ficha antes del 404 global y conservar CSP/cabeceras en `server/app.js` (depende de T014).
- [X] T016 [P] [US1] Implementar mensaje aprobado y consulta de disponibilidad; formar `wa.me` con texto íntegro codificado una vez y pasar origen desde el botón en `src/lib/whatsapp.js` y `src/components/BotonWhatsApp.jsx` (depende de T012).
- [X] T017 [US1] Crear ficha React con carga abortable, foto entera, nombre, descripción con saltos, precio, pedido solo si producto/destino existen, error/reintento y título en `src/pages/Producto.jsx`, `src/App.jsx` y `src/styles/producto.css` (depende de T009/T015/T016).
- [X] T018 [P] [US1] Añadir enlace accesible separado a la ficha por tarjeta, sin anidar el botón WhatsApp, en `src/components/TarjetaProducto.jsx` (depende de T012).
- [X] T019 [US1] Corregir y ejecutar unitarias, HTTP y E2E con tres productos temporales; revisar borradores sin enviar en `tests/unit/whatsapp.test.js`, `tests/integration/producto-detalle.test.js`, `tests/integration/producto-html.test.js`, `tests/integration/imagen-social.test.js` y `tests/e2e/producto.spec.js` (depende de T008–T018).

**Checkpoint**: US1 demostrable en localhost. Preview externa requiere HTTPS público y WhatsApp real.

---

## Phase 4: User Story 2 — Explorar productos en la portada (Priority: P1)

**Goal**: Mostrar productos existentes, avanzar cada cinco segundos, ofrecer controles manuales y pausar/reducir movimiento según las aclaraciones.

**Independent Test**: Con cuatro productos de prueba, observar el avance y navegar por miniatura, flechas y deslizado en computadora/celular; repetir en ambos temas y con movimiento reducido.

### Pruebas US2 — primero

- [X] T020 [P] [US2] Probar selección por UUID, vuelta circular, cero/uno, lista que cambia y clasificación de gestos en `tests/unit/carrusel.test.js`.
- [X] T021 [P] [US2] Probar reloj controlado en 4999/5000 ms, rotaciones, miniaturas/flechas, pausas simultáneas de hover/foco/tacto, reanudación y limpieza en `tests/e2e/carrusel.spec.js`.
- [X] T022 [P] [US2] Probar movimiento reducido inicial/dinámico, tema sin perder selección, teclado, gestos, 360/768/1366, texto al 200 % y overflow en `tests/e2e/carrusel-accesibilidad.spec.js`.
- [X] T023 [P] [US2] Extender pruebas básicas de ficha y navegación manual para Firefox/WebKit en `tests/e2e/basico.spec.js`.

Antes de T024–T029, confirmar que fallan por el carrusel aún ausente.

### Implementación US2

- [X] T024 [P] [US2] Crear helpers puros de selección UUID, recorrido circular y clasificación de gesto en `src/lib/carrusel.js`.
- [X] T025 [US2] Crear hook con timeout único de 5000 ms, pausas independientes, limpieza StrictMode y escucha dinámica de movimiento reducido en `src/hooks/useCarrusel.js` (depende de T024).
- [X] T026 [P] [US2] Agregar trazos accesibles de flecha anterior/siguiente sin quitar iconos actuales en `src/components/Icono.jsx`.
- [X] T027 [US2] Crear carrusel con producto activo, miniaturas hover/activación, flechas, swipe, foco/etiquetas, estados cero/uno y transición 240 ms en `src/components/CarruselProductos.jsx` y `src/styles/carrusel.css` (depende de T024–T026).
- [X] T028 [US2] Pasar listado/estado a portada y reemplazar el producto protagonista estático por carrusel; conservar texto, CTA, franja y estado neutro en `src/pages/Catalogo.jsx` y `src/components/PortadaCatalogo.jsx` (depende de T027).
- [ ] T029 [US2] Corregir y ejecutar pruebas unitarias, E2E, visuales, teclado, tacto y movimiento reducido; comprobar `contain`, foco, contraste y objetivos 44×44 en `tests/unit/carrusel.test.js`, `tests/e2e/` y `src/styles/carrusel.css` (depende de T020–T028).

**Checkpoint**: US2 comprobable con datos temporales, dos temas, medidas indicadas, teclado/tacto y movimiento reducido.

---

## Phase 5: Polish — regresión y aceptación

- [ ] T030 Revisar presentación en ambos temas y actualizar únicamente baselines de tienda justificadas; conservar capturas del panel en `tests/e2e/presentacion.spec.js-snapshots/tienda-claro-1672-chromium-win32.png` y `tests/e2e/presentacion.spec.js-snapshots/tienda-oscuro-1672-chromium-win32.png`.
- [ ] T031 Ejecutar `npm test`, `npm run build` y `npm run test:e2e` definidos en `package.json`; registrar resultados, navegadores y fallos en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.
- [ ] T032 [US1] En HTTPS público autorizado, comprobar tres fichas, imágenes y vistas previas desde fuera de la red local; registrar resultado y límites externos en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.
- [ ] T033 [US1] Con destino comercial autorizado, revisar tres mensajes en WhatsApp real sin enviarlos, incluida descripción larga; documentar límites sin truncar ni agregar fallback en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.
- [ ] T034 [US2] Validar en celular físico gesto/scroll/zoom y en computadora teclado/lectura asistida; documentar ambos temas y movimiento reducido en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.
- [ ] T035 Comparar desde la app catálogo/fotos con inventario previo; verificar persistencia, login/logout y altas/bajas solo con productos ficticios, sin tocar credenciales en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.
- [ ] T036 Confirmar que guía y contratos reflejan la implementación real, anotando aceptaciones pendientes en `specs/003-whatsapp-carrusel/evidencia/aceptacion.md`.

---

## Dependencies & Execution Order

- **Setup**: T001 primero.
- **Foundational**: T002 depende de T001 y prepara pruebas aisladas.
- **User Stories**: US1 y US2 dependen de T002, no dependen funcionalmente entre sí y pueden ejecutarse en paralelo.
- **Polish**: T030–T036 dependen de los checkpoints aplicables. T032 requiere HTTPS público, T033 acceso autorizado a WhatsApp y T034 dispositivos disponibles. Estas tareas no despliegan la tienda.

**US1**: T003–T007 paralelas tras T002. T008/T010/T012 paralelas; T009 depende de T008; T011 de T009/T010; T013 de T008/T010/T012; T014 de T013; T015 de T014; T016 de T012 y puede avanzar mientras se crea HTML; T017 depende de T009/T015/T016; T018 depende de T012 y puede ir paralelo con T017; T019 integra tras T008–T018.

**US2**: T020–T023 paralelas tras T002. T024/T026 paralelas; T025 depende de T024; T027 de T024–T026; T028 de T027; T029 valida T020–T028.

### Oportunidades paralelas

- Después de T002, asignar una historia a cada implementador.
- US1: primero T003–T007; luego T008/T010/T012; continuar T016 mientras avanza la ficha.
- US2: primero T020–T023; luego T024/T026.
- Las tareas sin `[P]` comparten archivo o dependen de la tarea indicada.

## Parallel Example: US1

```text
Pruebas tras T002:
T003 tests/unit/whatsapp.test.js
T004 tests/integration/producto-detalle.test.js
T005 tests/integration/producto-html.test.js
T006 tests/integration/imagen-social.test.js
T007 tests/e2e/producto.spec.js

Implementación independiente:
T008 server/db.js  ||  T010 server/imagen-social.js  ||  T012 src/lib/enlaceProducto.js
```

## Parallel Example: US2

```text
Pruebas tras T002:
T020 tests/unit/carrusel.test.js
T021 tests/e2e/carrusel.spec.js
T022 tests/e2e/carrusel-accesibilidad.spec.js
T023 tests/e2e/basico.spec.js

Implementación independiente:
T024 src/lib/carrusel.js  ||  T026 src/components/Icono.jsx
```

## Implementation Strategy

### MVP primero

1. Completar T001–T002.
2. Escribir T003–T007, implementar US1 T008–T019 y verificar historia independientemente.
3. Implementar US2 T020–T029 como incremento P1 paralelo o posterior.
4. Completar T030–T036; no tratar mocks como aceptación de WhatsApp real.

### Entrega incremental

US1 entrega mensaje y ficha individual. US2 añade navegación de portada sin sustituir el catálogo. La revisión final confirma que ficha, vista previa, mensaje y carrusel corresponden al mismo producto y que las funciones previas siguen disponibles.

## Notes

- `[US1]`/`[US2]` corresponden a las dos historias P1 de `spec.md`.
- Mantener límites existentes: nombre 4096 bytes y descripción 32768 bytes; no truncar. La compatibilidad externa con URLs largas requiere evidencia.
- No agregar paquetes, migraciones, productos de prueba a la base real, secretos, datos personales, pagos o alcance no aprobado.
- T032–T034 podrían quedar pendientes sin HTTPS, WhatsApp autorizado o dispositivos físicos; no aprobar con mocks.
- Esta lista describe trabajo futuro; no ejecuta pruebas ni implementación.





