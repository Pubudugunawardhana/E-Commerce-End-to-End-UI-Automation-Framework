# E-Commerce End-to-End UI Automation Framework

An end-to-end UI test automation framework for the [Sauce Demo](https://www.saucedemo.com) e-commerce site, built with **Playwright** and **JavaScript**.

It covers login, product sorting, the shopping cart, and the full checkout flow. The suite runs on **Chromium, Firefox and WebKit**.

## Features

- **Page Object Model (POM).** Each page's locators and actions live in their own class.
- **Custom fixtures.** Tests receive ready-made page objects (`loginPage`, `inventoryPage`, ...) without creating them by hand.
- **Data-driven tests.** Test scenarios are stored in `data/testData.json`, and a single test runs once for each scenario.
- **Log in once.** A setup step logs in once and saves the session, so the other tests start already logged in.
- **Environment variables.** The URL and credentials are read from `.env` and are not committed to Git.
- **Debugging on failure.** A failed test keeps a screenshot, a video and a trace file.
- **Cross-browser.** The suite runs on Chromium, Firefox and WebKit.
- **CI ready.** A GitHub Actions workflow runs the tests on every push and pull request.

## Project structure

```
ecommerce-playwright-framework/
├── .github/workflows/
│   └── playwright.yml        # GitHub Actions CI pipeline
├── data/
│   └── testData.json         # Test scenarios and data
├── fixtures/
│   └── pageFixtures.js       # Extends Playwright's test with page objects
├── pages/
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── tests/
│   ├── auth.setup.js         # Logs in once and saves the session
│   ├── login.spec.js
│   ├── inventory.spec.js
│   └── e2eCheckout.spec.js
├── utils/
│   ├── env.js                # Loads and validates environment variables
│   ├── constants.js
│   └── price.js              # Parses "$29.99" style price labels
├── .env.example
└── playwright.config.js
```

## Getting started

**Prerequisites:** Node.js 18 or later.

```bash
# 1. Install dependencies and browsers
npm install
npx playwright install

# 2. Create your .env file
cp .env.example .env
```

Then fill in `.env`. The Sauce Demo login page lists its public test credentials.

```
BASE_URL=https://www.saucedemo.com
STANDARD_USER=standard_user
USER_PASSWORD=secret_sauce
```

## Running tests

| Command | What it does |
|---|---|
| `npm test` | Run all tests on all three browsers |
| `npm run test:chromium` | Run on Chromium only (`test:firefox` and `test:webkit` also exist) |
| `npm run test:headed` | Run on Chromium with the browser window visible |
| `npm run test:ui` | Open Playwright's interactive UI mode |
| `npm run test:debug` | Step through tests with the Playwright Inspector |
| `npm run report` | Open the HTML report from the last run |

## Test cases

| ID | Test | File |
|---|---|---|
| TC01 | A valid user can log in | `login.spec.js` |
| TC02 | Login fails with the correct error message (5 data-driven scenarios: locked out user, wrong password, unknown user, empty username, empty password) | `login.spec.js` |
| TC03 | Products sort correctly (4 data-driven scenarios: name A–Z and Z–A, price low–high and high–low) | `inventory.spec.js` |
| TC04 | Adding and removing products updates the cart badge | `inventory.spec.js` |
| TC05 | A user can log out | `inventory.spec.js` |
| TC06 | Full checkout flow: add products, check the cart, enter customer details, check the subtotal, tax and total, and place the order | `e2eCheckout.spec.js` |
| TC07 | Checkout shows an error for each missing required field (3 data-driven scenarios) | `e2eCheckout.spec.js` |

These 7 test cases expand to 16 tests per browser, which makes 48 tests across the three browsers, plus 1 login setup step.

## Adding test data

Add a new object to the matching array in `data/testData.json`, and a new test is generated for it automatically. You don't need to change any code.

In `loginErrorScenarios`, `"password": null` means "use the valid password from `.env`".

## CI (GitHub Actions)

The workflow in `.github/workflows/playwright.yml` runs the full suite on every push and pull request to `main` or `master`. It then uploads the HTML report as a build artifact.

The workflow needs two repository secrets. Add them under **Settings → Secrets and variables → Actions**:

- `STANDARD_USER`
- `USER_PASSWORD`

## Debugging a failed test

When a test fails, its screenshot, video and trace are saved under `test-results/`. To inspect them, open the report with `npm run report`, or open a trace directly:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
