# Accesibilidad y movimiento — US5

Verificación técnica en Windows: batería transversal de 43 casos aprobada (1.4 min), incluyendo tres recorridos por motor Chromium/Firefox/WebKit. Doce recorridos de teclado adicionales cubren claro/oscuro, 360/768/1366 y texto 100/200 %, seis acciones, objetivos ≥44 × 44, foco y diálogo.

Los eventos reales animationstart/end/cancel verifican aparición una vez por UUID/visita, sin repetir por scroll, tema, validación, alta ajena o revalidación de sesión. Historial inicia otra visita. Reducir movimiento durante una animación produce cancelación real; al volver a normal no se repite lo consumido. Sin IntersectionObserver el contenido queda visible. Hover/pulsación mantienen idéntico rectángulo de pedido. Entrada documental 200 ms, aparición 240 ms y transiciones 180–200 ms; no hay loops ni desplazamiento de formularios/diálogo/fotos.

Se detectó y corrigió un contraste 1.74:1 del reemplazo de foto en portada oscura: ahora adopta la superficie del tema. Los veinte estados medidos pasan: mínimo 5.98:1 en claro y 8.04:1 en oscuro; botones degradados, campos, controles, disabled y foco se complementan con la revisión unitaria de pares semánticos.

Vite/StrictMode: el primer ensayo registró cero entradas en acceso. Se corrigió la cancelación anterior al primer pintado; el ensayo reproducible registra exactamente una entrada, con script/fuente/licencia 200. Ejecutar `node specs/002-rediseno-visual/evidencia/verificar-dev.mjs` (5176 libre; sesión ficticia interceptada, sin SQLite). Resultado en [dev-activos.json](dev-activos.json).

La matriz fotográfica comprueba tres proporciones, cuatro superficies, ambos temas y 360/640/768/1200/1366. Las etiquetas decorativas se separaron del área real de fotografía tras fallos a 360, 640 con texto 200 % y escritorio estrecho. Se calcula la intersección con la fotografía contenida: cero cobertura por adornos al 100/200 %. No se ocultan desbordes de página ni se recodifican imágenes reales.

La batería final vuelve a comprobar todo el conjunto. Esto no sustituye lector de pantalla ni tacto/HTTPS en dispositivo físico: T059 permanece pendiente.
