# Evidencia de implementación — 003

**Fecha de inicio**: 2026-10-27. Resultados en curso.

## Preservación previa — T001

- No había servidores escuchando en los puertos 3001/5173.
- Copia consistente de SQLite creada fuera del repositorio usando conexión de solo lectura.
- Inventario privado externo: 2 productos y 2 fotografías, con sus datos y hashes de imagen.
- Catálogo y ambas fotografías comprobados mediante la API original con repositorio de solo lectura.
- Control externo del archivo SQLite y `.env` preparado para comparar al finalizar.
- No se alteraron credenciales, productos ni imágenes; no se guardan rutas privadas o secretos aquí.

## Preparación — T002

- Lector de índice compilado inyectable en `crearApp`; fixture HTML controlada para integración.
- Las pruebas mantienen SQLite temporal; los checklists de requisitos permanecen intactos (16/16).

## Pendientes externos

- T032: URL pública HTTPS y vista previa real en WhatsApp.
- T033: destino comercial autorizado y revisión real de borradores.
- T034: celular físico y lectura asistida presencial.
