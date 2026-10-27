import sharp from 'sharp';
export function crearImagenSocial(buffer) {
  return sharp(buffer, { failOn: 'warning', limitInputPixels: 25000000 })
    .rotate().resize(1200, 630, { fit: 'contain', background: '#F4F7FF' })
    .flatten({ background: '#F4F7FF' }).jpeg({ quality: 80 }).toBuffer();
}
