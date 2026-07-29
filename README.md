# InvoiceHub - React Dashboard Exercise

A pragmatic, maintainable React application for managing and creating business invoices. Built as a technical exercise to demonstrate frontend engineering decisions, component architecture, and state management.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation & Running

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open `http://localhost:3000` in your browser.

### Running Tests

This project uses Playwright for End-to-End (E2E) testing to ensure critical user journeys work as expected.

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests in the terminal
npx playwright test

# Or run tests with the interactive UI
npx playwright test --ui
```

## 🏗 Architecture & Technical Decisions

### Tech Stack

- **Framework:** React + TypeScript via Create React App (`react-scripts`).
- **Routing:** `react-router-dom` for client-side navigation.
- **Styling:** Tailwind CSS for maintainable, utility-first styling without external UI component library overhead.
- **Forms:** `react-hook-form` + `zod` for performant, strictly-typed form validation.
- **Icons:** `lucide-react`.
- **E2E Testing:** Playwright.

### 1. The Data Layer (Mock API)

Instead of embedding state directly into components, I created a dedicated `invoiceApi.ts` module. This simulates network latency (`setTimeout`) and asynchronous behavior.

- **Why?** This creates a clean boundary. If this app were to be productionized, we would only need to swap the internals of `invoiceApi.ts` with real `fetch` or `axios` calls. The React components would remain completely untouched.

### 2. URL-Driven State

Search and filter states (query, status, sort field, sort direction) are stored in the URL Search Params rather than local `useState`.

- **Why?** It drastically improves the user experience. Users can bookmark a specific view (e.g., "Overdue invoices sorted by highest amount") or share the link with a colleague, and the exact state will be preserved.

### 3. Form Performance

The Invoice Creation form utilizes `react-hook-form` with `useFieldArray` for dynamic line items.

- **Why?** Complex forms with dynamic inputs can cause severe re-render performance issues. `react-hook-form` manages the DOM nodes natively, meaning adding/removing line items or typing in inputs doesn't re-render the entire form. We used `useWatch` specifically for the total calculation to keep performance snappy.

### 4. Business Logic Separation

Logic like determining if an invoice is "overdue" is abstracted into `utils/invoiceUtils.ts` rather than hardcoded.

- **Why?** Status should be derived from data (dueDate vs currentDate), not stored statically, to prevent data anomalies (e.g., an invoice being marked "Unpaid" when it is technically past due).

## ⚖️ Tradeoffs & Simplifications

Given the time constraints, I made a few pragmatic tradeoffs:

1. **State Management:** I used standard React state (`useState`/`useEffect`) for data fetching. In a production app, I would introduce a server-state library like **TanStack Query (React Query)** to handle caching, background refetching, and deduping requests.
2. **Client-Side Filtering:** Currently, filtering and sorting happen in the browser after fetching all invoices. If this app scales to thousands of invoices, this logic should be moved to the backend with proper pagination.
3. **No Database Persistence:** Because the API is mocked in memory, refreshing the page will reset the data back to the seed state.

## 🔮 Future Improvements

If I had more time to prepare this for a real production environment, I would add:

1. **Accessibility (a11y):** Ensure full keyboard navigation for the table and use ARIA live regions to announce loading states and form errors to screen readers.
2. **Internationalization (i18n):** Move currency and date formatting into an i18n provider so it adapts to the user's locale (e.g., displaying `DD/MM/YYYY` vs `MM/DD/YYYY`).
3. **Pagination / Virtualization:** Implement infinite scrolling or paginated table views for the dashboard.
4. **Unit Testing:** While E2E tests cover the critical paths, I would add `Vitest` to unit-test the business logic functions (like the grand total calculator and the status derivation).
5. **Authentication:** Add protected routes to ensure only authorized users can view or create invoices.
