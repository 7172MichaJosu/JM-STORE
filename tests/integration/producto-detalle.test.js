import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {entorno} from '../fixtures/entorno.mjs';
test('detalle exacto, errores y lecturas sin mutaciones',async t=>{
  const e=await entorno();t.after(()=>e.cerrar());
  const [p]=await e.sembrar([{nombre:'Taza',descripcion:'Texto\n'+'á'.repeat(500),precioCentimos:4990}]);
  const antes=e.db.raw.prepare('SELECT * FROM productos').all();
  const r=await e.pedir('/api/productos/'+p.id);assert.equal(r.status,200);
  assert.equal(r.headers.get('cache-control'),'no-store');
  assert.deepEqual(await r.json(),{producto:p,whatsapp:{disponible:false,destino:null}});
  assert.equal((await e.pedir('/api/productos/mal')).status,400);
  assert.equal((await e.pedir('/api/productos/'+randomUUID())).status,404);
  e.fallos.obtener=true;const fallo=await e.pedir('/api/productos/'+p.id);
  assert.equal(fallo.status,503);assert.doesNotMatch(await fallo.text(),/SELECT|sqlite|Fallo interno|scrypt/);
  e.fallos.obtener=false;
  assert.deepEqual(e.db.raw.prepare('SELECT * FROM productos').all(),antes);
  e.db.eliminar(p.id);assert.equal((await e.pedir('/api/productos/'+p.id)).status,404);
});
