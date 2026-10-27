import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
const ContextoTema = createContext(null);
export default function ProveedorTema({ children }) {
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro');
  const origen = useRef(document.documentElement.dataset.origenTema || 'sistema');
  const soloMemoria = useRef(false);
  const aplicar = useCallback((nuevo, origen = 'manual') => {
    document.documentElement.dataset.tema = nuevo;
    document.documentElement.dataset.origenTema = origen;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nuevo === 'oscuro' ? '#050B1B' : '#F4F7FF');
    setTema(nuevo);
  }, []);
  const alternar = useCallback(() => {
    const nuevo = document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    origen.current = 'manual';
    aplicar(nuevo);
    try { localStorage.setItem('jm-store.tema', nuevo); soloMemoria.current = false; }
    catch { soloMemoria.current = true; }
  }, [aplicar]);
  useEffect(() => {
    const consulta = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    const reconciliar = () => {
      if (soloMemoria.current && origen.current === 'manual') return;
      let guardado;
      try { guardado = localStorage.getItem('jm-store.tema'); }
      catch { if (origen.current === 'manual') return; }
      if (guardado === 'claro' || guardado === 'oscuro') {
        origen.current = 'manual'; aplicar(guardado, 'manual');
      } else if (origen.current !== 'manual') {
        origen.current = 'sistema'; aplicar(consulta?.matches ? 'oscuro' : 'claro', 'sistema');
      }
    };
    const alCambiar = evento => { if (origen.current === 'sistema') aplicar(evento.matches ? 'oscuro' : 'claro', 'sistema'); };
    const alVolver = evento => { if (evento.persisted) reconciliar(); };
    reconciliar();
    consulta?.addEventListener('change', alCambiar);
    window.addEventListener('pageshow', alVolver);
    return () => { consulta?.removeEventListener('change', alCambiar); window.removeEventListener('pageshow', alVolver); };
  }, [aplicar]);
  return <ContextoTema.Provider value={{ tema, alternar }}>{children}</ContextoTema.Provider>;
}
export function useTema() { return useContext(ContextoTema); }
