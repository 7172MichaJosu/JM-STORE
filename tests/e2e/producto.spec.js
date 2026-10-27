import {test,expect,habilitarDestino,ingresar} from '../fixtures/navegador.mjs';
for(const tema of ['light','dark'])test(`ficha directa y borrador (${tema})`,async({page})=>{
  await page.emulateMedia({colorScheme:tema});await habilitarDestino(page);
  const {productos}=await(await page.request.get('/api/catalogo')).json();
  for(const p of productos.slice(0,3)){
    await page.goto('/productos/'+p.id);await page.reload();
    await expect(page.getByRole('heading',{level:1})).toHaveText(p.nombre);
    await expect(page.locator('.ficha-descripcion')).toHaveText(p.descripcion);
    const href=await page.getByRole('link',{name:'Pedir por WhatsApp'}).getAttribute('href');
    const texto=new URL(href).searchParams.get('text');
    expect(texto).toContain('📦 Producto: '+p.nombre);expect(texto).toContain('📝 Descripción: '+p.descripcion);
    expect(texto).toContain('🔗 Enlace: http://localhost:4175/productos/'+p.id);
    expect(await(await page.request.get('/productos/'+p.id)).text()).toContain('property="og:image"');
  }
  await page.getByRole('link',{name:'Volver al catálogo',exact:true}).click();
  await expect(page.getByRole('article')).toHaveCount(20);
  await page.getByRole('article').first().getByRole('link', { name: /^Ver / }).click();
  await expect(page.locator('.ficha-producto')).toBeVisible();
});

for(const tema of ['light','dark'])for(const ancho of [360,768,1366])test(`ficha adaptable y teclado ${tema} ${ancho}`,async({page},info)=>{
  await page.emulateMedia({colorScheme:tema,reducedMotion:'reduce'});
  await page.setViewportSize({width:ancho,height:900});await habilitarDestino(page);
  const {productos}=await(await page.request.get('/api/catalogo')).json();
  await page.goto('/productos/'+productos[0].id);
  await expect(page.locator('.ficha-producto')).toBeVisible();
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const boton=page.getByRole('link',{name:'Pedir por WhatsApp'});await boton.focus();
  expect(await boton.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');
  expect(await page.locator('.imagen-ficha img').evaluate(e=>getComputedStyle(e).objectFit)).toBe('contain');
  await info.attach(`ficha-${tema}-${ancho}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('foto fallida y producto retirado',async({page,context})=>{
  await habilitarDestino(page);
  const {productos}=await(await page.request.get('/api/catalogo')).json();const p=productos[0];
  await page.route(/\/api\/productos\/[^/]+\/imagen$/,r=>r.abort());
  await page.goto('/productos/'+p.id);await expect(page.getByText('Imagen no disponible')).toBeVisible();
  await expect(page.getByRole('link',{name:'Pedir por WhatsApp'})).toBeVisible();
  const gestion=await context.newPage();await ingresar(gestion);
  expect((await gestion.request.delete('/api/productos/'+p.id,{headers:{Origin:'http://localhost:4175','X-JM-STORE-Request':'1'}})).status()).toBe(204);
  await page.reload();await expect(page.getByText('El producto ya no está disponible')).toBeVisible();
  await expect(page.getByRole('link',{name:'Pedir por WhatsApp'})).toHaveCount(0);
});

test('fallo de lectura permite reintentar sin sustituir el producto',async({page})=>{
  const {productos}=await(await page.request.get('/api/catalogo')).json();const p=productos[0];
  let falla=true;
  await page.route(new RegExp('/api/productos/'+p.id+'$'),r=>falla?r.fulfill({status:503,json:{mensaje:'Inténtalo de nuevo'}}):r.continue());
  await page.goto('/productos/'+p.id);
  await expect(page.getByRole('button',{name:'Reintentar'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Pedir por WhatsApp'})).toHaveCount(0);
  falla=false;await page.getByRole('button',{name:'Reintentar'}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(p.nombre);
});
