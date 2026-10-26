# Contrato de solicitud por WhatsApp

**Requisitos**: FR-004–FR-008, FR-017–FR-018; H2.1–H2.5, EC-05–EC-07.

## Destino

`WHATSAPP_NUMBER` se suministra externamente al servidor como número internacional canónico: `+` y dígitos, sin espacios, paréntesis, guiones ni extensión. Se comprueban máximo 15 dígitos, primer dígito distinto de cero y validez con `libphonenumber-js/max`. No se impone un país específico ni se garantiza cuenta activa en WhatsApp.

La API publica `whatsapp.disponible` y `whatsapp.destino`: dígitos sin `+` si es válido; `null` si no lo es. Una cadena inválida nunca se transmite como destino navegable. No se requiere un número real para elaborar el plan; el responsable lo proporciona para la validación posterior.

## Texto preparado

Se sustituyen nombre, descripción y precio por los valores visibles del producto elegido en el instante de activar el enlace:

```text
Hola, JM-STORE. Me interesa este producto: [nombre]. Descripción: [descripción]. Precio: [precio]. ¿Podrían confirmarme su disponibilidad?
```

Ejemplo ficticio de contenido, sin número de destino:

```text
Hola, JM-STORE. Me interesa este producto: Taza & café + plato. Descripción: Cerámica, color azul. Precio: S/ 49.90. ¿Podrían confirmarme su disponibilidad?
```

El precio utiliza el mismo formateador que la tarjeta. No se combina contenido de otros productos ni se agrega cantidad, total, dirección, nombre de cliente o dato de pago. Nombres repetidos son válidos; el enlace se construye con el objeto concreto de la tarjeta.

## Enlace y activación

Formato: `https://wa.me/<destino-en-digitos>?text=<mensaje-codificado>`.

Codificar el mensaje completo una sola vez como componente URL con codificación UTF-8, por ejemplo mediante `encodeURIComponent`. No concatenar nombre/descripción sin codificar ni interpretar `&` como separador de parámetros o `+` como espacio. Al decodificar `text`, el resultado debe coincidir exactamente con el texto preparado, incluidos tildes, signos, saltos y precio.

El control es un enlace directo activado por el usuario, sin petición de red previa, popup programado ni confirmación en JM-STORE. Una activación inicia la navegación externa; el dispositivo puede abrir aplicación, web o acceso al servicio. La navegación puede abandonar la pestaña y volver con el historial.

Con destino ausente/inválido, no crear enlace activo y mostrar «Los pedidos por WhatsApp no están disponibles por el momento». No deshabilitar el catálogo ni sustituir por un destinatario inventado.

## Límites y privacidad

- La solicitud es un borrador. Solo el cliente decide enviar desde WhatsApp.
- No se guarda entidad de pedido, reserva, pago, envío o confirmación de venta en JM-STORE.
- No se registra ni transmite el borrador al servidor de JM-STORE. Los datos públicos del producto pasan al servicio externo mediante el enlace elegido por el cliente.
- No se detecta inicio de sesión, envío, entrega ni lectura en WhatsApp. Si no está accesible, JM-STORE no anuncia pedido enviado ni éxito comercial.
- Una tarjeta abierta antes de eliminar el producto puede preparar su borrador; no confirma disponibilidad. No se retiran conversaciones externas.
- No se exige cuenta de cliente ni se solicitan datos personales en la tienda. Las pantallas propias de WhatsApp están fuera del idioma/control de JM-STORE.

## Verificación

Automatizada: construir enlaces de tres productos, decodificar `text`, comparar los tres campos, destino y caracteres especiales; comprobar estado deshabilitado con configuración ausente e inválida; verificar que no se genera una llamada para guardar pedidos.

Manual V-02: con acceso al servicio y un destino comercial de prueba autorizado, activar una vez cada producto, revisar destinatario y tres borradores sin enviarlos; volver al catálogo sin mensajes de pedido enviado. Probar regreso cuando el servicio no permite continuar. SC-002 no incluye el tiempo de acceso externo.

Fuentes de integración: [WhatsApp: clic para chatear](https://faq.whatsapp.com/5913398998672934/), [enlaces universales](https://faq.whatsapp.com/425247423114725/). Las decisiones de validación se fundamentan en [../research.md](../research.md).
