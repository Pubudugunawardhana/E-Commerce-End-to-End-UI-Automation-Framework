const { parsePrice } = require('../utils/price');

exports.CheckoutPage = class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Step one: customer information
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueBtn = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // Step two: order overview
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishBtn = page.locator('[data-test="finish"]');

    // Order complete
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillCustomerInfo({ firstName, lastName, postalCode }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueBtn.click();
  }

  async getSubtotal() {
    return parsePrice(await this.subtotalLabel.textContent());
  }

  async getTax() {
    return parsePrice(await this.taxLabel.textContent());
  }

  async getTotal() {
    return parsePrice(await this.totalLabel.textContent());
  }

  async finishOrder() {
    await this.finishBtn.click();
  }
};
