import sharp from 'sharp';

export async function imagenValida(formato = 'png', color = '#d8ac71') {
  return sharp({ create: { width: 320, height: 240, channels: 3, background: color } }).toFormat(formato).toBuffer();
}
export const imagenCorrupta = Buffer.from('Esto no es una imagen');
export const svgNoAdmitido = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>');
