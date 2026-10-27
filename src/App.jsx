import Catalogo from './pages/Catalogo.jsx';
import IniciarSesion from './pages/IniciarSesion.jsx';
import Gestion from './pages/Gestion.jsx';
import Producto from './pages/Producto.jsx';
export default function App() {
  const producto = /^\/productos\/([^/]+)\/?$/.exec(location.pathname);
  if (producto) return <Producto id={producto[1]} />;
  if (location.pathname === '/encargado/ingresar') return <IniciarSesion />;
  if (location.pathname === '/encargado') return <Gestion />;
  return <Catalogo />;
}
