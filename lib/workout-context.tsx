"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { WorkoutEntry } from "./types";
import { sampleWorkouts } from "./sample-data";

// ── Context shape ──────────────────────────────────────────────────────────

interface WorkoutContextValue {
  workouts: WorkoutEntry[];
  addWorkout: (entry: WorkoutEntry) => void;
  getByDate: (date: string) => WorkoutEntry | undefined;
  getRecent: (n?: number) => WorkoutEntry[];
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(sampleWorkouts);

  const addWorkout = useCallback((entry: WorkoutEntry) => {
    setWorkouts((prev) => {
      // Replace if same date already exists, otherwise prepend
      const exists = prev.some((w) => w.date === entry.date);
      if (exists) {
        return prev.map((w) => (w.date === entry.date ? entry : w));
      }
      return [entry, ...prev];
    });
  }, []);

  const getByDate = useCallback(
    (date: string) => workouts.find((w) => w.date === date),
    [workouts]
  );

  const getRecent = useCallback(
    (n = 5) =>
      [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n),
    [workouts]
  );

  return (
    <WorkoutContext.Provider value={{ workouts, addWorkout, getByDate, getRecent }}>
      {children}
    </WorkoutContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useWorkouts(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkouts must be used inside <WorkoutProvider>");
  return ctx;
}
