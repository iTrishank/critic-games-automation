import { processGames } from "@/features/run-processing/api/process-games";

async function main() {
  console.log("Starting processing...\n");

  const result = await processGames();

  console.log("\nProcessing complete:");
  console.dir(result, {
    depth: null,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});