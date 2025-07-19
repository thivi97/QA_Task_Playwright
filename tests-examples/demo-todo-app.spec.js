// playwright demo test in JavaScript
const { test, expect } = require('@playwright/test');

test('basic todo test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  await page.getByPlaceholder('What needs to be done?').fill('Walk the dog');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  const items = await page.locator('.todo-list li');
  await expect(items).toHaveCount(2);

  await expect(items.nth(0)).toHaveText('Buy groceries');
  await expect(items.nth(1)).toHaveText('Walk the dog');
});
