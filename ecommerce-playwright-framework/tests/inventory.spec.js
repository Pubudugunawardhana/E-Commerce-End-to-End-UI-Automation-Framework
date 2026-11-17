const { test, expect } = require('../fixtures/pageFixtures');
const { labelTest, Severity } = require('../utils/allure');
const testData = require('../data/testData.json');

test.describe('Inventory', () => {
  // Already logged in via the saved session (see tests/auth.setup.js)
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  // Data-driven: one test per sort option in testData.json
  for (const scenario of testData.sortScenarios) {
    test(`TC03 - Sort products by ${scenario.label}`, async ({ inventoryPage }) => {
      await labelTest({ feature: 'Product catalogue', story: 'Sorting', severity: Severity.NORMAL });

      const readValues = () =>
        scenario.by === 'price' ? inventoryPage.getProductPrices() : inventoryPage.getProductNames();

      // Work out the expected order ourselves from the values currently on the page
      const expected = await test.step('Work out the expected order', async () => {
        const values = await readValues();
        expect(values.length).toBeGreaterThan(0);
        const sorted = [...values].sort(
          scenario.by === 'price' ? (a, b) => a - b : (a, b) => a.localeCompare(b)
        );
        if (scenario.order === 'desc') sorted.reverse();
        return sorted;
      });

      await test.step(`Sort by "${scenario.label}"`, async () => {
        await inventoryPage.sortBy(scenario.option);
      });

      // expect.poll keeps re-reading the page until it matches (or times out),
      // so the check does not run before the list has re-rendered
      await test.step('Verify the products are in the expected order', async () => {
        await expect.poll(readValues).toEqual(expected);
      });
    });
  }

  test('TC04 - Adding and removing products updates the cart badge', async ({ inventoryPage }) => {
    await labelTest({ feature: 'Shopping cart', story: 'Add and remove products', severity: Severity.CRITICAL });
    const [firstProduct, secondProduct] = testData.products;

    await test.step('Add two products', async () => {
      await inventoryPage.addProductToCart(firstProduct);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await inventoryPage.addProductToCart(secondProduct);
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    await test.step('Remove both products', async () => {
      await inventoryPage.removeProductFromCart(firstProduct);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await inventoryPage.removeProductFromCart(secondProduct);
      await expect(inventoryPage.cartBadge).toBeHidden();
    });
  });

  test('TC05 - User can log out', async ({ page, inventoryPage, loginPage }) => {
    await labelTest({ feature: 'Login', story: 'Logout', severity: Severity.NORMAL });

    await test.step('Log out from the side menu', async () => {
      await inventoryPage.logout();
    });

    await test.step('Verify the login page is shown', async () => {
      await expect(loginPage.loginButton).toBeVisible();
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });
});
