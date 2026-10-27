# Contrato HTTP y Open Graph — 003

**Estado**: Diseño para Implement. Complementa los contratos de 001/002; no cambia altas, eliminación, acceso o `/api/catalogo`.

## Convenciones

IDs usan el validador UUID existente de `server/errores.js`. Proyección de producto según [data-model.md](../data-model.md). Lecturas públicas sin cuenta ni cookie requerida; nunca exponen BLOB en JSON, credenciales, ruta SQLite o configuración completa. Respuestas dinámicas con `Cache-Control: no-store`, cabeceras de seguridad existentes y `X-Content-Type-Options: nosniff`.

## GET /api/productos/{id}

**200**, `application/json`:

```json
{
  "producto": {
    "id": "123e4567-e89b-42d3-a456-426614174000",
    "nombre": "Taza & café + plato",
    "descripcion": "Descripción completa del producto de prueba.",
    "precioCentimos": 4990,
    "imagenUrl": "/api/productos/123e4567-e89b-42d3-a456-426614174000/imagen"
  },
  "whatsapp": { "disponible": false, "destino": null }
}
```

`whatsapp` conserva la forma pública vigente: cuando está habilitado, `destino` son dígitos internacionales ya validados. No hay un campo nuevo de configuración comercial. No devolver atributos de producto distintos de los existentes.

| Estado | Código JSON | Mensaje / condición |
| --- | --- | --- |
| 400 | `SOLICITUD_INVALIDA` | `La solicitud no es válida`; ID mal formado. |
| 404 | `NO_ENCONTRADO` | `El producto ya no está disponible`; UUID sin registro. |
| 503 | `SERVICIO_NO_DISPONIBLE` | Mensaje genérico vigente ante fallo de lectura; sin detalles internos. |

No se interpreta un nombre como identidad. No se devuelve el primer producto ante ausencia.

## GET /productos/{id}

En compilación servida por Express: **200**, `text/html; charset=utf-8`, índice compilado con metadatos específicos ya presentes antes de ejecutar JS. La página React consulta el detalle; foto, nombre, descripción íntegra, precio y pedido pertenecen al mismo ID. Navegación directa, recarga y nueva sesión deben funcionar.

| Elemento | Valor |
| --- | --- |
| `title` | Nombre del producto y JM-STORE. Exactamente un título. |
| `meta name=description` | Descripción guardada completa. Exactamente una descripción estándar. |
| `link rel=canonical` | `APP_ORIGIN` + `/productos/{id}`. |
| `og:title` | Nombre del producto. |
| `og:type` | `website`. |
| `og:url` | Misma URL canónica absoluta. |
| `og:description` | Descripción completa guardada. |
| `og:image` | `APP_ORIGIN` + `/api/productos/{id}/imagen-social`. |
| `og:image:type` | `image/jpeg`. |
| `og:image:width`, `og:image:height` | `1200`, `630`. |
| `og:image:alt` | Nombre del producto como texto alternativo comprensible. |
| `og:locale`, `og:site_name` | `es_PE`, `JM-STORE`. |

Son propiedades del [protocolo Open Graph](https://ogp.me/). El consumidor puede limitar el fragmento de descripción visible o no generar una tarjeta; no se promete mostrar toda la descripción en el espacio de la vista previa.

Canonical e imagen usan origen configurado, nunca Host/X-Forwarded-Host de la petición. No se incluyen secretos, datos en scripts, handlers inline ni etiquetas provenientes de campos de producto. Escapar caracteres HTML y preservar literalmente valores como `$&`, comillas, tildes y saltos. No duplicar metadatos genéricos y específicos.

| Estado HTML | Resultado observable |
| --- | --- |
| 404 | ID mal formado o inexistente: `El producto ya no está disponible`, regreso al catálogo, sin pedido ni OG de un producto. |
| 503 | Fallo temporal o plantilla no disponible: mensaje seguro de indisponibilidad/reintento; sin secretos ni OG de datos obsoletos. |

Mantener formato HTML también en errores de esta ruta, no convertirlos al JSON global de la API. Si React consulta nuevamente después de una baja, debe mostrar su estado de ausencia sin habilitar un pedido del producto retirado. En Vite local, la ruta usa el fallback de desarrollo; la API determina estado visual y no se exige un código HTML 404 del servidor Vite ni OG específico local.

## GET /api/productos/{id}/imagen-social

**200**, `image/jpeg`, bytes de un JPEG derivado de la fotografía del producto. Lienzo 1200×630; fotografía completa proporcionada y centrada con `contain`, sin recorte ni deformación. Fondo neutro para transparencia/espacio restante. Usa sharp existente con calidad inicial 80 y límite de entrada vigente. No sobrescribe ni actualiza `imagen`/`imagen_mime` ni escribe un archivo derivado persistente.

**400/404** con formato JSON vigente por ID inválido o imagen ausente. **503** seguro ante fallo de lectura/conversión. Nunca devolver fotografía de otro producto, genérica como si fuera la suya o credenciales. `HEAD` debe conservar los estados/cabeceras de GET sin cuerpo, conforme al manejo de Express. Mantener la copia original en `/api/productos/{id}/imagen` como WebP, sin modificar su contrato.

## Configuración y publicación

| Entorno | Origen del enlace de cliente | Canonical/OG del servidor |
| --- | --- | --- |
| Vite local | `http://localhost:5173` desde navegador | No se exige OG local específico; proxy API intacto. |
| Compilación local | `http://127.0.0.1:3001` | `APP_ORIGIN=http://127.0.0.1:3001`, modo development. |
| Internet | Origen HTTPS visitado, coincidente con el canónico | `APP_ORIGIN` público HTTPS y modo production. |

No hay variable de secretos nueva. La publicación enruta ficha, imagen y assets al servidor; no servir únicamente la SPA estática. La imagen social y HTML deben poder leerse sin sesión desde Internet para validar el preview. No añadir autenticación pública nueva, túnel o proveedor.

## Comprobaciones de contrato

- Metadatos en cuerpo inicial sin JS; título, description y cada propiedad OG aparecen una vez.
- Datos con `<script>`, `"`, `&`, saltos y `$&` se muestran como texto, sin modificar estructura o ejecutar nada.
- Variar Host no modifica canonical ni imagen; origen público usa HTTPS y nunca localhost residual.
- Después de eliminar un producto de prueba, detalle/HTML/imagen social ya no entregan datos de ese registro.
- GETs no alteran filas, UUID, precios ni BLOB. Fotografías de pantalla y sociales corresponden al mismo producto.
