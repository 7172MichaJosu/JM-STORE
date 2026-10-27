import Icono from './Icono.jsx';
import InterruptorTema from './InterruptorTema.jsx';
import '../styles/marco.css';
export function Marca({ lateral = false }) {
  return <a className={'marca' + (lateral ? ' marca-lateral' : '')} href="/" aria-label="JM-STORE, ir al catálogo">
    <span className="marca-simbolo">JM</span><span>JM-STORE<small>ELIGE A TU RITMO</small></span>
  </a>;
}
export default function Marco({ children, gestion = false, panel = false }) {
  return <>
    <a className="saltar" href="#contenido">Ir al contenido</a>
    <header className={'cabecera' + (gestion ? ' cabecera-gestion' : '') + (panel ? ' con-panel' : '')}><div className="contenedor cabecera-interior"><Marca />{panel && <span className="contexto-panel etiqueta">Espacio del encargado</span>}
      <nav aria-label="Navegación principal">
        {!gestion && <a className="nav-inicio nav-activo" href="/"><Icono nombre="inicio" size={18} />Inicio</a>}
        <a href="/#catalogo"><Icono nombre="etiqueta" size={18} />Catálogo</a>
        <a className="nav-encargado" href={gestion ? '/' : '/encargado'}><Icono nombre={gestion ? 'flecha' : 'candado'} size={17} />{gestion ? 'Volver a la tienda' : 'Acceso del encargado'}</a>
      </nav><InterruptorTema />
    </div></header>
    {children}
    <footer className={'pie contenedor' + (panel ? ' pie-panel' : '')}><a className="marca-pie" href="/">JM-STORE<span>✦</span></a><p>Elige tu favorito. Conversemos por WhatsApp.</p><a href="/encargado">Acceso del encargado <span aria-hidden="true">↗</span></a></footer>
  </>;
}
