# Workout Tracker

A personal workout tracker app. Data in client-side state (no database yet).

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React state for data (in memory, resets on refresh)

## Pages
- `/` — Homepage: today's date hero with streak badge, today's plan banner, today's workout log, weekly stats summary bar, recent workouts list
- `/new` — Add workout: date picker, workout type selector with icons, dynamic exercise builder with sets/reps/weight, cardio mode with duration
- `/day/[date]` — Day detail: full workout breakdown with set tables, planned vs logged view, prev/next navigation
- `/week` — Week overview: 7-day grid with color-coded cards, weekly stats (workouts count, lbs lifted, est. gym time), legend

## Data Model
- WorkoutEntry: { id, date, type (shoulder | leg | back | cardio | rest), exercises[] }
- Exercise: { id, name, sets[] } (for strength) or { id, name, duration, notes } (for cardio)
- Set: { reps, weight }

## Weekly Schedule (default plan)
- Monday: shoulder + abs (includes 2 abs exercises rotated from a pool of 6)
- Tuesday: rest (class day)
- Wednesday: rest (class day)
- Thursday: leg + abs (includes 2 abs exercises rotated from a pool of 6)
- Friday: rest (class day)
- Saturday: cardio
- Sunday: back + abs (includes 2 abs exercises rotated from a pool of 6)

Each strength day includes 2 abs exercises selected from 6 different abs exercises rotated across the 3 strength days.

## Style Preferences
- Light, fresh blue sports theme — white/light gray background, sky blue accents, pastel workout type badges, clean and energetic feel
- Clean, modern, minimal design
- Good typography and spacing
- Mobile-friendly layout
