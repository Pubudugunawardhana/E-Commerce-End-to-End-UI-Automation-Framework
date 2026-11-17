const { test, expect } = require('../fixtures/pageFixtures');
const testData = require('../data/testData.json');

test.describe('Inventory', () => {
  // Already logged in via the saved session (see tests/auth.setup.js)
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  // Data-driven: one test per sort option in testData.json
  for (const scenario of testData.sortScenarios) {
    test(`TC03 - Sort products by ${scenario.label}`, async ({ inventoryPage }) => {
      const readValues = () =>
        scenario.by === 'price' ? inventoryPage.getProductPrices() : inventoryPage.getProductNames();

      // Work out the expected order ourselves from the values currently on the page
      const values = await readValues();
      expect(values.length).toBeGreaterThan(0);
      const expected = [...values].sort(
        scenario.by === 'price' ? (a, b) => a - b : (a, b) => a.localeCompare(b)
      );
      if (scenario.order === 'desc') expected.reverse();

      await inventoryPage.sortBy(scenario.option);

      // expect.poll keeps re-reading the page until it matches (or times out),
      // so the check does not run before the list has re-rendered
      await expect.poll(readValues).toEqual(expected);
    });
  }

  test('TC04 - Adding and removing products updates the cart badge', async ({ inventoryPage }) => {
    const [firstProduct, secondProduct] = testData.products;

    await inventoryPage.addProductToCart(firstProduct);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.addProductToCart(secondProduct);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeProductFromCart(firstProduct);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCart(secondProduct);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('TC05 - User can log out', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
