import test from 'node:test';
import assert from 'node:assert/strict';
import { rutaProducto, urlProducto } from '../../src/lib/enlaceProducto.js';
test('enlace individual usa origen explícito y no acepta orígenes con ruta o credenciales',()=>{
  const id='123e4567-e89b-42d3-a456-426614174000';
  assert.equal(rutaProducto(id),'/productos/'+id);
  assert.equal(urlProducto(id,'http://localhost:5173'),'http://localhost:5173/productos/'+id);
  assert.equal(urlProducto(id,'https://tienda.example'),'https://tienda.example/productos/'+id);
  for(const origen of ['https://tienda.example/ruta','https://usuario:clave@tienda.example','javascript:alert(1)','file:///ruta','no-url'])assert.throws(()=>urlProducto(id,origen));
  assert.throws(()=>rutaProducto(''));
});
