# US4 — conservación técnica

Caso dedicado de persistencia, junto con presentación: 19/19, 17.7 s. El caso de reinicio duró 4.0 s. `npm test`: **33/33**, 14.41 s, incluidos HTTP y SQLite temporal real.

Se prepararon veinte productos ficticios con UUID deterministas, dos homónimos y texto extenso antes de usar el frontend. Se compararon esquema, orden, todos los campos y SHA-256 de cada imagen: idénticos tras tema/recarga/nueva sesión y dos reinicios de proceso. El alta adicional conserva copia después de retirar únicamente el archivo original del temporal. Se eliminó con confirmación; tras reiniciar permaneció ausente y la instantánea de los veinte productos quedó exactamente igual. No hubo restauración intermedia de esa base.

La cobertura existente ya comprueba límites UTF-8 (4/32 KiB), céntimos 1–9007199254740991, JPEG/PNG/WebP, 10 MiB/25 millones de píxeles, copia WebP, rutas propias, transacciones y seguridad. No fue necesario alterar el servidor ni añadir pruebas redundantes de esos límites. La evidencia humana del catálogo previo sigue pendiente en T046.
