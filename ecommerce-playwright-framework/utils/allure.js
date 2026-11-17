const allure = require('allure-js-commons');

const EPIC = 'Sauce Demo Web Shop';

/** Allure severity levels, from most to least important */
exports.Severity = {
  BLOCKER: 'blocker',   // The core user journey is broken
  CRITICAL: 'critical', // An important feature is broken
  NORMAL: 'normal',
  MINOR: 'minor',
  TRIVIAL: 'trivial',
};

/**
 * Adds Allure labels to the current test. They group and filter tests in the report
 * (Behaviors tab: Epic > Feature > Story, and the Severity filter).
 */
exports.labelTest = async ({ feature, story, severity }) => {
  await allure.epic(EPIC);
  if (feature) await allure.feature(feature);
  if (story) await allure.story(story);
  if (severity) await allure.severity(severity);
};
