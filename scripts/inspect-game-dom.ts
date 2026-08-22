import { chromium } from "playwright";

const GAME_URL =
  "https://www.metacritic.com/game/mortal-shell-ii/";

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
  });

  try {
    const page = await browser.newPage();

    await page.goto(GAME_URL, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(2000);

    console.log("\n========== GAME ==========\n");

    console.log("Name:");
    console.log(
      await page.locator("h1.hero-title__text").innerText(),
    );

    console.log("\nProduct scores:");

    const scoreCards = page.locator(
      '[data-testid="product-score"]',
    );

    console.log("Count:", await scoreCards.count());

    for (let i = 0; i < await scoreCards.count(); i++) {
      console.log(`\n--- Score ${i + 1} ---`);
      console.log(
        await scoreCards.nth(i).innerText(),
      );
    }

    console.log("\nPlatforms:");

    const platforms = await page
      .locator(
        ".c-product-details__section__list-item",
      )
      .allInnerTexts();

    console.log(platforms);

    console.log("\nCritic reviews link:");

    const criticLink = page
      .getByText("Critic Reviews", {
        exact: true,
      })
      .first();

    console.log(
      await criticLink.getAttribute("href"),
    );

    console.log("\nUser reviews section:");

    const userReviews = page.getByText(
      "User Reviews",
      { exact: true },
    );

    console.log(
      "Count:",
      await userReviews.count(),
    );

    const userReviewLink = page
      .locator("a")
      .filter({
        hasText: /User Reviews/i,
      })
      .first();

    console.log(
      "User review link:",
      await userReviewLink
        .getAttribute("href")
        .catch(() => null),
    );

    // --------------------------------------------------
    // Critic reviews page
    // --------------------------------------------------

    const criticHref =
      await criticLink.getAttribute("href");

    if (criticHref) {
      const criticPage = await browser.newPage();

      const criticUrl = new URL(
        criticHref,
        GAME_URL,
      ).href;

      console.log(
        "\n========== CRITIC REVIEWS ==========\n",
      );

      console.log(criticUrl);

      await criticPage.goto(criticUrl, {
        waitUntil: "domcontentloaded",
      });

      await criticPage.waitForTimeout(2000);

      console.log(
        (
          await criticPage.locator("body").innerText()
        ).slice(0, 10000),
      );

      await criticPage.screenshot({
        path: "metacritic-critic-reviews.png",
        fullPage: true,
      });
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});