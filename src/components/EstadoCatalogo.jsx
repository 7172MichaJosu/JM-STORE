import Icono from './Icono.jsx';

export default function EstadoCatalogo({ estado, reintentar }) {
  if (estado === 'listo') return null;
  return <div className={`estado-catalogo estado-${estado}`} role={estado === 'error' ? 'alert' : 'status'}>
    <div className="estado-icono"><Icono nombre={estado === 'error' ? 'imagen' : 'bolsa'} size={30} /></div>
    <h3>{estado === 'cargando' ? 'Cargando productos…' : estado === 'error' ? 'No pudimos cargar los productos' : 'Por el momento no hay productos disponibles'}</h3>
    <p>{estado === 'cargando' ? 'Estamos preparando el catálogo para ti.' : estado === 'error' ? 'Vuelve a intentarlo en un momento.' : 'Vuelve pronto para descubrir lo que tenemos para ti.'}</p>
    {estado === 'error' && <button onClick={reintentar}>Reintentar <Icono nombre="flecha" size={17} /></button>}
  </div>;
}
