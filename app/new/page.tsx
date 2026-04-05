"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/workout-context";
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
  shoulder: "border-violet-500 bg-violet-500/10 text-violet-300",
  leg:      "border-blue-500   bg-blue-500/10   text-blue-300",
  back:     "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  cardio:   "border-orange-500 bg-orange-500/10 text-orange-300",
  rest:     "border-zinc-600   bg-zinc-700/30   text-zinc-400",
};

const TYPE_COLORS_INACTIVE =
  "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300";

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
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
      <span className="w-6 text-center text-xs text-zinc-500 font-mono shrink-0">
        {index + 1}
      </span>
      <input
        type="number"
        min={1}
        placeholder="Reps"
        value={set.reps}
        onChange={(e) => onChange("reps", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      <input
        type="number"
        min={0}
        placeholder="Weight (lb)"
        value={set.weight}
        onChange={(e) => onChange("weight", e.target.value)}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      {/* Exercise header */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono shrink-0">#{index + 1}</span>
        <input
          type="text"
          placeholder="Exercise name (e.g. Barbell Squat)"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Set column labels */}
      <div className="flex items-center gap-2 px-0">
        <span className="w-6" />
        <span className="w-20 text-xs text-zinc-500 text-center">Reps</span>
        <span className="flex-1 text-xs text-zinc-500">Weight (lb)</span>
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
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono shrink-0">#{index + 1}</span>
        <input
          type="text"
          placeholder="Activity (e.g. Treadmill Run)"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Duration (min)</label>
          <input
            type="number"
            min={1}
            placeholder="30"
            value={exercise.duration}
            onChange={(e) => onChange({ ...exercise, duration: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs text-zinc-500 mb-1">Notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. 6.5 mph, felt strong"
            value={exercise.notes}
            onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function NewWorkoutPage() {
  const router = useRouter();
  const { addWorkout } = useWorkouts();

  const [date, setDate] = useState(todayISO());
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
    router.push("/");
  }

  const isStrength = isStrengthType(workoutType);
  const isCardio = workoutType === "cardio";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          New Entry
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Log Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date */}
        <section className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO()}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none [color-scheme:dark]"
          />
        </section>

        {/* Workout type */}
        <section className="space-y-3">
          <label className="block text-sm font-semibold text-zinc-300">
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
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors text-left ${
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
            <label className="block text-sm font-semibold text-zinc-300">
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
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors w-full justify-center"
            >
              + Add Exercise
            </button>
          </section>
        )}

        {/* Exercises — Cardio */}
        {isCardio && (
          <section className="space-y-3">
            <label className="block text-sm font-semibold text-zinc-300">
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
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors w-full justify-center"
            >
              + Add Activity
            </button>
          </section>
        )}

        {/* Rest day note */}
        {workoutType === "rest" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm text-zinc-400">
            😴 Rest days are just as important as training days. Good choice!
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            Save Workout
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
