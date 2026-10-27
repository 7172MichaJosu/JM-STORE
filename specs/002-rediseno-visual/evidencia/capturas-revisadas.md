# Capturas revisadas y baselines

Revisor técnico: Codex, durante la ejecución de Implement solicitada por el responsable. Se revisaron individualmente tienda clara, tienda oscura, panel claro y panel oscuro frente a los rasgos RV/VR y las medidas finales, después de aprobar la batería completa. Decisión técnica: adoptar esas cuatro capturas para detectar regresiones visuales posteriores.

Se copiaron únicamente esos cuatro PNG a `tests/e2e/presentacion.spec.js-snapshots/`; [baselines.json](baselines.json) relaciona origen, destino y SHA-256. No se ejecutó --update-snapshots ni se relajó la comparación para esconder diferencias. Las cuatro aserciones toHaveScreenshot pasaron con las opciones predeterminadas.

Condiciones: Chromium 156.0.8078.4, Windows/win32, 1672 × 941, deviceScaleFactor 1, Manrope local fijada y fotografías/datos de ensayo controlados. La banda del panel procede de una creación real temporal; UUID no visibles no alteran el orden preparado. Fuente e imágenes se esperan cargadas.

Estas capturas estáticas usan movimiento reducido/animaciones desactivadas. Los tiempos, foco y movimiento se comprueban por separado con efectos normales. La adopción técnica no sustituye la aceptación externa ni el cierre pendiente T067. Un cambio de SO/motor/fuente/datos requiere revisar diferencias antes de actualizar una baseline.
