"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, WORKOUT_TYPE_LABELS, WorkoutEntry, isCardioExercise } from "@/lib/types";
import { localISO } from "@/lib/utils";

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
    <div className={`rounded-2xl border px-5 py-5 transition-all duration-200 hover:scale-[1.01] ${colorClass}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">
        Today&apos;s Plan
      </p>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <span className="text-2xl font-bold tracking-tight">{plan.label}</span>
      </div>
    </div>
  );
}

export function WorkoutCard({ entry }: { entry: WorkoutEntry }) {
  const colorClass = WORKOUT_COLORS[entry.type] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[entry.type] ?? "📅";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-zinc-100">{WORKOUT_TYPE_LABELS[entry.type]}</span>
          <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
            {entry.exercises.length} exercise{entry.exercises.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href={`/day/${entry.date}`}
          className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors font-medium"
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
                <span className="text-sm text-zinc-400 tabular-nums">{ex.duration} min</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-200">{ex.name}</span>
                  <span className="text-xs text-zinc-500">{ex.sets.length} sets</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono tabular-nums"
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
        <div className="px-5 py-2.5 border-t border-zinc-800/80 bg-zinc-900/60">
          <span className="text-xs text-zinc-600">
            Total volume:{" "}
            <span className="font-semibold text-zinc-400">
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
  const today = localISO(now);          // ← local date, no UTC shift
  const dayOfWeek = now.getDay();       // ← local day of week

  const todayEntry = getByDate(today);
  const recentWorkouts = getRecent(5).filter((w) => w.date !== today);

  const todayFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero date header */}
      <div className="pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Today
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">
          {now.toLocaleDateString("en-US", { weekday: "long" })}
        </h1>
        <p className="mt-1.5 text-lg text-zinc-500 font-medium">
          {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Today's plan */}
      <TodayPlan dayOfWeek={dayOfWeek} />

      {/* Today's log or CTA */}
      {todayEntry ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Today&apos;s Log
          </h2>
          <WorkoutCard entry={todayEntry} />
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700/80 px-5 py-10 text-center transition-colors hover:border-zinc-600">
          <p className="text-zinc-500 text-sm mb-5">No workout logged for today yet.</p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-zinc-100 active:scale-95 transition-all duration-150 shadow-lg shadow-white/10"
          >
            + Log Today&apos;s Workout
          </Link>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Recent Workouts
            </h2>
            <Link
              href="/week"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Week view →
            </Link>
          </div>
          <ul className="space-y-4 stagger">
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
