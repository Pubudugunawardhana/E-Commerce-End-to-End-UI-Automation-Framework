const { test, expect } = require('../fixtures/pageFixtures');
const { labelTest, Severity } = require('../utils/allure');
const { failRequests, delayRequests, collectNetworkProblems } = require('../utils/network');
const env = require('../utils/env');
const testData = require('../data/testData.json');

const FEATURE = 'Network resilience';
const SITE_ORIGIN = new URL(env.baseURL).origin;
const PRODUCT_COUNT = 6;

/**
 * Shared start: open the login page and log in, like a real user.
 * Opening /inventory.html directly is avoided on purpose: the server answers deep links
 * with HTTP 404 (the React app still renders), and the error-reporting requests only fire during login.
 */
async function loginAsUser({ loginPage, inventoryPage }) {
  await test.step('Log in from the home page', async () => {
    await loginPage.gotoLoginPage();
    await loginPage.login(env.standardUser, env.password);
    await expect(inventoryPage.inventoryItems).toHaveCount(PRODUCT_COUNT);
  });
}

/** Shared flow: buy the test products and confirm the order went through. */
async function completeCheckout({ inventoryPage, cartPage, checkoutPage }) {
  await test.step('Add products to the cart', async () => {
    await inventoryPage.addProductsToCart(testData.products);
    await expect(inventoryPage.cartBadge).toHaveText(String(testData.products.length));
  });

  await test.step('Verify the cart contents', async () => {
    await inventoryPage.goToCart();
    await expect(cartPage.itemNames).toHaveText(testData.products);
  });

  await test.step('Check out and place the order', async () => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(testData.customerInfo);
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();
    await expect(checkoutPage.completeHeader).toHaveText(testData.messages.orderComplete);
  });
}

test.describe('Network resilience', () => {
  // Start logged out: every test goes through the real login page so all network traffic is covered.
  test.use({ storageState: { cookies: [], origins: [] } });

  // Data-driven: one test per failure scenario in testData.json
  for (const scenario of testData.networkFailureScenarios) {
    test(`TC08 - Shop still works when ${scenario.title}`, async ({
      page,
      loginPage,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await labelTest({ feature: FEATURE, story: 'Failed requests', severity: Severity.NORMAL });

      const mocked = await test.step(`Mock the failure: ${scenario.title}`, () =>
        failRequests(page, scenario),
      );

      await loginAsUser({ loginPage, inventoryPage });

      await test.step('Verify the mock intercepted real requests', async () => {
        await expect.poll(() => mocked.count).toBeGreaterThan(0);
      });

      await completeCheckout({ inventoryPage, cartPage, checkoutPage });
    });
  }

  test('TC09 - Checkout completes on a slow network', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Slow by design: triple the timeout so a busy machine doesn't cause a false failure.
    test.slow();
    await labelTest({ feature: FEATURE, story: 'Slow network', severity: Severity.NORMAL });
    const { slowDelayMs } = testData.network;

    const delayed = await test.step(`Delay every site request by ${slowDelayMs} ms`, () =>
      delayRequests(page, { origin: SITE_ORIGIN, delayMs: slowDelayMs }),
    );

    await loginAsUser({ loginPage, inventoryPage });
    expect(delayed.count).toBeGreaterThan(0);

    await completeCheckout({ inventoryPage, cartPage, checkoutPage });
  });

  test('TC10 - Cart and checkout keep working after the connection drops', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await labelTest({ feature: FEATURE, story: 'Offline mode', severity: Severity.NORMAL });

    await loginAsUser({ loginPage, inventoryPage });

    await test.step('Go offline', async () => {
      await page.context().setOffline(true);
      expect(await page.evaluate(() => navigator.onLine)).toBe(false);
    });

    // Sauce Demo navigates on the client and keeps the cart in localStorage, so no network is needed.
    await completeCheckout({ inventoryPage, cartPage, checkoutPage });
  });

  test('TC11 - Checkout makes no failed site requests and throws no JavaScript errors', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }, testInfo) => {
    await labelTest({ feature: FEATURE, story: 'Network monitoring', severity: Severity.CRITICAL });

    const problems = collectNetworkProblems(page, SITE_ORIGIN);

    await loginAsUser({ loginPage, inventoryPage });

    await completeCheckout({ inventoryPage, cartPage, checkoutPage });

    await test.step('Verify there were no site request failures or JavaScript errors', async () => {
      // Third-party failures are attached for visibility but don't fail the test.
      await testInfo.attach('network-problems.json', {
        body: JSON.stringify(problems, null, 2),
        contentType: 'application/json',
      });
      expect(problems.firstParty, 'Failed requests to the site').toEqual([]);
      expect(problems.pageErrors, 'Uncaught JavaScript errors').toEqual([]);
    });
  });
});
