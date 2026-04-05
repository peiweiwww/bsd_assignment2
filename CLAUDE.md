# Workout Tracker

A personal workout tracker app. Data in client-side state (no database yet).

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React state for data (in memory, resets on refresh)

## Pages
- `/` — Homepage: show today's workout plan, recent workout logs
- `/new` — Add workout entry: pick date, workout type, add exercises with sets/reps/weight
- `/day/[date]` — View a specific day's workout detail, with prev/next day navigation
- `/week` — Weekly overview: 7-day grid showing each day's workout type and status

## Data Model
- WorkoutEntry: { id, date, type (shoulder | leg | back | cardio | rest), exercises[] }
- Exercise: { id, name, sets[] } (for strength) or { id, name, duration, notes } (for cardio)
- Set: { reps, weight }

## Weekly Schedule (default plan)
- Monday: shoulder + abs
- Tuesday: rest (class day)
- Wednesday: rest (class day)
- Thursday: leg + abs
- Friday: rest (class day)
- Saturday: cardio
- Sunday: back + abs

## Style Preferences
- Clean, modern, minimal design
- Dark or neutral color palette works well for a fitness app
- Good typography and spacing
- Mobile-friendly layout
