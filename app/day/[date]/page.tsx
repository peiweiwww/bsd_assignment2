"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkouts } from "@/lib/workout-context";
import { WEEKLY_PLAN, WORKOUT_TYPE_LABELS, isCardioExercise, WorkoutEntry } from "@/lib/types";
import { localISO } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

const WORKOUT_COLORS: Record<string, string> = {
  shoulder: "bg-violet-50 text-violet-700 border-violet-200",
  leg:      "bg-sky-50    text-sky-700    border-sky-200",
  back:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  cardio:   "bg-orange-50  text-orange-700  border-orange-200",
  rest:     "bg-slate-100  text-slate-500   border-slate-200",
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

function shiftDate(iso: string, days: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return localISO(d);
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
    <div className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${colorClass}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50 leading-none mb-0.5">
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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight">
            {WORKOUT_TYPE_LABELS[entry.type]}
          </h2>
          {vol > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              Total volume:{" "}
              <span className="text-slate-600 font-semibold">{vol.toLocaleString()} lb</span>
            </p>
          )}
        </div>
        <span className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold ${colorClass}`}>
          {entry.exercises.length} exercise{entry.exercises.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Exercise list */}
      {entry.exercises.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {entry.exercises.map((ex, exIdx) => (
            <li key={ex.id} className="px-5 py-4">
              {isCardioExercise(ex) ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{ex.name}</span>
                    <span className="text-sm font-bold text-slate-700 tabular-nums bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                      {ex.duration} min
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-slate-400 italic mt-1">{ex.notes}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{ex.name}</span>
                    <span className="text-xs text-slate-400 font-medium">{ex.sets.length} sets</span>
                  </div>

                  {/* Sets table */}
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <div className="grid grid-cols-3 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Set</span>
                      <span className="text-center">Reps</span>
                      <span className="text-right">Weight</span>
                    </div>
                    {ex.sets.map((s, si) => (
                      <div
                        key={si}
                        className={`grid grid-cols-3 px-3 py-2.5 text-sm ${
                          si % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <span className="text-slate-400 font-mono text-xs">{exIdx + 1}.{si + 1}</span>
                        <span className="text-center text-slate-700 font-bold tabular-nums">
                          {s.reps}
                        </span>
                        <span className="text-right text-slate-700 font-bold tabular-nums">
                          {s.weight === 0 ? "BW" : `${s.weight} lb`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const exVol = ex.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
                    return exVol > 0 ? (
                      <p className="text-xs text-slate-400 text-right">
                        Volume:{" "}
                        <span className="text-slate-500 font-semibold">{exVol.toLocaleString()} lb</span>
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
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
      <div className="text-center py-20 text-slate-400">
        Invalid date format. Use <code>/day/YYYY-MM-DD</code>.
      </div>
    );
  }

  const localDate = parseLocalDate(date);
  const dayOfWeek = localDate.getDay();
  const heading   = formatHeading(date);
  const prevDate  = shiftDate(date, -1);
  const nextDate  = shiftDate(date, 1);
  const today     = localISO(new Date());
  const isToday   = date === today;

  const entry = getByDate(date);

  const navBtn = "flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium shadow-sm transition-all duration-150";
  const navBtnActive = `${navBtn} text-slate-600 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50 active:scale-95`;
  const navBtnDisabled = `${navBtn} border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed pointer-events-none`;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <Link href={`/day/${prevDate}`} className={navBtnActive}>
          ← Prev
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-slate-400 hover:text-sky-600 transition-colors"
        >
          ↑ Home
        </Link>

        <Link
          href={`/day/${nextDate}`}
          className={nextDate > today ? navBtnDisabled : navBtnActive}
        >
          Next →
        </Link>
      </div>

      {/* Date heading */}
      <div className="pt-1">
        {isToday && (
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Today
          </p>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {heading}
        </h1>
      </div>

      {/* Planned workout badge */}
      <PlannedBadge dayOfWeek={dayOfWeek} />

      {/* Workout detail or empty state */}
      {entry ? (
        <WorkoutDetail entry={entry} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center space-y-4 hover:border-sky-300 hover:bg-sky-50/20 transition-colors">
          <p className="text-slate-600 text-base font-semibold">No workout logged for this day.</p>
          <p className="text-slate-400 text-sm">
            {date <= today
              ? "Did you work out? Add it now."
              : "This day hasn't happened yet — come back later!"}
          </p>
          {date <= today && (
            <Link
              href={`/new?date=${date}`}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-600 active:scale-95 transition-all duration-150 shadow-md shadow-sky-200"
            >
              + Log Workout for This Day
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
