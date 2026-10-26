# Modelo de datos — JM-STORE

**Estado**: diseño de fase 1; no contiene migraciones ni implementación.

## Producto persistente

Tabla prevista `productos`, con tipado estricto SQLite. Es la única tabla funcional. Requisitos: FR-001, FR-003, FR-010–FR-013; A-03 y A-05.

| Campo | Tipo | Reglas y finalidad |
| --- | --- | --- |
| `id` | TEXT, clave primaria | UUID generado por servidor; inmutable. Identifica incluso nombres repetidos. |
| `nombre` | TEXT, obligatorio | Texto distinto de espacios; quitar espacios exteriores, conservar caracteres internos. ≤4096 bytes UTF-8. |
| `descripcion` | TEXT, obligatorio | Texto distinto de espacios; quitar espacios exteriores, conservar tildes, signos y saltos internos. ≤32768 bytes UTF-8. |
| `precio_centimos` | INTEGER, obligatorio | Mayor que cero y ≤9007199254740991, límite de entero seguro de JavaScript. Moneda fija PEN; no hay campo de moneda editable. |
| `imagen` | BLOB, obligatorio | Copia WebP decodificada/normalizada por la aplicación; no vacía y ≤10485760 bytes. No es enlace ni ruta al dispositivo. |
| `imagen_mime` | TEXT, obligatorio | Valor `image/webp` correspondiente a la copia, definido por servidor. |

No hay tablas para categorías, inventario, variantes, clientes, pedidos o historial. No se añaden campos de edición ni borrado lógico. Se consulta con orden explícito por `id` para evitar cambios arbitrarios de orden; no existe una promesa de orden comercial.

### Precio de entrada y salida

- Campo de entrada `precio`: cadena decimal con dígitos, opcionalmente punto o coma y una o dos cifras decimales; sin separadores de miles, signo, símbolo monetario ni exponente. Quitar espacios exteriores. Ejemplos válidos: `49`, `49.9`, `49,90`, `0.01`.
- Convertir las partes a céntimos con aritmética entera y comprobar rango antes de insertar. `49.90` produce `4990`; no usar redondeo para aceptar `49.999`.
- Rechazar cadena vacía, cero, negativos, `1e2`, `NaN`, tres decimales y valores fuera de rango, con error del campo `precio`.
- API pública: `precioCentimos` entero; interfaz y WhatsApp: mismo formateador, prefijo exacto `S/ `, punto y dos decimales, sin agrupadores. Formar parte entera y dos dígitos de céntimos desde el entero; no depender de convertir a decimal binario y aplicar `toFixed`, que puede perder precisión en el extremo del rango. No hay cantidades ni totales.

### Imagen de entrada y conservación

Un solo archivo del dispositivo; JPEG, PNG o WebP estático. Original ≤10 MiB y ≤25000000 píxeles. El servidor limita número de archivos/campos/partes y bytes; no acepta SVG, archivos animados, enlaces ni un MIME declarado como prueba suficiente.

Tras autenticar, decodificar todo el contenido mediante Sharp con rechazo de advertencias de corrupción, límite de píxeles y sin opción ilimitada. Orientar según el original, retirar metadatos y generar WebP sin recortar ni redimensionar; comprobar de nuevo ≤10 MiB. Si falla, señalar `imagen` y no iniciar el alta. La ayuda del formulario debe informar los límites; aceptar formatos adicionales requeriría revisar el contrato técnico, sin añadir una función de edición.

La previsualización local `blob:` solo ayuda a revisar el archivo antes de guardar; no se envía ni persiste esa URL. Liberarla cuando se descarte el borrador. La copia del servidor continúa disponible desde otro dispositivo y al eliminar el original.

### Integridad y transacciones

- Restricciones de SQLite: tipos estrictos; campos no nulos; nombre/descripción no vacíos; precio entero positivo en rango; BLOB no vacío en rango y MIME fijo. La validación de espacios y decodificación se realiza además en servidor.
- Crear producto e imagen mediante una sola inserción atómica. UUID distinto por alta; no hay unicidad del nombre. Responder `201` únicamente después del commit.
- Eliminar por ID exacto en una sola operación; la imagen desaparece con la fila. Responder `204` después del commit. ID ausente: `404`, sin modificar otro producto.
- Cualquier fallo de escritura revierte la operación y conserva los otros productos. No anunciar éxito ni eliminar una tarjeta de forma optimista antes de confirmación.
- SQL preparado con parámetros. Las consultas de catálogo no incluyen el BLOB. Ruta de imagen consulta solo el ID y devuelve MIME del servidor, `nosniff` y `no-store`.
- Las pulsaciones repetidas se bloquean en la interfaz desde el inicio hasta resolver la operación. No se reintentan escrituras automáticamente. El contrato no introduce deduplicación por nombre, ya que se admiten productos distintos con el mismo nombre.

### Transiciones observables

| Origen | Acción | Resultado |
| --- | --- | --- |
| Borrador local | Datos inválidos | Continúa borrador; errores por campo; ninguna fila creada. |
| Borrador válido | Guardar | Estado guardando, confirmación bloqueada. |
| Guardando | Commit correcto | Producto disponible una vez; éxito; formulario puede limpiarse. |
| Guardando | Fallo previo al commit | No existe producto nuevo; conservar campos y archivo para reintentar. |
| Producto existente | Solicitar eliminar | Diálogo con nombre; aún no se modifica. |
| Confirmación abierta | Cancelar | Producto y copia intactos. |
| Confirmación abierta | Confirmar | Estado eliminando; confirmación bloqueada. |
| Eliminando | Commit correcto | Fila/copia ausentes en próximas consultas. |
| Eliminando | Fallo de escritura | Producto intacto; mensaje de error y reintento. |

Un fallo de lectura de imagen después del alta usa «Imagen no disponible»; no elimina el producto ni sus datos. Una pestaña antigua puede conservar una tarjeta hasta la siguiente consulta/recarga, conforme a EC-05.

## Acceso del encargado — configuración, sin tabla de usuarios

| Dato externo | Regla |
| --- | --- |
| `ADMIN_USERNAME` | Identificador del único encargado; no se publica como parte del catálogo ni se registra al fallar. |
| `ADMIN_PASSWORD_HASH` | Registro `scrypt$131072$8$1$<saltBase64>$<derivadoBase64>`, con salt de 16 bytes o más y derivado de 64 bytes. El servidor valida algoritmo, parámetros y longitudes antes de aceptar configuración. Solo servidor, excluido de Git. |

El preparador técnico local solicitará usuario y contraseña sin eco ni argumentos, generará salt/hash y escribirá la configuración externa ignorada por Git. No guarda contraseña en claro. No constituye registro público ni administración de cuentas.

No hay relaciones con Producto: no se necesita autoría, historial ni roles. Configuración inválida de credenciales impide arrancar la gestión con acceso abierto.

## Sesión técnica — memoria del proceso

| Campo interno | Tipo | Regla |
| --- | --- | --- |
| `tokenHash` | Cadena SHA-256 | Clave de `Map`; derivada de 32 bytes aleatorios. El token original solo viaja en cookie protegida. |
| `expiresAt` | Instante UTC en milisegundos | Ocho horas desde emisión; validar en cada operación, no depender del reloj del navegador. |

Relación conceptual: cada sesión autoriza al mismo encargado, sin tabla ni dato de identidad duplicado. Cada login emite un token nuevo. Expiración elimina/rechaza la entrada; logout la elimina y vence la cookie; reiniciar vacía las sesiones. No se exige persistencia de sesiones en la spec.

Los contadores de intentos de acceso son estado técnico temporal en memoria, con vencimiento de 15 minutos. No se persisten ni registran sus claves de red. Ninguno de estos estados llega al modelo público de producto.

## Destino comercial — configuración externa

`WHATSAPP_NUMBER`: número canónico con `+`, prefijo internacional y dígitos, hasta 15. Validar plan numérico con metadatos `max`; no verificar cuenta activa. Es común a todos los productos, sin pantalla de administración.

El servidor transforma configuración válida en `{ disponible: true, destino: <digitos> }`; ausente/inválida en `{ disponible: false, destino: null }`. No se publica el texto inválido ni se detiene el catálogo. No se persiste en una tabla.

## Solicitud preparada — transitoria, sin almacenamiento

Se construye en la tarjeta a partir de nombre, descripción y precio formateado visibles. Se codifica en el enlace externo, según [contracts/whatsapp.md](contracts/whatsapp.md). No tiene ID de pedido, estado comercial, datos de cliente ni relación persistente. No se guarda en SQLite, registros o almacenamiento del navegador.

## Resumen de relaciones y persistencia

```text
Producto 1 ── 1 imagen BLOB en la misma fila
Encargado configurado 1 ── N sesiones técnicas temporales
Destino comercial configurado 1 ── N enlaces transitorios de producto
```

Solo Producto e imagen deben sobrevivir a recarga, nueva navegación y reinicio. SQLite se ubica en ruta persistente externa al código, con directorio y diario escribibles por el proceso y sin acceso público al archivo. No versionar bases de datos, diarios ni secretos.
