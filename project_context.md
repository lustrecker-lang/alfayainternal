# Project: Al Faya Ventures Internal System (AFV-OS)

## 1. Business Hierarchy (Strict)
The system supports different "Types" of Business Units (BUs):

**A. The "Operational" Units (Direct Management)**
1. **IMEDA (Education):**
   - **Core Entity:** Seminars (Date, Location, Cost EUR, Revenue AED).
   - **Key Feature:** Profitability calculator per seminar.
2. **AFCONSULT (Services):**
   - **Core Entity:** Clients & Contracts.
   - **Key Feature:** Billable hours tracking and invoicing.

**B. The "Portfolio" Unit (AFTECH)**
- **AFTECH is a container.** It does not have "projects" itself; it owns "Consumer Apps".
- **Current Apps:** "Circles", "WhosFree".
- **Requirement:** Admin must be able to add new Apps to AFTECH easily.
- **Data Isolation:** "Circles" user data must never mix with "WhosFree" user data.

## 2. Technical Architecture
- **Framework:** Next.js 15 (App Router).
- **Backend:** Firebase (Firestore + Auth).
- **Styling:** Tailwind + Shadcn/UI.

## 3. The "Audit-Ready" Financial Core
- Regardless of the Business Unit (IMEDA or AFTECH/WhosFree), **ALL** financial transactions (Income/Expense) must be logged to a single root collection: `general_ledger`.
- This allows for a "One-Click Audit" for UAE Corporate Tax/VAT.

## 4. UI Strategy: The Registry Pattern
- We do not hardcode units.
- We use a central configuration file (`config/units.ts`) to define which Units exist and what "Type" they are.