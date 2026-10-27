import Icono from './Icono.jsx';
import ImagenProducto from './ImagenProducto.jsx';

export default function PortadaCatalogo({ producto }) {
  return <>
    <section className="hero" aria-labelledby="titulo-catalogo">
      <div className="contenedor hero-interior">
        <div className="hero-texto" data-aparicion-id="portada-texto">
          <span className="etiqueta">DESCUBRE JM-STORE</span>
          <h1 id="titulo-catalogo">Tu próximo favorito<br /><em>está aquí.</em></h1>
          <p>Descubre productos que van contigo y pide tu favorito fácilmente por WhatsApp. Todo a tu ritmo, en un solo lugar.</p>
          <a className="boton boton-primario" href="#catalogo"><Icono nombre="bolsa" size={20} />Ver catálogo<Icono nombre="flecha" size={20} /></a>
          <span className="hero-nota">Elige. Conecta. Disfruta.</span>
        </div>
        <div className="hero-arte" data-aparicion-id="portada-escena">
          <div className="escena-orbita escena-orbita-uno" aria-hidden="true" /><div className="escena-orbita escena-orbita-dos" aria-hidden="true" />
          <div className="escena-base" aria-hidden="true" />
          <div className="hero-producto">{producto ? <ImagenProducto variante="portada" src={producto.imagenUrl} alt={producto.nombre} fetchPriority="high" />
            : <div className="escena-identidad" aria-hidden="true"><span>JM</span><small>ELIGE A TU RITMO</small></div>}</div>
          <div className="escena-distintivo escena-distintivo-uno" aria-hidden="true"><Icono nombre="brillo" size={25} /><span>Tu próximo<br /><strong>favorito</strong></span></div>
          <div className="escena-distintivo escena-distintivo-dos" aria-hidden="true"><Icono nombre="bolsa" size={25} /><span>Elige<br /><strong>a tu ritmo</strong></span></div>
        </div>
      </div>
    </section>
    <div className="contenedor pasos" data-aparicion-id="pasos" aria-label="Cómo solicitar un producto">
      {[['etiqueta', 'Explora el catálogo', 'Descubre lo que va contigo.'], ['brillo', 'Elige tu favorito', 'Encuentra tu próximo favorito.'], ['whatsapp', 'Pide por WhatsApp', 'Conversemos directamente.']].map(([icono, titulo, texto]) =>
        <div className="paso" key={titulo}><span className="paso-icono"><Icono nombre={icono} size={25} /></span><div><strong>{titulo}</strong><p>{texto}</p></div></div>)}
    </div>
  </>;
}
