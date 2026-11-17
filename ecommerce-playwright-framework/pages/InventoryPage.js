const { parsePrice } = require('../utils/price');

exports.InventoryPage = class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.productNames = page.locator('[data-test="inventory-item-name"]');
    this.productPrices = page.locator('[data-test="inventory-item-price"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** @param {'az' | 'za' | 'lohi' | 'hilo'} option */
  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  /** The product card whose name exactly matches productName */
  productCard(productName) {
    return this.inventoryItems.filter({
      has: this.page.getByText(productName, { exact: true }),
    });
  }

  async addProductToCart(productName) {
    await this.productCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async addProductsToCart(productNames) {
    for (const name of productNames) {
      await this.addProductToCart(name);
    }
  }

  async removeProductFromCart(productName) {
    await this.productCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async getProductNames() {
    return this.productNames.allTextContents();
  }

  async getProductPrices() {
    const priceTexts = await this.productPrices.allTextContents();
    return priceTexts.map(parsePrice);
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
};
