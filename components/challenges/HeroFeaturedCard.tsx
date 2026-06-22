export type HeroFeaturedDifficulty = "EASY" | "MED" | "HARD";
export type HeroFeaturedProofType = "photo" | "text" | "location";
type HeroFeaturedCategory = "body" | "mind" | "faith" | "focus";

export interface HeroFeaturedData {
  id: string;
  slug: string | null;
  name: string;
  duration_days: number;
  difficulty: HeroFeaturedDifficulty;
  proof_type: HeroFeaturedProofType;
  category: HeroFeaturedCategory;
  joinedTodayCount: number;
  featuredProof: {
    user_display_name: string;
    day_number: number;
    photo_url: string;
  } | null;
  friendsStarted: {
    friend_names: string[];
    others_count: number;
  };
}
