import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const url =
    "https://www.metacritic.com/game/mortal-shell-ii/";

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(3000);

    console.log("Title:", await page.title());
    console.log("URL:", page.url());

    const report = page
      .getByText("REPORT", {
        exact: true,
      })
      .first();

    console.log(
      "\nREPORT count:",
      await report.count(),
    );

    if (await report.count()) {
      console.log("\nREPORT HTML:\n");

      const reportHtml = await report.evaluate(
        (element: HTMLElement) => {
          let current: HTMLElement | null =
            element.parentElement;

          const output: string[] = [];

          for (
            let i = 0;
            i < 6 && current;
            i++
          ) {
            output.push(
              `\n--- LEVEL ${i} ---\n` +
                current.outerHTML.slice(
                  0,
                  10000,
                ),
            );

            current = current.parentElement;
          }

          return output.join("\n");
        },
      );

      console.log(reportHtml);
    }

    const text = await page
      .locator("body")
      .innerText();

    console.log("\n--- PAGE TEXT ---\n");
    console.log(text.slice(0, 12000));

    await writeFile(
      "metacritic-game.html",
      await page.content(),
    );

    await page.screenshot({
      path: "metacritic-game.png",
      fullPage: true,
    });

    console.log(
      "\nSaved metacritic-game.html",
    );

    console.log(
      "Saved metacritic-game.png",
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});