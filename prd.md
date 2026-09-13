# Product Requirements Document: Duty Planner

## 1. Product Overview

### 1.1 Product Name
Duty Planner (Working Title)

### 1.2 Executive Summary
Duty Planner is a lightweight, web-based scheduling application designed for a 3-person team (such as military unit personnel) to plan, track, and balance base presence versus home stays across any configurable date range. The application supports granular time tracking (exact arrival and departure timestamps), operational readiness alerts, and dual view modes (Table View and Calendar View). It aims to replace messy spreadsheets or whiteboards with a clear, mobile-optimized digital tool.

### 1.3 Core Objectives & Value Proposition
- **Precision:** Allow detailed scheduling beyond full days by recording exact arrival and departure times for transit days.
- **Transparency:** Provide immediate visual clarity on who is on base, at home, or in transit on any given day.
- **Fairness & Metrics:** Automatically compute total base days, home days, and weekend shifts per individual to ensure equitable distribution of duties.
- **Operational Safety:** Highlight low-headcount days automatically to prevent understaffed base presence (e.g., minimum 2 personnel at all times).

## 2. Target Audience & Personas

### 2.1 Primary Personas
- **The Team Member (e.g., Soldier/Officer):** Needs to quickly input their availability, request home days, and see when their teammates are on base or off.
- **The Commander/Manager (e.g., Squad Leader):** Needs a holistic view of the unit's presence to ensure operational readiness and fair distribution of duties.

### 2.2 Supported Devices
- **Mobile-First Priority:** Fully responsive layout optimized for mobile smartphones (iOS and Android browsers) for quick on-the-go planning and updates.
- **Desktop Support:** Expanding to support typical desktop browsers (Chrome, Safari, Edge) for comprehensive monthly planning and metrics reporting by commanders.

## 3. Product Features & Detailed Requirements

### 3.1 Global Navigation & Configuration
- **Date Range Selector:** Inputs for Start Date and End Date. Changing these inputs dynamically reconstructs the scheduling grid without losing saved data.
- **Team Configuration:** Editable text fields for the 3 team members (Defaults: Member 1, Member 2, Member 3). Updating a name reflects instantly across all views.
- **View Switcher:** A single-click toggle/segmented control to switch between **Table View (Person-Centric)** and **Calendar View (Date-Centric)** seamlessly.

### 3.2 Status & Time Tracking Model
For any given date, a team member can be assigned one of the following statuses:
1. **HOME (At Home):** Represents a full day off base. (Visual: Soft Green background with text).
2. **BASE (On Base):** Represents a full 24-hour day on base. (Visual: Soft Red/Khaki background).
3. **TRANSIT (Travel/Partial Day):** User is moving between base and home. (Visual: Amber/Yellow background).
   - *Arrival Timestamp (`arrivalTime`):* Optional time string (e.g., `08:00`) indicating arrival at base.
   - *Departure Timestamp (`departureTime`):* Optional time string (e.g., `13:00`) indicating release/departure to home.
4. **UNKNOWN (Unassigned):** Default state if no action was taken. (Visual: Neutral Gray background).

### 3.3 Feature Set A: Table View (Person-Centric Matrix)
- **Matrix Structure:**
  - *Rows:* The 3 Team Members.
  - *Columns:* Calendar dates within the selected timeframe. Horizontal scrolling enabled on smaller screens.
- **Contextual Visuals:** Friday and Saturday columns visually shaded (weekend indicator) for quick orientation.
- **Cell Interactions:**
  - Single tap/click on a grid cell opens a quick-action popover menu to set status (HOME, BASE, TRANSIT, or CLEAR).
  - If TRANSIT is selected, additional contextual inputs appear to log Arrival and Departure times.
  - Selected status displays as an inline badge. Transit status shows time badges (e.g., 📥 `08:00` or 📤 `13:00`).
- **Daily Readiness Row (Bottom Summary):**
  - Calculates total active personnel on base per day (e.g., `2/3`). (HOME = 0, BASE = 1, TRANSIT = 1 for overlap logic).
  - **Low-Presence Alert:** Visual indicator (e.g., pulsing or bold soft red text/background) on days where base presence falls strictly below 2 members.

### 3.4 Feature Set B: Calendar View (Date-Centric Layout)
- **Grid Layout:** Standard responsive monthly grid (Sunday–Saturday).
- **Daily Breakdowns (Per Cell):**
  - 🔴 **On Base:** List of members physically present (includes TRANSIT arrivals). Time labels attached if in transit.
  - 🟢 **At Home:** List of members remaining at home (includes TRANSIT departures).
- **In-Place Editing:** Tapping a team member's badge inside a calendar box directly opens the status-edit modal for quick updates without switching views.

### 3.5 Feature Set C: Analytics & Metrics Dashboard
Real-time summary statistics calculated per person across the active date range.
- **Total Days on Base:** Full base days + proportional logic for transit days (e.g., half-day credits computation).
- **Total Days at Home:** Count of full home days.
- **Weekend Shifts:** Count of Friday–Saturday shifts served on base.
- **Presence Ratio:** Percentage of total days spent on base (helps evaluate rotation fairness and prevent individual burnout).

## 4. Technical Architecture & Data Model

### 4.1 Data Structure (JSON)
The core application state will hold configuration and an indexed map of schedules for fast `O(1)` lookups.

```json
{
  "config": {
    "startDate": "2026-08-30",
    "endDate": "2026-11-11",
    "members": [
      { "id": "m1", "name": "Doron" },
      { "id": "m2", "name": "Yiftach" },
      { "id": "m3", "name": "Ofer" }
    ],
    "minBasePresence": 2
  },
  "schedules": {
    "2026-08-01": {
      "m1": { "status": "BASE" },
      "m2": { "status": "HOME" },
      "m3": { 
        "status": "TRANSIT", 
        "arrivalTime": "09:00", 
        "departureTime": "14:00" 
      }
    }
  }
}
```

### 4.2 Data Persistence Strategy
- **Phase 1 (MVP - Local Only):** Web Storage API (`localStorage`) for standalone client-side offline persistence. Good for initial testing by a single planner.
- **Phase 2 (Collaborative Sync):** Firebase Firestore or Supabase backend. Enables real-time state synchronization via Live Subscriptions (WebSockets) across the team's smartphones using a simple shared link or authentication wall.

## 5. UI/UX Design Guidelines

### 5.1 Color System & Semantics
- **HOME (Off Duty):** `#2E7D32` (Forest Green text) / Soft green background (Hex: `#E8F5E9`)
- **BASE (On Duty):** `#C62828` (Crimson Red text) / Soft red background (Hex: `#FFEBEE`)
- **TRANSIT (Travel/Partial):** `#F57C00` (Amber Orange text) / Soft orange background (Hex: `#FFF3E0`)
- **UNKNOWN (Empty):** `#9E9E9E` (Neutral Gray text) / Soft gray background (Hex: `#F5F5F5`)

### 5.2 Accessibility & Layout
- **Typography:** Clean, legible sans-serif font (e.g., Inter, Roboto, or system-ui).
- **Touch Targets:** Minimum 44x44px for reliable mobile interaction.
- **Fluid Layouts:** Horizontal CSS smooth scrolling with sticky left-column headers (Member names) in the Table View to ensure row context is never lost on narrow screens.

## 6. Out of Scope for MVP
- Push notifications / SMS alerts.
- Complex hierarchical permissions (everyone is an admin/editor in MVP).
- Shifts that cross midnight natively (A standard recorded "day" runs 00:00 to 23:59).
- Integration with external calendar clients (Google Calendar, WebCal, Outlook) - deferred to V2.

## 7. Assumptions & Risks
- **Assumption:** Users will diligently input their transit times to ensure accurate readiness numbers.
- **Risk:** Timezone discrepancies if team members modify the schedule while physically far away (though unlikely for a single local base unit). *Solution:* Store everything in localized strings relative to the base timezone, independent of standard JS Date objects.
- **Risk:** Concurrency race conditions in Phase 2 if two members edit the same block simultaneously. *Solution:* Backend must use Last-Write-Wins or atomic document updates on individual cells.
- **Risk:** Hardcoding a 3-member limit might be too inflexible if the team size changes. *Solution:* Design the UI and JSON structure dynamically to handle arrays (N elements) rather than hardcoding exactly 3 rows, standardizing around scaling up as needed.
