import Catalogo from './pages/Catalogo.jsx';
import IniciarSesion from './pages/IniciarSesion.jsx';
import Gestion from './pages/Gestion.jsx';
export default function App() {
  if (location.pathname === '/encargado/ingresar') return <IniciarSesion />;
  if (location.pathname === '/encargado') return <Gestion />;
  return <Catalogo />;
}
