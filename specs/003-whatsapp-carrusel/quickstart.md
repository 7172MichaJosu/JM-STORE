# Guía de validación — 003 WhatsApp y carrusel

**Estado**: Implementación recuperada y revisada en laptop el 2026-10-27. Las rutas y pruebas descritas existen. Consultar los resultados locales y las aceptaciones externas aún pendientes en [evidencia/aceptacion.md](evidencia/aceptacion.md); esta guía no declara aprobados los ensayos con WhatsApp, HTTPS público ni celular físico.

Contratos de referencia: [HTTP y OG](contracts/productos-http.md), [interfaz y mensaje](contracts/interfaz-whatsapp-carrusel.md), [datos](data-model.md). Los criterios SC pertenecen a [spec.md](spec.md).

## 1. Preparación y conservación

Usar Node.js 24 LTS y ejecutar desde la raíz `C:\JM-STORE`. Para pruebas automatizadas, los fixtures actuales crean SQLite temporal fuera del catálogo real. No cambiar su ruta para apuntarla a la base de la tienda.

Antes de implementar o validar con datos existentes, detener la aplicación y preparar externamente una copia consistente del archivo indicado por `SQLITE_PATH`; conservar la configuración externa de forma privada, fuera de Git. Registrar desde la app una relación previa de productos con nombre, descripción, precio, fotografía y orden, y comprobar el acceso actual sin revelar credenciales. La copia contiene los BLOB de las fotografías. No copiar archivos de base mientras haya escrituras ni reemplazar la base real con una semilla de prueba.

Preparar catálogo de comprobación aislado con al menos diez productos distintos, nombres repetidos con IDs diferentes, texto `Taza & café + plato`, símbolos/tildes/emojis/saltos, una descripción de al menos 500 caracteres, fotografías horizontales/verticales y un precio `S/ 49.90`. Preparar además estados cero/uno/ocho productos, imagen fallida, lectura fallida y producto retirado. El responsable técnico prepara los casos; la persona que acepta comprueba resultados desde la app.

## 2. Instalación y desarrollo local

Comandos de PowerShell para un entorno de laboratorio propio, no para reiniciar una instalación existente:

```powershell
Set-Location C:\JM-STORE
npm ci
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Si ya hay `.env`, conservarlo. Revisar localmente `NODE_ENV=development`, `APP_ORIGIN=http://localhost:5173`, puerto 3001 y una ruta absoluta persistente de SQLite fuera del repositorio. Para un entorno nuevo, usar datos de acceso propios mediante `npm run configurar-acceso`; no ejecutar de nuevo sobre credenciales existentes para esta feature. El número WhatsApp autorizado se configura externamente; no copiarlo, junto con secretos, a la evidencia pública.

Abrir dos terminales en la raíz:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

Abrir `http://localhost:5173`. En el catálogo, usar el enlace de un producto para entrar directamente a su ficha y copiar esa URL a otra pestaña del mismo equipo. Esperado: fotografía entera, descripción íntegra, precio y acción correctos; recargar mantiene la ficha. La URL en el borrador utiliza puerto 5173, no el puerto de la API. Localhost no permite validar preview remoto ni acceso desde otro equipo.

## 3. Compilación local y HTML inicial

Detener los servidores previos antes de usar el mismo puerto. En una terminal nueva con la configuración externa preservada:

```powershell
npm run build
$env:APP_ORIGIN = 'http://127.0.0.1:3001'
$env:NODE_ENV = 'development'
npm start
```

Estas variables afectan la terminal; no reescribir `.env`. Abrir `http://127.0.0.1:3001`, entrar a una ficha y recargar. Esperado: mismo producto y enlace con origen 3001.

Comprobación técnica de HTML sin ejecutar JS, usando el primer producto del entorno de comprobación:

```powershell
$catalogoRevision = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/catalogo'
$idRevision = $catalogoRevision.productos[0].id
$urlRevision = 'http://127.0.0.1:3001/productos/' + $idRevision
$htmlRevision = (Invoke-WebRequest -Uri $urlRevision).Content
$htmlRevision | Select-String -Pattern 'og:title|og:description|og:image|og:url|canonical'
```

Esperado: metadatos del mismo producto, URL canónica absoluta e imagen social absoluta, una sola instancia por propiedad, título/description estándar únicos y textos escapados. Comprobar el JPEG con la ruta del contrato y verificar 1200×630; no confundir estos resultados locales con aceptación real de WhatsApp. La prueba HTTP automatizada cubre también Host ajeno, caracteres de inyección y errores.

## 4. Pruebas automatizadas después de implementar

Preparar navegadores una sola vez si no están instalados:

```powershell
npx playwright install chromium firefox webkit
```

Ejecutar la suite Node y luego la suite E2E existente, que compila y crea su servidor/datos temporales:

```powershell
npm test
npm run test:e2e
```

Esperado: pruebas existentes y nuevas aprobadas, sin alterar el catálogo real. Chromium cubre casos completos; Firefox/WebKit incluyen ficha y navegación manual en `basico.spec.js`. Registrar recuentos y fallos reales, no reutilizar números históricos de 002 como evidencia de 003.

Los casos del temporizador usan reloj controlado de Playwright: no avanzar antes de 4999 ms, un cambio al llegar a 5000 ms, diez avances, pausa simultánea por foco/hover/tacto y reanudación tras un período completo. Emular movimiento reducido al inicio y durante la visita. Las pruebas HTTP inyectan plantilla mínima para que `npm test` no necesite una compilación previa; E2E verifica también HTML compilado real. No reducir cobertura o actualizar capturas automáticamente para convertir un fallo en aprobación.

La revisión de laptop añade `tests/e2e/aceptacion-carrusel.spec.js`: ciclo de ocho productos con diez avances, diez selecciones por método en ambos temas y preferencias de movimiento, pausa combinada de tacto/foco y diez fichas en sesiones nuevas. Para repetir solo estos casos después de compilar, ejecutar `node tests/fixtures/ejecutar-web.mjs aceptacion-carrusel.spec.js --project=chromium`. Los Pointer Events simulados comprueban el código; el scroll/zoom y el gesto físico siguen requiriendo celular.

## 5. Escenarios observables de aceptación

| Caso | Condiciones y acción | Resultado esperado / criterio |
| --- | --- | --- |
| Mensaje completo | Cinco productos de prueba, uno con ≥500 caracteres. Abrir cada pedido en WhatsApp y revisar sin enviarlo. | Cinco mensajes con saludo, 📦/📝/💰/🔗, nombre, descripción íntegra, precio y URL correctos. Ningún envío automático; SC-001. |
| Ficha directa | Copiar diez enlaces a nuevas sesiones y recargarlos. Retirar solo un producto ficticio y abrir su enlace. | Diez fichas del producto correcto; retirado muestra no disponible y no otro producto/pedido; SC-002. |
| Carrusel normal | Ocho productos, puntero fuera y sin foco dentro. Observar diez avances; después seleccionar diez veces por miniaturas y flechas. | Períodos de cinco segundos, recorrido por todos sin duplicados por ciclo y selección indicada; SC-004. |
| Pausa | Mantener puntero, después foco y luego tacto; combinar dos pausas y terminar solo una. | No avanza mientras persista alguna. Al terminar todas, transcurren cinco segundos completos antes del cambio; SC-004. |
| Tacto | En celular, diez deslizamientos horizontales; repetir con verticales/cortos/cancelados y desde controles. | Horizontal cambia en dirección esperada; los demás no cambian ni activan pedido accidental; scroll y zoom utilizables. |
| Vacío/unitario | Preparar cero productos y luego uno, ambos temas. | Vacío comprensible sin productos ficticios; uno sin rotación ni controles redundantes; SC-005. |
| Movimiento reducido | Activar preferencia antes de abrir y también mientras rota; hacer diez cambios manuales. | Se detiene autoplay y no hay transición no esencial; controles siguen funcionando; SC-005/006. |
| Tema y adaptación | Repetir a 360/768/1366 en claro/oscuro; seleccionar producto y cambiar tema; ampliar texto al 200 % y recorrer con teclado. | Misma selección, foto íntegra, texto/control legibles, foco visible y sin overflow horizontal de página; SC-006. |
| Fallos | Preparar foto fallida, lectura fallida e ID inexistente. | Reemplazo de foto sin perder detalles, error con reintento, ausencia sin producto ajeno. Sin secretos o mensajes técnicos. |
| Conservación | Comparar relación previa, recargar y reiniciar entorno; probar acceso/logout, alta y eliminación solo de un producto ficticio. | Productos originales, fotografías, orden y credenciales conservados; todas las funciones siguen disponibles; SC-007. |

El responsable técnico complementa la observación con medición de 240 ms y contraste heredado: texto normal 4.5:1, grande/controles/foco 3:1; objetivos 44×44. Actualizar y revisar únicamente capturas de tienda afectadas; panel continúa con regresión actual.

## 6. Publicación y WhatsApp real: pendiente externo

Cuando exista un entorno público autorizado, configurar privadamente `APP_ORIGIN` con su origen HTTPS y `NODE_ENV=production`. Mantener ruta SQLite persistente y credenciales existentes. El servidor/proxy debe servir Express para `/productos/{id}`, API y assets; un alojamiento exclusivamente estático no genera el HTML específico.

1. Abrir desde otro dispositivo tres enlaces públicos de productos distintos. Esperado: fichas e imágenes sin cuenta; URLs sin localhost, puertos locales o secretos.
2. Consultar el HTML inicial y la imagen social desde fuera de la red local. Esperado: HTTPS, 200, OG correcto y JPEG del producto, sin sesión.
3. En WhatsApp real, pegar cada enlace en un borrador propio de prueba sin enviarlo. Observar fotografía, nombre y descripción cuando el servicio genere tarjeta. Esperado de SC-003: tres previews correspondientes a sus productos. La descripción visible puede ser fragmento del texto ofrecido.
4. Abrir los borradores desde los botones y comprobar el destinatario autorizado y el texto completo; no enviarlos. Incluir textos extensos y registrar cualquier límite real sin truncar ni declarar aprobación parcial como total.
5. Si una tarjeta no aparece, distinguir falta de acceso/metadatos/imagen de caché o decisiones externas de WhatsApp. No prometer renovación o eliminación inmediata de previews ya cacheados por terceros.

Sin dominio/HTTPS o WhatsApp autorizado, registrar estos casos como pendientes, con causa. No aprobarlos mediante mocks, interceptaciones de wa.me o la presencia de etiquetas locales. Si el servicio externo bloquea un requisito, comunicarlo y resolver el comportamiento con decisión aprobada antes de aceptar la feature.

## 7. Evidencia posterior

El registro [evidencia/aceptacion.md](evidencia/aceptacion.md) distingue evidencia recuperada, resultados de laptop y dependencias externas. Adjuntar pruebas/capturas revisadas sin credenciales, cookies, rutas privadas o número real innecesario. Mantener pendientes de 001/002 y distinguir aprobación técnica de los ensayos presenciales/WhatsApp.
