(function () {
  var tema = null;
  try { var valor = localStorage.getItem('jm-store.tema'); if (valor === 'claro' || valor === 'oscuro') tema = valor; } catch (_) {}
  var manual = tema !== null;
  if (!tema) { try { tema = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'; } catch (_) { tema = 'claro'; } }
  document.documentElement.dataset.tema = tema;
  document.documentElement.dataset.origenTema = manual ? 'manual' : 'sistema';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', tema === 'oscuro' ? '#050B1B' : '#F4F7FF');
})();
