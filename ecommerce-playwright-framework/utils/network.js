// Helpers for network mocking and monitoring with page.route() and page events.

/** Swallows errors from routes that finish after the page has closed. */
const ignoreClosed = () => {};

/**
 * Error texts browsers report when they cancel a request themselves (for example on navigation).
 * These are not server or network failures. Chromium, Firefox, WebKit.
 */
const BROWSER_CANCELLATIONS = /ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i;

/**
 * Makes every request whose URL matches urlPattern fail.
 * With a status, the request gets a mocked HTTP error response; without one, it is aborted
 * as if the network dropped it.
 * Returns a counter so the test can prove the mock was actually used.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ urlPattern: string, status?: number | null }} options
 */
exports.failRequests = async (page, { urlPattern, status }) => {
  const hits = { count: 0 };
  await page.route(new RegExp(urlPattern), async (route) => {
    hits.count += 1;
    if (status) {
      await route
        .fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Mocked failure from the test' }),
        })
        .catch(ignoreClosed);
    } else {
      await route.abort('failed').catch(ignoreClosed);
    }
  });
  return hits;
};

/**
 * Delays every request to the given origin to simulate a slow network.
 * Returns a counter of delayed requests.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ origin: string, delayMs: number }} options
 */
exports.delayRequests = async (page, { origin, delayMs }) => {
  const hits = { count: 0 };
  await page.route(
    (url) => url.origin === origin,
    async (route) => {
      hits.count += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue().catch(ignoreClosed);
    },
  );
  return hits;
};

/**
 * Records failed requests and uncaught JavaScript errors while a test runs.
 * Failures are split into first-party (the site under test) and third-party,
 * because third-party services are outside the team's control.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} firstPartyOrigin
 */
exports.collectNetworkProblems = (page, firstPartyOrigin) => {
  const problems = { firstParty: [], thirdParty: [], pageErrors: [] };
  const record = (url, reason) => {
    const isFirstParty = new URL(url).origin === firstPartyOrigin;
    (isFirstParty ? problems.firstParty : problems.thirdParty).push(`${reason} ${url}`);
  };

  page.on('response', (response) => {
    if (response.status() >= 400) record(response.url(), `HTTP ${response.status()}`);
  });
  page.on('requestfailed', (request) => {
    const errorText = request.failure()?.errorText ?? 'unknown';
    if (BROWSER_CANCELLATIONS.test(errorText)) return;
    record(request.url(), `FAILED (${errorText})`);
  });
  page.on('pageerror', (error) => problems.pageErrors.push(error.message));

  return problems;
};
