# 💰 Fintech

A fintech mobile app for Malaysian food stall owners to track cash flow, predict survival days, and get spending warnings — all stored locally on device.

**Tech Stack:** React 18 · Vite · Vanilla CSS (inline) · localStorage

---

## 🚀 Quick Start (open your COMMAND PORMPT) and write what i write 

```bash
1. cd Fintech
2. npm install 
3. npm run dev        # → http://localhost:5173/
```

---

## 📁 Project Structure & File Guide

```
Software/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── utils/
    ├── hooks/
    └── components/
```

---

## 🔧 Root Config Files

### `package.json`
Project manifest. Defines dependencies (`react`, `react-dom`) and dev dependencies (`vite`, `@vitejs/plugin-react`). Contains npm scripts:
- `npm run dev` — Start dev server with hot reload
- `npm run build` — Production build
- `npm run preview` — Preview production build

### `vite.config.js`
Vite bundler configuration. Loads the `@vitejs/plugin-react` plugin so Vite can compile JSX syntax. No custom settings — uses Vite defaults.

### `index.html`
The single HTML page. Loads **Google Fonts** (Plus Jakarta Sans + Inter) and mounts the React app into `<div id="root">`. This is Vite's entry point — it references `/src/main.jsx`.

---

## 📂 `src/` — Application Source

### `src/main.jsx`
**React entry point.** Mounts the root `<App />` component into the DOM. Also imports `index.css` for global styles. This is the first JavaScript file that runs.

### `src/index.css`
**Global CSS reset.** Removes default margins/padding, sets `box-sizing: border-box`, and applies the Inter font family to the body. Keeps the app looking consistent across browsers.

### `src/App.jsx`
**Root application component.** This is the "brain" of the app. It:
- Manages **global state** (stall name, balance, transactions, warnings) via `useLs` hook
- Handles **routing** between pages (Dashboard, Transactions, Reports, Settings) using a `tab` state
- Controls **modals** (AddModal for new/edit transactions)
- Manages the **warning system** (detects spending streaks, shows/hides CriticalWarning overlay)
- Renders the **Shell** wrapper, **BottomNav**, and the active page
- Shows the **Onboarding** flow on first visit

> **When to edit:** Add new pages/tabs, change global state shape, add new modals.

---

## 📂 `src/utils/` — Pure Utility Functions

These files contain **no React code** — just plain JavaScript functions and constants.

### `src/utils/helpers.js`
**Shared helper functions** used across the entire app:

| Function | Purpose | Example Output |
|---|---|---|
| `genId()` | Generate unique ID for transactions | `"a1b2c3d4-..."` |
| `todayStr()` | Today's date as `YYYY-MM-DD` string | `"2026-04-15"` |
| `fmtRM(n)` | Format number as Malaysian Ringgit | `"RM 1,250.00"` |
| `fmtDate(d)` | Human-readable date label | `"Today"`, `"Yesterday"`, `"Mon, 12 Apr"` |
| `daysAgo(n)` | Date string N days in the past | `daysAgo(3)` → `"2026-04-12"` |
| `weekStart()` | Monday of current week as date string | `"2026-04-14"` |

> **When to edit:** Add new date/formatting utilities.

### `src/utils/constants.js`
**App-wide configuration values:**

| Constant | Value | Purpose |
|---|---|---|
| `INCOME_CATS` | `["Sales", "Catering", "Advance", "Other"]` | Income category options in forms |
| `EXPENSE_CATS` | `["Ingredients", "Gas", "Packaging", ...]` | Expense category options in forms |
| `WARN_THRESHOLD` | `0.80` (80%) | Expense-to-income ratio that triggers warning |
| `WARN_STREAK` | `3` | Number of consecutive days needed to trigger critical warning |

> **When to edit:** Add new categories, adjust warning sensitivity.

### `src/utils/seedData.js`
**Demo transactions** loaded on first app launch. Contains 17 realistic food stall transactions spanning 7 days (income from sales, expenses for ingredients/gas/rent/etc). Used to show the app with data immediately — the user doesn't start with an empty dashboard.

> **When to edit:** Change demo data, add more sample transactions.

### `src/utils/exportUtils.js`
**File export functions** (client-side, no server needed):

| Function | Purpose | Output |
|---|---|---|
| `exportCSV(txns, stallName)` | Export transactions as `.csv` file | Downloads `Warung-Mak-Jah-transactions.csv` |
| `exportTXT(txns, stallName, calcs)` | Export summary report as `.txt` file | Downloads `Warung-Mak-Jah-report.txt` |

Both create a `Blob`, generate a download URL, and auto-click a link to trigger the browser download.

> **When to edit:** Add PDF export, change export format/columns.

---

## 📂 `src/hooks/` — Custom React Hooks

Reusable state logic extracted from components.

### `src/hooks/useLs.js`
**localStorage persistence hook.** Works like `useState` but automatically saves to and loads from `localStorage`. All app state (name, balance, transactions, warning acknowledgement) is persisted through this hook.

```js
const [value, setValue] = useLs("storage_key", defaultValue);
```

> **When to edit:** Add encryption, migrate to IndexedDB, or add cloud sync.

### `src/hooks/useCalcs.js`
**Business calculation engine.** Takes `txns` (transactions array) and `ob` (opening balance) and returns:

| Field | Type | Description |
|---|---|---|
| `totalIncome` | number | Sum of all income transactions |
| `totalExpense` | number | Sum of all expense transactions |
| `balance` | number | Opening balance + income − expenses |
| `daysLeft` | number | Estimated survival days (balance ÷ avg daily expense) |
| `weekIncome` | number | Income this week (Mon–Sun) |
| `weekExpense` | number | Expenses this week |
| `bizExpense` | number | Business-only expenses (excludes personal) |
| `realProfit` | number | Income minus business expenses |
| `isSafe` | boolean | `true` if `daysLeft >= 7` |
| `avgDaily` | number | Average daily expense (last 7 days) |

Uses `useMemo` — only recalculates when `txns` or `ob` change.

> **When to edit:** Change survival threshold, add monthly calculations, add trend analysis.

### `src/hooks/useWarningEngine.js`
**Spending streak detector.** Analyzes the last N days (default 3) and returns:

| Field | Type | Description |
|---|---|---|
| `streakActive` | boolean | `true` if expense ratio ≥ 80% for 3+ consecutive days |
| `pct` | number | Expense-to-income percentage (e.g. `91`) |
| `topCat` | array | `["Ingredients", 582]` — highest expense category |
| `changePct` | number | % change vs previous period |
| `targetSpend` | number | Recommended spending target (70% of current) |
| `priceRaise` | number | Suggested price increase (10% of income) |

When `streakActive` is `true`, the app shows the **CriticalWarning** overlay.

> **When to edit:** Adjust detection algorithm, add weekly/monthly warnings.

---

## 📂 `src/components/` — React Components

One component per file. Each renders a specific part of the UI.

### `src/components/Icons.jsx`
**SVG icon library.** Exports an `I` object with icon components:

```js
import { I } from './Icons';
// Usage: <I.Home style={{ width: 20, height: 20 }} />
```

Available icons: `Home`, `List`, `Chart`, `Gear`, `Plus`, `Warn`, `Check`, `Back`, `Edit`, `Trash`, `Shield`, `Chevron`, `Bell`, `Download`, `Info`

> **When to edit:** Add new icons (paste SVG path data).

### `src/components/Shell.jsx`
**Phone simulator wrapper.** Wraps the entire app in a mobile-sized container (max 390px wide) with rounded corners and shadow. Makes the app look like a phone on desktop screens.

> **When to edit:** Change phone dimensions, remove for production mobile deployment.

### `src/components/BottomNav.jsx`
**Bottom navigation bar** with 4 tabs: Dashboard, Transactions, Reports, Settings. Active tab gets a blue pill highlight. Uses frosted glass (backdrop blur) effect.

**Props:**
- `active` — Current tab ID string
- `onChange(tabId)` — Callback when tab is tapped

> **When to edit:** Add/remove tabs, change icons, modify styling.

### `src/components/TxnRow.jsx`
**Single transaction row.** Shows category, note/date, amount (green for income, red for expense), and hover-reveal edit/delete buttons.

**Props:**
- `txn` — Transaction object `{ id, type, category, amount, date, note, isPersonal }`
- `onEdit(txn)` — Callback to edit
- `onDel(id)` — Callback to delete

> **When to edit:** Add swipe-to-delete, receipt thumbnails, category icons.

### `src/components/Dashboard.jsx`
**Main dashboard screen** — the first thing users see. Material 3 "Simulation Center" design featuring:

1. **App bar** — Avatar image + stall name + bell icon
2. **Header** — "SIMULATION CENTER" label + "Fintech" title
3. **Period toggle** — Last Month / This Month / Next Month segmented button
4. **Hero card** — Big survival days number, burn rate, projected net (blue = safe, red = danger)
5. **Metric cards** — Available Cash + Incoming (EOY)
6. **Scheduled Inflows** — List of upcoming payments
7. **Extended FAB** — "+ New Transaction" button

**Props:**
- `txns` — Transactions array
- `name` — Stall name
- `bal` — Opening balance
- `onAdd()` — Open add-transaction modal
- `warnBanner` — Show warning banner
- `onBannerClick()` — Warning banner tap handler

> **When to edit:** Add charts, modify hero card, change layout.

### `src/components/Transactions.jsx`
**Transaction list page** with:
- Filter tabs (All / Income / Expenses)
- Summary bar (total in, total out, net)
- Date-grouped transaction list
- Floating action button (FAB) to add new transactions

**Props:**
- `txns` — Transactions array
- `onAdd()` — Open add modal
- `onEdit(txn)` — Open edit modal with transaction
- `onDel(id)` — Delete transaction by ID

> **When to edit:** Add search, pagination, date range filter.

### `src/components/Reports.jsx`
**Financial reports page** with:
- Cash forecast card (survival days)
- Expense ratio progress bar with danger threshold
- 7-day income vs expenses bar chart
- Expense breakdown by category
- Real business profit calculation

**Props:**
- `txns` — Transactions array
- `bal` — Opening balance

> **When to edit:** Add monthly trends, pie charts, PDF export.

### `src/components/Settings.jsx`
**Settings page** with:
- Profile section (edit stall name)
- Stall config (opening balance, transaction count, current balance)
- Export section (CSV + TXT download buttons)
- Data management (clear all data with confirmation)
- About section (version, storage info)

**Props:**
- `name`, `bal`, `txns` — Current state
- `onName(newName)` — Update stall name
- `onBal(newBalance)` — Update opening balance
- `onReset()` — Clear all data

> **When to edit:** Add backup/restore, currency settings, dark mode toggle.

### `src/components/AddModal.jsx`
**Bottom sheet modal** for adding or editing transactions:
- Type toggle (Income / Expense)
- Amount input with RM prefix
- Category selection chips
- Date picker
- Optional note
- Personal expense toggle (for expenses only)

**Props:**
- `initial` — `null` for new transaction, or existing transaction object for editing
- `onSave(txn)` — Save callback
- `onClose()` — Close modal

> **When to edit:** Add receipt photo upload, recurring transactions, split transactions.

### `src/components/CriticalWarning.jsx`
**Full-screen warning overlay** shown when spending exceeds 80% of income for 3+ consecutive days. Two phases:

1. **Shock phase** (5 seconds) — Shows the problem: expense ratio, biggest spending drain, animated progress bar
2. **Solutions phase** — Actionable recommendations: cut spending, raise prices, track daily

**Props:**
- `data` — Warning data from `useWarningEngine` hook
- `onAcknowledge()` — Dismiss callback (saves acknowledgement timestamp)

> **When to edit:** Add more solution types, change countdown duration.

### `src/components/Onboarding.jsx`
**3-step first-launch wizard:**

1. **Step 1** — "What's your stall called?" (text input)
2. **Step 2** — "How much cash do you have?" (number input)
3. **Step 3** — "What do you spend on?" (category chips)

**Props:**
- `onComplete(name, balance)` — Callback with user inputs when wizard finishes

> **When to edit:** Add more steps, add currency selection, add tutorial slides.

---

## 📊 Data Model

### Transaction Object
```js
{
  id: "unique-string",       // Generated by genId()
  type: "income" | "expense",
  category: "Sales",          // From INCOME_CATS or EXPENSE_CATS
  amount: 250.00,             // Always positive number
  date: "2026-04-15",         // YYYY-MM-DD string
  note: "Morning restock",    // Optional description
  isPersonal: false           // If true, excluded from business profit
}
```

### localStorage Keys
| Key | Type | Purpose |
|---|---|---|
| `cf5_ob` | boolean | Has user completed onboarding? |
| `cf5_name` | string | Stall name |
| `cf5_bal` | number | Opening cash balance |
| `cf5_txns` | array | All transactions |
| `cf5_warn` | number\|null | Timestamp of last warning acknowledgement |

---

## 🗺️ Adding a New Feature

1. **New utility?** → Add to `src/utils/`
2. **New state logic?** → Create a hook in `src/hooks/`
3. **New UI section?** → Create a component in `src/components/`
4. **New page/tab?** → Create component, add to `App.jsx` routing + `BottomNav.jsx`
5. **New constant?** → Add to `src/utils/constants.js`
