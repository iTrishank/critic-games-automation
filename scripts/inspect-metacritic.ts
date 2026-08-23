import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto("https://www.metacritic.com/game/", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(3000);

  console.log("Title:", await page.title());
  console.log("URL:", page.url());

  const links = await page.locator("a").evaluateAll((elements) =>
    elements
      .map((element) => ({
        text: element.textContent?.trim(),
        href: (element as HTMLAnchorElement).href,
      }))
      .filter((link) => link.href.includes("/game/"))
      .slice(0, 50),
  );

  console.log("\nGame-like links:");
  console.dir(links, { depth: null });

  const html = await page.content();

  await writeFile("metacritic-page.html", html);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});