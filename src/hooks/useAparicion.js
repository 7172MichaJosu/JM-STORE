import { useEffect, useRef, useState } from 'react';

// Los UUID y los IDs semánticos sobreviven a las consultas y al cambio de tema.
export default function useAparicion(raiz, revision, activa = true, pantalla = 'pantalla') {
  const vistos = useRef(new Set()); const entrada = useRef(false); const ultimaPantalla = useRef(null);
  const [visita, setVisita] = useState(0);
  useEffect(() => {
    const alVolver = e => { if (e.persisted) { vistos.current.clear(); entrada.current = false; setVisita(v => v + 1); } };
    window.addEventListener('pageshow', alVolver); return () => window.removeEventListener('pageshow', alVolver);
  }, []);
  useEffect(() => {
    const contenedor = raiz.current;
    if (!activa || !contenedor) return;
    if (ultimaPantalla.current !== pantalla) { vistos.current.clear(); entrada.current = false; ultimaPantalla.current = pantalla; }
    const elementos = [...contenedor.querySelectorAll('[data-aparicion-id]')];
    if (typeof IntersectionObserver !== 'function') return;
    const preferencia = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const primeraEntrada = !entrada.current; entrada.current = true;
    let intentoDeEntrada = false; let entradaIniciada = false;
    const animados = new Set();
    const marcar = e => vistos.current.add(e.dataset.aparicionId);
    const quitar = e => { e.classList.remove('apareciendo', 'entrada-pantalla'); animados.delete(e); };
    const alTerminar = evento => { if (evento.animationName.startsWith('jm-')) quitar(evento.target); };
    const alIniciar = evento => { if (evento.target === contenedor && evento.animationName === 'jm-entrada') entradaIniciada = true; };
    const observador = new IntersectionObserver(registros => {
      for (const { target, isIntersecting } of registros) {
        if (!isIntersecting) continue;
        observador.unobserve(target);
        if (vistos.current.has(target.dataset.aparicionId)) continue;
        marcar(target);
        if (!preferencia?.matches && !target.matches(':focus-within')) { animados.add(target); target.classList.add('apareciendo'); }
      }
    }, { threshold: 0.01 });
    function reducir() {
      if (preferencia?.matches) { intentoDeEntrada = false; observador.disconnect(); elementos.forEach(marcar); [...animados].forEach(quitar); quitar(contenedor); }
    }
    function alFoco(evento) {
      intentoDeEntrada = false;
      const elemento = evento.target.closest('[data-aparicion-id]');
      if (elemento && contenedor.contains(elemento)) { marcar(elemento); observador.unobserve(elemento); quitar(elemento); }
      quitar(contenedor);
    }
    contenedor.addEventListener('animationstart', alIniciar); contenedor.addEventListener('animationend', alTerminar); contenedor.addEventListener('animationcancel', alTerminar); contenedor.addEventListener('focusin', alFoco);
    if (preferencia?.matches) reducir();
    else {
      if (primeraEntrada && !contenedor.matches(':focus-within')) { intentoDeEntrada = true; contenedor.classList.add('entrada-pantalla'); animados.add(contenedor); }
      for (const elemento of elementos) {
        if (vistos.current.has(elemento.dataset.aparicionId)) continue;
        const r = elemento.getBoundingClientRect();
        if (primeraEntrada && r.top < innerHeight && r.bottom > 0) marcar(elemento); else observador.observe(elemento);
      }
    }
    preferencia?.addEventListener('change', reducir);
    return () => {
      observador.disconnect(); preferencia?.removeEventListener('change', reducir);
      contenedor.removeEventListener('animationstart', alIniciar); contenedor.removeEventListener('animationend', alTerminar); contenedor.removeEventListener('animationcancel', alTerminar); contenedor.removeEventListener('focusin', alFoco);
      [...animados].forEach(quitar);
      // StrictMode puede retirar el primer efecto antes de que se haya pintado.
      if (intentoDeEntrada && !entradaIniciada) entrada.current = false;
    };
  }, [raiz, revision, activa, pantalla, visita]);
}
