/**
 * film.html 을 프레임마다 찍는다 (1920×1080 JPEG). puppeteer-core + 설치된 Chrome.
 *
 *   NODE_PATH=<puppeteer-core 가 있는 node_modules> node scripts/lab/expo_capture.cjs <film.html> <out_dir> [from] [to] [step]
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

(async () => {
  const [html, out, from = "0", to, step = "1"] = process.argv.slice(2);
  fs.mkdirSync(out, {recursive: true});
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--allow-file-access-from-files", "--force-color-profile=srgb", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});
  page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
  await page.goto("file://" + path.resolve(html), {waitUntil: "load"});
  const total = await page.evaluate(() => window.TOTAL_FRAMES);
  const end = to ? Math.min(+to, total - 1) : total - 1;
  console.log("total frames", total);
  for (let f = +from; f <= end; f += +step) {
    await page.evaluate((f) => window.renderFrame(f), f);
    await page.screenshot({path: path.join(out, `f_${String(f + 1).padStart(5, "0")}.jpg`), type: "jpeg", quality: 93});
    if (f % 150 === 0) console.log("frame", f);
  }
  await browser.close();
})();
