import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {entorno} from '../fixtures/entorno.mjs';
test('HTML inicial OG seguro, canónico y único, sin ejecutar JS',async t=>{
  const e=await entorno({env:{APP_ORIGIN:'https://tienda.example'}});t.after(()=>e.cerrar());
  const [p]=await e.sembrar([{nombre:'Taza <script> & "$&',descripcion:"Descripción <img onerror='x'>\n& + "+'á'.repeat(500),precioCentimos:4990}]);
  const r=await e.pedir('/productos/'+p.id,{headers:{Host:'ajeno.example','X-Forwarded-Host':'ajeno.example'}});
  assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);
  const html=await r.text();
  for(const campo of ['title','description','url','image','image:type','image:width','image:height','image:alt','locale','site_name','type']){
    assert.equal((html.match(new RegExp(`property="og:${campo}"`,'g'))||[]).length,1);
  }
  assert.match(html,/&lt;script&gt; &amp; &quot;\$&amp;/);
  assert.doesNotMatch(html,/<script>|<img onerror|ajeno\.example|localhost/);
  assert.ok(html.includes('https://tienda.example/productos/'+p.id));
  assert.ok(html.includes('https://tienda.example/api/productos/'+p.id+'/imagen-social'));
  assert.equal((html.match(/<title>/g)||[]).length,1);
  assert.equal((html.match(/name="description"/g)||[]).length,1);
});
test('ausencia y fallos son HTML sin OG obsoleto ni datos internos',async t=>{
  const e=await entorno();t.after(()=>e.cerrar());
  for(const id of ['mal',randomUUID()]){
    const r=await e.pedir('/productos/'+id);assert.equal(r.status,404);assert.match(r.headers.get('content-type'),/html/);
    assert.doesNotMatch(await r.text(),/og:image/);
  }
  const [p]=await e.sembrar([{nombre:'Prueba',descripcion:'Detalle',precioCentimos:100}]);
  e.fallos.obtener=true;const r=await e.pedir('/productos/'+p.id);assert.equal(r.status,503);
  assert.doesNotMatch(await r.text(),/Fallo interno|SELECT|sqlite|og:image/);
  const otro=await entorno({app:{leerIndiceHtml:()=>{throw Error('ruta privada');}}});t.after(()=>otro.cerrar());
  const [q]=await otro.sembrar([{nombre:'Otro',descripcion:'Detalle',precioCentimos:100}]);
  const fallo=await otro.pedir('/productos/'+q.id);assert.equal(fallo.status,503);
  assert.doesNotMatch(await fallo.text(),/ruta privada|og:image/);
});
