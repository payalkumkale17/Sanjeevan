# Sanjeevan 🌿

> **Sanskrit: "life-restoring"** — A mobile-first air quality intelligence framework for urban India.

Sanjeevan is a lightweight, cross-platform mobile application built with **Expo (React Native)** that transforms publicly available air quality and meteorological data into personalised, actionable health guidance. It bridges the gap between raw AQI numbers and real-world decisions — telling you not just *what* the air quality is, but *what to do about it*.

---

## Screenshots 📱

| Dashboard | Rankings | Forecast | Origins | Guidance | Profile |
|-----------|----------|----------|---------|----------|---------|
| AQI card + pollutant grid | Global city leaderboard | 72h trend + weather | Pollution source breakdown | Health recommendations | Settings + dark mode |

---

## Features ✨

### Core
- **Real-Time AQI Dashboard** — Live air quality readings from the nearest OpenAQ monitoring station, with a colour-coded scale bar (Good → Hazardous) and a sliding position marker
- **Full Pollutant Grid** — PM2.5, PM10, Temperature, Humidity, and Wind Speed displayed as individual metric cards with status badges (Good / Fair / Poor / Very Poor) and normalised progress bars
- **72-Hour Forecast** — Rule-based qualitative AQI trend projection (Improving / Stable / Worsening) using Open-Meteo meteorological data, with a horizontal hourly snapshot carousel and a 2×2 weather context grid
- **Pollution Origins** — Heuristic source attribution across Vehicles, Dust, Industry, and Burning, with percentage breakdowns, contribution bars, and actionable tips per source
- **Personalised Health Guidance** — AQI-category × user health profile × activity pattern → context-aware health and behavioural recommendations (outdoor exercise, mask usage, ventilation, escalation cues)
- **Global City Rankings** — Sortable leaderboard of 28 cities worldwide with AQI chips, status badges, 24-hour trend arrows (colour-coded), PM2.5 values, and top-3 gold/silver/bronze rank badges

### UX & Accessibility
- **System-Wide Dark Mode** — Full adaptive theming via React Context; toggle from the Profile screen and the change propagates instantly across all 6 screens. Dark palette uses deep navy/slate tones to reduce contrast fatigue on OLED displays
- **Adaptive AQI Colour System** — Six-tier colour coding (Green → Amber → Orange → Red → Purple → Maroon) consistent across light and dark themes
- **Location Picker** — GPS-based auto-detection with reverse geocoding + manual city selection via a searchable modal
- **Pull-to-Refresh** — Available on Dashboard, Rankings, and all data screens

### Profile & Settings
- **Onboarding** — Single-screen profile setup: age, health condition, activity pattern, daily outdoor exposure, notification preference
- **Profile Screen** — User stats (Days Active, Alerts, Locations), dark mode toggle, and 7 functional settings menu items with contextual Alert dialogs (Personal Info, Notifications, Saved Locations, Language, Privacy Policy, Help & FAQ, About)
- **Sign Out** — Confirmation dialog with destructive action

---

## Tech Stack 🛠️

| Category | Technology |
|----------|-----------|
| Framework | Expo SDK 54 / React Native 0.81.5 |
| Language | TypeScript 5.9.2 |
| Navigation | React Navigation 7 (Bottom Tabs) |
| Fonts | Poppins (300–800) + Inter (400/500/700) via @expo-google-fonts |
| Icons | Ionicons via @expo/vector-icons |
| Storage | AsyncStorage (@react-native-async-storage) |
| Location | expo-location (GPS + reverse geocoding) |
| Gestures | react-native-gesture-handler + react-native-reanimated |
| State | React Context (ThemeContext + AirQualityDataContext) |

### APIs
| API | Purpose | Auth |
|-----|---------|------|
| [OpenAQ v3](https://openaq.org) | Real-time AQI + pollutant data | API Key required |
| [Open-Meteo](https://open-meteo.com) | 48-hour weather forecast | None (free & open) |

---

## Project Structure 📁

```
Sanjeevan/
├── App.tsx                        # Root — ThemeProvider + AppContent
├── app.json                       # Expo config (name, icon, permissions)
├── index.ts                       # Entry point
├── babel.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── context/
    │   ├── AirQualityDataContext.tsx  # AQI + weather data state
    │   └── ThemeContext.tsx           # Dark/light mode state
    ├── screens/
    │   ├── HomeScreen.tsx             # AQI dashboard + pollutant grid
    │   ├── RankingsScreen.tsx         # Global city leaderboard
    │   ├── ForecastScreen.tsx         # 72h trend + weather
    │   ├── SourcesScreen.tsx          # Pollution source breakdown
    │   ├── GuidanceScreen.tsx         # Health recommendations
    │   ├── ProfileScreen.tsx          # Settings + dark mode toggle
    │   └── OnboardingScreen.tsx       # First-run profile setup
    ├── navigation/
    │   └── MainTabs.tsx               # 6-tab bottom navigator
    ├── components/
    │   └── LocationModal.tsx          # City picker modal
    ├── services/
    │   ├── openaqService.ts           # OpenAQ API + caching + fallback
    │   └── openMeteoService.ts        # Open-Meteo API
    ├── data/
    │   └── mockData.ts                # Fallback mock data
    ├── storage/
    │   └── profile.ts                 # AsyncStorage profile persistence
    ├── theme.ts                       # Light + dark palette tokens, typography
    └── types.ts                       # Shared TypeScript types
```

---

## Getting Started 🚀

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Expo Go app on your Android or iOS device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/payalkumkale17/Sanjeevan.git
cd Sanjeevan

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start --lan
```

### Running on Your Device

After running `npx expo start --lan`:

- Open **Expo Go** on your phone
- Scan the QR code shown in the terminal
- Or tap **Enter URL manually** and type `exp://<your-ip>:8081`

> **Note:** Your phone and laptop must be on the same WiFi network.

### Platform Commands

```bash
npm run android   # Android emulator
npm run ios       # iOS simulator (macOS only)
npm run web       # Web browser
```

---

## Configuration ⚙️

### OpenAQ API Key

The app uses the OpenAQ v3 API which requires a free API key.

1. Register at [https://explore.openaq.org/register](https://explore.openaq.org/register)
2. Copy your API key from your account settings
3. Open `src/services/openaqService.ts`
4. Replace the value of `OPENAQ_API_KEY` with your key:

```typescript
const OPENAQ_API_KEY = 'your_api_key_here';
```

> Without a valid API key the app falls back to mock data and displays a **"Live data unavailable"** banner.

---

## Navigation Structure 🗺️

The app uses a 6-tab bottom navigation:

| Tab | Screen | Description |
|-----|--------|-------------|
| Overview | HomeScreen | AQI dashboard, pollutant grid, scale reference |
| Rankings | RankingsScreen | Global city leaderboard, sortable by AQI or PM2.5 |
| Forecast | ForecastScreen | 72h AQI bar chart, hourly snapshot, weather |
| Origins | SourcesScreen | Pollution source attribution and tips |
| Guidance | GuidanceScreen | Personalised health recommendations |
| Profile | ProfileScreen | User settings, dark mode toggle, about |

---

## AQI Colour Scale 🎨

| Range | Category | Colour |
|-------|----------|--------|
| 0–50 | Good | 🟢 #00C853 |
| 51–100 | Moderate | 🟡 #FFB300 |
| 101–150 | Unhealthy for Sensitive Groups | 🟠 #FF6D00 |
| 151–200 | Unhealthy | 🔴 #D50000 |
| 201–300 | Very Unhealthy | 🟣 #6A1B9A |
| 301+ | Hazardous | ⬛ #4E0000 |

Colours are consistent across both light and dark themes.

---

## Dark Mode 🌙

Dark mode can be toggled from the **Profile** screen using the switch under **Dark Mode**. The theme change is applied system-wide instantly — no restart required.

The theming system uses a `ThemeContext` provider at the application root with two semantic colour palettes (`palette` and `darkPalette`), each containing 22 tokens. All screen components read colours via `useTheme()` rather than using hardcoded colour values.

---

## Data Pipeline 🔄

```
GPS / Manual City
       ↓
  OpenAQ API  ──→  Normalisation  ──→  Rule Engine  ──→  State (Context)  ──→  UI
  Open-Meteo  ──→  Temporal Align ──→  Heuristics   ──→
       ↓
  AsyncStorage (15-min cache)
```

- **Caching:** AQI data is cached for 15 minutes via AsyncStorage, keyed by location coordinates
- **Fallback:** If live data is unavailable, mock data is served with a visible banner
- **Rate limiting:** Requests are spaced at 1.25-second intervals to respect OpenAQ rate limits

---

## Known Limitations ⚠️

- AQI data availability depends on OpenAQ monitoring station density — some cities may have sparse or delayed readings
- The 72-hour forecast uses rule-based heuristics (wind, humidity, temperature) and is **not** a validated meteorological model — treat as indicative only
- Source attribution (Vehicles, Dust, Industry, Burning) is a heuristic estimator based on time-of-day and seasonal signals, not a scientific receptor model
- City Rankings use a static dataset — live global ranking requires a backend aggregation service (planned)
- Theme preference is not persisted across app restarts (planned)

---

## Future Roadmap 🔮

- [ ] Persist dark mode preference across sessions (AsyncStorage)
- [ ] Live city rankings via OpenAQ aggregation
- [ ] Push notifications for AQI threshold exceedances
- [ ] ML-based AQI forecasting (gradient-boosted regressor)
- [ ] Scientifically validated source attribution (PMF/CMB lookup)
- [ ] Multi-language support (Hindi, Marathi, Tamil, Bengali)
- [ ] WCAG 2.1 accessibility audit
- [ ] Historical AQI trends and analytics
- [ ] Backend API layer for multi-city scalability

---

## Contributing 🤝

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please use TypeScript, follow existing component structure, and write descriptive commit messages.

---

## License 📄

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Team 👩‍💻

| Name | Email |
|------|-------|
| Payal Kumkale | payalkumkale17@gmail.com |
| Aarya Hingane | hinganeaarya@gmail.com |
| Vidushi Chilka | sushividushi11@gmail.com |
| Maviya Sayed | sayedmaviya47@gmail.com |

**Institution:** School of Computing, MIT ADT University, Pune, Maharashtra, India

---

## Acknowledgments 🙏

- [OpenAQ](https://openaq.org) — Open air quality data platform
- [Open-Meteo](https://open-meteo.com) — Free, open-source weather API
- [Expo](https://expo.dev) — Cross-platform React Native toolchain
- [React Navigation](https://reactnavigation.org) — Routing and navigation

---

## Disclaimer ⚠️

Air quality data provided by Sanjeevan is for informational purposes only. The app relies on third-party data sources and heuristic models. Always consult official health authorities and environmental agencies (CPCB, SAFAR) for critical health decisions. Do not use this app as a sole basis for medical decisions.

---

*Made with ❤️ for healthier breathing and informed living.*
