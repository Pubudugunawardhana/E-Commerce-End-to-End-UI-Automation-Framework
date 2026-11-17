const { test, expect } = require('../fixtures/pageFixtures');
const { labelTest, Severity } = require('../utils/allure');
const testData = require('../data/testData.json');

test.describe('Checkout', () => {
  // Already logged in via the saved session (see tests/auth.setup.js)

  test('TC06 - Complete end-to-end product checkout flow', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await labelTest({ feature: 'Checkout', story: 'Place an order', severity: Severity.BLOCKER });

    await test.step('Add products to the cart', async () => {
      await inventoryPage.goto();
      await inventoryPage.addProductsToCart(testData.products);
      await expect(inventoryPage.cartBadge).toHaveText(String(testData.products.length));
    });

    // toHaveText retries until the cart page has loaded, so it never reads the old inventory page.
    const cartPrices = await test.step('Verify the cart contains exactly those products', async () => {
      await inventoryPage.goToCart();
      await expect(cartPage.itemNames).toHaveText(testData.products);
      return cartPage.getItemPrices();
    });

    await test.step('Enter customer information', async () => {
      await cartPage.checkout();
      await checkoutPage.fillCustomerInfo(testData.customerInfo);
      await checkoutPage.continueToOverview();
    });

    await test.step('Verify subtotal, tax and total', async () => {
      const expectedSubtotal = cartPrices.reduce((sum, price) => sum + price, 0);
      const tax = await checkoutPage.getTax();
      expect(await checkoutPage.getSubtotal()).toBeCloseTo(expectedSubtotal, 2);
      expect(await checkoutPage.getTotal()).toBeCloseTo(expectedSubtotal + tax, 2);
    });

    await test.step('Place the order and verify the confirmation', async () => {
      await checkoutPage.finishOrder();
      await expect(checkoutPage.completeHeader).toHaveText(testData.messages.orderComplete);
      await expect(page).toHaveURL(/checkout-complete\.html/);
    });
  });

  // Data-driven: one test per required field in testData.json
  for (const scenario of testData.checkoutErrorScenarios) {
    test(`TC07 - Checkout shows an error when ${scenario.title}`, async ({
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await labelTest({ feature: 'Checkout', story: 'Form validation', severity: Severity.NORMAL });

      await test.step('Add a product and start checkout', async () => {
        await inventoryPage.goto();
        await inventoryPage.addProductToCart(testData.products[0]);
        await cartPage.goto();
        await cartPage.checkout();
      });

      await test.step(`Submit the form with ${scenario.title}`, async () => {
        await checkoutPage.fillCustomerInfo({ ...testData.customerInfo, [scenario.emptyField]: '' });
        await checkoutPage.continueToOverview();
      });

      await test.step('Verify the error message', async () => {
        await expect(checkoutPage.errorMessage).toHaveText(scenario.errorMsg);
      });
    });
  }
});
