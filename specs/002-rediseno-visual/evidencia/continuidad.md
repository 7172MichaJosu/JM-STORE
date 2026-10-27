# Continuidad del proyecto

Auditoría contra los hashes de T001: cero cambios en servidor, esquema, autenticación, API, precio, WhatsApp, manifiestos, lock, Constitution, AGENTS y documentos de decisión protegidos. La comparación se repite al finalizar.

Las modificaciones de la tienda son presentación, estado visual y recursos locales. No hay migraciones, reset/seed del catálogo real, endpoints nuevos, dependencias nuevas ni cambios de codificación comercial o CSP. Los únicos INSERT/DELETE de las verificaciones usan bases temporales explícitas de ensayo. No existe `.env` y no se ha creado; no se ejecutó configurar-acceso. No hay commit, push ni merge.

La conservación técnica está en [us4-pruebas.md](us4-pruebas.md). La aceptación humana sobre copia del catálogo previo permanece pendiente T046.


Auditoría final repetida: cero diferencias en los hashes protegidos. Quickstart/README/estado/tareas se actualizaron conforme a T066; spec, cinco aclaraciones, plan.md, contratos y checklist permanecen intactos. Los tres activos coinciden byte por byte con dist y las cuatro baselines coinciden con sus capturas revisadas. `git diff --check` con la configuración CRLF del repositorio pasa. El temporal .playwright-entorno.json fue retirado por el lanzador; la rama continúa en 002-rediseno-visual.
