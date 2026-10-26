<!--
Informe de impacto de sincronización (temporal; retirar antes de realizar el commit).
Cambio de versión: plantilla sin versión adoptada → 1.0.0.
Motivo: adopción inicial de los cinco principios y las reglas de gobernanza de JM-STORE.
Principios definidos a partir de los espacios de la plantilla:
- Principio 1 → I. Simplicidad ante todo.
- Principio 2 → II. Idioma y mercado peruano.
- Principio 3 → III. Cero alcance fantasma.
- Principio 4 → IV. Verificable por una persona no técnica.
- Principio 5 → V. Datos del usuario con respeto.
Secciones concretadas: Alcance y restricciones del producto;
Flujo de trabajo y control de calidad; Governance.
Secciones eliminadas: ninguna.
Pendientes o marcadores diferidos: ninguno.
No se modifican plantillas ni comandos; estos consultan la constitución en tiempo de ejecución.
-->

# JM-STORE Constitution

## Core Principles

### I. Simplicidad ante todo

Ante dos soluciones que satisfagan la spec y esta constitución, se DEBE elegir la más simple
de comprender, implementar y mantener. JM-STORE es una versión 1: NO se DEBEN incorporar
abstracciones, dependencias, servicios ni infraestructura para necesidades futuras hipotéticas.
Toda complejidad adicional DEBE responder a un requisito vigente y tener una justificación
documentada. Esto reduce errores y facilita el mantenimiento.

### II. Idioma y mercado peruano

Todo texto visible del producto DEBE estar en español de Perú, incluidos navegación, mensajes,
validaciones y contenido de los pedidos preparados para WhatsApp. Los precios y demás importes
DEBEN expresarse en soles peruanos (PEN), usando el símbolo `S/` y un formato uniforme; por
ejemplo, `S/ 49.90`. NO se DEBEN introducir otros idiomas ni monedas en la versión 1.

### III. Cero alcance fantasma

Solo se DEBE implementar funcionalidad escrita explícitamente en la spec vigente de la
funcionalidad. Cada cambio funcional DEBE poder vincularse con un requisito de esa spec.
Una idea nueva se DEBE presentar como propuesta; NO se DEBE construir hasta que el responsable
del proyecto la acepte y quede incorporada en la spec. Una tarea o un plan técnico NO autoriza
por sí solo a ampliar el alcance. Las decisiones técnicas necesarias para cumplir un requisito
DEBEN respetar los demás principios y NO DEBEN añadir comportamiento funcional no solicitado.

### IV. Verificable por una persona no técnica

Cada criterio de éxito DEBE describir una comprobación reproducible usando la app, con
condiciones iniciales, acciones y un resultado observable. Una persona no técnica DEBE poder
comprobarlo sin leer código, consultar bases de datos ni ejecutar comandos. Se DEBEN sustituir
expresiones subjetivas como «funciona bien» por resultados concretos que permitan decidir si el
criterio se cumple. Las comprobaciones técnicas complementan esta validación y NO la sustituyen.

### V. Datos del usuario con respeto

Solo se DEBEN solicitar los datos imprescindibles para el pedido definido en la spec. Cada dato
solicitado DEBE tener una finalidad documentada y comprensible para el usuario; si no es
necesario, NO se DEBE pedir ni almacenar. Los datos personales NO se DEBEN exponer en registros
o mensajes de error. Las claves, contraseñas, tokens y demás secretos NO se DEBEN incluir en
el código ni en archivos versionados; cuando sean necesarios, se DEBEN suministrar mediante
configuración externa y usar valores ficticios en ejemplos. El acceso a datos y secretos se
DEBE limitar a lo necesario para el funcionamiento especificado.

## Alcance y restricciones del producto

JM-STORE es una tienda virtual tipo catálogo de productos para el mercado peruano. Los pedidos
se realizan por WhatsApp. La versión 1 NO incluye pagos en línea: NO se DEBEN integrar pasarelas
de pago ni solicitar datos de tarjetas o credenciales bancarias.

Esta descripción delimita el producto; cada funcionalidad concreta DEBE estar definida en la
spec antes de implementarse. La constitución NO autoriza por sí sola nuevas pantallas, flujos
ni módulos. Cualquier cambio de estos límites requiere una enmienda de la constitución y su
reflejo en la spec antes de construirlo.

## Flujo de trabajo y control de calidad

- Antes de implementar, se DEBEN revisar la spec vigente y su conformidad con los cinco
  principios. Los requisitos ambiguos se DEBEN aclarar antes de construir el comportamiento
  afectado.
- Cada cambio DEBE tener un propósito definido, mantener el código legible y evitar
  dependencias o modificaciones ajenas a ese propósito.
- La revisión de cada cambio DEBE comprobar su relación con la spec, la solución más simple,
  el español de Perú, los importes en `S/` y la minimización de datos y secretos.
- Antes de dar una funcionalidad por terminada, se DEBEN ejecutar sus criterios de aceptación
  en la app y registrar el resultado. Se DEBEN realizar las comprobaciones técnicas y pruebas
  pertinentes al comportamiento modificado y a los riesgos de regresión, sin imponer
  herramientas o infraestructura innecesarias para la versión 1.
- Los fallos que impidan cumplir la spec o estos principios se DEBEN resolver antes de aceptar
  el cambio. Las ideas fuera de alcance se DEBEN mantener como propuestas pendientes.

## Governance

Esta constitución rige las especificaciones, los planes, las tareas y las revisiones del
proyecto. Si otro documento la contradice, se DEBE resolver la contradicción antes de
implementar el trabajo afectado. Toda revisión o solicitud de cambios DEBE comprobar el
cumplimiento de la constitución y dejar constancia del resultado.

Para enmendarla, se DEBE documentar el cambio propuesto, su motivo, el impacto en las specs y
el trabajo existente, y cualquier adaptación necesaria. El responsable del proyecto DEBE
aprobar la enmienda antes de aplicarla. Después se DEBEN actualizar la versión, la fecha de
última modificación y los documentos afectados. No se permiten excepciones implícitas a los
principios; cualquier redefinición requiere este procedimiento.

La versión sigue el formato `MAJOR.MINOR.PATCH`: se incrementa `MAJOR` al eliminar o redefinir
principios o reglas de forma incompatible; `MINOR` al añadir principios, secciones o ampliar
materialmente las reglas; y `PATCH` al aclarar redacción sin cambiar su significado. La fecha
de ratificación original se conserva y la fecha de última modificación se actualiza con cada
enmienda. La versión `1.0.0` constituye la adopción inicial de estas reglas.

**Version**: 1.0.0 | **Ratified**: 2026-10-26 | **Last Amended**: 2026-10-26
