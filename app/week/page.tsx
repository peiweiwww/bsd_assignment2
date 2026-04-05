"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, WorkoutEntry, isCardioExercise } from "@/lib/types";
import { localISO } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

const WORKOUT_COLORS: Record<string, { card: string; badge: string; dot: string }> = {
  shoulder: {
    card:  "border-violet-500/40 bg-violet-500/8 hover:border-violet-500/60 hover:bg-violet-500/12",
    badge: "bg-violet-500/20 text-violet-300",
    dot:   "bg-violet-400",
  },
  leg: {
    card:  "border-blue-500/40 bg-blue-500/8 hover:border-blue-500/60 hover:bg-blue-500/12",
    badge: "bg-blue-500/20 text-blue-300",
    dot:   "bg-blue-400",
  },
  back: {
    card:  "border-emerald-500/40 bg-emerald-500/8 hover:border-emerald-500/60 hover:bg-emerald-500/12",
    badge: "bg-emerald-500/20 text-emerald-300",
    dot:   "bg-emerald-400",
  },
  cardio: {
    card:  "border-orange-500/40 bg-orange-500/8 hover:border-orange-500/60 hover:bg-orange-500/12",
    badge: "bg-orange-500/20 text-orange-300",
    dot:   "bg-orange-400",
  },
  rest: {
    card:  "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700",
    badge: "bg-zinc-700/50 text-zinc-500",
    dot:   "bg-zinc-600",
  },
};

const WORKOUT_ICONS: Record<string, string> = {
  shoulder: "🏋️",
  leg:      "🦵",
  back:     "💪",
  cardio:   "🏃",
  rest:     "😴",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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

function formatMonthRange(monday: Date, sunday: Date): string {
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear  = monday.getFullYear() === sunday.getFullYear();
  const monStr = monday.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const sunStr = sunday.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "long",
    day: "numeric",
    year: "numeric",
  });
  return sameYear
    ? `${monStr} – ${sunStr}`
    : `${monStr}, ${monday.getFullYear()} – ${sunStr}`;
}

// ── Day card ───────────────────────────────────────────────────────────────

function DayCard({
  date,
  isToday,
  isFuture,
  entry,
}: {
  date: Date;
  isToday: boolean;
  isFuture: boolean;
  entry: WorkoutEntry | undefined;
}) {
  const iso       = localISO(date);
  const dayOfWeek = date.getDay();
  const plan      = WEEKLY_PLAN[dayOfWeek];
  const type      = entry?.type ?? plan.types[0];
  const colors    = WORKOUT_COLORS[type] ?? WORKOUT_COLORS.rest;
  const icon      = WORKOUT_ICONS[type] ?? "📅";
  const isRest    = type === "rest";

  const dayName   = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum    = date.getDate();
  const monthAbbr = date.toLocaleDateString("en-US", { month: "short" });

  // Summary line
  let summary: React.ReactNode = null;
  if (entry) {
    if (entry.type === "rest") {
      summary = <span className="text-zinc-600 text-xs">Rest logged</span>;
    } else if (entry.type === "cardio") {
      const dur = totalDuration(entry);
      summary = (
        <span className="text-xs text-zinc-400 tabular-nums">
          {entry.exercises.length} activity{entry.exercises.length !== 1 ? "s" : ""} · {dur} min
        </span>
      );
    } else {
      const vol = totalVolume(entry);
      summary = (
        <span className="text-xs text-zinc-400 tabular-nums">
          {entry.exercises.length} ex
          {vol > 0 && <> · {(vol / 1000).toFixed(1)}k lb</>}
        </span>
      );
    }
  }

  return (
    <Link
      href={`/day/${iso}`}
      className={`
        relative flex flex-col gap-2.5 rounded-2xl border p-4
        min-h-[160px] transition-all duration-200
        hover:scale-[1.03] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5
        ${colors.card}
        ${isFuture ? "opacity-35" : ""}
        ${isToday ? "ring-2 ring-white/25 shadow-md shadow-black/30" : ""}
      `}
    >
      {/* Today pill */}
      {isToday && (
        <span className="absolute top-3 right-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest backdrop-blur-sm">
          Today
        </span>
      )}

      {/* Date */}
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest ${isRest ? "text-zinc-700" : "text-zinc-500"}`}>
          {dayName}
        </p>
        <p className={`text-3xl font-extrabold leading-none mt-0.5 ${isRest ? "text-zinc-700" : "text-white"}`}>
          {dayNum}
        </p>
        <p className={`text-xs mt-0.5 font-medium ${isRest ? "text-zinc-800" : "text-zinc-600"}`}>
          {monthAbbr}
        </p>
      </div>

      {/* Workout type badge */}
      <span className={`self-start rounded-lg px-2 py-1 text-xs font-semibold ${colors.badge}`}>
        {icon} {plan.label}
      </span>

      {/* Logged indicator */}
      <div className="mt-auto">
        {entry ? (
          <div className="flex items-start gap-1.5">
            <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${colors.dot}`} />
            {summary}
          </div>
        ) : (
          !isFuture && (
            <p className="text-xs text-zinc-700">Not logged</p>
          )
        )}
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function WeekPage() {
  const { getByDate } = useWorkouts();

  // ✅ Use localISO to avoid UTC-shift bug
  const todayISO = localISO(new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()));

  // weekDates: Mon(+0) … Sun(+6)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const sunday    = weekDates[6];
  const today     = parseLocalDate(todayISO);

  const weekEntries = weekDates
    .map((d) => getByDate(localISO(d)))
    .filter((e): e is WorkoutEntry => !!e);

  const trainDays = weekEntries.filter((e) => e.type !== "rest").length;
  const totalVol  = weekEntries.reduce((acc, e) => acc + totalVolume(e), 0);

  // Estimated total workout time: 60 min per strength session, 45 min per cardio
  const STRENGTH_TYPES = new Set(["shoulder", "leg", "back"]);
  const estMinutes = weekEntries.reduce((acc, e) => {
    if (STRENGTH_TYPES.has(e.type)) return acc + 60;
    if (e.type === "cardio") return acc + 45;
    return acc;
  }, 0);
  const estHours = Math.floor(estMinutes / 60);
  const estMins  = estMinutes % 60;
  const estLabel = estMinutes === 0 ? "—"
    : estHours > 0 && estMins > 0 ? `${estHours}h ${estMins}m`
    : estHours > 0 ? `${estHours}h`
    : `${estMins}m`;

  function prevWeek() { setWeekStart((d) => addDays(d, -7)); }
  function nextWeek() { setWeekStart((d) => addDays(d, 7)); }

  const isCurrentWeek = localISO(weekStart) === localISO(getMondayOf(new Date()));
  const isFutureWeek  = weekStart > getMondayOf(new Date());

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Overview
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">Week</h1>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevWeek}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3.5 py-2 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50 active:scale-95 transition-all duration-150"
        >
          ← Prev
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-zinc-200">
            {formatMonthRange(weekStart, sunday)}
          </p>
          {isCurrentWeek && (
            <p className="text-xs text-zinc-600 mt-0.5">Current week</p>
          )}
        </div>

        <button
          onClick={nextWeek}
          disabled={isFutureWeek}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
            isFutureWeek
              ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50 active:scale-95"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Weekly stats */}
      {weekEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Workouts", value: `${trainDays}`,                                           sub: "this week" },
            { label: "Volume",   value: totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}k` : "—", sub: "lbs lifted" },
            { label: "Time",     value: estLabel,                                                  sub: "est. gym time" },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3.5 text-center"
            >
              <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
              <p className="text-xs text-zinc-600 mt-1 font-medium">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* 7-day grid — fixed 2-col on mobile, 4-col on sm+ so all 7 show well */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {weekDates.map((date) => {
          const iso     = localISO(date);
          const isToday = iso === todayISO;                // ✅ both use localISO now
          const isFuture = date > today;
          const entry   = getByDate(iso);

          return (
            <DayCard
              key={iso}
              date={date}
              isToday={isToday}
              isFuture={isFuture}
              entry={entry}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-zinc-800/60">
        {(["shoulder", "leg", "back", "cardio", "rest"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${WORKOUT_COLORS[type].dot}`} />
            <span className="text-xs text-zinc-600 font-medium">
              {WEEKLY_PLAN[
                type === "shoulder" ? 1
                : type === "leg"    ? 4
                : type === "back"   ? 0
                : type === "cardio" ? 6 : 2
              ].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
