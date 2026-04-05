"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, isCardioExercise, WorkoutEntry } from "@/lib/types";

// ── Constants (mirrors page.tsx) ───────────────────────────────────────────

const WORKOUT_COLORS: Record<string, string> = {
  shoulder: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  leg:      "bg-blue-500/15   text-blue-300   border-blue-500/30",
  back:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cardio:   "bg-orange-500/15 text-orange-300  border-orange-500/30",
  rest:     "bg-zinc-700/40   text-zinc-400    border-zinc-600/40",
};

const WORKOUT_ICONS: Record<string, string> = {
  shoulder: "🏋️",
  leg:      "🦵",
  back:     "💪",
  cardio:   "🏃",
  rest:     "😴",
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Parse an ISO date string as a local date (avoids UTC offset issues). */
function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatHeading(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(iso: string, days: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
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

function PlannedBadge({ dayOfWeek }: { dayOfWeek: number }) {
  const plan = WEEKLY_PLAN[dayOfWeek];
  const colorClass = WORKOUT_COLORS[plan.types[0]] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[plan.types[0]] ?? "📅";

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 ${colorClass}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 leading-none mb-0.5">
          Planned
        </p>
        <p className="text-sm font-bold leading-none">{plan.label}</p>
      </div>
    </div>
  );
}

function WorkoutDetail({ entry }: { entry: WorkoutEntry }) {
  const colorClass = WORKOUT_COLORS[entry.type] ?? WORKOUT_COLORS.rest;
  const icon = WORKOUT_ICONS[entry.type] ?? "📅";
  const vol = totalVolume(entry);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="font-semibold text-zinc-100 capitalize text-lg leading-tight">
            {entry.type === "rest" ? "Rest Day" : `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Workout`}
          </h2>
          {vol > 0 && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Total volume:{" "}
              <span className="text-zinc-300 font-semibold">{vol.toLocaleString()} lb</span>
            </p>
          )}
        </div>
        <span className={`ml-auto rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}>
          {entry.exercises.length} exercise{entry.exercises.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Exercise list */}
      {entry.exercises.length > 0 ? (
        <ul className="divide-y divide-zinc-800/60">
          {entry.exercises.map((ex, exIdx) => (
            <li key={ex.id} className="px-5 py-4">
              {isCardioExercise(ex) ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-100">{ex.name}</span>
                    <span className="text-sm font-semibold text-zinc-300 tabular-nums">
                      {ex.duration} min
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-zinc-500 italic">{ex.notes}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Exercise name + set count */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-100">{ex.name}</span>
                    <span className="text-xs text-zinc-500">{ex.sets.length} sets</span>
                  </div>

                  {/* Sets table */}
                  <div className="rounded-lg overflow-hidden border border-zinc-800">
                    {/* Column headers */}
                    <div className="grid grid-cols-3 bg-zinc-800/60 px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <span>Set</span>
                      <span className="text-center">Reps</span>
                      <span className="text-right">Weight</span>
                    </div>
                    {/* Set rows */}
                    {ex.sets.map((s, si) => (
                      <div
                        key={si}
                        className={`grid grid-cols-3 px-3 py-2 text-sm ${
                          si % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/40"
                        }`}
                      >
                        <span className="text-zinc-500 font-mono">{exIdx + 1}.{si + 1}</span>
                        <span className="text-center text-zinc-200 font-medium tabular-nums">
                          {s.reps}
                        </span>
                        <span className="text-right text-zinc-300 font-medium tabular-nums">
                          {s.weight === 0 ? "BW" : `${s.weight} lb`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Per-exercise volume */}
                  {(() => {
                    const exVol = ex.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
                    return exVol > 0 ? (
                      <p className="text-xs text-zinc-600 text-right">
                        Volume: <span className="text-zinc-400">{exVol.toLocaleString()} lb</span>
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-zinc-500">
          No exercises recorded — enjoy the rest!
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DayPage() {
  const params = useParams();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;
  const { getByDate } = useWorkouts();

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Invalid date format. Use <code>/day/YYYY-MM-DD</code>.
      </div>
    );
  }

  const localDate = parseLocalDate(date);
  const dayOfWeek = localDate.getDay();
  const heading = formatHeading(date);
  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;

  const entry = getByDate(date);

  return (
    <div className="space-y-8">
      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/day/${prevDate}`}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          ← Prev
        </Link>

        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ↑ Home
        </Link>

        <Link
          href={`/day/${nextDate}`}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-colors ${
            nextDate > today
              ? "border-zinc-800 text-zinc-700 cursor-not-allowed pointer-events-none"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          }`}
        >
          Next →
        </Link>
      </div>

      {/* Date heading */}
      <div>
        {isToday && (
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
            Today
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
          {heading}
        </h1>
      </div>

      {/* Planned workout badge */}
      <PlannedBadge dayOfWeek={dayOfWeek} />

      {/* Workout detail or empty state */}
      {entry ? (
        <WorkoutDetail entry={entry} />
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700 px-5 py-10 text-center space-y-4">
          <p className="text-zinc-400 text-base font-medium">No workout logged for this day.</p>
          <p className="text-zinc-600 text-sm">
            {date <= today
              ? "Did you work out? Add it now."
              : "This day is in the future — come back later!"}
          </p>
          {date <= today && (
            <Link
              href={`/new?date=${date}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              + Log Workout for This Day
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
