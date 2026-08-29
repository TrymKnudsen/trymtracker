import type { AppState, Exercise, MuscleGroup, WorkoutDay } from "./types";

type Seed = [
  id: string,
  name: string,
  muscle: MuscleGroup,
  sets: number,
  repMin: number,
  repMax: number,
  rest: number,
  increment: number,
  note?: string,
];

const SEEDS: Seed[] = [
  ["incline-bb", "Incline barbell press", "Bryst", 4, 5, 5, 180, 2.5, "Øk 2,5 kg når 4x5 klares"],
  ["hs-incline", "Hammer Strength incline press", "Bryst", 3, 8, 10, 120, 2.5],
  ["hs-pecdeck", "Hammer Strength pec deck", "Bryst", 3, 12, 15, 75, 2],
  ["shoulder-press", "Shoulder press (maskin)", "Skulder", 3, 10, 12, 90, 2],
  ["lateral-raise", "Lateral raise (maskin)", "Skulder", 4, 12, 15, 75, 1],
  ["triceps-pushdown", "Cable triceps pushdown", "Triceps", 3, 10, 12, 75, 1],
  ["leg-raises", "Leg raises", "Mage", 3, 12, 15, 50, 0],
  ["pulldown-wide", "Cable pulldown, bredt grep", "Rygg", 4, 8, 10, 120, 2.5],
  ["cable-row-narrow", "Cable row, smalt grep", "Rygg", 3, 10, 12, 90, 2.5],
  ["low-row", "Low row (maskin)", "Rygg", 3, 10, 12, 90, 2.5],
  ["reverse-pecdeck", "Reverse pec deck", "Skulder", 3, 15, 15, 50, 2],
  ["hammer-curl", "Hammer curl", "Biceps", 3, 10, 12, 75, 2],
  ["cable-curl", "Cable curl", "Biceps", 3, 10, 12, 75, 1],
  ["db-shrug", "Dumbbell shrugs", "Rygg", 3, 12, 15, 50, 2],
  ["hack-squat", "Hack squat", "Ben", 4, 8, 10, 150, 2.5],
  ["leg-extension", "Leg extension", "Ben", 3, 12, 15, 75, 2],
  ["leg-curl", "Leg curl", "Ben", 3, 12, 15, 75, 2],
  ["calf-extension", "Calf extension", "Ben", 4, 15, 15, 50, 2.5],
  ["crunch-machine", "Crunch-maskin", "Mage", 3, 15, 15, 50, 2],
  ["incline-bb-volum", "Incline barbell press (volum)", "Bryst", 3, 8, 8, 120, 2.5, "65–70 % av 1RM"],
  ["oh-triceps", "Overhead triceps extension", "Triceps", 3, 10, 12, 75, 1],
  ["pushdown-bar", "Cable pushdown, stangrep", "Triceps", 3, 10, 12, 75, 1],
  ["preacher-curl", "Seated preacher curl", "Biceps", 3, 10, 12, 75, 1],
  ["cable-shrug", "Cable shrug", "Rygg", 3, 12, 15, 50, 2],
  ["lateral-raise-hi", "Lateral raise (maskin), høy rep", "Skulder", 4, 15, 20, 75, 1],
  ["shoulder-press-heavy", "Shoulder press (maskin), tung", "Skulder", 4, 8, 10, 120, 2],
  ["crunch-machine-hi", "Crunch-maskin, høy rep", "Mage", 3, 15, 20, 50, 2],
  ["pulldown-wide-hi", "Cable pulldown, bredt grep (høy rep)", "Rygg", 3, 12, 15, 90, 2.5],
  ["low-row-heavy", "Low row (maskin), tung", "Rygg", 4, 8, 10, 120, 2.5],
  ["leg-raises-15", "Leg raises 15", "Mage", 3, 15, 15, 50, 0],
];

function buildExercises(): Record<string, Exercise> {
  const out: Record<string, Exercise> = {};
  for (const [id, name, muscle, sets, repMin, repMax, rest, increment, note] of SEEDS) {
    out[id] = { id, name, muscle, sets, repMin, repMax, rest, increment, note, currentWeight: null };
  }
  return out;
}

const DAYS: WorkoutDay[] = [
  {
    day: "man",
    title: "Push A",
    subtitle: "Styrke-fokus",
    rest: false,
    exerciseIds: [
      "incline-bb",
      "hs-incline",
      "hs-pecdeck",
      "shoulder-press",
      "lateral-raise",
      "triceps-pushdown",
      "leg-raises",
    ],
  },
  {
    day: "tir",
    title: "Pull A",
    subtitle: "Rygg / Biceps",
    rest: false,
    exerciseIds: [
      "pulldown-wide",
      "cable-row-narrow",
      "low-row",
      "reverse-pecdeck",
      "hammer-curl",
      "cable-curl",
      "db-shrug",
    ],
  },
  {
    day: "ons",
    title: "Ben",
    subtitle: "Underkropp",
    rest: false,
    exerciseIds: [
      "hack-squat",
      "leg-extension",
      "leg-curl",
      "calf-extension",
      "leg-raises-15",
      "crunch-machine",
    ],
  },
  {
    day: "tor",
    title: "Push B",
    subtitle: "Volum + teknikk",
    rest: false,
    exerciseIds: [
      "incline-bb-volum",
      "hs-incline",
      "hs-pecdeck",
      "shoulder-press",
      "lateral-raise",
      "oh-triceps",
      "pushdown-bar",
    ],
  },
  {
    day: "fre",
    title: "Pull B",
    subtitle: "Ryggtykkelse",
    rest: false,
    exerciseIds: [
      "low-row-heavy",
      "cable-row-narrow",
      "pulldown-wide-hi",
      "reverse-pecdeck",
      "preacher-curl",
      "cable-shrug",
    ],
  },
  {
    day: "lor",
    title: "Skulder / Arm",
    subtitle: "Spesialisering",
    rest: false,
    exerciseIds: [
      "shoulder-press-heavy",
      "lateral-raise-hi",
      "pushdown-bar",
      "hammer-curl",
      "crunch-machine-hi",
      "leg-raises-15",
    ],
  },
  {
    day: "son",
    title: "Hvile / Padel",
    subtitle: "Fri aktivitet",
    rest: true,
    exerciseIds: [],
  },
];

export function defaultState(): AppState {
  return {
    exercises: buildExercises(),
    days: DAYS.map((d) => ({ ...d, exerciseIds: [...d.exerciseIds] })),
    sessions: [],
    weights: [],
    settings: { targetPerWeek: 0.25, mode: "bulk", toleranse: 0.1 },
  };
}
