import { WorkoutEntry } from "./types";

export const sampleWorkouts: WorkoutEntry[] = [
  // Monday — Shoulder + Abs
  {
    id: "w1",
    date: "2026-03-30",
    type: "shoulder",
    exercises: [
      {
        id: "e1",
        name: "Overhead Press",
        sets: [
          { reps: 8, weight: 95 },
          { reps: 8, weight: 95 },
          { reps: 6, weight: 100 },
          { reps: 6, weight: 100 },
        ],
      },
      {
        id: "e2",
        name: "Lateral Raise",
        sets: [
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 },
          { reps: 10, weight: 25 },
        ],
      },
      {
        id: "e3",
        name: "Front Raise",
        sets: [
          { reps: 12, weight: 20 },
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 },
        ],
      },
      // Abs
      {
        id: "e4",
        name: "Cable Crunch",
        sets: [
          { reps: 15, weight: 50 },
          { reps: 15, weight: 50 },
          { reps: 12, weight: 55 },
        ],
      },
      {
        id: "e4b",
        name: "Hanging Leg Raise",
        sets: [
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
        ],
      },
    ],
  },

  // Thursday — Leg + Abs
  {
    id: "w2",
    date: "2026-04-02",
    type: "leg",
    exercises: [
      {
        id: "e5",
        name: "Barbell Squat",
        sets: [
          { reps: 5, weight: 185 },
          { reps: 5, weight: 185 },
          { reps: 5, weight: 195 },
          { reps: 4, weight: 195 },
        ],
      },
      {
        id: "e6",
        name: "Romanian Deadlift",
        sets: [
          { reps: 10, weight: 135 },
          { reps: 10, weight: 145 },
          { reps: 8,  weight: 145 },
        ],
      },
      {
        id: "e7",
        name: "Leg Press",
        sets: [
          { reps: 12, weight: 270 },
          { reps: 12, weight: 270 },
          { reps: 10, weight: 290 },
        ],
      },
      // Abs
      {
        id: "e8",
        name: "Hanging Leg Raise",
        sets: [
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
        ],
      },
      {
        id: "e8b",
        name: "Plank",
        sets: [
          { reps: 1, weight: 0 },
          { reps: 1, weight: 0 },
          { reps: 1, weight: 0 },
        ],
      },
      {
        id: "e8c",
        name: "Cable Crunch",
        sets: [
          { reps: 15, weight: 50 },
          { reps: 15, weight: 50 },
          { reps: 12, weight: 55 },
        ],
      },
    ],
  },

  // Saturday — Cardio
  {
    id: "w3",
    date: "2026-04-04",
    type: "cardio",
    exercises: [
      {
        id: "e9",
        name: "Treadmill Run",
        duration: 25,
        notes: "Maintained 6.5 mph, felt strong",
      },
      {
        id: "e10",
        name: "Rowing Machine",
        duration: 10,
        notes: "Cooldown pace, 500m splits ~2:10",
      },
    ],
  },

  // Sunday March 29 — Back + Abs
  {
    id: "w4",
    date: "2026-03-29",
    type: "back",
    exercises: [
      {
        id: "e11",
        name: "Deadlift",
        sets: [
          { reps: 5, weight: 225 },
          { reps: 5, weight: 225 },
          { reps: 3, weight: 245 },
        ],
      },
      {
        id: "e12",
        name: "Pull-Up",
        sets: [
          { reps: 10, weight: 0 },
          { reps: 9,  weight: 0 },
          { reps: 8,  weight: 0 },
        ],
      },
      {
        id: "e13",
        name: "Seated Cable Row",
        sets: [
          { reps: 12, weight: 120 },
          { reps: 12, weight: 120 },
          { reps: 10, weight: 130 },
        ],
      },
      // Abs
      {
        id: "e14",
        name: "Plank",
        sets: [
          { reps: 1, weight: 0 },
          { reps: 1, weight: 0 },
        ],
      },
      {
        id: "e14b",
        name: "Hanging Leg Raise",
        sets: [
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
        ],
      },
      {
        id: "e14c",
        name: "Russian Twist",
        sets: [
          { reps: 20, weight: 25 },
          { reps: 20, weight: 25 },
          { reps: 15, weight: 25 },
        ],
      },
    ],
  },

  // Sunday April 5 (today) — Back + Abs
  {
    id: "w5",
    date: "2026-04-05",
    type: "back",
    exercises: [
      {
        id: "e15",
        name: "Deadlift",
        sets: [
          { reps: 5, weight: 225 },
          { reps: 5, weight: 225 },
          { reps: 3, weight: 245 },
        ],
      },
      {
        id: "e16",
        name: "Pull-Up",
        sets: [
          { reps: 10, weight: 0 },
          { reps: 9,  weight: 0 },
          { reps: 8,  weight: 0 },
        ],
      },
      {
        id: "e17",
        name: "Seated Cable Row",
        sets: [
          { reps: 12, weight: 120 },
          { reps: 12, weight: 120 },
          { reps: 10, weight: 130 },
        ],
      },
      // Abs
      {
        id: "e18",
        name: "Hanging Leg Raise",
        sets: [
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
        ],
      },
      {
        id: "e19",
        name: "Russian Twist",
        sets: [
          { reps: 20, weight: 25 },
          { reps: 20, weight: 25 },
          { reps: 15, weight: 25 },
        ],
      },
    ],
  },
];

/** Returns the workout entry for today (if any) */
export function getTodayWorkout(): WorkoutEntry | undefined {
  const today = new Date().toISOString().split("T")[0];
  return sampleWorkouts.find((w) => w.date === today);
}

/** Returns the most recent N workout entries sorted newest-first */
export function getRecentWorkouts(n = 5): WorkoutEntry[] {
  return [...sampleWorkouts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n);
}
