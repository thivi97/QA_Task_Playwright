import {test, expect} from '@playwright/test';
import {MainProductPage} from '../Pages/MainProductPage';

test.describe('eBay Wallet Product Page Tests', () => {
  test('Full flow: Load → Search → Related section validations', async ({ page }) => {
    const productPage = new MainProductPage(page);

    // Load Home Page
    await productPage.navigateToHome();
    await expect(page).toHaveTitle(/ebay/i);

    


  })
});