"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, isCardioExercise, WorkoutEntry } from "@/lib/types";
import { localISO } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

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

/** Shift an ISO date by `days` using local calendar arithmetic. */
function shiftDate(iso: string, days: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return localISO(d);   // ✅ local-safe
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
    <div className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 ${colorClass}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60 leading-none mb-0.5">
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="font-bold text-zinc-100 capitalize text-lg leading-tight">
            {entry.type === "rest"
              ? "Rest Day"
              : `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Workout`}
          </h2>
          {vol > 0 && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Total volume:{" "}
              <span className="text-zinc-300 font-semibold">{vol.toLocaleString()} lb</span>
            </p>
          )}
        </div>
        <span className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold ${colorClass}`}>
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
                    <span className="font-semibold text-zinc-100">{ex.name}</span>
                    <span className="text-sm font-bold text-zinc-300 tabular-nums bg-zinc-800 px-2.5 py-0.5 rounded-lg">
                      {ex.duration} min
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-zinc-500 italic mt-1">{ex.notes}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">{ex.name}</span>
                    <span className="text-xs text-zinc-600 font-medium">{ex.sets.length} sets</span>
                  </div>

                  {/* Sets table */}
                  <div className="rounded-xl overflow-hidden border border-zinc-800">
                    <div className="grid grid-cols-3 bg-zinc-800/70 px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span>Set</span>
                      <span className="text-center">Reps</span>
                      <span className="text-right">Weight</span>
                    </div>
                    {ex.sets.map((s, si) => (
                      <div
                        key={si}
                        className={`grid grid-cols-3 px-3 py-2.5 text-sm transition-colors ${
                          si % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/50"
                        }`}
                      >
                        <span className="text-zinc-600 font-mono text-xs">{exIdx + 1}.{si + 1}</span>
                        <span className="text-center text-zinc-200 font-bold tabular-nums">
                          {s.reps}
                        </span>
                        <span className="text-right text-zinc-300 font-bold tabular-nums">
                          {s.weight === 0 ? "BW" : `${s.weight} lb`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const exVol = ex.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
                    return exVol > 0 ? (
                      <p className="text-xs text-zinc-700 text-right">
                        Volume:{" "}
                        <span className="text-zinc-500 font-semibold">{exVol.toLocaleString()} lb</span>
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-zinc-500">
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

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Invalid date format. Use <code>/day/YYYY-MM-DD</code>.
      </div>
    );
  }

  const localDate = parseLocalDate(date);
  const dayOfWeek = localDate.getDay();
  const heading   = formatHeading(date);
  const prevDate  = shiftDate(date, -1);
  const nextDate  = shiftDate(date, 1);
  const today     = localISO(new Date());   // ✅ local-safe
  const isToday   = date === today;

  const entry = getByDate(date);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/day/${prevDate}`}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3.5 py-2 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50 active:scale-95 transition-all duration-150"
        >
          ← Prev
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          ↑ Home
        </Link>

        <Link
          href={`/day/${nextDate}`}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
            nextDate > today
              ? "border-zinc-800 text-zinc-700 cursor-not-allowed pointer-events-none"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50 active:scale-95"
          }`}
        >
          Next →
        </Link>
      </div>

      {/* Date heading */}
      <div className="pt-1">
        {isToday && (
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Today
          </p>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
          {heading}
        </h1>
      </div>

      {/* Planned workout badge */}
      <PlannedBadge dayOfWeek={dayOfWeek} />

      {/* Workout detail or empty state */}
      {entry ? (
        <WorkoutDetail entry={entry} />
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700/80 px-5 py-12 text-center space-y-4 hover:border-zinc-600 transition-colors">
          <p className="text-zinc-400 text-base font-semibold">No workout logged for this day.</p>
          <p className="text-zinc-600 text-sm">
            {date <= today
              ? "Did you work out? Add it now."
              : "This day hasn't happened yet — come back later!"}
          </p>
          {date <= today && (
            <Link
              href={`/new?date=${date}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-zinc-100 active:scale-95 transition-all duration-150 shadow-lg shadow-white/10"
            >
              + Log Workout for This Day
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
