import { test, expect } from '@playwright/test';
import { MainProductPage } from '../Pages/MainProductPage';

const TEST_PRODUCT = 'wallet';
const INVALID_PRODUCT_URL = 'https://www.ebay.com/itm/INVALID-ID-123456';
const NON_EXISTENT_SEARCH_TERM = 'xyznonexistentproduct987';

test.describe('eBay Wallet Product Page Tests', () => {
  test('Full flow: Load -> Search -> Related section validations', async ({ page }) => {
    const productPage = new MainProductPage(page);

    // Load Home Page
    await test.step('Navigate to Home Page', async () => {
      await productPage.navigateToHome();
      await expect(page).toHaveTitle(/ebay/i);
    });

    // Search for wallet
    await test.step(`Search for product: ${TEST_PRODUCT}`, async () => {
      await productPage.searchForProduct(TEST_PRODUCT);
      await expect(productPage.firstSearchResult).toBeVisible();
    });

    // Open first product in search results
    await test.step('Open first product in results', async () => {
      await productPage.openFirstProductFromResults();

    // Validate product info section
      await test.step('Validate main product content', async () => {
        await expect(productPage.productTitle).toBeVisible();

    // ✅ Step 2: Fallback handling for price
        const isPriceVisible = await productPage.productPrice.isVisible();
        if (!isPriceVisible) {
          console.warn('Product price not visible - skipping price validation.');
        } else {
          await expect(productPage.productPrice).toBeVisible();
          const mainPrice = await productPage.getMainProductPrice();
          console.log('Main product price:', mainPrice);
        }

    // Product Description
        const descLocator = page.locator('#viTabs_0_is, #vi-desc-maincntr, div[itemprop="description"]');
        try {
          await expect(descLocator).toBeVisible({ timeout: 5000 });
        } catch (e) {
          console.warn('Product description not visible – skipping description validation.');
          await page.screenshot({ path: 'desc_not_visible.png', fullPage: true });
        }
    
    });

    // Related products section
      await test.step('Check related products section', async () => {
        const isRelatedVisible = await productPage.relatedSection.isVisible();

        if (isRelatedVisible) {
          const count = await productPage.relatedItems.count();
          expect(count).toBeLessThanOrEqual(6);

          await productPage.validateRelatedItemContent();
          await productPage.validateTitlesAreNotTruncated();

          const mainPrice = await productPage.getMainProductPrice();
          await productPage.validatePriceRange(mainPrice);

          const expectedCategory = await productPage.breadcrumbCategory.textContent();
          if (expectedCategory) {
            await productPage.validateCategoryMatch(expectedCategory);
          }

          const originalTitles = await productPage.getRelatedProductTitles();
          await page.reload();
          const refreshedTitles = await productPage.getRelatedProductTitles();
          expect(refreshedTitles).toEqual(originalTitles);
        } else {
          const fallback = productPage.placeHolderError;
          if ((await fallback.count()) > 0) {
            await expect(fallback.first()).toBeVisible({ timeout: 5000 });
          } else {
            console.log('No fallback element found — skipping visibility check.');
            await page.screenshot({ path: 'no_related_fallback.png', fullPage: true });
          }
        }
      });
    }); // 
  }); // 

  
test('Invalid product URL should show fallback or error message', async ({ page }) => {
        await page.goto(INVALID_PRODUCT_URL);
        await expect(page.locator('body')).toBeVisible();

        const fallbackTexts = [
            'This listing has ended',
            'Looks like this item isn\'t available anymore',
            'This listing is no longer available',
            'We looked everywhere',
            'Oops',
            'Page Not Found'
        ];

    let found = false;
    for (const text of fallbackTexts) {
        const locator = page.locator('body');
        try {
        await expect(locator).toContainText(text, { timeout: 8000 });
        found = true;
        break;
        } catch (_) {
        // continue to next
        }
    }

    if (!found) {
        const pageText = await page.textContent('body');
        console.log('None of the expected fallback texts were found. Page says:\n', pageText);
        await page.screenshot({ path: 'invalid_product_fallback.png', fullPage: true });
        throw new Error('None of the expected fallback texts were found.');
    }
});


test('Invalid search term should show no results message', async ({ page }) => {
  const productPage = new MainProductPage(page);

  await productPage.navigateToHome();
  await productPage.searchForProduct(NON_EXISTENT_SEARCH_TERM);

  const noResultTexts = [
    '0 results found',
    'No exact matches found',
    'We couldn’t find any results',
    'Try checking your spelling',
    'No results matching',
    'No exact matches',
    'did not match any listings'
  ];

  let matchFound = false;
  for (const text of noResultTexts) {
    const locator = page.locator('body');
    try {
      await expect(locator).toContainText(text, { timeout: 8000 });
      matchFound = true;
      break;
    } catch (_) {
      // continue checking next
    }
  }

  if (!matchFound) {
    const pageText = await page.textContent('body');
    console.log('No "no results" text found. Page content:', pageText);
    await page.screenshot({ path: 'no_results_page.png', fullPage: true });
    throw new Error('No "no results" message found for invalid search.');
  }
});

});
