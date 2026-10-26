# Fase 0 — Investigación y decisiones

**Fecha**: 2026-10-26 | **Entrada**: [spec.md](spec.md), incluidas sus dos aclaraciones.

Investigación documental con tres agentes de solo lectura: acceso/sesión, servidor/persistencia/imágenes y cliente/WhatsApp/pruebas. Las decisiones siguientes son de diseño, no afirmaciones de que exista implementación. Las fuentes son documentación primaria consultada en esta fecha. Las versiones exactas se fijarán con lockfile durante Implement.

## R-01 — Aplicación y servidor

**Decisión**: React 19 y Vite 8.3 con JavaScript/JSX; servidor Node.js 24 LTS y Express 5, bajo el mismo origen. Un paquete npm, tres vistas y CSS propio.

**Razón**: mantiene React/Vite y permite acceder a SQLite y proteger operaciones desde internet, como exigen A-02, A-05 y FR-019. El navegador no debe poseer la base de datos ni credenciales. Las familias elegidas son compatibles con Node 24; Express aporta rutas, multipart integrado mediante middleware y errores HTTP sin un framework de aplicación adicional.

**Alternativas consideradas**: web estática con SQLite en el navegador no ofrece catálogo compartido ni autorización de servidor; frameworks adicionales, servicios separados y renderizado en servidor no responden a necesidades de esta versión. Un router y gestor global de estado tampoco son necesarios para tres vistas sin navegación compleja.

**Fuentes**: [versiones React](https://react.dev/versions), [versiones soportadas de Vite](https://vite.dev/releases), [requisitos de Vite](https://vite.dev/guide/), [Express 5](https://expressjs.com/en/5x/api/), [ciclo de versiones Node](https://nodejs.org/en/about/previous-releases).

## R-02 — SQLite y atomicidad de producto e imagen

**Decisión**: `better-sqlite3` 13 con SQL preparado y una tabla de productos; copia de imagen como BLOB en la misma fila. El catálogo no selecciona el BLOB; una ruta pública lo entrega por ID. Disco persistente, diario DELETE, sincronización FULL y transacciones breves.

**Razón**: satisface FR-011 con una sola operación atómica. Alta conserva datos e imagen o ninguno; eliminación retira ambos. No hace falta coordinar carpetas, mover archivos, compensar fallos ni limpiar archivos huérfanos. El volumen de aceptación es 20 productos y solo hay un encargado. Decodificar antes de abrir la transacción; éxito HTTP después del commit.

**Alternativas consideradas**: archivos externos obligan a coordinar dos almacenamientos; servicio de objetos añade infraestructura no solicitada; ORM añade abstracción innecesaria. `node:sqlite` evita una dependencia, pero la documentación de Node 24 consultada lo clasifica como candidato de lanzamiento; se prefiere la API consolidada de transacciones de better-sqlite3. No se necesita WAL para este acceso pequeño con un único proceso.

**Fuentes**: [tipos SQLite](https://www.sqlite.org/datatype3.html), [commit atómico](https://www.sqlite.org/atomiccommit.html), [pragmas SQLite](https://www.sqlite.org/pragma.html), [transacciones better-sqlite3](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md), [compatibilidad del paquete](https://github.com/WiseLibs/better-sqlite3/blob/master/package.json), [node:sqlite en Node 24](https://nodejs.org/docs/latest-v24.x/api/sqlite.html).

## R-03 — Subida y copia de imagen utilizable

**Decisión**: Multer 2 solo en el alta autenticada, almacenamiento temporal en memoria con límites; Sharp 0.35 decodifica completamente y normaliza a WebP, orientando según el original y retirando metadatos. Sin recorte, redimensionamiento ni edición visible. JPEG, PNG o WebP estático; original/copia ≤10 MiB y original ≤25 millones de píxeles.

**Razón**: una extensión o MIME no demuestra que un archivo sea imagen utilizable. La decodificación completa impide guardar un archivo corrupto como éxito. Los límites acotan memoria para una tienda expuesta a internet; deben mostrarse en el campo y devolver errores específicos sin perder los demás datos. El BLOB es independiente de la previsualización `blob:` y del dispositivo original. Retirar metadatos evita conservar información ajena al catálogo.

**Alternativas consideradas**: confiar en el nombre/MIME o solo leer metadatos no valida todos los píxeles; guardar una URL externa o una ruta del dispositivo contradice Clarify. Almacenar originales de cualquier tipo exige más validadores y formatos de visualización. Un procesador/gran servicio de imágenes no es necesario.

**Fuentes**: [Multer y límites de memoria](https://expressjs.com/en/resources/middleware/multer/), [Sharp: entrada y límites](https://sharp.pixelplumbing.com/api-constructor/), [Sharp: salida y metadatos](https://sharp.pixelplumbing.com/api-output/).

## R-04 — Precio, textos y formato peruano

**Decisión**: recibir precio como texto decimal, aceptar punto o coma decimal sin separadores de miles y hasta dos decimales; convertir por partes a céntimos enteros seguros. Rechazar cero, negativos, exponenciales, exceso de decimales y desbordamientos; nunca redondear silenciosamente. Un formateador produce exactamente `S/ ` más importe con punto y dos decimales.

**Razón**: satisface FR-004/FR-010 y evita errores de punto flotante o variaciones del símbolo según navegador. Tarjeta y borrador usan el mismo valor formateado. Textos como nodos de React, sin interpretación HTML, conservan tildes, `&`, `+` y contenido extenso.

**Alternativas consideradas**: SQLite REAL y cálculos con decimales binarios pueden introducir errores; moneda internacionalizada por defecto puede variar el prefijo/espacio requerido. No se necesita biblioteca monetaria. Nombre y descripción tienen límites defensivos de transporte de 4/32 KiB UTF-8; se muestran y rechazan excesos, sin truncado oculto.

**Fuentes**: [tipos y enteros SQLite](https://www.sqlite.org/datatype3.html), [listas y claves de React](https://react.dev/learn/rendering-lists), [contenido en componentes React](https://react.dev/reference/react-dom/components/common). La representación en céntimos y los límites son decisiones propias del diseño.

## R-05 — Acceso del único encargado

**Decisión**: `ADMIN_USERNAME` y hash scrypt en configuración externa del servidor; sin tabla de usuarios. Verificación asíncrona mediante `node:crypto` y comparación temporalmente constante. Parámetros iniciales: `N=131072`, `r=8`, `p=1`, salt aleatorio ≥16 bytes y `maxmem` suficiente, por ejemplo 256 MiB. Un preparador local interactivo escribirá solo usuario y hash en `.env`, sin contraseña en argumentos, historial o salida.

Sesión opaca: 32 bytes aleatorios en cookie; SHA-256 del token en memoria, ocho horas de duración absoluta. Logout elimina el hash. Reinicio invalida sesiones. Cookie de producción HttpOnly, Secure y SameSite Strict, prefijo `__Host-`, sin Domain. Desarrollo HTTP exclusivamente local usa otro nombre sin Secure.

**Razón**: cumple FR-019 con revocación inmediata y sin servicio de identidad. La persistencia de sesión no está solicitada; conservarla en memoria evita otra tabla o biblioteca. SHA-256 se usa solo para tokens aleatorios, nunca como hash de contraseña.

**Alternativas consideradas**: JWT requiere resolver revocación; tokens en `localStorage` quedan disponibles a JavaScript; ocultar botones no autoriza operaciones. Persistir sesiones en SQLite es posible, pero aporta continuidad no exigida. OAuth, registro y recuperación agregan funcionalidades fuera de alcance.

**Fuentes**: [Node Crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [almacenamiento de contraseñas OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [sesiones OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [cookie Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

## R-06 — Operaciones protegidas y fallos seguros

**Decisión**: toda mutación, incluido login/logout, exige cabecera `X-JM-STORE-Request: 1` y `Origin` exacto contra configuración; CORS cerrado a otros orígenes. Alta/baja requieren sesión validada por servidor antes de consumir la imagen y antes del commit tras cualquier espera. Límite de cinco accesos fallidos por origen de red en 15 minutos, cuerpo de login ≤4 KiB y errores genéricos. No hay reintentos automáticos de escritura.

**Razón**: la cabecera no puede enviarse desde un formulario externo ordinario y las peticiones de otros orígenes no reciben autorización CORS. Con la comprobación de origen y cookie Strict protege esta API del mismo origen, incluido multipart. Límites y autorización responden a la exposición a internet de A-02. No se registran credenciales ni datos personales.

**Alternativas consideradas**: solo SameSite o protección visual dejan controles incompletos; token CSRF sincronizado es una alternativa válida, pero innecesario con esta API exclusivamente Ajax y sus cabeceras/origen obligatorios. Si cambia el contrato de orígenes, se deberá revisar esta decisión. No se crean endpoints de pruebas en producción.

**Fuentes**: [cabeceras personalizadas para prevenir CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi), [prácticas de seguridad Express](https://expressjs.com/en/advanced/best-practice-security/).

## R-07 — WhatsApp sin sistema de pedidos

**Decisión**: enlace oficial `wa.me` con número internacional en dígitos y mensaje codificado una sola vez. El servidor valida configuración `+E.164` con `libphonenumber-js/max`; expone destino válido o estado deshabilitado. No se limita a números peruanos ni se inventa un número real.

**Razón**: FR-005–FR-008 requieren abrir un borrador correcto en una activación y detectar configuración inválida, sin confirmar envío. La biblioteca se usa solo en servidor y solo para el número comercial; no añade campos del cliente. Validar formato/plan no demuestra una cuenta activa ni disponibilidad del servicio.

**Alternativas consideradas**: expresión regular verifica caracteres y máximo de 15 dígitos, pero puede admitir prefijos o longitudes de países incorrectos. Los metadatos `max` permiten validación más completa sin consultas externas. SDK/API de WhatsApp, pedidos en base de datos o envío automático no forman parte de la spec.

**Fuentes**: [WhatsApp: clic para chatear](https://faq.whatsapp.com/5913398998672934/), [WhatsApp: enlaces universales](https://faq.whatsapp.com/425247423114725/), [ITU E.164](https://www.itu.int/rec/T-REC-E.164/), [libphonenumber-js y metadatos](https://github.com/catamphetamine/libphonenumber-js).

## R-08 — Presentación accesible y adaptable

**Decisión**: paleta común marfil/verde profundo/acento cálido, tipografía de sistema, Grid flexible, texto completo, controles ≥44 px y foco visible. HTML semántico, errores asociados, estados anunciados y diálogo de eliminación con cancelación/restauración de foco. Transiciones CSS breves y movimiento no esencial suprimido con preferencia reducida.

**Razón**: concreta FR-014–FR-016 sin dependencias visuales. Los 44 px son una decisión de diseño para tacto; no se confunden con el mínimo general WCAG 2.2. No se reduce el alcance a emulación: se comprueban celular real, teclado y texto al 200 %.

**Alternativas consideradas**: framework CSS y biblioteca de animaciones no aportan requisitos necesarios; truncar descripciones, depender del hover o usar tarjetas rígidas contradice accesibilidad y lectura completa.

**Fuentes**: [W3C: texto al 200 %](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [W3C: tamaño mínimo de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [preferencia de movimiento reducido](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## R-09 — Verificación proporcional y continuidad SDD

**Decisión**: `node:test` para lógica y contratos con SQLite temporal real; Playwright para navegador y fallos controlados mediante entorno de pruebas. Validación manual con condiciones, acciones, resultados y evidencias SC-001–SC-009. No inicializar ni ejecutar aplicación en Plan. Los comandos futuros se especifican como contrato propuesto en [quickstart.md](quickstart.md).

**Razón**: autorización, transacciones y persistencia necesitan comprobación técnica; una persona no técnica debe poder aceptar el producto desde la app. La revisión de borradores reales, los cinco participantes y los tiempos no se sustituyen por pruebas de componentes.

**Alternativas consideradas**: solo pruebas manuales no cubren HTTP directo; solo automatización no acredita comprensión visual ni integración externa real. Añadir Jest, Vitest, Testing Library o una plataforma de pruebas remota no es necesario para esta versión.

**Fuentes**: [runner de Node](https://nodejs.org/docs/latest-v24.x/api/test.html), [Playwright](https://playwright.dev/docs/intro), [emulación Playwright](https://playwright.dev/docs/emulation), [Constitution](../../.specify/memory/constitution.md).

## Resultado

Todas las cuestiones técnicas identificadas tienen decisión, motivo y alternativa. No quedan aclaraciones pendientes. Credenciales, destino de prueba, HTTPS y disco persistente son prerrequisitos de ejecución futura que se proporcionan externamente. Las fuentes sustentan capacidades de las herramientas; la arquitectura y los límites concretos son decisiones de este plan. No se han instalado dependencias del producto ni creado código de aplicación.
