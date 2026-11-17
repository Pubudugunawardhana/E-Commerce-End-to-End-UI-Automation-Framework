const { test, expect } = require('../fixtures/pageFixtures');
const env = require('../utils/env');
const testData = require('../data/testData.json');

// Login tests must start logged out, so ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.gotoLoginPage();
  });

  test('TC01 - Valid user can log in', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(env.standardUser, env.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // Data-driven: one test per scenario in testData.json.
  // A null password means "use the valid password from .env".
  for (const scenario of testData.loginErrorScenarios) {
    test(`TC02 - Login fails with ${scenario.title}`, async ({ loginPage }) => {
      await loginPage.login(scenario.username, scenario.password ?? env.password);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toHaveText(scenario.errorMsg);
    });
  }
});
