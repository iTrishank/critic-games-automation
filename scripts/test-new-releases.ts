import { getNewReleaseGames } from "@/entities/game/api/metacritic.releases";

async function main() {
  const games = await getNewReleaseGames(20);

  console.log(`Found ${games.length} new releases:\n`);

  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name}`);
    console.log(`   ${game.url}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});