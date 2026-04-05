"use client";

import { WorkoutProvider } from "@/lib/workout-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WorkoutProvider>{children}</WorkoutProvider>;
}
