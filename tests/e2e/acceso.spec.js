import { test, expect, ingresar } from '../fixtures/navegador.mjs';

for (const tema of ['claro', 'oscuro']) test.describe(`administración ${tema}`, () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ colorScheme: tema === 'oscuro' ? 'dark' : 'light' }); });

test('gestión directa cerrada, acceso incorrecto, correcto y cierre con historial', async ({ page }) => {
  await page.goto('/encargado');
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar producto' })).toHaveCount(0);
  await page.getByLabel('Usuario', { exact: true }).fill('incorrecto'); await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByText('No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo')).toBeVisible();
  await ingresar(page);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await page.goBack(); await page.goto('/encargado');
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await page.goto('/'); await expect(page.getByRole('article')).toHaveCount(20);
});
test('fallo al verificar o cerrar sesión no concede acceso ni anuncia cierre', async ({ page }) => {
  await page.route('**/api/sesion', async route => { if (route.request().method() === 'GET') await route.abort(); else await route.continue(); });
  await page.goto('/encargado'); await expect(page.getByText('No pudimos verificar tu acceso. Inténtalo de nuevo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar producto' })).toHaveCount(0);
  await page.unroute('**/api/sesion'); await page.getByRole('button', { name: 'Reintentar' }).click();
  await ingresar(page);
  await page.route('**/api/sesion', async route => { if (route.request().method() === 'DELETE') await route.abort(); else await route.continue(); });
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByText('No pudimos confirmar el cierre de sesión. Inténtalo de nuevo')).toBeVisible();
});
test('límite temporal 429 bloquea y permite reintentar después del plazo', async ({ page }) => {
  await page.route('**/api/sesion', async route => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 429, headers: { 'Retry-After': '1' }, json: { codigo: 'INTENTOS_EXCEDIDOS', mensaje: 'Espera unos minutos antes de volver a intentarlo' } }); else await route.continue();
  });
  await page.goto('/encargado'); await page.getByLabel('Usuario', { exact: true }).fill('encargado-ficticio'); await page.getByLabel('Contraseña', { exact: true }).fill('Acceso ficticio solo para pruebas 49!');
  const enviar = page.getByRole('button', { name: 'Iniciar sesión', exact: true }); await enviar.click();
  await expect(page.getByText('Espera unos minutos antes de volver a intentarlo', { exact: false })).toBeVisible(); await expect(enviar).toBeDisabled();
  await expect(enviar).toBeEnabled({ timeout: 4000 }); await page.unroute('**/api/sesion'); await enviar.click();
  await expect(page.getByRole('heading', { name: 'Gestión del catálogo' })).toBeVisible();
});

});
