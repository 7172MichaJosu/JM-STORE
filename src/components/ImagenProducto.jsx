import { useState } from 'react';
import Icono from './Icono.jsx';
export default function ImagenProducto({ src, alt, variante = 'tarjeta', className = '', onLoad, onError, ...props }) {
  const [fallo, setFallo] = useState(null);
  return <div className={['imagen-producto', 'imagen-' + variante, className].filter(Boolean).join(' ')}>
    {!src || fallo === src ? <span className="imagen-faltante"><Icono nombre="imagen" size={30} /><span>Imagen no disponible</span></span>
      : <img src={src} alt={alt} {...props} onLoad={onLoad} onError={evento => { setFallo(src); onError?.(evento); }} />}
  </div>;
}
