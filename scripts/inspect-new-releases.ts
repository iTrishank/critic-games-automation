import { chromium } from "playwright";

const URL =
  "https://www.metacritic.com/browse/game/all/all/all-time/new/";

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(1500);

    const links = page.locator(
      'a[href^="/game/"]',
    );

    console.log("Total game links:", await links.count());

    for (let i = 0; i < Math.min(links.count ? await links.count() : 0, 30); i++) {
      const link = links.nth(i);

      const href = await link.getAttribute("href");
      const text = (await link.innerText()).trim();

      console.log(`\n--- ${i + 1} ---`);
      console.log("href:", href);
      console.log("text:", text.slice(0, 200));

      console.log(
        "parent:",
        (
          await link.evaluate(
            (element) => element.parentElement?.outerHTML ?? "",
          )
        ).slice(0, 2000),
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});