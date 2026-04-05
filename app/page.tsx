"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, WORKOUT_TYPE_LABELS, WorkoutEntry, isCardioExercise } from "@/lib/types";
import { localISO } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

export const WORKOUT_COLORS: Record<string, string> = {
  shoulder: "bg-violet-50 text-violet-700 border-violet-200",
  leg:      "bg-sky-50    text-sky-700    border-sky-200",
  back:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  cardio:   "bg-orange-50  text-orange-700  border-orange-200",
  rest:     "bg-slate-100  text-slate-500   border-slate-200",
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
    <div className={`rounded-2xl border px-5 py-5 transition-all duration-200 hover:scale-[1.01] shadow-sm ${colorClass}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-sky-100/60 hover:-translate-y-0.5">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-slate-800">{WORKOUT_TYPE_LABELS[entry.type]}</span>
          <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
            {entry.exercises.length} exercise{entry.exercises.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href={`/day/${entry.date}`}
          className="text-xs text-slate-400 hover:text-sky-600 transition-colors font-medium"
        >
          {formatDate(entry.date)} →
        </Link>
      </div>

      {/* Exercise list */}
      <ul className="divide-y divide-slate-100">
        {entry.exercises.map((ex) => (
          <li key={ex.id} className="px-5 py-3">
            {isCardioExercise(ex) ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                <span className="text-sm text-slate-500 tabular-nums font-medium">{ex.duration} min</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                  <span className="text-xs text-slate-400">{ex.sets.length} sets</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs text-slate-600 font-mono tabular-nums"
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
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/70">
          <span className="text-xs text-slate-400">
            Total volume:{" "}
            <span className="font-semibold text-slate-600">
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
  const today = localISO(now);
  const dayOfWeek = now.getDay();

  const todayEntry = getByDate(today);
  const recentWorkouts = getRecent(5).filter((w) => w.date !== today);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero date header */}
      <div className="pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Today
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-none">
          {now.toLocaleDateString("en-US", { weekday: "long" })}
        </h1>
        <p className="mt-1.5 text-lg text-slate-500 font-medium">
          {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Today's plan */}
      <TodayPlan dayOfWeek={dayOfWeek} />

      {/* Today's log or CTA */}
      {todayEntry ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Today&apos;s Log
          </h2>
          <WorkoutCard entry={todayEntry} />
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center transition-colors hover:border-sky-300 hover:bg-sky-50/30">
          <p className="text-slate-400 text-sm mb-5">No workout logged for today yet.</p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-600 active:scale-95 transition-all duration-150 shadow-md shadow-sky-200"
          >
            + Log Today&apos;s Workout
          </Link>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Recent Workouts
            </h2>
            <Link
              href="/week"
              className="text-xs font-medium text-slate-400 hover:text-sky-600 transition-colors"
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
