export type WorkoutType = "shoulder" | "leg" | "back" | "cardio" | "rest";

export interface Set {
  reps: number;
  weight: number; // in lbs
}

export interface StrengthExercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface CardioExercise {
  id: string;
  name: string;
  duration: number; // in minutes
  notes?: string;
}

export type Exercise = StrengthExercise | CardioExercise;

export function isCardioExercise(ex: Exercise): ex is CardioExercise {
  return "duration" in ex;
}

export interface WorkoutEntry {
  id: string;
  date: string; // ISO date string: "YYYY-MM-DD"
  type: WorkoutType;
  exercises: Exercise[];
}

// Maps day of week (0=Sun, 1=Mon, ..., 6=Sat) to planned workout type(s)
export const WEEKLY_PLAN: Record<number, { types: WorkoutType[]; label: string }> = {
  0: { types: ["back"],     label: "Back + Abs" },
  1: { types: ["shoulder"], label: "Shoulder + Abs" },
  2: { types: ["rest"],     label: "Rest (class day)" },
  3: { types: ["rest"],     label: "Rest (class day)" },
  4: { types: ["leg"],      label: "Leg + Abs" },
  5: { types: ["rest"],     label: "Rest (class day)" },
  6: { types: ["cardio"],   label: "Cardio" },
};
