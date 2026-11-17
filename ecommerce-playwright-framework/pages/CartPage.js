const { parsePrice } = require('../utils/price');

exports.CartPage = class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.checkoutBtn = page.locator('[data-test="checkout"]');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async getItemNames() {
    return this.itemNames.allTextContents();
  }

  async getItemPrices() {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map(parsePrice);
  }

  async checkout() {
    await this.checkoutBtn.click();
  }
};
