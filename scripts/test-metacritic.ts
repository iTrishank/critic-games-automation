import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto("https://www.metacritic.com/game/", {
    waitUntil: "domcontentloaded",
  });

  console.log("Title:", await page.title());
  console.log("URL:", page.url());

  await page.screenshot({
    path: "metacritic-home.png",
    fullPage: true,
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});