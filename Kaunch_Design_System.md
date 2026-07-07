**OLMS**

Office Lunch Management System

**Design System**

v1.1 · June 2026

*This document defines the visual and interaction language for Kaunch. All
UI work --- components, screens, emails, and exports --- must derive
directly from these tokens and patterns.*

**1. Introduction**

This design system is the single source of truth for all visual
decisions in the Office Lunch Management System (OLMS). It covers color,
typography, spacing, component states, screen layouts, and communication
patterns.

Every UI surface --- web app, admin dashboard, email notification, and
exported report --- must reference these definitions. When new
components are added, update this document first.

**2. Design Principles**

**Clarity first ---** Employees act under a 1-hour daily window. Every
screen must show the most important action prominently. There is no room
for ambiguity.

**State always visible ---** Confirmed, skipped, pending, and fine
states must be distinguishable at a glance --- without relying on color
alone.

**Trust through consistency ---** Fine disputes happen when employees
feel the system is opaque. Consistent labeling, timestamps, and audit
trails build trust.

**Admin efficiency ---** Admin users manage 500+ employees. Tables must
be scannable and sortable. Bulk actions must be one click.

**Accessibility baseline ---** All text on colored backgrounds must meet
WCAG AA contrast. Focus states must be visible. Reduced-motion must be
respected.

**3. Color Palette**

The palette is built around Emerald (growth, freshness, confirmation)
and Saffron (urgency, warmth, caution) --- colors native to South Asian
food culture and directly legible as status signals.

  ------------ ------------------ ------------ ----------------------------------
  **Swatch**   **Name**           **Hex**      **Usage**

               **Primary /        #1A6B3C      Brand, nav, CTAs, confirmed state
               Emerald**                       

               **Primary Light**  #E8F5EE      Table row tints, chip backgrounds

               **Primary Dark**   #134D2B      H1 headings, hover states

               **Accent /         #F4A025      Warnings, highlights, pending
               Saffron**                       badge

               **Accent Light**   #FEF3DC      Pending badge background

               **Danger / Red**   #C0392B      Fines, errors, skipped state

               **Danger Light**   #FDECEA      Fine amount backgrounds

               **Neutral 900**    #1C1C1E      Body text

               **Neutral 700**    #3C3C43      Secondary text

               **Neutral 400**    #8E8E93      Labels, placeholders

               **Neutral 200**    #E5E5EA      Borders, dividers

               **Neutral 100**    #F2F2F7      Page background

               **White**          #FFFFFF      Card surfaces

               **Subscription     #2D6DA8      Subscription plan badges
               Blue**                          
  ------------ ------------------ ------------ ----------------------------------

**3.1 Semantic Usage Rules**

-   Emerald (#1A6B3C) is reserved for brand, navigation, confirmed
    state, and primary buttons. Never use it for warnings.

-   Saffron (#F4A025) signals time-sensitivity or pending action only.
    Do not use it for decoration.

-   Red (#C0392B) is exclusively for fines, errors, and destructive
    actions.

-   Neutral 100 (#F2F2F7) is the page background. Cards and table
    surfaces use White.

-   Never place white text on Accent Light or Primary Light --- contrast
    is insufficient.

**4. Typography**

Inter is the system typeface --- it is humanist, legible at small sizes,
and available free via Google Fonts. Courier New is the mono utility
face for data values, IDs, and timestamps.

  ------------- ------------ ---------- ------------ -------------------------------
  **Role**      **Family**   **Size**   **Weight**   **Usage**

  **Display /   Inter        52pt       Bold         Page titles, dashboard hero
  Hero**                                             numbers

  **H1**        Inter        36pt       Bold         Section headings

  **H2**        Inter        26pt       Bold         Sub-section headings

  **H3**        Inter        20pt       Semi         Component headings, card titles

  **Body /      Inter        11pt       Regular      All body copy, form labels
  Default**                                          

  **Body        Inter        10pt       Regular      Table content, secondary info
  Small**                                            

  **Caption /   Inter        8pt        Bold         Overline labels (all caps)
  Label**                                            

  **Code /      Courier New  10pt       Regular      IDs, timestamps, data values
  Mono**                                             
  ------------- ------------ ---------- ------------ -------------------------------

**5. Spacing System**

All spacing uses a base-4 scale. The DXA column is provided for
Word-based exports; the px column governs the web app. Never use
arbitrary pixel values --- pick the nearest token.

  ----------- --------- ------------- ------------------------------------
  **Token**   **px**    **DXA         **Usage**
                        (Word)**      

  **sp-1**    4px       72 DXA        Inner icon padding

  **sp-2**    8px       144 DXA       Tight chip / badge padding

  **sp-3**    12px      216 DXA       Button padding (vertical)

  **sp-4**    16px      288 DXA       Card internal padding (default)

  **sp-5**    24px      432 DXA       Section gap, form field spacing

  **sp-6**    32px      576 DXA       Card-to-card gap

  **sp-8**    48px      864 DXA       Section-to-section gap

  **sp-12**   64px      1152 DXA      Page top margin
  ----------- --------- ------------- ------------------------------------

**6. Status Badges**

Status badges are the core communication unit of Kaunch. They appear in
tables, history grids, and dashboards. Use exactly these colors and
labels --- never substitute with plain text.

  ------------------ -------------- ------------------------------------------------
  **Badge**          **Label**      **Usage**

  **Confirmed**      ✓ Confirmed    Employee selected Yes before cutoff

  **Skipped**        ✗ Skipped      Employee selected No

  **Pending**        ⏱ Pending      No selection yet, cutoff not reached

  **Fine Applied**   ⚠ Fine Applied Subscribed, no selection before cutoff

  **Subscribed**     ◉ Subscribed   Active subscription this month

  **Unsubscribed**   ○ Unsubscribed No active subscription
  ------------------ -------------- ------------------------------------------------

**7. Components**

**7.1 Primary Button**

  ----------------- ----------------- ----------------- -----------------
  **Property**      **Default**       **Hover**         **Disabled**

  Background        #1A6B3C           #134D2B           #E5E5EA

  Text color        #FFFFFF           #FFFFFF           #8E8E93

  Border radius     8px               8px               8px

  Padding           12px 24px         12px 24px         12px 24px

  Font              Inter 14px Bold   Inter 14px Bold   Inter 14px Bold
  ----------------- ----------------- ----------------- -----------------

**7.2 Danger / Destructive Button**

  ----------------- ----------------- ----------------- -----------------
  **Property**      **Default**       **Hover**         **Disabled**

  Background        #C0392B           #96281C           #E5E5EA

  Text color        #FFFFFF           #FFFFFF           #8E8E93

  Border radius     8px               8px               8px

  Usage             Apply fine,       Apply fine,       ---
                    Delete record     Delete record     
  ----------------- ----------------- ----------------- -----------------

**7.3 Confirmation Toggle (Yes / No)**

The most critical component in the system. Must be tappable on mobile.
Locked visually and functionally after cutoff.

  ------------- ------------------- ------------------- -------------------
  **State**     **Yes (Confirmed)** **No (Skipped)**    **Locked (Past
                                                        cutoff)**

  Background    #1A6B3C             #C0392B             #E5E5EA

  Icon          ✓                   ✗                   🔒

  Label         Confirmed           Skipped             Cutoff passed

  Min height    56px                56px                56px

  Cursor        pointer             pointer             not-allowed
  ------------- ------------------- ------------------- -------------------

**7.4 Food Preference Chip**

Mapped to database values: `regular`, `no_fish`, `no_chicken`, `no_mutton_beef`, `always_fish`.

  ----------------- ----------------- ----------------- -----------------
  **Preference**    **Label**         **Background**    **Icon**

  Regular           Regular           #E8F5EE           🍽

  No fish           No fish           #FEF3DC           🍗

  No chicken        No chicken        #EAF4FB           🐟

  No mutton/beef    No mutton/beef    #FDECEA           🥗

  Always fish       Always fish       #EAF4FB           🐟
  ----------------- ----------------- ----------------- -----------------

**7.6 Modal (Portal)**

Used for destructive confirms and post-action feedback (e.g. Daily Sheet fine generation).

- Rendered via React portal on `document.body` with `z-index: 9999`
- Backdrop: `rgba(0,0,0,0.5)` — click or Escape closes (unless loading)
- Body scroll locked while open
- Max width: 512px (`max-w-lg`), centered, white card, `rounded-lg`, `shadow-xl`
- **Confirm modal:** warning icon, question text, Cancel (secondary) + primary action
- **Result modal:** success icon (💰 or 🎉), message, optional mini table, Close / View fine list

**7.5 Data Table**

All admin tables follow these rules:

-   Alternating row fill: White (#FFFFFF) and Neutral 100 (#F2F2F7)

-   Header row: Primary Dark (#134D2B) fill, white text, Bold

-   Row height: minimum 40px

-   Sortable columns: show ↑↓ icon in header, active sort highlighted in
    Emerald

-   Sticky header on scroll (desktop only)

-   Pagination: default 25 rows; options 10 / 25 / 50 / 100

-   Empty state: show illustration + actionable text (see Section 9)

**8. Icon Library**

Use these semantic icon tokens consistently. Source: Heroicons (outline
style, 24px). Do not mix icon libraries.

  ---------- ------------- ----------------------------------------------------
  **Icon**   **Token**     **Context**

  🍽          meal          Lunch confirmation toggle

  ✓          check         Confirmed / success states

  ✗          close         Skipped / error states

  ⏱          clock         Cutoff countdown, pending

  ⚠          warning       Fine warnings, alerts

  📊         chart         Reports and analytics

  🔔         bell          Notification reminders

  👤         person        Employee profile, user role

  ⚙          settings      Admin configuration

  📅         calendar      Subscription plan, monthly view

  🥬         vegetarian    Vegetarian food preference

  🐟         fish          Fish food preference

  🍗         chicken       Chicken food preference

  🥩         beef          Beef food preference

  💰         fine          Fine amount, billing

  📤         export        Export to Excel / PDF
  ---------- ------------- ----------------------------------------------------

**9. Screen Layouts**

Each screen is described in terms of named zones. Implementation must
follow this zone order. Component composition within each zone is
flexible but must use tokens from this document.

**Employee Dashboard**

Primary screen for employees. Displays today\'s lunch status,
subscription info, and the month\'s history grid.

  ---------------- ------------------------------------------------------
  **Zone**         **Contents**

  **Top Nav**      Kaunch logo (left) · Employee name + avatar (right)

  **Hero Strip**   Today\'s confirmation toggle (Yes / No) · Cutoff
                   countdown timer

  **Info Row**     Subscription type · Food preference chip · Fine
                   balance

  **History**      Week view (Mon–Fri) confirmations · Daily Fine List ·
                   personal fines table

  **Footer**       (optional)
  ---------------- ------------------------------------------------------

**Admin Dashboard**

Overview for admins: total lunches, food breakdown, fine summary, and
employee activity.

  ---------------- ------------------------------------------------------
  **Zone**         **Contents**

  **Top Nav**      Kaunch logo · Admin badge · Settings icon

  **Stats Bar**    Total lunches today · Confirmed vs Skipped · Fines
                   this month

  **Charts Row**   Doughnut: food-type split · Bar: weekly trend

  **Employee       Filterable list · Name · Dept · Status · Fine amount ·
  Table**          Actions

  **Sidebar        Quick actions: Set cutoff · Configure menu · Export
  (optional)**     report
  ---------------- ------------------------------------------------------

**Fine Management Screen**

Admin/HR screen. Monthly fine overview and mark-as-paid actions.

  ---------------- ------------------------------------------------------
  **Zone**         **Contents**

  **Header**       Month/year selector · stat cards (total, pending, paid)

  **Fines Table**  Employee ID · Name · Date · Amount · Reason · Status · Mark paid

  **Empty state**  No fines for selected period
  ---------------- ------------------------------------------------------

**Daily Food Sheet Screen**

Admin/HR primary fine workflow. Replaces manual spreadsheet tracking.

  ---------------- ------------------------------------------------------
  **Zone**         **Contents**

  **Header**       Title · date picker · Mark all signed / Clear all

  **Stats bar**    Subscribed · Signed sheet · Not signed · Fines generated

  **Main table**   Checkbox (signed) · Employee ID · Name · Subscription · Status
                   OR (after generate with fines) Generated fine list table

  **Actions**      Save sheet · Generate fines · View fine list · Back to sheet

  **Modals**       Confirm generate · Result (fines list or no fines message)
  ---------------- ------------------------------------------------------

**Employee History Screen**

  ---------------- ------------------------------------------------------
  **Zone**         **Contents**

  **Week selector** Prev / This week / Next

  **Confirmations** Mon–Fri table with status badges

  **Daily Fine List** Date picker · office-wide fined employees (published by admin)

  **Personal fines** Employee's own fine records
  ---------------- ------------------------------------------------------

**10. Notification Templates**

All system notifications use a consistent voice: direct, specific, and
actionable. Never use passive voice. Always include the next action.

  ---------------- ------------- ---------------------------- ----------------
  **Trigger**      **Channel**   **Message**                  **Condition**

  **10:00 AM       Email +       *🍽 Time to confirm your      Sent daily to
  Reminder**       In-app        lunch for today! Cutoff is   all active
                                 at 11:00 AM.*                subscribers

  **10:45 AM       Email +       *⏱ 15 minutes left! Confirm  Sent only if
  Warning**        In-app        your lunch or you'll be      employee has not
                                 marked as skipped.*          yet confirmed

  **Fine Applied   Email         *⚠ A fine of ৳50 has been    After admin
  (Daily Sheet)**                applied for [Date]. Did not  generates fines
                                 sign daily food sheet.*      from Daily Sheet

  **Fine Applied   Email         *⚠ A fine of ৳50 has been    After auto cron
  (Online cron)**                applied… missed online       (optional)
                                 confirmation before cutoff.*

  **Subscription   Email         *📅 Your lunch subscription  Sent to
  Reminder**                     for \[Month\] starts         unsubscribed
                                 tomorrow. Log in to confirm  employees before
                                 your preference.*            month start

  **Monthly        Email         *📊 Your lunch report for    Sent to
  Summary**                      \[Month\]: 18 confirmed, 4   employees on 1st
                                 skipped, 0 fines. View full  of each month
                                 report →*                    

  **Admin Daily    Email         *📋 Today\'s Kaunch summary:   Sent to admin
  Report**                       47 confirmed, 6 skipped, 2   after cutoff
                                 new fines. Cutoff was 11:00  daily
                                 AM.*                         
  ---------------- ------------- ---------------------------- ----------------

**11. Reports & Exports**

**11.1 Excel Export Columns**

  --------------------- --------------- ----------------------------------
  **Column**            **Type**        **Example Value**

  Employee ID           String          EMP-0042

  Name                  String          Tanvir Ahmed

  Department            String          Engineering

  Date                  Date            2026-06-01
                        (YYYY-MM-DD)    

  Status                Enum            Confirmed / Skipped / Pending

  Food Preference       Enum            Chicken / Fish / Beef / Veg / Any

  Fine Amount           Number (BDT)    50

  Subscription Type     Enum            Full / Half / None
  --------------------- --------------- ----------------------------------

**11.2 PDF Report Layout**

-   Header: Kaunch logo (left) · Report title + date range (center) · Page
    number (right)

-   Summary box: 4 KPI tiles (Total confirmed / Skipped / Fines
    collected / Employees)

-   Main table: same columns as Excel, sorted by Department then Name

-   Footer: "Generated by Kaunch · Confidential" · Generation timestamp

-   Font: Inter; primary color accent on table headers; page size A4

**12. Do\'s and Don\'ts**

A quick reference for common design decisions.

  ----------------------------------- -----------------------------------
  **✓ Do**                            **✗ Don\'t**

  Use status badges consistently ---  Mix text colors and badge styles
  one badge per state per row         across different tables

  Show cutoff time in 12-hour format  Use 24-hour format --- users expect
  with AM/PM (11:00 AM)               12h in this context

  Use saffron (#F4A025) only for      Use saffron as a generic accent on
  warnings and pending states         buttons or headings

  Confirm destructive actions (fine   Perform fine changes without user
  edits) with a modal                 review

  Keep empty states actionable (\"No  Show generic \"No data\" without
  lunches yet → Confirm Now\")        direction

  Export reports as both Excel        Force users to download one format
  (.xlsx) and PDF                     only

  Show food preference chips inline   Hide preferences behind a details
  in employee rows                    modal

  Lock the confirmation toggle        Grey out without explaining why it
  visually after 11:00 AM cutoff      is disabled
  ----------------------------------- -----------------------------------

**13. Accessibility Checklist**

-   All text/background combinations must pass WCAG AA contrast (4.5:1
    for normal, 3:1 for large text)

-   Interactive elements must have visible focus ring (2px solid
    #1A6B3C, 2px offset)

-   All icons used without adjacent text must have aria-label or title

-   Confirmation toggle must be operable by keyboard (Space / Enter)

-   Status badges must not rely on color alone --- use icon or text
    label alongside fill

-   Reduced-motion: skip all transitions when prefers-reduced-motion:
    reduce is set

-   Form inputs must have visible labels (never placeholder-only)

-   Error messages must reference the field by name (\"Employee ID is
    required\")

-   Minimum tap target size: 44 × 44px on all mobile-facing controls

**14. Change Log**

  ------------- ------------ ---------------- ---------------------------------
  **Version**   **Date**     **Author**       **Summary**

  v1.0          June 2026    Design Lead      Initial design system --- covers
                                              color, type, spacing, badges,
                                              components, screens,
                                              notifications, reports

  v1.1          June 2026    Product          Daily Food Sheet screen, portal
                                              modals, employee Daily Fine List,
                                              half-manual fine workflow
  ------------- ------------ ---------------- ---------------------------------

*This document should be updated whenever a new component is introduced,
a token value changes, or a new screen is added to the product.*
