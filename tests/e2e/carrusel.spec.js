import {test,expect,usarCatalogoVisual} from '../fixtures/navegador.mjs';
export async function prepararReloj(page){
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.clock.install({time:new Date('2026-10-27T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-27T12:00:01Z'));
  await page.goto('/'); await expect(page.getByRole('region',{name:'Productos del catálogo'})).toBeVisible();
  await page.mouse.move(0,0);
}
test('cada cinco segundos recorre diez cambios sin duplicar timers',async({page})=>{
  await prepararReloj(page);
  const ps=(await(await page.request.get('/api/catalogo')).json()).productos;
  const c=page.getByRole('region',{name:'Productos del catálogo'});
  await expect(c).toHaveAttribute('data-activo',ps[0].id);
  await page.clock.runFor(4999);await expect(c).toHaveAttribute('data-activo',ps[0].id);
  await page.clock.runFor(1);await expect(c).toHaveAttribute('data-activo',ps[1].id);
  for(let i=2;i<=10;i++){await page.clock.runFor(5000);await expect(c).toHaveAttribute('data-activo',ps[i].id);}
});
test('miniaturas, flechas, pausas simultáneas y período completo al salir',async({page})=>{
  await prepararReloj(page);const c=page.getByRole('region',{name:'Productos del catálogo'});
  const mini=c.locator('.carrusel-miniatura').nth(2);await mini.hover();
  const id=await mini.getAttribute('data-producto');
  await expect(c).toHaveAttribute('data-activo',id);
  await mini.focus();await page.mouse.move(0,0);await page.clock.runFor(15000);
  await expect(c).toHaveAttribute('data-activo',id);
  await c.getByRole('button',{name:'Producto siguiente'}).click();
  const siguiente=await c.getAttribute('data-activo');expect(siguiente).not.toBe(id);
  await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
  await page.clock.runFor(4999);await expect(c).toHaveAttribute('data-activo',siguiente);
  await page.clock.runFor(1);expect(await c.getAttribute('data-activo')).not.toBe(siguiente);
});
test('vacío y unitario no inventan navegación',async({page})=>{
  for(const n of [0,1]){
    await usarCatalogoVisual(n);await page.goto('/');
    if(!n)await expect(page.getByText('Por el momento no hay productos disponibles')).toBeVisible();
    else await expect(page.locator('.carrusel-foto img')).toBeVisible();
    await expect(page.getByRole('button',{name:'Producto siguiente'})).toHaveCount(0);
  }
});
