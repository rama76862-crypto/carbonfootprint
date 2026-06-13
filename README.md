# EcoTrace Carbon Coach

EcoTrace is a full-stack carbon footprint tracker for the **Personal Sustainability Coach** vertical. It helps users log monthly transport, home energy, food, and shopping emissions, then turns those logs into dashboard analytics, chat-driven logging, and practical reduction advice.

## Key Features

- Smart Eco Assistant with client-side natural language logging and a floating chat widget.
- Backend-powered carbon coach that reads the latest footprint context and returns prioritized actions.
- Dashboard charts for monthly trends, category breakdowns, emissions score, benchmarks, and logging streaks.
- Settings page for profile, country benchmark, annual target, theme accent, export/import, and reset controls.
- JSON-backed Node API for profile and emissions persistence.

## Approach and Logic

The chosen vertical is **Personal Sustainability Coach**. The solution is designed around an urban household user who needs realistic, repeatable actions rather than generic climate advice.

Decision logic:

- Normalize all emissions entries into tonnes CO2e.
- Aggregate year-to-date totals across transport, home, food, and shopping.
- Compare the user against country averages and their selected annual target.
- Detect the largest emissions category.
- Recommend high-impact actions for that category, plus a supporting action from the next largest category.
- Keep recommendations practical, affordable, and privacy-conscious.

## Project Structure

- `frontend/` - React + Vite app.
- `backend/` - dependency-free Node.js API.
- `data/carbon-data.json` - local JSON persistence seed.

## Backend API

- `GET /api/health`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/emissions`
- `POST /api/emissions`
- `PATCH /api/emissions/:month`
- `POST /api/calculate`
- `POST /api/assistant`

## Run Locally

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start the backend API from the `frontend` folder:

```bash
npm run api
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:5174`.

## Validation

From the `frontend` folder:

```bash
npm test
npm run lint
npm run build
```

`npm test` runs both the frontend calculation checks and backend Node tests.

## Assumptions

- Emission factors are simplified estimates for challenge demonstration purposes.
- Shopping emissions use an approximate INR-to-USD conversion of INR 83 to USD 1.
- The backend avoids external services and heavy dependencies to keep the repository small and easy to evaluate.
- The assistant uses transparent rule-based logic instead of sending personal data to a third-party AI service.
