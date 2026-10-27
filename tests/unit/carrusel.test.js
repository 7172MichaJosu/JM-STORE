import test from 'node:test';
import assert from 'node:assert/strict';
import { siguienteId, direccionGesto } from '../../src/lib/carrusel.js';
test('recorrido circular e identidad, incluso con nombres repetidos',()=>{
  const ps=[{id:'a',nombre:'Igual'},{id:'b',nombre:'Igual'},{id:'c'}];
  assert.equal(siguienteId(ps,'a',1),'b'); assert.equal(siguienteId(ps,'a',-1),'c');
  assert.equal(siguienteId(ps,'c',1),'a'); assert.equal(siguienteId(ps,'retirado',1),'a');
  assert.equal(siguienteId([],null,1),null);assert.equal(siguienteId([ps[0]],'a',1),'a');
});
test('gesto horizontal intencional, no vertical o corto',()=>{
  assert.equal(direccionGesto(-80,5),1);assert.equal(direccionGesto(80,5),-1);
  for(const [x,y] of [[10,0],[40,40],[80,100],[0,80]])assert.equal(direccionGesto(x,y),0);
});
