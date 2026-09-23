# FinStudent AI — Design System (DESIGN.md)
*Synthesized from Refero Styles (Ramp Fintech) & DesignMD (Wise & BudgetZen)*

## Overview & Creative Direction
FinStudent AI is a modern student financial intelligence platform. It rejects the generic "AI generated" clichés — no murky blue glassmorphic blobs, no purple neon glow spheres, and no unreadable low-contrast gray text. 

Instead, it embodies the **Editorial Fintech Precision** of Ramp and Wise:
- **Clean, confident canvas**: Deep obsidian (`#0c0e12`) and sleek stone (`#14171f`), with flat card surfaces (`#1a1d26`) resting on crisp hairline borders (`rgba(255, 255, 255, 0.08)`) instead of heavy artificial drop shadows.
- **Electric Money Signal**: A signature high-contrast **Lime Mint** accent (`#10b981` / `#9fe870`) that lights up call-to-actions, positive savings, and active states.
- **Supportive & Non-Judgmental (BudgetZen Philosophy)**: UI copy frames finances constructively ("₹8,420 remaining this month" instead of alarming red guilt trips).
- **Mobile-First Touch Architecture**: 48px touch targets, mobile bottom navigation bar, responsive slide-out drawer, fluid bento cards, and responsive horizontal chip scrolls.

---

## 🎨 Color Palette

### Surfaces & Neutrals
- **Canvas / Root Background**: `#0c0e12` (deep obsidian with neutral undertone)
- **Primary Surface / Cards**: `#151821` (warm obsidian card background)
- **Elevated Surface**: `#1c202c` (modals, dropdowns, hovered items)
- **Subtle Fill**: `#242838` (chips, inactive pills, table header row)
- **Hairline Border**: `rgba(255, 255, 255, 0.09)` (1px elevation delimiter)
- **Border Hover**: `rgba(255, 255, 255, 0.18)`

### Text & Content
- **Text Primary**: `#f8fafc` (high-contrast crisp off-white for effortless legibility)
- **Text Secondary**: `#94a3b8` (clean slate for descriptions, table column headers)
- **Text Muted / Caption**: `#64748b` (metadata, timestamps, unit labels)

### Accents & Financial Signals
- **Primary Signal (Lime Mint)**: `#10b981` (primary button fill, active pills, savings progress)
- **Accent Voltage (Wise Lime)**: `#9fe870` (badge highlights, key metrics callouts)
- **Secondary Accent (Sky Blue)**: `#38bdf8` (forecast predictions, info tooltips)
- **Warning (Amber)**: `#f59e0b` (approaching budget limit, velocity caution)
- **Danger (Coral Red)**: `#ef4444` (budget exceeded, high severity anomalies)
- **Insight Violet**: `#a855f7` (AI reasoning, natural language facts)

---

## 🔤 Typography & Hierarchy
- **Primary UI & Body Font**: `Inter`, `-apple-system`, `sans-serif`
- **Headings & Display**: `Plus Jakarta Sans`, `Outfit`, `Inter`
- **Monospace (Numbers & Math)**: `JetBrains Mono`, `ui-monospace`, `monospace`

### Scale
- **Display Hero**: 48px - 64px (`font-bold`, tight leading `1.08`, `tracking-tight`)
- **Page Titles**: 28px - 32px (`font-semibold`, `tracking-tight`)
- **Card Headings**: 18px - 20px (`font-semibold`)
- **Body Regular**: 15px - 16px (`font-normal`, `leading-relaxed`)
- **Caption / Meta**: 12px - 13px (`font-medium`, `text-slate-400`)
- **Micro Overline**: 11px (`font-bold`, `tracking-wider`, `uppercase`)

---

## 🔘 Components & Interactive Patterns

### 1. Buttons
- **Primary Pill**:
  - `background: #10b981`, `color: #042f1a`, `border-radius: 9999px` (pill) or `12px`
  - Font: 14px / 600 weight
  - Hover: `background: #34d399`, micro-scale `active:scale-[0.98]`
- **Secondary Neutral**:
  - `background: #1e2230`, `color: #f1f5f9`, border `1px solid rgba(255,255,255,0.1)`
  - Hover: `background: #282d3f`
- **Ghost / Action**:
  - Transparent background, `color: #94a3b8`, hover `color: #f8fafc`, `bg-white/5`

### 2. Cards & Containers (Bento Box)
- Flat background: `#151821`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Corner Radius: `16px` for standard cards, `24px` for hero cards
- Shadow: minimal hairline border ring shadow (`ring-1 ring-white/5`), zero heavy blurry shadows
- Padding: `16px` on mobile (`sm:24px` on desktop)

### 3. Navigation
- **Desktop**: 240px sleek sidebar, icon + label with active pill indicator.
- **Mobile**:
  - Top header with hamburger button, brand logo, and quick "Try Demo" CTA.
  - Slide-out mobile drawer with complete 12-page links.
  - Fixed bottom navigation bar with 5 primary touch points: Dashboard, Transactions, Budgets, Insights, Ask AI.

### 4. Tables & Data Lists
- Horizontal scroll container with touch momentum (`overflow-x-auto -webkit-overflow-scrolling-touch`)
- Alternating subtle zebra rows or clean divided rows (`divide-y divide-white/5`)
- Row hover: subtle highlight (`hover:bg-white/[0.02]`)
- Distinct mobile card list view for transactions on small screens.
