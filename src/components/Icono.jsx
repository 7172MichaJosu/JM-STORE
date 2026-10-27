const trazos = {
  sol: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  luna: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />,
  inicio: <><path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7" /></>,
  etiqueta: <><path d="M3 3h8l10 10-8 8L3 11V3Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  brillo: <><path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" /></>,
  escudo: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  flecha: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
  anterior: <><path d="M19 12H5m7-7-7 7 7 7" /></>,
  bolsa: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
  imagen: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
  whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.1a8.5 8.5 0 1 1 15.6-4.4Z" /><path d="M8 7c-2 3 3 8 6 7l1-2-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2-1 1Z" /></>,
  salir: <><path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" /></>,
  mas: <path d="M12 5v14M5 12h14" />,
  eliminar: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
  candado: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
};
export default function Icono({ nombre, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{trazos[nombre] || trazos.bolsa}</svg>;
}
