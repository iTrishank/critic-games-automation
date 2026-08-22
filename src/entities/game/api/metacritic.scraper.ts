import { chromium, type Browser, type Page } from "playwright";

import type {
  ScrapedGame,
  ScrapedPlatform,
  ScrapedReview,
} from "@/entities/game/model/types";

const METACRITIC_BASE_URL = "https://www.metacritic.com";

const PLATFORM_PATTERN =
  /^(PC|PlayStation 5|PlayStation 4|Xbox Series X|Xbox One|Nintendo Switch|Nintendo Switch 2|PS5|PS4|iOS|Android)$/i;

const DATE_PATTERN = /^[A-Z]{3} \d{1,2}, \d{4}$/;

function parseScore(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "tbd") {
    return null;
  }

  const score = Number(normalized);

  return Number.isFinite(score) ? score : null;
}

function slugFromUrl(url: string): string {
  return new URL(url).pathname
    .replace(/^\/game\//, "")
    .replace(/\/$/, "");
}

async function scrapePlatforms(page: Page): Promise<string[]> {
  const platformsLabel = page.getByText("Platforms:", {
    exact: true,
  });

  if (!(await platformsLabel.count())) {
    return [];
  }

  const section = platformsLabel.locator("..");

  const text = await section.innerText();

  return text
    .split("\n")
    .map((value) => value.trim())
    .filter(
      (value) =>
        value &&
        value !== "Platforms:" &&
        !value.includes("Publisher:") &&
        !value.includes("Genres:"),
    );
}

async function scrapeScores(
  page: Page,
): Promise<{
  metascore: number | null;
  userscore: number | null;
}> {
  const cards = page.locator(
    '[data-testid="product-score"]',
  );

  let metascore: number | null = null;
  let userscore: number | null = null;

  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);

    const headerLocator = card.locator(
      '[data-testid="global-score-header"]',
    );

    if (!(await headerLocator.count())) {
      continue;
    }

    const header = (
      await headerLocator.innerText()
    )
      .trim()
      .toLowerCase();

    const value = card.locator(
      '[data-testid="global-score-value"]',
    );

    const tbd = card.locator(
      '[data-testid="global-score-tbd"]',
    );

    let scoreText: string | null = null;

    if (await value.count()) {
      scoreText = await value.textContent();
    } else if (await tbd.count()) {
      scoreText = await tbd.textContent();
    }

    if (header === "metascore") {
      metascore = parseScore(scoreText);
    }

    if (header === "user score") {
      userscore = parseScore(scoreText);
    }
  }

  return {
    metascore,
    userscore,
  };
}

async function scrapeCoverImage(
  page: Page,
  gameName: string,
): Promise<string | null> {
  const image = page
    .locator(`img[alt="${gameName}"]`)
    .first();

  if (!(await image.count())) {
    return null;
  }

  return image.getAttribute("src");
}

async function scrapeVideoUrl(
  page: Page,
): Promise<string | null> {
  const video = page.locator("video").first();

  if (await video.count()) {
    const src = await video.getAttribute("src");

    if (src && !src.startsWith("/browse/")) {
      return src;
    }
  }

  const source = page
    .locator("video source")
    .first();

  if (await source.count()) {
    const src = await source.getAttribute("src");

    if (src && !src.startsWith("/browse/")) {
      return src;
    }
  }

  return null;
}

async function extractReviewLines(
  element: HTMLElement,
): Promise<string[] | null> {
  let current: HTMLElement | null =
    element.parentElement;

  while (current) {
    const lines = (current.innerText ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const dateIndex = lines.findIndex((line) =>
      /^[A-Z]{3} \d{1,2}, \d{4}$/.test(line),
    );

    const hasRating = lines.some((line) =>
      /^\d{1,3}$/.test(line),
    );

    if (
      dateIndex !== -1 &&
      lines.length >= 5 &&
      hasRating
    ) {
      return lines;
    }

    current = current.parentElement;
  }

  return null;
}

async function scrapeCriticReviews(
  page: Page,
  criticUrl: string,
): Promise<ScrapedReview[]> {
  const originalUrl = page.url();

  try {
    await page.goto(criticUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    const reviews: ScrapedReview[] = [];

    const reviewButtons = page.getByText(
      "FULL REVIEW",
      {
        exact: true,
      },
    );

    const count = await reviewButtons.count();

    for (let i = 0; i < count; i++) {
      const button = reviewButtons.nth(i);

      const lines = await button.evaluate(
        extractReviewLines,
      );

      if (!lines) {
        continue;
      }

      const dateIndex = lines.findIndex((line) =>
        DATE_PATTERN.test(line),
      );

      if (dateIndex === -1) {
        continue;
      }

      const ratingIndex = lines.findIndex(
        (line, index) =>
          index > dateIndex &&
          /^\d{1,3}$/.test(line),
      );

      if (ratingIndex === -1) {
        continue;
      }

      const rating = Number(
        lines[ratingIndex],
      );

      const publication =
        lines[ratingIndex + 1] ?? "";

      const platformIndex = lines.findIndex(
        (line, index) =>
          index > ratingIndex &&
          PLATFORM_PATTERN.test(line),
      );

      const platform =
        platformIndex === -1
          ? null
          : lines[platformIndex];

      const textEnd =
        platformIndex === -1
          ? lines.length
          : platformIndex;

      const text = lines
        .slice(ratingIndex + 2, textEnd)
        .filter(
          (line) =>
            line !== "FULL REVIEW" &&
            line !== "Read More",
        )
        .join(" ")
        .replace(/\s*Read More\s*$/i, "")
        .trim();

      if (!publication || !text) {
        continue;
      }

      reviews.push({
        rating,
        publication,
        date: lines[dateIndex],
        text,
        platform,
      });
    }

    return reviews;
  } finally {
    await page.goto(originalUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  }
}

async function scrapeUserReviews(
  page: Page,
): Promise<ScrapedReview[]> {
  const body = await page.locator("body").innerText();

  if (
    body.includes(
      "User reviews are not available for this game yet.",
    )
  ) {
    return [];
  }

  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const reviews: ScrapedReview[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "REPORT") {
      continue;
    }

    let dateIndex = -1;

    for (
      let j = i - 1;
      j >= Math.max(0, i - 30);
      j--
    ) {
      if (
        /^[A-Z]{3} \d{1,2}, \d{4}$/.test(
          lines[j],
        )
      ) {
        dateIndex = j;
        break;
      }
    }

    if (dateIndex === -1) {
      continue;
    }

    const ratingIndex = dateIndex + 1;

    if (
      !/^\d{1,3}$/.test(
        lines[ratingIndex] ?? "",
      )
    ) {
      continue;
    }

    const rating = Number(
      lines[ratingIndex],
    );

    if (
      rating < 0 ||
      rating > 100
    ) {
      continue;
    }

    const username =
      lines[ratingIndex + 1] ?? "";

    if (!username) {
      continue;
    }

    const contentStart =
      ratingIndex + 2;

    const contentEnd = i;

    const contentLines = lines.slice(
      contentStart,
      contentEnd,
    );

    let platform: string | null = null;

    if (contentLines.length > 0) {
      const lastLine =
        contentLines[
          contentLines.length - 1
        ];

      if (
        /^(PC|PlayStation 5|PlayStation 4|Xbox Series X|Xbox One|Nintendo Switch|Nintendo Switch 2|PS5|PS4|iOS|Android)$/i.test(
          lastLine,
        )
      ) {
        platform = lastLine;
        contentLines.pop();
      }
    }

    const text = contentLines
      .filter(
        (line) =>
          line !== "Read More" &&
          line !== "FULL REVIEW",
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      continue;
    }

    reviews.push({
      rating,
      publication: username,
      date: lines[dateIndex],
      text,
      platform,
    });
  }

  return reviews;
}

export async function createMetacriticBrowser(): Promise<Browser> {
  return chromium.launch({
    channel: "chrome",
    headless: false,
  });
}

export async function scrapeGame(
  browser: Browser,
  url: string,
): Promise<ScrapedGame> {
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    const name = (
      await page
        .locator("h1.hero-title__text")
        .innerText()
    ).trim();

    const slug = slugFromUrl(url);

    const developerText = await page
      .locator("text=Developer:")
      .first()
      .locator("..")
      .innerText()
      .catch(() => null);

    const developer =
      developerText
        ?.replace(/^Developer:\s*/i, "")
        .trim() || null;

    const summary = page
      .getByText("Summary", {
        exact: true,
      })
      .first();

    const description = await summary
      .locator("..")
      .innerText()
      .then((text) =>
        text
          .replace(/^Summary\s*/i, "")
          .replace(/Action RPG\s*$/i, "")
          .trim(),
      )
      .catch(() => null);

    const platforms = await scrapePlatforms(page);

    const scores = await scrapeScores(page);

    const coverImage = await scrapeCoverImage(
      page,
      name,
    );

    const videoUrl = await scrapeVideoUrl(page);

    /*
     * Critic reviews are only available when
     * Metacritic exposes the review-count link.
     *
     * For games with no critic reviews, we return [].
     */
    let criticReviews: ScrapedReview[] = [];

    const criticLink = page.locator(
      'a[data-testid="global-score-review-count-link"]',
    );

    if (await criticLink.count()) {
      const criticHref =
        await criticLink
          .first()
          .getAttribute("href");

      if (criticHref) {
        criticReviews =
          await scrapeCriticReviews(
            page,
            new URL(
              criticHref,
              METACRITIC_BASE_URL,
            ).href,
          );
      }
    }

    /*
     * User reviews are scraped from the game page.
     */
    const userReviews =
      await scrapeUserReviews(page);

    const platformData: ScrapedPlatform[] =
      platforms.map((platform) => ({
        platform,
        metascore: scores.metascore,
        userscore: scores.userscore,
      }));

    return {
      name,
      slug,
      coverImage,
      developer,
      description,
      videoUrl,
      platforms: platformData,
      criticReviews,
      userReviews,
    };
  } finally {
    await page.close();
  }
}