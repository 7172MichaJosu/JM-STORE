import { useEffect, useState } from 'react';
import { siguienteId } from '../lib/carrusel.js';

export default function useCarrusel(productos) {
  const [seleccionado, setSeleccionado] = useState(productos[0]?.id ?? null);
  const [pausas, setPausas] = useState({ puntero: false, foco: false, tacto: false });
  const [reducido, setReducido] = useState(() => typeof window.matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [revision, setRevision] = useState(0);
  const idActivo = productos.some(p => p.id === seleccionado) ? seleccionado : productos[0]?.id ?? null;
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const cambiar = () => setReducido(media.matches);
    cambiar(); media.addEventListener('change', cambiar);
    return () => media.removeEventListener('change', cambiar);
  }, []);
  useEffect(() => {
    if (productos.length < 2 || reducido || pausas.puntero || pausas.foco || pausas.tacto) return;
    const temporizador = setTimeout(() => setSeleccionado(siguienteId(productos, idActivo, 1)), 5000);
    return () => clearTimeout(temporizador);
  }, [productos, idActivo, reducido, pausas, revision]);
  const seleccionar = id => {
    if (productos.some(p => p.id === id)) { setSeleccionado(id); setRevision(r => r + 1); }
  };
  const pausar = (tipo, valor) => setPausas(p => p[tipo] === valor ? p : { ...p, [tipo]: valor });
  return { idActivo, reducido, seleccionar, pausar, mover: paso => seleccionar(siguienteId(productos, idActivo, paso)) };
}
