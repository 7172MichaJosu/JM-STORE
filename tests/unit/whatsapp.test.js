import test from 'node:test';
import assert from 'node:assert/strict';
import { mensajeWhatsApp, enlaceWhatsApp } from '../../src/lib/whatsapp.js';
const producto={id:'123e4567-e89b-42d3-a456-426614174000',nombre:'Taza & café + plato',descripcion:'Texto % # 📝\nSegunda línea',precioCentimos:4990};
test('mensaje íntegro, local/público, emojis y codificación única',()=>{
  for(const origen of ['http://localhost:5173','https://tienda.example']){
    for(const descripcion of [producto.descripcion,'á'.repeat(16384)]){
      const p={...producto,descripcion};
      const esperado=`Hola, JM-STORE. Me interesa este producto:\n\n📦 Producto: ${p.nombre}\n📝 Descripción: ${descripcion}\n💰 Precio: S/ 49.90\n🔗 Enlace: ${origen}/productos/${p.id}\n\n¿Podrían confirmarme su disponibilidad?`;
      assert.equal(mensajeWhatsApp(p,origen),esperado);
      const url=new URL(enlaceWhatsApp(p,{disponible:true,destino:'12025550123'},origen));
      assert.equal(url.origin+url.pathname,'https://wa.me/12025550123');
      assert.equal(url.searchParams.get('text'),esperado); assert.equal([...url.searchParams].length,1);
    }
  }
  assert.equal(enlaceWhatsApp(producto,{disponible:false},'http://localhost:5173'),null);
  assert.ok(mensajeWhatsApp({...producto,nombre:'N'.repeat(4096)},'https://tienda.example').includes('📦 Producto: '+'N'.repeat(4096)+'\n'));
  assert.match(mensajeWhatsApp({...producto,precioCentimos:9007199254740991},'https://tienda.example'),/S\/ 90071992547409\.91/);
});
