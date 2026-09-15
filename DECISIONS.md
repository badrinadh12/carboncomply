# CARBONCOMPLY — Architectural & Policy Decision Records (DECISIONS.md)

This document provides formal architectural decision records (ADRs) for the citizen carbon tracking and government compliance platform **CARBONCOMPLY** (“Track. Reduce. Comply.”).

---

## DP1 — NUDGE POLICY & COMPLIANCE FEE STRUCTURE

### Decision
1. **First-Ever Government Threshold Violation**:
   - Result: Statutory Compliance Reminder Issued.
   - Financial Impact: **₹0 fee**.
2. **Every Subsequent Government Threshold Violation**:
   - Result: **₹10 Carbon Compliance Fee** applied for that violating week.
   - Non-Consecutive Enforcement: “Subsequent” applies to any later week that exceeds the 100 kg threshold, regardless of whether there were compliant weeks in between.
   - Single Charge Rule: No week can ever be charged more than one ₹10 fee.
   - Non-Blocking Architecture: Citizens are **never blocked** from logging further activities, and the platform never shames or punishes users.

### Rationale
Behavioral economics and modern civic design demonstrate that immediate financial penalties on a citizen's first infraction generate resentment and avoidance. The initial breach serves as an educational milestone—alerting the citizen to their emission intensity without economic friction.

Subsequent violations introduce a modest, highly predictable financial consequence (₹10 Carbon Compliance Fee) that reinforces accountability while maintaining citizen autonomy and goodwill. Crucially, keeping activity logging unblocked ensures continuous, honest self-reporting rather than incentivizing citizens to hide emissions.

---

## DP2 — ABSURD INPUT HANDLING

### Decision
1. When a citizen inputs a quantity that significantly exceeds reasonable individual thresholds (e.g., Car $> 2,000\text{ km}$, Flight $> 20,000\text{ km}$, Electricity $> 1,500\text{ kWh}$, Meals $> 30\text{ meals}$):
   - The platform **does NOT silently reject** the input.
   - The platform **does NOT automatically clamp or modify** the value.
   - The platform displays an **explicit confirmation modal**:
     > *“This value is unusually high. Please confirm that the quantity is correct.”*
2. If the citizen **Confirms**: The entered value is recorded and persisted exactly as provided.
3. If the citizen **Cancels**: The entry is discarded without saving, allowing the user to correct typographical mistakes.

### Rationale
Automated data systems that silently drop or truncate citizen data degrade trust and cause silent calculation discrepancies. In real-world civic life, extreme values occasionally reflect legitimate scenarios (such as an extended cross-country family road trip, annual meter reconciliation, or bulk community catering). 

Requiring explicit user confirmation prevents accidental extra zeros while respecting citizen truthfulness and preserving data integrity.

---

## DP3 — COMPLIANCE WEEK DEFINITION & DATE PERSISTENCE

### Decision
1. **Compliance Week Boundaries**:
   - Begins: **Monday 00:00:00**
   - Concludes: **Sunday 23:59:59**
   - Follows international standard ISO-8601 calendar week alignment.
2. **No Rolling Windows**:
   - The platform strictly rejects rolling 7-day windows, Sunday–Saturday cycles, or user registration date offsets.
3. **Strict Date Persistence (`activity_date`)**:
   - Calculations, weekly aggregations, and historical audit queries strictly execute on the user-selected `activity_date` (stored as `YYYY-MM-DD`).
   - `created_at` is preserved exclusively as audit creation metadata and is **never used** for compliance boundaries.
4. **Permanent Historical Week Preservation**:
   - When a new Monday arrives, the active week calculation begins from zero for the new period. All prior weeks remain permanently accessible, complete with their historical compliance statuses and fee snapshots.

### Rationale
A fixed Monday-to-Sunday cycle mirrors standard national reporting schedules, utility billing cycles, and international corporate greenhouse gas protocols. It establishes an unambiguous, predictable rhythm for citizens. Separating `activity_date` from `created_at` allows citizens to log past activities accurately (e.g., entering Thursday's electricity bill on Saturday) without distorting compliance periods.

---

## TRAVEL POLICY — FAIR MOBILITY ALLOWANCE

### Decision
1. **Non-Exemption Principle**:
   - Commercial flight emissions are **not exempt**. They are calculated at $0.25\text{ kg CO}_2\text{ / km}$ and fully included in the citizen's total weekly footprint against the 100 kg government threshold.
2. **Separate Monthly Travel Allowance**:
   - Citizens receive a dedicated monthly travel allowance of **200 kg CO₂ / month** for flight activities.
   - Travel emissions are highlighted separately on the dashboard to ensure full visibility into long-distance travel.
   - If flight emissions exceed 200 kg in a given calendar month, the dashboard clearly displays:
     > *“Monthly Travel Allowance Exceeded”*

### Rationale
Treating air travel as completely exempt would render a carbon tracking system toothless, as aviation constitutes one of the highest emission sources per passenger. Conversely, penalizing infrequent, necessary long-distance travel without accommodating fair mobility needs would create an inequitable system for citizens with distant family or work requirements. The 200 kg monthly allowance establishes a transparent, fair mobility threshold without hiding emissions.
