export type ScrapedPlatform = {
  platform: string;
  metascore: number | null;
  userscore: number | null;
};

export type ScrapedReview = {
  rating: number | null;
  publication: string;
  date: string;
  text: string;
  platform: string | null;
};

export type ScrapedGame = {
  name: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  description: string | null;
  videoUrl: string | null;

  platforms: ScrapedPlatform[];

  criticReviews: ScrapedReview[];
  userReviews: ScrapedReview[];
};