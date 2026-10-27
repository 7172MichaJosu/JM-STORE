# Contrato de apariencia, movimiento y navegación

**Entrada normativa**: [Clarify y FR-002/003/004/013/014](../spec.md). **Modelo**: [data-model](../data-model.md).

## Arranque y recursos

1. `index.html` conserva idioma `es-PE`, título, raíz y módulo actuales. Incorpora un script clásico externo del mismo origen en `head`, antes de montar la aplicación, con URL `/assets/tema-inicial-v1.js`. El archivo se mantendrá en `public/assets/`; no se crean archivos de aplicación durante Plan.
2. Ese script lee únicamente `jm-store.tema` con captura de excepciones. Valor válido → tema y origen manual; en otro caso → dispositivo y origen sistema; sin soporte/preferencia → claro. No rellena ni elimina una preferencia inválida como efecto colateral necesario.
3. Escribe `data-tema="claro|oscuro"` y `data-origen-tema="sistema|manual"` sobre `html` y adapta `meta theme-color`. No usa scripts inline, atributos `style`, cookies, red ni registro de errores con valores del almacenamiento.
4. `main.jsx` monta `ProveedorTema` alrededor de `App`; el proveedor inicializa desde los atributos existentes. El estilo base tiene caída a claro/sistema sin atributo, por lo que un fallo del bootstrap no deja contenido oculto. No se garantiza recordar un valor que el navegador no permite leer.
5. La prueba de ausencia de destello exige recurso servido correctamente, CSP intacta y captura/secuencia desde una carga fría. Verificar HTTP 200 y tipo JavaScript en dev y compilación. Un cambio de contenido del bootstrap requiere otro nombre versionado y actualizar su referencia, dada la caché inmutable actual de `/assets`.

## Interruptor y eventos de apariencia

Control propuesto: botón nativo `type="button"`, `role="switch"`, nombre accesible estable «Modo oscuro» y `aria-checked` verdadero solo en oscuro. Sol/luna son ayudas visuales, no únicas etiquetas. Objetivo mínimo 44 × 44 px, foco visible y activación con Espacio/Enter, tacto o puntero. El control visible representa solo dos temas, no un menú de preferencias.

| Evento | Condición | Resultado exigido |
| --- | --- | --- |
| Seleccionar tema | Cualquier origen | Alternar inmediatamente; origen manual; persistir si se puede; respuesta visible ≤0.5 s. |
| Preferencia del dispositivo cambia | Origen sistema | Actualizar tema y meta/color-scheme; conservar trabajo y foco. |
| Preferencia del dispositivo cambia | Origen manual | No sustituir la elección manual. |
| Escritura/lectura bloqueada | Cualquier navegador | Sin bloqueo ni error técnico visible; mantener elección manual en memoria durante esa pantalla. |
| Volver por historial restaurado | `pageshow.persisted` | Reconciliar preferencia accesible con sistema antes de continuar interacción; conservar estado React y comprobación de sesión existente. Si almacenamiento falla, preservar elección manual en memoria del documento. |
| Cambio automático con diálogo abierto | Sin elección manual | Estilizar el mismo diálogo; no cerrarlo, recrearlo, enviar/cancelar ni habilitar el resto de la página. |

Ningún evento de tema ejecuta consulta de catálogo, mutación HTTP, revalidación de sesión, redirección, limpieza de formulario o reinicio de registro de aparición. No cambiar `key` según tema, ni renderizar dos árboles alternativos completos. El selector queda fuera del diálogo modal y no es accesible mientras este bloquee el resto de la pantalla; H2.7 se verifica mediante cambio automático del dispositivo.

Los listeners de `matchMedia` y `pageshow` se limpian simétricamente al desmontar. Mantener una sola suscripción efectiva por documento, también con el ciclo adicional de efectos de `StrictMode`. No añadir listeners de sincronización de preferencias entre pestañas: ese comportamiento queda fuera de esta feature.

## Visita y animaciones de aparición

**Visita**: entrada nueva a una pantalla, regreso real a ella o restauración de historial. La transición confirmada de acceso a gestión dentro de `/encargado` presenta una pantalla nueva; ocultar temporalmente la gestión para verificar sesión no crea otra visita. Tema, validación, resultado de operación, cambio de imagen y actualización del listado tampoco lo hacen.

El hook de presentación `useAparicion` observa secciones/tarjetas dentro de la raíz de la pantalla y mantiene un conjunto en memoria por visita. Claves lógicas: sección por ID semántico y tarjeta por UUID; no índice del listado. Los hooks o atributos de presentación no participan en las claves React de los datos.

Secuencia prevista sin código completo:

1. Contenido visible por defecto; comprobar soporte de observación y movimiento normal. Si no hay soporte, mantener presentación estática.
2. La primera zona visible participa en la entrada breve de pantalla y se marca presentada, sin iniciar una segunda aparición encima de la primera. Los demás elementos se observan para su primera intersección.
3. En primera entrada, marcar visto antes de añadir clase de animación y dejar de observar ese elemento. No reconstruir el observador ni el conjunto por cambiar tema o validar.
4. Eliminar la clase de efecto al terminar o cancelarse, conservando el registro. Esto evita que ocultar/volver a mostrar por una revalidación reinicie una animación CSS aún aplicada.
5. Si un elemento recibe foco, mostrarlo inmediatamente y marcarlo visto sin mover su control. Los controles deben funcionar desde su primera aparición, sin esperar `animationend`.
6. Un producto nuevo conserva su identidad propia y puede tener su primera aparición; los ya vistos no se repiten por la nueva consulta. Salir y volver reinicia la visita; restauración de historial también, sin reiniciar el estado del formulario.

No preparar elementos permanentemente invisibles esperando JavaScript. No emplear `transition: all`, estilos inline de retraso o temporizadores que bloqueen foco. Si se usa un escalonado corto, declararlo mediante clases CSS limitadas; todas las animaciones deben respetar 150–350 ms y no alargar la disponibilidad del primer grupo.

## Movimiento reducido e interacción

CSS y escucha equivalente de `prefers-reduced-motion` deben funcionar en vivo. Al activarse: cancelar apariciones y transiciones no esenciales, quitar transformaciones de hover/pulsación, cambiar scroll a inmediato, desconectar observación no necesaria y mostrar pendientes. Las apariciones ya vistas no se repiten al volver a movimiento normal. Los elementos mostrados sin movimiento durante esa visita cuentan como presentados.

Los estados de foco, hover, ocupado, validación y resultado siguen identificables de forma estática. La elevación decorativa de tarjeta o pulsación interior no cambia su rectángulo accionable ni desplaza controles vecinos. Nunca animar el desplazamiento de un diálogo abierto, un formulario completo, la contraseña o un elemento enfocado. El cambio de tema no anima fotografías ni reinicia una escena.

## Rutas y estado protegido

Se conservan `/`, `/encargado` y `/encargado/ingresar`, sus anchors y las llamadas a navegación existentes. Una entrada por opacidad de 200 ms en la pantalla destino proporciona transición breve sin retrasar el enlace, interceptar Atrás, reemplazar el historial o añadir router. En movimiento reducido no hay entrada animada.

`Gestion` sigue verificando sesión en sus puntos actuales, incluidos `focus` y `pageshow`. La apariencia no decide permisos; ninguna captura/transición entre pantallas conserva o muestra una gestión tras el cierre de sesión. Se mantiene el formulario montado mientras la verificación transitoria lo oculta; el hook visual no sustituye esos controles.

El diálogo mantiene `showModal()`, nombre y descripción asociados, foco inicial en Cancelar, ciclo de Tab, bloqueo de acciones repetidas, Escape según estado y restauración al origen o al título del listado si el origen fue eliminado. Su efecto de apertura no depende del tema. No se cambia la selección por nombre: siempre por el producto/ID seleccionado.

## Evidencia exigida

Pruebas de navegador con tema del dispositivo en vivo, preferencia manual guardada y almacenamiento denegado; comparación de campos, archivo, preview, foco y cantidad de solicitudes antes/después. Regreso por historial y visita nueva deben cumplir repetición de aparición sin saltarse autenticación. Ensayar también ausencia de `IntersectionObserver` y fallo del bootstrap: contenido visible y funcional.

Las capturas estáticas no demuestran estos comportamientos. Casos con animación normal y preferencia reducida se registrarán separadamente, conforme a [quickstart](../quickstart.md).
