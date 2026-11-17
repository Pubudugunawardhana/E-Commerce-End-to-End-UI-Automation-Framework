const { test, expect } = require('../fixtures/pageFixtures');
const testData = require('../data/testData.json');

test.describe('Checkout', () => {
  // Already logged in via the saved session (see tests/auth.setup.js)

  test('TC06 - Complete end-to-end product checkout flow', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // 1. Add products to the cart
    await inventoryPage.goto();
    await inventoryPage.addProductsToCart(testData.products);
    await expect(inventoryPage.cartBadge).toHaveText(String(testData.products.length));

    // 2. Verify the cart contains exactly those products.
    // toHaveText retries until the cart page has loaded, so it never reads the old inventory page.
    await inventoryPage.goToCart();
    await expect(cartPage.itemNames).toHaveText(testData.products);
    const cartPrices = await cartPage.getItemPrices();

    // 3. Enter customer information
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(testData.customerInfo);
    await checkoutPage.continueToOverview();

    // 4. Verify the price calculation on the overview page
    const expectedSubtotal = cartPrices.reduce((sum, price) => sum + price, 0);
    const tax = await checkoutPage.getTax();
    expect(await checkoutPage.getSubtotal()).toBeCloseTo(expectedSubtotal, 2);
    expect(await checkoutPage.getTotal()).toBeCloseTo(expectedSubtotal + tax, 2);

    // 5. Place the order and verify the confirmation
    await checkoutPage.finishOrder();
    await expect(checkoutPage.completeHeader).toHaveText(testData.messages.orderComplete);
    await expect(page).toHaveURL(/checkout-complete\.html/);
  });

  // Data-driven: one test per required field in testData.json
  for (const scenario of testData.checkoutErrorScenarios) {
    test(`TC07 - Checkout shows an error when ${scenario.title}`, async ({
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await inventoryPage.goto();
      await inventoryPage.addProductToCart(testData.products[0]);
      await cartPage.goto();
      await cartPage.checkout();

      await checkoutPage.fillCustomerInfo({ ...testData.customerInfo, [scenario.emptyField]: '' });
      await checkoutPage.continueToOverview();

      await expect(checkoutPage.errorMessage).toHaveText(scenario.errorMsg);
    });
  }
});
