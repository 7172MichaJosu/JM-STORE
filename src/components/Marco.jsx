import Icono from './Icono.jsx';
import '../styles/marco.css';

export default function Marco({ children, gestion = false }) {
  return <>
    <a className="saltar" href="#contenido">Ir al contenido</a>
    <div className="franja">Una elección a tu medida. Una conversación más cercana.</div>
    <header className="cabecera contenedor">
      <a className="marca" href="/" aria-label="JM-STORE, ir al catálogo"><span className="marca-simbolo">JM<span>●</span></span><span>JM-STORE<small>ELIGE A TU RITMO</small></span></a>
      <nav aria-label="Navegación principal">
        <a className={!gestion ? 'nav-activo' : ''} href="/#catalogo">Catálogo</a>
        <a className="nav-encargado" href={gestion ? '/' : '/encargado'}><Icono nombre={gestion ? 'flecha' : 'candado'} size={16} />{gestion ? 'Volver a la tienda' : 'Acceso del encargado'}</a>
      </nav>
    </header>
    {children}
    <footer className="pie contenedor"><a className="marca-pie" href="/">JM-STORE<span>●</span></a><p>Elige tu favorito. Conversemos por WhatsApp.</p><a href="/encargado">Acceso del encargado <span aria-hidden="true">↗</span></a></footer>
  </>;
}
