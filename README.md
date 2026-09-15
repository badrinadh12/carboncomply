## Hackathon Details

Portal        https://hackathon.azisly.ai/login  
Email         badrinadhgoru@gmail.com  
Hackathon ID  AZIS-NRKU3X  
Team          Badrinadh's Team  
College       JK Lakshmipat University  
Track         Track 2: Real-World AI Products  
Product       CarbonComply  
Website       https://carboncomply.vercel.app/dashboard

# CARBONCOMPLY
> **Track. Reduce. Comply.**

**Track 2: Real-World AI Products**  
**Hackathon ID: AZIS-NRKU3X**  
**Product**: CarbonComply — Citizen Carbon Footprint Tracking and Statutory Compliance Platform

---

## 1. Overview

**CARBONCOMPLY** is a government-oriented carbon footprint tracking and statutory compliance digital service prototype built for citizens. It empowers citizens to record their everyday activities (transportation, electricity, aviation travel, and diet), computes exact greenhouse gas emissions, measures weekly footprints against a statutory 100 kg CO₂ threshold, and administers an educational carbon compliance fee structure designed using behavioral nudges.

---

## 2. The Problem

Urban carbon reduction programs frequently encounter two opposing extremes:
1. **Toothless consumer tracking apps**: Gamified trackers that lack statutory weight, resulting in high churn and negligible behavioral change.
2. **Punitive regulatory taxes**: Heavy-handed taxation schemes that spark citizen backlash, lack transparency, and penalize essential everyday mobility.

Furthermore, traditional systems suffer from moral hazard (citizens raising personal targets to avoid limits) and unfair treatment of essential long-distance travel.

---

## 3. The Solution

CARBONCOMPLY bridges civic technology and public policy through a transparent, trustworthy digital service:
- **Zero Friction**: No login, no signup, and no authentication walls. The citizen opens directly into their command center.
- **Dual-Limit Governance**: Decouples the citizen's personal aspirational goal from the fixed 100 kg statutory threshold.
- **Nudge Compliance**: First threshold breach triggers an educational reminder (₹0 fee); subsequent violations incur a predictable ₹10 Carbon Compliance Fee.
- **Fair Travel Policy**: Flights are tracked in total emissions while backed by a separate 200 kg CO₂/month fair mobility allowance.
- **Strict Temporal Integrity**: Follows international Monday–Sunday compliance cycles keyed strictly to persistent `activity_date` timestamps.

---

## 4. Key Features

- **Instant Activity Logging**: Select activity type, input quantity, pick a date, and view live emission calculations before saving.
- **Dual-Track Carbon Meter**: Visual gauge displaying personal progress against the statutory 100 kg government threshold.
- **Compliance Status Engine**: Real-time warning tiers (`ON TRACK`, `APPROACHING LIMIT`, `NEAR LIMIT`, `LIMIT EXCEEDED`).
- **Behavioral Fee System**: Clear ₹0 reminder on first-ever infraction; ₹10 compliance fee on subsequent infractions.
- **Fair Travel Quarantine**: Dedicated monthly 200 kg flight allowance tracker.
- **Non-Double-Counted Breakdown**: Reconciled category distribution across Transport, Travel, Electricity, and Food.
- **Full Historical Audit**: Date range and activity type filtering across all previous Monday–Sunday compliance weeks.
- **Absurd Input Safeguard**: Explicit confirmation dialog preventing accidental input errors without silent manipulation.
- **Deterministic Personal Insights**: Factual citizen analytics derived directly from verified activity records.

---

## 5. Carbon Calculation Factors

Calculations strictly follow statutory emission coefficients. External APIs are prohibited for core calculations:

| Activity Type | Category | Unit | Statutory Factor | Example Calculation |
| :--- | :--- | :--- | :--- | :--- |
| **Car** | Transport | km | **0.20 kg CO₂ / km** | $10\text{ km} \times 0.20 = 2.00\text{ kg CO}_2$ |
| **Bus** | Transport | km | **0.08 kg CO₂ / km** | $50\text{ km} \times 0.08 = 4.00\text{ kg CO}_2$ |
| **Flight** | Travel | km | **0.25 kg CO₂ / km** | $400\text{ km} \times 0.25 = 100.00\text{ kg CO}_2$ |
| **Electricity** | Electricity | kWh | **0.80 kg CO₂ / kWh** | $50\text{ kWh} \times 0.80 = 40.00\text{ kg CO}_2$ |
| **Vegetarian Meal** | Food | meals | **0.50 kg CO₂ / meal** | $4\text{ meals} \times 0.50 = 2.00\text{ kg CO}_2$ |
| **Non-Vegetarian Meal** | Food | meals | **2.00 kg CO₂ / meal** | $3\text{ meals} \times 2.00 = 6.00\text{ kg CO}_2$ |

$$\text{CO}_2\ (\text{kg}) = \text{round}_2(\text{quantity} \times \text{factor})$$

---

## 6. Government Compliance Model

- **Statutory Weekly Threshold**: Fixed at **100.00 kg CO₂ / week**.
- **Warning Tiers**:
  - **0% – 70%**: `ON TRACK` (Emerald/Green)
  - **70% – 90%**: `APPROACHING LIMIT` (Amber/Yellow)
  - **90% – 100%**: `NEAR LIMIT` (Orange)
  - **> 100%**: `LIMIT EXCEEDED` (Red)
- *Note*: Exactly 100.00 kg is reached but not exceeded (compliant). Only $> 100.00\text{ kg}$ is exceeded.

---

## 7. Personal Target vs. Government Threshold

The system strictly decouples these two concepts to eliminate moral hazard:
- **Personal Weekly Target**: Citizen-controlled (default: 100 kg CO₂). Configured in Settings to motivate personal reduction. **Does not alter statutory compliance.**
- **Government Carbon Threshold**: System-controlled and fixed at 100 kg CO₂. Cannot be edited by citizens. Determines official compliance and fees.

---

## 8. Travel Policy (Fair Mobility Allowance)

- Flight emissions are **never hidden or exempt**; they are calculated and included in the total weekly footprint.
- A dedicated **200 kg CO₂ / month** fair travel allowance is provided for air travel.
- The dashboard highlights the everyday vs. travel split and tracks monthly flight emissions against the 200 kg quota.
- If monthly flight emissions exceed 200 kg, the system alerts: *“Monthly Travel Allowance Exceeded”*.

---

## 9. Weekly Calculation (Monday–Sunday)

- **Week Start**: Monday 00:00:00
- **Week End**: Sunday 23:59:59
- Rolling 7-day windows and Sunday–Saturday calendars are strictly prohibited.
- When Monday arrives, the active week begins at zero for the new period, while all previous weeks remain permanently archived in History.
- Aggregations query: `activity_date >= week_start AND activity_date <= week_end`.

---

## 10. Compliance Fee Logic (DP1)

- **First-Ever Violation in Citizen History**:
  - Compliance Fee: **₹0**
  - Message: *“First threshold violation — reminder issued.”*
- **Subsequent Violations (Any Later Violating Week)**:
  - Compliance Fee: **₹10 Carbon Compliance Fee**
  - Reason: *“Weekly government threshold exceeded.”*
- **Persistent & Idempotent**: At most one fee applies per violating week; refreshing the page never duplicates fee records.
- **Unblocked Self-Reporting**: Citizens are **never blocked** from logging further activities.
- *Notice*: This is a prototype Carbon Compliance Fee; no actual financial transactions or payment gateways are implemented.

---

## 11. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Gov-Tech Design System, clean slate neutrals, emerald accents)
- **Icons**: Lucide React
- **Charts & Visuals**: Recharts & SVG custom meters
- **Database / Backend**:
  - Persistent local filesystem database engine (`data/carboncomply_db.json`) for zero-dependency local execution and automated grading.
  - Native Supabase PostgreSQL integration via `@supabase/supabase-js` (with full SQL schema provided in `supabase-schema.sql`).

---

## 12. Database Architecture

### `activities` Table
- `id` (text, primary key)
- `activity_type` (text: car, bus, flight, electricity, veg_meal, non_veg_meal)
- `quantity` (numeric > 0)
- `unit` (text: km, kWh, meals)
- `emission_factor` (numeric)
- `co2_kg` (numeric, 2 decimal places)
- `activity_date` (date, YYYY-MM-DD)
- `created_at` (timestamptz)

### `user_settings` Table
- `id` (text, primary key)
- `personal_weekly_target` (numeric, default 100.00)
- `updated_at` (timestamptz)

### `compliance_weeks` Table
- `id` (text, primary key)
- `week_start` (date)
- `week_end` (date)
- `total_co2` (numeric)
- `government_threshold` (numeric, 100.00)
- `exceeded` (boolean)
- `first_violation` (boolean)
- `fee_amount` (numeric: 0 or 10)
- `created_at`, `updated_at` (timestamptz)

---

## 13. Critical Date Persistence Requirement

Every activity strictly stores a separate `activity_date` (YYYY-MM-DD) field. 
- The user-selected date survives page reloads, browser refreshes, and server restarts.
- `created_at` is reserved solely as creation metadata.
- All weekly aggregations and historical filtering operate exclusively on `activity_date`.
- Timezone-safe UTC component parsing prevents day-shifting across international timezones.

---

## 14. Setup Instructions

```bash
# 1. Clone repository
git clone <repo-url>
cd codehackathon

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application boots directly to the citizen dashboard with zero login or setup required.

To compile a production build:
```bash
npm run build
npm run start
```

---

## 15. Environment Variables

The application runs seamlessly out-of-the-box without requiring external cloud accounts. To connect to a live Supabase instance in production, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Execute the migration script in `supabase-schema.sql` inside the Supabase SQL Editor to initialize tables, constraints, indexes, and RLS policies.

---

## 16. Deployment

- **Frontend**: Deploy to Vercel with zero configuration (`npm run build`).
- **Database**: Connect to Supabase PostgreSQL or utilize persistent backend storage.
- **Secrets**: No secrets or private keys are committed to the repository.

---

## 17. Testing Workflow

The application supports immediate verification of all 15 required evaluation flows:

1. **TEST 1 (Car)**: Log 10 km car $\rightarrow 2.00\text{ kg CO}_2$.
2. **TEST 2 (Electricity)**: Log 50 kWh electricity $\rightarrow 50 \times 0.80 = 40.00\text{ kg CO}_2$.
3. **TEST 3 (Non-Veg Meal)**: Log 3 non-veg meals $\rightarrow 3 \times 2.0 = 6.00\text{ kg CO}_2$.
4. **TEST 4 (Flight & Travel Allowance)**: Log 100 km flight $\rightarrow 25.00\text{ kg CO}_2$. Appears in Travel emissions and updates monthly allowance ($25.00 / 200.00\text{ kg}$).
5. **TEST 5 (Personal Target vs. Government)**: Set personal target to 70 kg. Log 85 kg. Result: Personal target exceeded, government compliant, ₹0 fee.
6. **TEST 6 (First Violation)**: Exceed 100 kg. Result: Reminder issued, ₹0 fee.
7. **TEST 7 (Compliant Following Week)**: Next week remains under 100 kg. Result: ₹0 fee.
8. **TEST 8 (Subsequent Violation)**: Later week exceeds 100 kg again. Result: ₹10 Carbon Compliance Fee applies.
9. **TEST 9 (Persistence)**: Refresh browser $\rightarrow$ all activities, dates, and fee statuses remain intact.
10. **TEST 10 (Type Filtering)**: In History, filter by `Flight` $\rightarrow$ only flight logs are returned.
11. **TEST 11 (Date Filtering)**: Filter by date range $\rightarrow$ only logs with `activity_date` in range are returned.
12. **TEST 12 (Historical Week Entry)**: Add activity dated in a prior week $\rightarrow$ aggregates to that prior week, leaving current week intact.
13. **TEST 13 (Monday Cycle)**: Monday 00:00 starts new cycle; prior weeks remain permanently archived.
14. **TEST 14 (Absurd Input)**: Enter 500,000 km car trip $\rightarrow$ warning dialog prompts for explicit confirmation before recording exact value.
15. **TEST 15 (Travel Footprint Reconciled)**: Travel emissions remain in total weekly footprint and are tracked against the monthly 200 kg allowance.

---

## 18. Decision Points Summary

Documented comprehensively in [DECISIONS.md](DECISIONS.md):
- **DP1 — Nudge**: First exceedance gives reminder + ₹0 fee; subsequent exceedances give ₹10 fee. Never block activity logging.
- **DP2 — Absurd Input**: Unusually large inputs prompt an explicit confirmation modal; exact values are recorded upon confirmation without silent manipulation.
- **DP3 — The Week**: Strict Monday 00:00:00 to Sunday 23:59:59 compliance weeks bound to persistent `activity_date`.
- **Travel Policy**: Flights are non-exempt, included in total footprint, and regulated by a monthly 200 kg allowance.

---

## 19. Standard API Status

> **Standard API**: Not implemented — no official standard API specification was provided for this prototype.

---

## 20. Hackathon Information

- **Product**: CarbonComply
- **Track**: Track 2: Real-World AI Products
- **Hackathon ID: AZIS-NRKU3X**
- **Authentication**: Zero authentication required (direct open citizen access)
- **Repository**: Public GitHub Repository Ready
- **License**: MIT
