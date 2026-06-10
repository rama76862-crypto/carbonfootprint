# 🌍 EcoTrace — Smart AI-Powered Carbon Footprint Tracker

EcoTrace is a premium, high-fidelity web application designed to help individuals calculate, track, and optimize their carbon footprint. Developed as a **Frontend-Only** submission, EcoTrace integrates a **Smart AI Assistant** that operates purely on the client-side, making logical decisions based on the user's logged metrics, location, and habits.

---

## 🚀 Key Features

### 1. 🤖 Smart AI Eco-Assistant
* **Full Chat Interface (`/assistant`):** Speak with "EcoBot", a context-aware conversational agent that analyzes your footprint, gives tailored strategies, and explains carbon limits (like the Paris Climate Agreement).
* **Interactive Natural Language Logging:** You can log activities directly by chatting. Type commands like:
  * *"Log 120 km flight"*
  * *"I spent ₹5000 on shopping"*
  * *"Log a vegan meal"*
  * *"Log 300 kwh electricity"*
* **Inline Confirmation Actions:** The assistant parses your intent, calculates the emissions in real-time, and renders confirmation buttons directly in the chat bubble. Click once, and it commits the activity to your tracking database.
* **Global Floating Chat Widget:** Invoke EcoBot Lite instantly from any screen (Dashboard, Tracker, Tips) for quick questions or fast logging.

### 2. ⚙️ Profile & Data Portability System
* **Personalized Settings (`/settings`):** Manage profile attributes including name, location, and household size.
* **Dynamic Benchmarking:** Changing your location updates comparisons on the Dashboard dynamically (e.g. comparing vs. India averages of `1.9` tonnes vs. US averages of `14.7` tonnes).
* **Adjustable Paris Target Limits:** Set a custom carbon ceiling (defaults to `2.0` tonnes per year).
* **Data Portability:** Save and export all carbon logs as standard JSON backups, or load previous backups with immediate visual updates.
* **Danger Zone:** Safely purge local session history with strict double-confirmation guards.
* **UI Themes:** Toggle betweenForest Green, Electric Blue, Sunset Orange, and Neon Amethyst color accents.

### 3. 📊 Visual Dashboard & Heatmaps
* **Last 6 Months Area Chart:** Seamlessly monitors monthly emission curves and highlights carbon milestones.
* **Sector Breakdown Bar Chart:** Compares transportation, food, energy, and retail expenditures.
* **Emissions Ring Gauge:** A custom SVG gauge illustrating current tonnes against the Paris target, shifting dynamically from green (low) to orange (medium) and red (critical).
* **Calendar Heatmap:** Maps daily logging frequency, keeping track of streaks (e.g., a active 12-day streak).

---

## 🛠️ Technological Architecture

* **Core:** React 19, JavaScript (ESM)
* **Build System:** Vite 8
* **Icons:** Lucide React
* **Charts:** Recharts
* **Styling:** Vanilla CSS (Curated dark theme matching modern glassmorphism design principles, smooth micro-animations, and full responsive queries for tablets and smartphones)

### Natural Language Processing (NLP) Engine
EcoTrace uses a client-side RegEx and substring parser that:
1. Standardizes text inputs and extracts numeric metrics, units, and categories.
2. Resolves conversion factors (e.g., car fuel consumption, electricity grid indices, diet overheads).
3. Connects directly to `CarbonContext` to dispatch state additions.

---

## 📐 Assumptions & Conversion Factors

Formula calculations follow standard environmental metrics:
* **Transport:** 
  * Car: `0.171` kg CO₂/km
  * Flight: `0.254` kg CO₂/km
  * Bus: `0.082` kg CO₂/km
  * Train: `0.041` kg CO₂/km
  * Bike: `0.00` kg CO₂/km
* **Home Energy:**
  * Electricity: `0.385` kg CO₂/kWh
  * Gas: `0.185` kg CO₂/unit
  * *Sharing Ratio:* Total home emissions are divided by the household size (`householdSize`) to calculate individual share.
* **Food & Diet (per month):**
  * Meat-heavy: `2.9` kg CO₂/day
  * Omnivore: `1.7` kg CO₂/day
  * Vegetarian: `1.2` kg CO₂/day
  * Vegan: `0.7` kg CO₂/day
  * *Modifiers:* Waste overhead multiplies values by 1.05 (low), 1.15 (medium), or 1.25 (high). Local/seasonal sourcing applies a 10% discount.
* **Shopping:**
  * Retail spend: `0.120` kg CO₂ per USD spent.
  * *Exchange Rate:* ₹83 INR = $1 USD. Second-hand purchasing reduces shopping footprint by 40%.

---

## ⚡ Running Locally

### 1. Installation
Clone the repository and install npm packages:
```bash
npm install
```

### 2. Start the Development Server
Run Vite's local hot-reload server:
```bash
npm run dev
```

### 3. Run Production Builds
Compile the application to static assets inside the `dist` folder:
```bash
npm run build
```

---

## 🧪 Testing

To ensure calculations are exact, run the built-in ESM test suite:
```bash
npm run test
```
The test suite performs assertions on transport, electricity, food types, and shopping spends, confirming the integrity of the math.
