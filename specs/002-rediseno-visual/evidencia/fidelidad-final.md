# Fidelidad final — revisión técnica de 28 rasgos

Revisión: Codex durante Implement, con las tres referencias adjuntas y las cuatro capturas reales a 1672 × 941. La revisión técnica y las baselines de regresión se distinguen de la aceptación externa pendiente.

| Rasgo | Tienda clara / RV-01 | Tienda oscura / RV-02 |
| --- | --- | --- |
| VR-001 | JM, lema, marca izquierda, navegación central y selector derecho; cabecera 89 px y márgenes 7 % | Misma composición; activo y marca luminosos |
| VR-002 / VR-003 | Blanco/azulado, paneles blancos, sombras suaves y texto noche | Fondo #050B1B, superficies profundas, bordes/halos cian-violeta |
| VR-004 | Portada 442.91 px, columnas 44/56; título/CTA izquierda | Misma jerarquía y escena tecnológica |
| VR-005 | Primera fotografía íntegra sobre plataforma y halo suave | Primera fotografía íntegra con plataforma luminosa |
| VR-006 | Banda Explora/Elige/Pide, tres iconos y divisiones | Banda coherente sobre superficie oscura |
| VR-007 | Tres tarjetas, foto/datos 39.97/60.03, radio 20 px y sombras | Tarjetas profundas con bordes azul/violeta |
| VR-008 | Degradado azul/violeta, iconos, foco, hover y pulsación interior | WhatsApp verde, foco legible y mismos estados |
| VR-009 | Manrope; portada 66.88 px, sección 32, lectura 14 y precio 21.6 | Misma familia/jerarquía; acentos luminosos |

16 rasgos públicos conformes en la revisión técnica.

| Rasgo | Panel claro / RV-03 | Adaptación oscura |
| --- | --- | --- |
| VR-002 / VR-003 | Cuerpo azulado y paneles blancos | Cuerpo noche, paneles y campos distinguibles |
| VR-008 | Guardar degradado, salir secundario y eliminar destructivo con texto | Misma jerarquía y contraste |
| VR-009 | Manrope, título fuerte, secciones 28 px y lectura principal 14–16 | Mismos tamaños y luminosidad adaptada |
| VR-010 | Sidebar 17 %, marca y gestión activa; ondas moderadas | Navegación noche y acento cian/violeta |
| VR-011 | Panel redondeado, icono, cuatro campos/ayudas, archivo y preview separados | Formulario/preview con superficies del tema |
| VR-012 | Paneles 37/63, miniaturas completas, texto/precio/eliminar y banda de alta real | Misma composición y resultado semántico |

12 rasgos administrativos conformes; total técnico **28/28**. Las medidas exactas están en `medidas-tienda-*.json` y `medidas-panel-*.json`.

Capturas: [tienda clara](capturas/tienda-claro-1672.png), [oscura](capturas/tienda-oscuro-1672.png), [panel claro](capturas/panel-claro-1672.png) y [oscuro](capturas/panel-oscuro-1672.png).

Adaptaciones aprobadas: fotos reales completas con su fondo/espacio, franja del flujo real y CTA de catálogo; cuatro campos y límites vigentes; navegación solo a destinos existentes; ayudas y textos completos pueden hacer crecer el panel. Se omiten módulos comerciales excluidos. En celular/tablet las tarjetas son verticales y el panel se apila; los adornos reservan espacio propio para conservar toda la fotografía incluso con texto 200 %. La matriz cubre tres proporciones en portada/tarjeta/miniatura/preview a 360/640/768/1200/1366 en ambos temas.

La interfaz se construye con componentes React, SVG, CSS y fotografías de la API existente. Las referencias orientan geometría/estilo; las capturas de la app se usan únicamente como evidencia y baselines.
