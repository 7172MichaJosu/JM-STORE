# V-07 — medición local

Condiciones: Windows, Chromium 156.0.8078.4, viewport 1672 × 941, veinte productos con fotografías autorizadas, localhost sin throttling, cinco contextos nuevos por tema y caché HTTP aislada por contexto. Se incluyen arranque de tema, fuente local y fotografías del primer grupo; no se incluye acceso al servicio externo de WhatsApp. No es una medición de una conexión de internet o un celular físico.

Primera ejecución: claro 257/250/253/252/255 ms; oscuro 254/269/257/260/267 ms. Las diez aperturas cumplen ≤3000 ms (5/5 por tema). Cambio manual de tema 54–73 ms, dentro de ≤500 ms. Se recorrieron veinte tarjetas, con veinte UUID únicos y controles estables al pulsar.

Los archivos [claro](rendimiento-claro.json) y [oscuro](rendimiento-oscuro.json) se regeneran con las mediciones de la batería final; contienen las cinco aperturas y cambios de tema individualmente. No se descartan aperturas lentas ni se relajan umbrales.


Medición final de la batería completa: claro 291/303/318/334/313 ms; oscuro 382/323/334/358/319 ms. Resultado 5/5 por tema, todas ≤382 ms. Cambios de tema de estos contextos: 59–114 ms; los doce cambios manuales/automáticos de las tres pantallas dieron 34–148 ms. Se mantienen ambas series como historial, sin sustituir una medición desfavorable por la mejor.
