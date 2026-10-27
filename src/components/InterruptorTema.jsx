import { useTema } from '../tema/ProveedorTema.jsx';
import Icono from './Icono.jsx';
export default function InterruptorTema() {
  const { tema, alternar } = useTema();
  return <button type="button" className="interruptor-tema" role="switch" aria-checked={tema === 'oscuro'} aria-label="Modo oscuro" onClick={alternar}>
    <span className="tema-sol"><Icono nombre="sol" size={21} /></span><span className="tema-luna"><Icono nombre="luna" size={20} /></span>
  </button>;
}
