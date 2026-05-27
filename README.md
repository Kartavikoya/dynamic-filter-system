# Dynamic Filter System

A React + TypeScript + Vite application implementing a reusable dynamic filter builder for an employee dataset.

## Overview

- Dynamic filter rows driven by external field definitions
- Support for text, number, date, amount, single-select, multi-select, and boolean filters
- Local JSON dataset filtering and fallback data handling
- Optional mock JSON API for `/api/employees`
- Sortable result table with CSV and JSON export
- Filter state persistence via `localStorage`

## Running the project

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Optional: run the mock API server:

```bash
npm run mock
```

Then open the local URL shown in your terminal.

## Available scripts

- `npm run dev` — start development server
- `npm run build` — build production bundles
- `npm run preview` — preview the production build locally
- `npm run mock` — start the mock JSON API server

## Project structure

- `src/App.tsx` — main app container, data loading, state management, export actions
- `src/components/FilterBuilder.tsx` — dynamic filter form UI
- `src/components/DataTable.tsx` — sortable table for filtered results
- `src/config/filterConfig.ts` — filter field metadata and operator definitions
- `src/utils/filterUtils.ts` — filter validation and matching logic
- `src/data/employees.ts` — built-in dataset fallback
- `mock-server.js` — mock JSON API server
- `mock-data/employees.json` — employee seed data

## Notes

- The app prefers the mock API at `http://localhost:4001/api/employees`, but falls back to built-in data if the server is unavailable.
- Export buttons generate filtered CSV and JSON payloads from the current query results.
- Filters are kept in `localStorage` so they survive browser refreshes.

## Dependencies

- `react` / `react-dom`
- `@mui/material`
- `@tanstack/react-table`
- `dayjs`
- `react-csv`
- `mock-json-api`

## Recommended workflow

1. Start `npm run mock` in one terminal
2. Start `npm run dev` in another terminal
3. Open the app and add filters
4. Export or reset the filtered dataset

## License

This project is an example implementation and is intended for demonstration purposes.
