import { Marca } from './Marco.jsx';
import Icono from './Icono.jsx';

export default function NavegacionEncargado() {
  return <aside className="navegacion-encargado">
    <Marca lateral />
    <nav aria-label="Navegación del encargado">
      <a href="/"><Icono nombre="inicio" />Volver a la tienda</a>
      <a href="/encargado" aria-current="page"><Icono nombre="bolsa" />Gestión del catálogo</a>
    </nav>
    <p className="lema-panel"><Icono nombre="bolsa" size={34} /><span>Tu tienda<br />más cerca<br />de tus clientes.</span></p>
  </aside>;
}
