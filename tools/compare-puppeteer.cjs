const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'reference', 'comparison');
fs.mkdirSync(OUT, { recursive: true });
const scrollPositions = [0, 900, 1800, 2700, 3600, 4500, 5400];

async function capture(page, label, url) {
  const result = { label, url, headings: [], media: { ok: [], fail: [] }, screenshots: [] };
  page.on('response', (resp) => {
    const u = resp.url();
    if (/media\/|assets\/|videos\/|images\/|fonts\//.test(u)) {
      const entry = { url: u.replace(/^https?:\/\/[^/]+/, ''), status: resp.status() };
      (resp.status() >= 400 ? result.media.fail : result.media.ok).push(entry);
    }
  });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2000));
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
  result.formAction = await page.evaluate(
    () => document.querySelector('.nl-form form, [data-newsletter-form]')?.getAttribute('action') || null
  );
  result.videoCount = await page.evaluate(() => document.querySelectorAll('video').length);
  for (const y of scrollPositions) {
    await page.evaluate((yPos) => window.scrollTo(0, yPos), y);
    await new Promise((r) => setTimeout(r, 700));
    const file = path.join(OUT, `${label}-scroll-${y}.png`);
    await page.screenshot({ path: file });
    result.screenshots.push(path.basename(file));
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT, `${label}-bottom.png`) });
  return result;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
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
})().catch((e) => {
  console.error('COMPARE_FAILED', e);
  process.exit(1);
});
