import { chromium } from "playwright";

const METACRITIC_BASE_URL = "https://www.metacritic.com";

const NEW_RELEASES_URL =
  "https://www.metacritic.com/browse/game/all/all/all-time/new/";

export type NewReleaseGame = {
  name: string;
  url: string;
};

export async function getNewReleaseGames(
  limit = 20,
): Promise<NewReleaseGame[]> {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
  });

  try {
    const page = await browser.newPage();

    await page.goto(NEW_RELEASES_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(1500);

    const cards = page.locator(
      '[data-testid="filter-results"]',
    );

    const count = await cards.count();

    const releases: NewReleaseGame[] = [];

    for (let i = 0; i < count && releases.length < limit; i++) {
      const card = cards.nth(i);

      const link = card.locator(
        'a[href^="/game/"]',
      ).first();

      if (!(await link.count())) {
        continue;
      }

      const href = await link.getAttribute("href");

      if (!href) {
        continue;
      }

      const title = card.locator(
        '[data-testid="product-title"]',
      ).first();

      const name = (
        await title.innerText()
      ).trim();

      if (!name) {
        continue;
      }

      releases.push({
        name,
        url: new URL(
          href,
          METACRITIC_BASE_URL,
        ).href,
      });
    }

    return releases;
  } finally {
    await browser.close();
  }
}
