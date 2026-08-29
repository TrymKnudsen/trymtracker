export type DayKey = "man" | "tir" | "ons" | "tor" | "fre" | "lor" | "son";

export const DAY_ORDER: DayKey[] = ["man", "tir", "ons", "tor", "fre", "lor", "son"];

export const DAY_NAMES: Record<DayKey, string> = {
  man: "Mandag",
  tir: "Tirsdag",
  ons: "Onsdag",
  tor: "Torsdag",
  fre: "Fredag",
  lor: "Lørdag",
  son: "Søndag",
};

export type MuscleGroup =
  | "Bryst"
  | "Rygg"
  | "Skulder"
  | "Biceps"
  | "Triceps"
  | "Ben"
  | "Mage"
  | "Annet";

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  sets: number;
  repMin: number;
  repMax: number;
  rest: number; // sekunder
  increment: number; // kg-hopp
  note?: string;
  /** Sist foreslåtte/oppdaterte arbeidsvekt i kg */
  currentWeight: number | null;
}

export interface WorkoutDay {
  day: DayKey;
  title: string;
  subtitle: string;
  rest: boolean;
  exerciseIds: string[];
}

export interface LoggedSet {
  weight: number;
  reps: number;
  at: number;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO yyyy-mm-dd
  day: DayKey;
  title: string;
  durationSec: number;
  entries: SessionExercise[];
  freeActivity?: string;
}

export interface BodyWeightLog {
  date: string; // yyyy-mm-dd
  weight: number;
}

export interface Settings {
  /** mål kg endring per uke, kan være negativ */
  targetPerWeek: number;
  mode: "bulk" | "cut" | "vedlikehold";
  toleranse: number;
}

export interface AppState {
  exercises: Record<string, Exercise>;
  days: WorkoutDay[];
  sessions: WorkoutSession[];
  weights: BodyWeightLog[];
  settings: Settings;
}
