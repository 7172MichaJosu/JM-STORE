# Regresión final — 2026-10-26

| Comprobación ejecutada | Resultado real |
| --- | --- |
| `npm test` | 33/33, 14.37 s, cero fallos/omitidos |
| `npm run test:e2e` | 140/140, 4.4 min, cero fallos/omitidos |
| Desglose E2E | Chromium 134; Firefox 3; WebKit 3 |
| Comparación posterior de baselines revisadas | 4/4, 6.5 s, sin actualizar snapshots automáticamente |
| Build posterior | Vite 8.3.5, correcto; 44 módulos |
| Vite/StrictMode y activos | Una entrada real; script, fuente y licencia 200 |

Las cuatro comparaciones posteriores añadieron aserciones de screenshot a casos existentes; el código de la aplicación permaneció igual al de la batería completa. El HTML `playwright-report/index.html` corresponde a la última ejecución de cuatro casos. La batería completa de 140 está registrada aquí y en el registro de ejecución de esta sesión; `npm run test:e2e` regenera su informe completo, usando el lanzador aislado.

Se comprobaron ambas apariencias, seis cambios manuales/seis automáticos, diez puntos de persistencia y cierre/reapertura real de un perfil temporal, almacenamiento bloqueado, historial, campos/File/blob/foco, modal, tres proporciones de fotografía, 100/200 % de texto, límites responsive, teclado, tres motores, movimiento reducido dinámico, cancelación y fallback sin observador. Veinte estados visuales y veinte productos persistentes cuentan con evidencia JSON/capturas propia bajo esta carpeta.

Se corrigieron fallos observados: desborde decorativo inicial, persistencia aún ausente, contraste del reemplazo oscuro, entrada retirada por StrictMode antes del pintado y adornos superpuestos a fotografías en tamaños estrechos/texto ampliado. Los resultados finales conservan los umbrales aprobados.

Todas las operaciones de datos se realizaron en SQLite temporal. No se abrió ni resembró el catálogo real, no se creó/modificó .env y no se cambió el servidor, dependencias o seguridad. WhatsApp real, copia previa, dispositivos/lectura asistida y participantes no se dan por aprobados.
