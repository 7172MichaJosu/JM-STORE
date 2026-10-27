# Arranque, CSP y activos

La compilación Express supera las pruebas de rutas recargables /, /encargado y /encargado/ingresar. En las entradas frías el bootstrap clásico externo establece la apariencia antes de React; se muestrearon los primeros cinco fotogramas de contenido sin tema contrario. El fallo intencional del recurso conserva contenido y selector operativos.

- Script, Manrope y licencia responden 200 en Vite y Express; en Express conservan caché immutable del servidor existente.
- La prueba comprueba script-src self, ausencia de unsafe-inline y ausencia de scripts/estilos inline en el DOM del producto; scripts, stylesheet y font proceden del mismo origen.
- No hay CDN, dependencias nuevas, rutas nuevas o cambios a CSP/autenticación. El script conserva su nombre versionado v1 y el contenido no cambió después de incorporarlo; Vite versiona los bundles por contenido.
- El tema utiliza solo jm-store.tema y valores claro/oscuro. Lectura/escritura fallidas se controlan sin perder trabajo. Los cambios de apariencia no consultan ni mutan datos comerciales.
- .env permanece ausente, sin configurar acceso. Los procesos de prueba tienen credenciales ficticias y rutas temporales explícitas. No se publican secretos.

Los hashes de los activos originales están en [activos.md](activos.md), la licencia junto a Manrope y los resultados de desarrollo en [dev-activos.json](dev-activos.json). La auditoría de continuidad comprueba el servidor y utilidades protegidos contra T001.
