const { test: setup, expect } = require('../fixtures/pageFixtures');
const env = require('../utils/env');
const { AUTH_FILE } = require('../utils/constants');
const { labelTest, Severity } = require('../utils/allure');

// Runs once before all browser projects. Logs in and saves the session (cookies + local storage)
// so the other tests can start on the inventory page without logging in again.
setup('authenticate as standard user', async ({ page, loginPage }) => {
  await labelTest({ feature: 'Test setup', story: 'Save login session', severity: Severity.BLOCKER });

  await loginPage.gotoLoginPage();
  await loginPage.login(env.standardUser, env.password);
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: AUTH_FILE });
});
