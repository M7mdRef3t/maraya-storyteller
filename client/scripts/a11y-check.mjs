import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const targetUrl = process.env.A11Y_URL || 'http://127.0.0.1:5180';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();

const summary = {
  url: targetUrl,
  violations: results.violations.length,
  top: results.violations.slice(0, 10).map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length,
    help: v.help,
  })),
};

console.log(JSON.stringify(summary, null, 2));

await context.close();
await browser.close();

if (results.violations.length > 0) {
  process.exit(1);
}
