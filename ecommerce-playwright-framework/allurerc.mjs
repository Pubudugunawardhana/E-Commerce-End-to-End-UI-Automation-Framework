import { defineConfig } from 'allure';

export default defineConfig({
  name: 'E-Commerce E2E Test Report',
  output: './allure-report',
  // Stores results of previous runs so the report can show trends and test history.
  // In CI this file is cached between runs (see .github/workflows/playwright.yml).
  historyPath: './allure-history/history.jsonl',
  historyLimit: 20,
});
