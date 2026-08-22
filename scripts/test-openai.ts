import { generateSummary } from "@/shared/lib/openai";

async function main() {
  const summary = await generateSummary([
    "The combat is excellent and the exploration is rewarding.",
    "The game has a beautiful world and strong progression.",
    "Some pacing issues and difficulty spikes hurt the experience.",
  ]);

  console.log("\nOpenAI summary:\n");
  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});