import { GameDetailsPage } from "@/pages/game-details/ui/game-details-page";

type GameDetailsRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GameDetailsRoute({ params }: GameDetailsRouteProps) {
  const { slug } = await params;

  return <GameDetailsPage slug={slug} />;
}
