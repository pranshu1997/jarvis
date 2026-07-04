export interface SportDrill {
  id: string;
  sport: string;
  title: string;
  duration_min: number;
  xp_reward: number;
  description: string;
}

export const SPORT_DRILLS: SportDrill[] = [
  { id: "tennis-serve", sport: "tennis", title: "Serve Practice", duration_min: 30, xp_reward: 80, description: "100 serves, focus on placement" },
  { id: "tennis-footwork", sport: "tennis", title: "Court Footwork", duration_min: 20, xp_reward: 60, description: "Ladder drills + split steps" },
  { id: "basketball-shooting", sport: "basketball", title: "Shooting Session", duration_min: 45, xp_reward: 90, description: "Spot shooting + free throws" },
  { id: "basketball-handling", sport: "basketball", title: "Ball Handling", duration_min: 25, xp_reward: 70, description: "Crossover combos + weak hand" },
  { id: "soccer-dribble", sport: "soccer", title: "Dribble Circuit", duration_min: 30, xp_reward: 75, description: "Cone weave + change of pace" },
];

export function getDrillById(id: string): SportDrill | undefined {
  return SPORT_DRILLS.find((d) => d.id === id);
}
