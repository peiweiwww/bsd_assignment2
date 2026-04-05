"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, WorkoutEntry, isCardioExercise } from "@/lib/types";

// ── Constants ──────────────────────────────────────────────────────────────

export const WORKOUT_COLORS: Record<string, string> = {
  shoulder: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  leg:      "bg-blue-500/15   text-blue-300   border-blue-500/30",
  back:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cardio:   "bg-orange-500/15 text-orange-300  border-orange-500/30",
  rest:     "bg-zinc-700/40   text-zinc-400    border-zinc-600/40",
};

export const WORKOUT_ICONS: Record<string, string> = {
  shoulder: "🏋️",
  leg:      "🦵",
  back:     "💪",
  cardio:   "🏃",
  rest:     "😴",
};

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function totalVolume(entry: WorkoutEntry): number {
  let vol = 0;
  for (const ex of entry.exercises) {
    if (!isCardioExercise(ex)) {
      for (const s of ex.sets) vol += s.reps * s.weight;
    }
  }
  return vol;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TodayPlan({ dayOfWeek }: { dayOfWeek: number }) {
  const plan = WEEKLY_PLAN[dayOfWeek];
  const colorClass = WORKOUT_COLORS[plan.types[0]] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[plan.types[0]] ?? "📅";

  return (
    <div className={`rounded-2xl border px-5 py-4 ${colorClass}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
        Today&apos;s Plan
      </p>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xl font-bold">{plan.label}</span>
      </div>
    </div>
  );
}

export function WorkoutCard({ entry }: { entry: WorkoutEntry }) {
  const colorClass = WORKOUT_COLORS[entry.type] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[entry.type] ?? "📅";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-zinc-100 capitalize">{entry.type}</span>
          <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
            {entry.exercises.length} exercise{entry.exercises.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href={`/day/${entry.date}`}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {formatDate(entry.date)} →
        </Link>
      </div>

      {/* Exercise list */}
      <ul className="divide-y divide-zinc-800/60">
        {entry.exercises.map((ex) => (
          <li key={ex.id} className="px-5 py-3">
            {isCardioExercise(ex) ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">{ex.name}</span>
                <span className="text-sm text-zinc-400">{ex.duration} min</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-zinc-200">{ex.name}</span>
                  <span className="text-xs text-zinc-500">{ex.sets.length} sets</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono"
                    >
                      {s.reps}×{s.weight === 0 ? "BW" : `${s.weight}lb`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Card footer — volume */}
      {totalVolume(entry) > 0 && (
        <div className="px-5 py-2.5 border-t border-zinc-800 bg-zinc-900/50">
          <span className="text-xs text-zinc-500">
            Total volume:{" "}
            <span className="font-semibold text-zinc-300">
              {totalVolume(entry).toLocaleString()} lb
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { getByDate, getRecent } = useWorkouts();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const dayOfWeek = now.getDay();

  const todayEntry = getByDate(today);
  const recentWorkouts = getRecent(5).filter((w) => w.date !== today);

  const todayFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Date header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          Today
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {todayFormatted}
        </h1>
      </div>

      {/* Today's plan */}
      <TodayPlan dayOfWeek={dayOfWeek} />

      {/* Today's log or CTA */}
      {todayEntry ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Today&apos;s Log
          </h2>
          <WorkoutCard entry={todayEntry} />
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700 px-5 py-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">No workout logged for today yet.</p>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            + Log Today&apos;s Workout
          </Link>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Recent Workouts
            </h2>
            <Link
              href="/week"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Week view →
            </Link>
          </div>
          <ul className="space-y-4">
            {recentWorkouts.map((entry) => (
              <li key={entry.id}>
                <WorkoutCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
