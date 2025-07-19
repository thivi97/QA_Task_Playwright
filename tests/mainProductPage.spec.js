import {test, expect} from '@playwright/test';
import {MainProductPage} from '../Pages/MainProductPage';

test.describe('eBay Wallet Product Page Tests', () => {
  test('Full flow: Load → Search → Related section validations', async ({ page }) => {
    const productPage = new MainProductPage(page);

    // Load Home Page
    await productPage.navigateToHome();
    await expect(page).toHaveTitle(/ebay/i);

    // Search for wallet
    await productPage.searchForProduct('wallet');
    await expect(productPage.firstSearchResult).toBeVisible();

    // Open first product in search results
    await productPage.openFirstProductFromResults();

    // Check if related section exists
    const isRelatedVisible = await productPage.relatedSection.isVisible();

    if (isRelatedVisible){
        const count = await productPage.relatedItems.count();

        // No more than 6 related products
        expect(count).toBeLessThanOrEqual(6);

        // Each product has image, title, price
        await productPage.validateRelatedItemContent();

        // Titles not abruptly cut off
        await productPage.validateTitlesAreNotTruncated();

        // Price range check
        const mainPrice = await productPage.getMainProductPrice();
        await productPage.validatePriceRange(mainPrice);

        // Category match
        const expectedCategory =  await productPage.breadcrumbCategory.textContent();
        if (expectedCategory){
            await productPage.validateCategoryMatch(expectedCategory);
        }

        // Refresh preserves order
        const originalTitles = await productPage.getRelatedProductTitles();
        await page.reload();
        const refreshedTitles = await productPage.getRelatedProductTitles();
        expect(refreshedTitles).toEqual(originalTitles);
    } else {
        // Fallback handling when related section is unavailable
        const fallback = productPage.placeHolderError;
        if (await fallback.count() > 0) {
            await expect(fallback.first()).toBeVisible({ timeout: 5000 });
        } else {
            console.log("⚠️ No fallback element found — skipping visibility check.");
        }
    }
  });

  test('Invalid product should show fallback or error message', async({ page }) => {
    await page.goto('https://www.ebay.com/itm/INVALID-ID-123456');

    // Wait for body to load
    await expect(page.locator('body')).toBeVisible();

    //Check for common fallback text used by eBay
    const fallbackText = page.locator('text=This listing was ended')
    .or(page.locator('text=We looked everywhere'))
    .or(page.locator('text=This listing does not exist'))
    .or(page.locator('text=Oops'))
    .or(page.locator('text=Page Not Found'));

    await expect(fallbackText).toBeVisible({timeout: 5000});

});

});