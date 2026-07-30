import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'reference', 'comparison');
fs.mkdirSync(OUT, { recursive: true });

const scrollPositions = [0, 900, 1800, 2700, 3600, 4500, 5400];

async function capture(page, label, url) {
  const result = {
    label,
    url,
    errors: [],
    consoleErrors: [],
    headings: [],
    media: { ok: [], fail: [] },
    screenshots: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') result.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => result.errors.push(String(err)));
  page.on('response', (resp) => {
    const u = resp.url();
    if ((label === 'local' && /127\.0\.0\.1|localhost/.test(u)) || (label === 'live' && /volturia\.com|cdn\.shopify/.test(u))) {
      if (/media\/|assets\/|videos\/|images\/|fonts\//.test(u)) {
        const entry = { url: u.replace(/^https?:\/\/[^/]+/, ''), status: resp.status() };
        (resp.status() >= 400 ? result.media.fail : result.media.ok).push(entry);
      }
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2000);

  result.headings = await page.evaluate(() =>
    [...document.querySelectorAll('.to-title, .nl-title, .iad-header-title, .sw-title')]
      .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  );

  result.titleLetters = await page.evaluate(() =>
    [...document.querySelectorAll('h1.loader span')].map((el) => el.textContent.trim()).join('')
  );

  result.sectionCount = await page.evaluate(
    () => document.querySelectorAll('[id^="shopify-section-template"]').length
  );
  result.hasPasswordModal = await page.evaluate(() => !!document.querySelector('#LoginModal'));
  result.hasNewsletterForm = await page.evaluate(
    () => !!document.querySelector('[data-newsletter-form], form[action*="customer"]')
  );
  result.formAction = await page.evaluate(() => {
    const form = document.querySelector('.nl-form form, [data-newsletter-form]');
    return form ? form.getAttribute('action') : null;
  });
  result.videoCount = await page.evaluate(() => document.querySelectorAll('video').length);
  result.faqCount = await page.evaluate(() => document.querySelectorAll('.faq-item, .faq details, .faq-button').length);

  for (const y of scrollPositions) {
    await page.evaluate((yPos) => window.scrollTo(0, yPos), y);
    await page.waitForTimeout(700);
    const file = path.join(OUT, `${label}-scroll-${y}.png`);
    await page.screenshot({ path: file, fullPage: false });
    result.screenshots.push(path.basename(file));
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  const full = path.join(OUT, `${label}-bottom.png`);
  await page.screenshot({ path: full, fullPage: false });
  result.screenshots.push(path.basename(full));

  return result;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

const local = await capture(page, 'local', 'http://127.0.0.1:8765/');
const live = await capture(page, 'live', 'https://volturia.com/password');

const report = {
  comparedAt: new Date().toISOString(),
  local,
  live,
  diff: {
    headingsMatch: JSON.stringify(local.headings) === JSON.stringify(live.headings),
    titleLettersMatch: local.titleLetters === live.titleLetters,
    sectionCountMatch: local.sectionCount === live.sectionCount,
    videoCountMatch: local.videoCount === live.videoCount,
    localMediaFailures: local.media.fail,
    liveMediaFailures: live.media.fail,
  },
};

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
