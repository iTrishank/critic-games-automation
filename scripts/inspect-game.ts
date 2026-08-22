import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
  });

  const page = await browser.newPage();

  const url =
    "https://www.metacritic.com/game/mortal-shell-ii/";

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(3000);

  console.log("Title:", await page.title());
  console.log("URL:", page.url());

  const text = await page.locator("body").innerText();

  console.log("\n--- PAGE TEXT ---\n");
  console.log(text.slice(0, 12000));

  await writeFile("metacritic-game.html", await page.content());

  await page.screenshot({
    path: "metacritic-game.png",
    fullPage: true,
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});