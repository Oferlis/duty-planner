# Implementation Plan: Duty Planner (MVP)

This document outlines the step-by-step technical implementation plan for building the Duty Planner MVP, as defined in `prd.md`. The plan is divided into logical phases to ensure structured development, prioritizing the mobile-first scheduling matrix and local data persistence.

## Phase 1: Project Setup & Core Types (Days 1-2)

### 1.1 Tech Stack & Initialization
- **Framework:** Set up a lightweight React single-page application using Vite (`npm create vite@latest -- --template react-ts`).
- **Styling:** Configure Vanilla CSS or a utility-first framework like Tailwind CSS for rapid implementation of the specified design system (color schemes, fluid layouts).
- **Tooling:** Initialize Git repository and structure standard directories (`/components`, `/context`, `/hooks`, `/types`, `/utils`).

### 1.2 Data Model Definition
Translate section 4.1 of the PRD into TypeScript interfaces/types in `src/types/index.ts`:
- Define literal types for `Status` (`"HOME" | "BASE" | "TRANSIT" | "UNKNOWN"`).
- Define `Member` interface (`id`, `name`).
- Define `Config` interface (`startDate`, `endDate`, `members`, `minBasePresence`).
- Define `DailyStatus` interface (includes `status`, optional `arrivalTime`, optional `departureTime`).
- Define the main root state structure mapped by date indices (`O(1)` lookups).

### 1.3 State Management & Local Storage
- **Storage Utility:** Implement wrapper functions (`localStorage.getItem`, `setItem`) to handle the JSON persistence. Include error handling for storage limits or corrupted JSON.
- **React State:** Create a global store (e.g., using React Context API + `useReducer` or a lightweight library like Zustand) for managing Configuration, Scheduling Data, and View modes (Table vs Calendar).

## Phase 2: Global UI Shell & Navigation (Days 3-4)

### 2.1 The Main App Layout
- Build a responsive, mobile-first container with a standard header.
- Implement the **Global Navigation Bar**:
  - Global Date Range inputs (`startDate`, `endDate`).
  - "Team Settings" modal trigger for managing member names.
  - View Switcher toggle component (Table View vs. Calendar View).
- **Design Implementation:** Inject color tokens mapping to the PRD definitions (Forest Green, Crimson Red, Amber Orange, Neutral Gray).

## Phase 3: Core Features implementation (Days 5-7)

### 3.1 Feature Set A: Table View (Matrix)
- **Layout Construction:** Create a horizontally scrollable container with a sticky left column for Member names. Ensure 44x44px minimum touch targets mapping to mobile accessibility.
- **Date Columns:** Generate dynamic columns based on the selected Date Range in config. Visually shade Friday and Saturday headers.
- **Cell Component:** Render states interactively. Use distinct background styling based on status (e.g., soft green for HOME) and populate time badges if TRANSIT.
- **Status Edit Popover:** Design a modal/drawer that triggers on cell tap. Render radio options for status. Conditionally display two time input fields (`arrivalTime`, `departureTime`) if TRANSIT is chosen.
- **Readiness Row:** Append a bottom summary row that calculates active Base personnel per day. If total < `minBasePresence` (defaults to 2), render a pulsing soft red alert.

### 3.2 Feature Set B: Calendar View
- **Calendar Logic:** Utilize a robust date library (e.g., `date-fns`) or native JS to generate month grids encompassing the active date selections.
- **Day Breakdowns:** Within each calendar cell, split personnel into two visual lists: 🔴 On Base vs 🟢 At Home.
- **Interaction:** Allow tapping a member's badge within this view to directly trigger the Status Edit Popover.

## Phase 4: Analytics Dashboards (Days 8-9)

### 4.1 Metrics Calculation Utilities
Develop pure functions parsing the current schedule state dictionary:
- *Total Days on Base:* Sum `BASE` + partial weight calculation for `TRANSIT`.
- *Total Days at Home:* Count of `HOME`.
- *Weekend Shifts:* Count overlapping `BASE`/`TRANSIT` checks against Friday/Saturday date keys.
- *Presence Ratio:* `(Days on Base / Total Configured Days) * 100`.

### 4.2 Dashboard Component
- Insert a Dashboard container above or below the primary view grids.
- Display a clean summary card/table mapping each member to their computed statistics. Ensure they react and recalculate instantly when schedule state changes.

## Phase 5: Polish, Testing, & Launch Prep (Days 10)

- **UX Validations:** Ensure smooth horizontal scrolling without layout breaking. Validate timezone stability (all saved dates should use simple localized strings like `YYYY-MM-DD`).
- **Edge Cases:** Handle scenarios where all members are deleted (enforce minimum of 1), or invalid time string ranges.
- **Deployment:** Configure continuous deployment of the static build (via Vercel, Netlify, or similar).
