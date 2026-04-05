"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkouts } from "@/lib/workout-context";
import { localISO } from "@/lib/utils";
import {
  WorkoutType,
  StrengthExercise,
  CardioExercise,
  WorkoutEntry,
} from "@/lib/types";

// ── Local form-state types ─────────────────────────────────────────────────

interface FormSet {
  reps: string;
  weight: string;
}

interface FormStrengthExercise {
  id: string;
  name: string;
  sets: FormSet[];
}

interface FormCardioExercise {
  id: string;
  name: string;
  duration: string;
  notes: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const WORKOUT_TYPES: { value: WorkoutType; label: string; icon: string }[] = [
  { value: "shoulder", label: "Shoulder + Abs", icon: "🏋️" },
  { value: "leg",      label: "Leg + Abs",      icon: "🦵" },
  { value: "back",     label: "Back + Abs",     icon: "💪" },
  { value: "cardio",   label: "Cardio",         icon: "🏃" },
  { value: "rest",     label: "Rest Day",       icon: "😴" },
];

const TYPE_COLORS: Record<WorkoutType, string> = {
  shoulder: "border-violet-400 bg-violet-50 text-violet-700",
  leg:      "border-sky-400    bg-sky-50    text-sky-700",
  back:     "border-emerald-400 bg-emerald-50 text-emerald-700",
  cardio:   "border-orange-400 bg-orange-50  text-orange-700",
  rest:     "border-slate-300  bg-slate-100  text-slate-500",
};

const TYPE_COLORS_INACTIVE =
  "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700";

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function todayISO() {
  return localISO(new Date());   // ✅ local calendar date, no UTC shift
}

function isStrengthType(type: WorkoutType) {
  return type === "shoulder" || type === "leg" || type === "back";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SetRow({
  set,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  set: FormSet;
  index: number;
  onChange: (field: keyof FormSet, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-center text-xs text-slate-400 font-mono shrink-0">
        {index + 1}
      </span>
      <input
        type="number"
        min={1}
        placeholder="Reps"
        value={set.reps}
        onChange={(e) => onChange("reps", e.target.value)}
        className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
      />
      <input
        type="number"
        min={0}
        placeholder="Weight (lb)"
        value={set.weight}
        onChange={(e) => onChange("weight", e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Remove set"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function StrengthExerciseBlock({
  exercise,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  exercise: FormStrengthExercise;
  index: number;
  onChange: (updated: FormStrengthExercise) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function updateSet(setIndex: number, field: keyof FormSet, value: string) {
    const sets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: value } : s
    );
    onChange({ ...exercise, sets });
  }

  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1];
    onChange({
      ...exercise,
      sets: [...exercise.sets, { reps: last?.reps ?? "", weight: last?.weight ?? "" }],
    });
  }

  function removeSet(setIndex: number) {
    onChange({ ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 transition-colors hover:border-slate-300 shadow-sm">
      {/* Exercise header */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono shrink-0">#{index + 1}</span>
        <input
          type="text"
          placeholder="Exercise name (e.g. Barbell Squat)"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Set column labels */}
      <div className="flex items-center gap-2 px-0">
        <span className="w-6" />
        <span className="w-20 text-xs text-slate-400 text-center">Reps</span>
        <span className="flex-1 text-xs text-slate-400">Weight (lb)</span>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, si) => (
          <SetRow
            key={si}
            set={set}
            index={si}
            onChange={(field, value) => updateSet(si, field, value)}
            onRemove={() => removeSet(si)}
            canRemove={exercise.sets.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addSet}
        className="text-xs text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-1 font-medium"
      >
        + Add Set
      </button>
    </div>
  );
}

function CardioExerciseBlock({
  exercise,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  exercise: FormCardioExercise;
  index: number;
  onChange: (updated: FormCardioExercise) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 transition-colors hover:border-slate-300 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono shrink-0">#{index + 1}</span>
        <input
          type="text"
          placeholder="Activity (e.g. Treadmill Run)"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 font-medium mb-1">Duration (min)</label>
          <input
            type="number"
            min={1}
            placeholder="30"
            value={exercise.duration}
            onChange={(e) => onChange({ ...exercise, duration: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs text-slate-500 font-medium mb-1">Notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. 6.5 mph, felt strong"
            value={exercise.notes}
            onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function NewWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addWorkout } = useWorkouts();

  const paramDate = searchParams.get("date");
  const [date, setDate] = useState(paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : todayISO());
  const [workoutType, setWorkoutType] = useState<WorkoutType>("shoulder");
  const [strengthExercises, setStrengthExercises] = useState<FormStrengthExercise[]>([
    { id: uid(), name: "", sets: [{ reps: "", weight: "" }] },
  ]);
  const [cardioExercises, setCardioExercises] = useState<FormCardioExercise[]>([
    { id: uid(), name: "", duration: "", notes: "" },
  ]);
  const [error, setError] = useState<string | null>(null);

  // ── Strength exercise handlers ───────────────────────────────────────────

  function updateStrength(index: number, updated: FormStrengthExercise) {
    setStrengthExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)));
  }

  function addStrengthExercise() {
    setStrengthExercises((prev) => [
      ...prev,
      { id: uid(), name: "", sets: [{ reps: "", weight: "" }] },
    ]);
  }

  function removeStrengthExercise(index: number) {
    setStrengthExercises((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Cardio exercise handlers ─────────────────────────────────────────────

  function updateCardio(index: number, updated: FormCardioExercise) {
    setCardioExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)));
  }

  function addCardioExercise() {
    setCardioExercises((prev) => [
      ...prev,
      { id: uid(), name: "", duration: "", notes: "" },
    ]);
  }

  function removeCardioExercise(index: number) {
    setCardioExercises((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Please select a date.");
      return;
    }

    let exercises: (StrengthExercise | CardioExercise)[] = [];

    if (workoutType === "rest") {
      // No exercises needed
    } else if (workoutType === "cardio") {
      // Validate cardio
      for (const ex of cardioExercises) {
        if (!ex.name.trim()) {
          setError("Please fill in all activity names.");
          return;
        }
        if (!ex.duration || Number(ex.duration) <= 0) {
          setError("Please enter a valid duration for each activity.");
          return;
        }
      }
      exercises = cardioExercises.map((ex) => ({
        id: ex.id,
        name: ex.name.trim(),
        duration: Number(ex.duration),
        notes: ex.notes.trim() || undefined,
      }));
    } else {
      // Validate strength
      for (const ex of strengthExercises) {
        if (!ex.name.trim()) {
          setError("Please fill in all exercise names.");
          return;
        }
        for (const s of ex.sets) {
          if (!s.reps || Number(s.reps) <= 0) {
            setError("Please enter valid reps for every set.");
            return;
          }
          if (s.weight === "" || Number(s.weight) < 0) {
            setError("Please enter a valid weight for every set (use 0 for bodyweight).");
            return;
          }
        }
      }
      exercises = strengthExercises.map((ex) => ({
        id: ex.id,
        name: ex.name.trim(),
        sets: ex.sets.map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
      }));
    }

    const entry: WorkoutEntry = {
      id: uid(),
      date,
      type: workoutType,
      exercises,
    };

    addWorkout(entry);
    router.push(paramDate ? `/day/${entry.date}` : "/");
  }

  const isStrength = isStrengthType(workoutType);
  const isCardio = workoutType === "cardio";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page header */}
      <div className="pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          New Entry
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-none">Log Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date */}
        <section className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors shadow-sm"
          />
        </section>

        {/* Workout type */}
        <section className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
            Workout Type
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {WORKOUT_TYPES.map(({ value, label, icon }) => {
              const active = workoutType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWorkoutType(value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-150 text-left active:scale-95 ${
                    active ? TYPE_COLORS[value] : TYPE_COLORS_INACTIVE
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Exercises — Strength */}
        {isStrength && (
          <section className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Exercises
            </label>
            <div className="space-y-3">
              {strengthExercises.map((ex, i) => (
                <StrengthExerciseBlock
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  onChange={(updated) => updateStrength(i, updated)}
                  onRemove={() => removeStrengthExercise(i)}
                  canRemove={strengthExercises.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addStrengthExercise}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-400 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-colors w-full justify-center"
            >
              + Add Exercise
            </button>
          </section>
        )}

        {/* Exercises — Cardio */}
        {isCardio && (
          <section className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Activities
            </label>
            <div className="space-y-3">
              {cardioExercises.map((ex, i) => (
                <CardioExerciseBlock
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  onChange={(updated) => updateCardio(i, updated)}
                  onRemove={() => removeCardioExercise(i)}
                  canRemove={cardioExercises.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addCardioExercise}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-400 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-colors w-full justify-center"
            >
              + Add Activity
            </button>
          </section>
        )}

        {/* Rest day note */}
        {workoutType === "rest" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
            😴 Rest days are just as important as training days. Good choice!
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-600 active:scale-95 transition-all duration-150 shadow-md shadow-sky-200"
          >
            Save Workout
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all duration-150 shadow-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
