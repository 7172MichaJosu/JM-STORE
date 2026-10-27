import { enlaceWhatsApp } from '../lib/whatsapp.js';
import Icono from './Icono.jsx';
import { useId } from 'react';

export default function BotonWhatsApp({ producto, whatsapp }) {
  const enlace = enlaceWhatsApp(producto, whatsapp, location.origin);
  const ayudaId = useId();
  return enlace ? <a className="boton boton-primario boton-pedido" href={enlace}><Icono nombre="whatsapp" size={18} />Pedir por WhatsApp<Icono nombre="flecha" size={16} /></a>
    : <><button disabled aria-describedby={ayudaId}><Icono nombre="whatsapp" size={18} />Pedir por WhatsApp</button><p id={ayudaId} className="pedido-inactivo">Los pedidos por WhatsApp no están disponibles por el momento</p></>;
}
