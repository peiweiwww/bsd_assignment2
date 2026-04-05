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

// Left-border accent colors per workout type
const CARD_ACCENT: Record<string, string> = {
  shoulder: "border-l-violet-400",
  leg:      "border-l-sky-400",
  back:     "border-l-emerald-400",
  cardio:   "border-l-orange-400",
  rest:     "border-l-slate-300",
};

// Gradient classes for TodayPlan banner
const PLAN_GRADIENT: Record<string, string> = {
  shoulder: "from-violet-50 to-purple-100/60 border-violet-200",
  leg:      "from-sky-50 to-blue-100/60 border-sky-200",
  back:     "from-emerald-50 to-green-100/60 border-emerald-200",
  cardio:   "from-orange-50 to-amber-100/60 border-orange-200",
  rest:     "from-slate-50 to-slate-100/60 border-slate-200",
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

function totalDuration(entry: WorkoutEntry): number {
  let dur = 0;
  for (const ex of entry.exercises) {
    if (isCardioExercise(ex)) dur += ex.duration;
  }
  return dur;
}

function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return localISO(d);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TodayPlan({ dayOfWeek }: { dayOfWeek: number }) {
  const plan = WEEKLY_PLAN[dayOfWeek];
  const gradientClass = PLAN_GRADIENT[plan.types[0]] ?? PLAN_GRADIENT.rest;
  const icon = WORKOUT_ICONS[plan.types[0]] ?? "📅";

  return (
    <div className={`rounded-2xl border bg-gradient-to-br px-5 py-5 transition-all duration-200 hover:scale-[1.01] shadow-sm ${gradientClass}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
        Today&apos;s Plan
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm text-3xl shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {plan.label}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Scheduled for today</p>
        </div>
      </div>
    </div>
  );
}

export function WorkoutCard({ entry }: { entry: WorkoutEntry }) {
  const colorClass = WORKOUT_COLORS[entry.type] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[entry.type] ?? "📅";
  const accentClass = CARD_ACCENT[entry.type] ?? CARD_ACCENT.rest;

  return (
    <div className={`rounded-2xl border-l-4 border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-sky-100/60 hover:-translate-y-0.5 ${accentClass}`}>
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

function WeeklyStatBar({ workouts }: { workouts: WorkoutEntry[] }) {
  const mondayISO = getMondayISO(new Date());
  const sundayISO = localISO(new Date()); // today is the upper bound

  const weekEntries = workouts.filter((w) => w.date >= mondayISO && w.date <= sundayISO);
  const trainDays = weekEntries.filter((e) => e.type !== "rest").length;

  if (trainDays === 0) return null;

  const totalVol = weekEntries.reduce((acc, e) => acc + totalVolume(e), 0);
  const STRENGTH_TYPES = new Set(["shoulder", "leg", "back"]);
  const estMinutes = weekEntries.reduce((acc, e) => {
    if (STRENGTH_TYPES.has(e.type)) return acc + 60;
    if (e.type === "cardio") return acc + totalDuration(e);
    return acc;
  }, 0);
  const estHours = Math.floor(estMinutes / 60);
  const estMins  = estMinutes % 60;
  const estLabel = estMinutes === 0 ? null
    : estHours > 0 && estMins > 0 ? `${estHours}h ${estMins}m`
    : estHours > 0 ? `${estHours}h`
    : `${estMins}m`;

  const stats = [
    { value: `${trainDays}`, label: trainDays === 1 ? "workout" : "workouts" },
    ...(totalVol > 0 ? [{ value: `${(totalVol / 1000).toFixed(1)}k lb`, label: "volume" }] : []),
    ...(estLabel ? [{ value: estLabel, label: "gym time" }] : []),
  ];

  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-3.5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2.5">This Week</p>
      <div className="flex items-center gap-5 flex-wrap">
        {stats.map(({ value, label }, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-sky-700 tabular-nums">{value}</span>
            <span className="text-xs text-sky-500/70 font-semibold">{label}</span>
            {i < stats.length - 1 && (
              <span className="ml-3 text-sky-200 font-light select-none">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityBadge({ workouts }: { workouts: WorkoutEntry[] }) {
  const mondayISO = getMondayISO(new Date());
  const todayISO  = localISO(new Date());
  const count = workouts.filter(
    (w) => w.date >= mondayISO && w.date <= todayISO && w.type !== "rest"
  ).length;

  if (count === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 shadow-sm">
      <span className="text-sm">🔥</span>
      <span className="text-xs font-bold text-sky-700">
        {count} workout{count !== 1 ? "s" : ""} this week
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { getByDate, getRecent, workouts } = useWorkouts();

  const now = new Date();
  const today = localISO(now);
  const dayOfWeek = now.getDay();

  const todayEntry = getByDate(today);
  const recentWorkouts = getRecent(5).filter((w) => w.date !== today);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero date header with gradient background */}
      <div className="-mx-4 px-4 pt-6 pb-5 bg-gradient-to-b from-sky-50/80 to-transparent rounded-b-3xl">
        <div className="flex items-start justify-between">
          <div>
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
          <ActivityBadge workouts={workouts} />
        </div>
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all duration-150 shadow-md shadow-sky-200"
          >
            + Log Today&apos;s Workout
          </Link>
        </div>
      )}

      {/* Weekly stat bar */}
      <WeeklyStatBar workouts={workouts} />

      {/* Divider */}
      {recentWorkouts.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Recent</span>
          <div className="flex-1 h-px bg-slate-200" />
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
