const {expect} = require('@playwright/test');
const { timeout } = require('../playwright.config');

class MainProductPage{
    constructor(page){
        this.page = page;

        // Home page elements
        this.searchBox = page.locator('#gh-ac');
        this.searchBtn = page.locator('#gh-search-btn');

        // Search results
        this.firstSearchResult = page.locator('.s-item__title').first();

        // Product details
        this.productTitle = page.locator('#itemTitle, h1');
        this.productPrice = page.locator('#prcIsum, .x-price-approx__value, span[itemprop="price"], .notranslate, .display-price');
        this.productDescription = page.locator('#viTabs_0_is, #vi-desc-maincntr');

        // Breadcrumb
        this.breadcrumbCategory = page.locator('#vi-VR-brumb-lnkLst span').last();

        // Price
        this.mainProductPrice = page.locator('#prcIsum, .x-price-approx__value');

        // Related section
        this.relatedSection = page.locator('.best-seller-section');
        this.relatedItems = this.relatedSection.locator('.item');

        // Fallbacks
        this.placeHolderError = page.locator('.related-placeholder, .no-related-data, .error-message, .not-found, .fallback-section');

    }

    async navigateToHome(){
        await this.page.goto('/');
    }

    async searchForProduct(productName){
        await this.searchBox.fill(productName);
        await this.searchBtn.click();
    }

    async openFirstProductFromResults(){
        
        const containers = ['div#srp-river-results', 'div.srp-river-results', 'ul.srp-results'];
        let found = false;

        for (const container of containers) {
        try {
            await this.page.waitForSelector(container, { timeout: 15000 });
            found = true;
            break;
        } catch {}
        }

        if (!found) {
        throw new Error('Search results container not found.');
        }

        const resultLink = this.page.locator('li.s-item div.s-item__title').first();
        await resultLink.waitFor({ state: 'visible', timeout: 10000 });

        const productAnchor = resultLink.locator('xpath=ancestor::a[contains(@class,"s-item__link")]');
        await productAnchor.click({ force: true });

        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
        
    }

    async getMainProductPrice(){
        try {
            const priceText = await this.productPrice.first().innerText();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (isNaN(price)) throw new Error('Price parsing failed');
            return price;
            } catch (err) {
            throw new Error(`Failed to get or parse main product price: ${err.message}`);
            }
    }

    async getRelatedProductTitles(){
        const count = await this.relatedItems.count();
        const titles = [];

        for (let i = 0; i < count; i++) {
        const titleLocator = this.relatedItems.nth(i).locator('.title');
        if (await titleLocator.isVisible()) {
            const title = await titleLocator.innerText();
            titles.push(title.trim());
        }
        }

        return titles;
    }

    async validateRelatedItemContent(){
        const count = await this.relatedItems.count();
        for (let i = 0; i < count; i++){
            const item = this.relatedItems.nth(i);
            await expect(item.locator('img')).toBeVisible();
            await expect(item.locator('.title')).toBeVisible();
            await expect(item.locator('.price')).toBeVisible();
        }
    }

    async validatePriceRange(mainPrice){
        const count = await this.relatedItems.count();
        const minium = mainPrice * 0.85;
        const maximum = mainPrice * 1.15;
        for (let i = 0; i < count; i++){
            const priceText = await this.relatedItems.nth(i).locator('.price').innerText();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            expect(price).toBeGreaterThanOrEqual(minium);
            expect(price).toBeLessThanOrEqual(maximum);

        }
    }

    async validateTitlesAreNotTruncated(){
        const count = await this.relatedItems.count();
        for (let i = 0; i < count; i++){
            const title = await this.relatedItems.nth(i).locator('.title').textContent();
            expect(title).not.toMatch(/...$|\.{3}$/);
            expect(title.length).toBeGreaterThan(5);
        }
    }

    async validateCategoryMatch(expectedCategory){
        const count = await this.relatedItems.count();

    for (let i = 0; i < count; i++) {
      const categoryLocator = this.relatedItems.nth(i).locator('.category');
      if (await categoryLocator.count() > 0) {
        const text = await categoryLocator.textContent();
        expect(text.toLowerCase()).toContain(expectedCategory.toLowerCase());
      } else {
        console.warn(`Category not found for related item ${i + 1}`);
      }
    }
  
    }
}

module.exports = { MainProductPage };