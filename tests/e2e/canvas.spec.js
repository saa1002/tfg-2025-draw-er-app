import { test, expect } from '@playwright/test';

test('add entities to the canvas and change name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mxgraph-drawing-container')).toBeVisible();

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

test('add a relation to the canvas and verify it appears', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mxgraph-drawing-container')).toBeVisible();
  
    const canvas = page.locator('.mxgraph-drawing-container');
    const entidadIcon = page.getByTestId('icon-entidad');
    const relacionIcon = page.getByTestId('icon-relacion');
  
    await entidadIcon.dragTo(canvas, { targetPosition: { x: 150, y: 150 } });
    await entidadIcon.dragTo(canvas, { targetPosition: { x: 450, y: 150 } });
  
    await relacionIcon.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  
    await expect(page.getByText('Relación', { exact: true })).toBeVisible();
  });
  
test('add attributes to an entity', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mxgraph-drawing-container')).toBeVisible();

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
    await expect(page.locator('.mxgraph-drawing-container')).toBeVisible();

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

test('generate SQL script from valid diagram', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('.mxgraph-drawing-container');
    await expect(canvas).toBeVisible();

    const entidadIcon = page.getByTestId('icon-entidad');
    await entidadIcon.dragTo(canvas, {targetPosition: { x: 200, y: 200 }});

    await page.getByText('Entidad').first().dblclick();
    await page.keyboard.type('Usuarios');
    await page.keyboard.press('Enter');

    await page.getByText('Usuarios').first().click();
    await page.getByText('Añadir atributo').click();

    await page.getByText('Atributo', {exact: true}).first().dblclick();
    await page.keyboard.type('ID');
    await canvas.click();

    await page.getByText('Generar SQL').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Deseas pasar a tablas el diagrama E-R?');

    const aceptarBtn = page.getByRole('button', { name: 'Aceptar'});
    await expect(aceptarBtn).toBeEnabled();
});

test('delete attribute from entity', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('.mxgraph-drawing-container');
    await expect(canvas).toBeVisible();

    const entidadIcon = page.getByTestId('icon-entidad');
    await entidadIcon.dragTo(canvas, {targetPosition: { x: 200, y: 200 }});

    await page.getByText('Entidad').first().click();
    await page.getByText('Añadir atributo').click();

    await page.getByText('Entidad').first().click();
    await page.getByText('Añadir atributo').click();

    await page.waitForTimeout(500);

    const atributos = page.locator('text=Atributo');
    const ultimoAtributo = atributos.last();
    await ultimoAtributo.click();

    const deleteBtn = page.getByRole('button', { name: 'Borrar' });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await expect(ultimoAtributo).not.toBeVisible();
});

// test('add relations between two entities', async ({ page }) => {
//     await page.goto('/');
//     await expect(page.locator('.mxgraph-drawing-container')).toBeVisible();
  
//     const canvas = page.locator('.mxgraph-drawing-container');
  
//     const entidadIcon = page.getByTestId('icon-entidad');
//     const relacionIcon = page.getByTestId('icon-relacion');
  
//     await entidadIcon.dragTo(canvas, { targetPosition: { x: 150, y: 150 } });
//     await entidadIcon.dragTo(canvas, { targetPosition: { x: 450, y: 150 } });
//     await relacionIcon.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  
//     const relacionText = page.getByText('Relación', { exact: true });
//     await expect(relacionText).toBeVisible();
  
//     await relacionText.click();
//     await page.getByText('Configurar relación').click();
  
//     const selects = page.locator('select');
//     await selects.nth(0).selectOption({ index: 0 });
//     await selects.nth(1).selectOption({ index: 1 });
  
//     await page.getByRole('button', { name: 'Aceptar' }).click();
  
//     await expect(page.getByText('Relación', { exact: true })).toBeVisible();
//   });