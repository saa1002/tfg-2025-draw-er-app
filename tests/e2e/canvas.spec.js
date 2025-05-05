import { test, expect } from '@playwright/test';

test('add entities to the canvas and change name', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator(".mxgraph-drawing-container");
    const box = await canvas.boundingBox();

    const entidadIcon = page.getByTestId('icon-entidad');
    await entidadIcon.dragTo(canvas, {targetPosition: {x: 150, y: 150}});

    const entidad = page.getByText('Entidad').first();
    await entidad.dblclick();

    await page.keyboard.type('Clientes');

    await page.keyboard.press('Enter');

    await expect(page.getByText('Clientes')).toBeVisible();

    //LocalStorage
});

test ('add relations between two entities', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('.mxgraph-drawing-container');
    const box = await canvas.boundingBox();
  
    const entidadIcon = page.getByTestId('icon-entidad');
    const relacionIcon = page.getByTestId('icon-relacion');
  
    await entidadIcon.dragTo(canvas, { targetPosition: { x: 150, y: 150 } });
  
    await entidadIcon.dragTo(canvas, { targetPosition: { x: 450, y: 150 } });
  
    await relacionIcon.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  
    await page.getByText('Relación').first().dblclick();
    await page.keyboard.type('Compra');
    await page.keyboard.press('Enter');
  
    await page.getByText('Compra').click();
    await page.getByText('Configurar relación').click();
  
    const selectLado1 = page.getByLabel('Lado 1');
    const selectLado2 = page.getByLabel('Lado 2');
  
    const entidades = page.locator('text=/Entidad(?: [0-9]*)?/');
  
    await selectLado1.selectOption({ label: await entidades.nth(0).innerText() });
    await selectLado2.selectOption({ label: await entidades.nth(1).innerText() });
  
    await page.getByRole('button', { name: 'Aceptar' }).click();
  
    await expect(page.getByText('Compra')).toBeVisible();

    //LocalStorage
});

test('add attributes to an entity', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator("svg")
    await page.getByRole('img').first().dragTo(canvas);

    await canvas.click();

    await page.getByText('Entidad').first().dblclick();
    await page.getByText('Añadir atributo').first().click();

    await page.getByText('Atributo', {exact: true}).first().dblclick();
    await page.keyboard.type('Clave');
    await canvas.click();

    // Añadir un atributo secundario
    await page.getByText('Entidad').first().dblclick();
    await page.getByText('Añadir atributo').first().click();
});

test('hide/show attributes', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator("svg");
    await page.getByRole('img').first().dragTo(canvas);
    await canvas.click();

    // Add a primary attribute
    await page.getByText('Entidad').first().dblclick();
    await page.getByText('Añadir atributo').first().click();

    await page.getByText('Atributo', {exact: true}).first().dblclick();
    await page.keyboard.type('Clave');
    await canvas.click();

    await page.getByText('Entidad').first().dblclick();

    // Hide attributes
    await page.getByText('Ocultar atributos', {exact: true}).first().click();
    await page.waitForTimeout(1000); // Wait for 1 second after hiding attributes

    // Check if the added attribute is hidden
    await expect(page.getByText('Clave', {exact: true}).first()).not.toBeAttached()

    // Show attributes
    await page.getByText('Mostrar atributos', {exact: true}).first().click();
    await page.waitForTimeout(1000); // Wait for 2 seconds after showing attributes to ensure changes take effect

    // Check if the added attribute is shown
    await expect(page.getByText('Clave', {exact: true}).first()).toBeAttached()
});
