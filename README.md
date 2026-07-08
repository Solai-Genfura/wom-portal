# FixFlow - Technician Work Orders Management Portal

FixFlow is a production-grade, highly polished Next.js application built to manage Technician Work Orders. It features a responsive UI, file-based JSON persistence, comprehensive Zod validation on both server/client boundaries, and unit/component test coverage.

---

## Getting Started

### 1. Installation
Install the project dependencies using npm:
```bash
npm install
```

### 2. Seeding Sample Data
To populate the database with realistic sample work orders (High, Medium, Low priority tasks under Open, In Progress, or Done statuses), run the seed script:
```bash
npm run seed
```
This initializes/overwrites the local data store at `data/work-orders.json` with 5 sample maintenance entries.

### 3. Run Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Testing

The application includes component tests (testing React renders, user validation, and input fields) and unit tests (testing schema boundaries).

Run all tests via Vitest:
```bash
npm test
```

---

## Architecture & Design Decisions

### 1. Server/Client Boundaries & Page Routing
* **Server Components (SSR by default)**: All main route files (`src/app/page.tsx`, `src/app/[id]/page.tsx`, `src/app/[id]/edit/page.tsx`, `src/app/new/page.tsx`) are Server Components. They read files directly and compile pages on the server, ensuring excellent SEO, no layout shifts, and minimal client bundle size.
* **Client Components**: Interactive utilities like `DashboardFilters`, `DeleteButton`, `CopyButton`, and the form module `WorkOrderForm` are client-rendered to handle live events, async network requests, inputs, and router transitions.

### 2. Caching Choice: `force-dynamic`
All pages and API route handlers declare `export const dynamic = 'force-dynamic';`.
* **Reasoning**: Next.js by default aggressively caches pages statically at build time. Because this project uses a local JSON file (`data/work-orders.json`) for persistence, any mutations (Create, Edit, Delete) occur directly on the filesystem during runtime. Static caching would serve outdated views to users. Forcing dynamic rendering guarantees the server reads fresh JSON records on every page transition.

### 3. Validation & Safe Rendering
* **Zod Validation**: Payloads are validated server-side using Zod schemas (`CreateWorkOrderSchema`, `UpdateWorkOrderSchema`) inside Route Handlers. Field-level error messages are returned in a standard `{ errors: { [field]: message } }` format on validation failure.
* **Safe Rendering**: Work order descriptions (which can contain newlines) are rendered safely using CSS text-wrapping (`whitespace-pre-wrap break-words`) rather than raw `dangerouslySetInnerHTML`. This preserves structural spacing and shields the application from cross-site scripting (XSS) risks.

### 4. Search and Filter Implementation
* **Double Scope Implementation**: To go above and beyond the requirements, we implemented **both** text search (filters against title and description) and status/priority dropdowns.
* **Mechanism**: Filters update search parameters on the URL. Next.js server components read these parameters, filter the dataset server-side, and push the optimized list down to the layout. This ensures bookmarkable, shareable search states.

---

## File Structure

```
├── data/
│   └── work-orders.json        # File-based JSON database (gitignored / auto-generated)
├── scripts/
│   └── seed.ts                 # Database seeding script
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Route Handlers (GET, POST, PUT, DELETE)
│   │   ├── [id]/               # Work Order Detail and Edit routes
│   │   ├── new/                # Work Order Creation route
│   │   ├── globals.css         # Styling system
│   │   ├── layout.tsx          # Main application wrapper
│   │   └── page.tsx            # Dashboard home view
│   ├── components/             # Reusable Client components
│   │   ├── copy-button.tsx     # Copy-to-clipboard button
│   │   ├── dashboard-filters.tsx # Dashboard filter bar (text, status, priority)
│   │   ├── delete-button.tsx   # Interactive deletion button
│   │   └── work-order-form.tsx # Reusable Create/Edit form
│   └── lib/
│       └── data-store.ts       # Persistence utilities and Zod schemas
├── vitest.config.ts            # Test configuration
└── vitest.setup.ts             # Test setup extending matchers
```
