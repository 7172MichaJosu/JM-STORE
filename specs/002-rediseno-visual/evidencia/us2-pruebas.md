# US2 — tema verificado

2026-10-26: `npm run test:e2e -- --project=chromium tema.spec.js`: **13/13**, 10.2 s. Bootstrap/contraste unitarios ya comprobados en fundamentos.

Antes de completar el proveedor, el caso de persistencia falló significativamente: localStorage devolvía null después de elegir oscuro. Tras la implementación pasó.

| Pantalla | Automático oscuro/claro (ms) | Manual oscuro/claro (ms) |
| --- | --- | --- |
| Tienda | 52 / 27 | 60 / 45 |
| Acceso | 25 / 14 | 41 / 48 |
| Gestión autenticada | 47 / 18 | 65 / 18 |

Las doce respuestas fueron ≤500 ms. Se verificaron los diez puntos de conservación: tienda, acceso, gestión, recarga y reapertura de pestaña en el mismo perfil, en claro y en oscuro. En entradas posteriores a elección se muestrearon los cinco primeros fotogramas con contenido: no apareció el tema contrario.

También pasaron lectura/escritura bloqueadas, prioridad manual, historial real y evento pageshow persistido, bootstrap abortado con catálogo usable, activos 200 y CSP sin unsafe-inline. Cambiar tema conserva nombre, File, URL blob y foco del selector; cero solicitudes /api/ por el cambio. El cambio automático conserva selección, diálogo nativo abierto y foco Cancelar; Escape no elimina. Ningún componente se remonta por tema.

Condición: Windows/Chromium y perfiles aislados Playwright. Reapertura comprobada de pestaña del mismo perfil; no se afirma haber cerrado un navegador personal ni ensayado un dispositivo físico.


Batería final: todos los quince casos de tema pasaron dentro de los 140 E2E. Se añadió cierre y reapertura real de un perfil Chromium exclusivamente temporal, conservando oscuro y luego claro. También pasó escritura denegada con valor previo y restauración de historial. Las doce respuestas finales fueron 34–148 ms; la comprobación anterior de reapertura de pestaña se mantiene como caso adicional. No se utilizó ningún perfil personal.
