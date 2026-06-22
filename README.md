# Sanjeevan 🌍

A React Native mobile application that provides real-time air quality monitoring and weather forecasts. Sanjeevan empowers users to make informed decisions about their health and outdoor activities by delivering accurate, location-based air quality data and comprehensive environmental insights.

**Sanjeevan** (Sanskrit: "life") is dedicated to helping you breathe cleaner and live healthier.

---

## Features ✨

- **Real-Time Air Quality Index (AQI)**: Get instant air quality readings for your current location or any city of your choice
- **Pollutant Breakdown**: Detailed information on PM2.5, PM10, NO₂, O₃, and other harmful pollutants
- **Weather Integration**: Current weather conditions, hourly forecasts, and climate data
- **Health Guidance**: AI-powered recommendations based on air quality levels
- **Pollution Sources**: Understand what's contributing to local air quality issues
- **Forecast Screen**: 7-day air quality and weather forecasts
- **Location Management**: Save and switch between multiple locations
- **Offline Support**: Cached data for offline access using AsyncStorage
- **Beautiful UI**: Modern, intuitive design with smooth animations and gradients

---

## Tech Stack 🛠️

### Frontend
- **React Native** 0.81.5
- **Expo** 54.0.34 - Fast development and deployment
- **TypeScript** 5.9.2 - Type-safe development
- **React Navigation** - Tab-based navigation
- **React Native Gesture Handler** - Touch and gesture support
- **React Native Reanimated** - Smooth animations

### APIs & Data
- **OpenAQ API** - Air quality data from global monitoring stations
- **Open-Meteo API** - Weather data (free, no API key required)

### Styling & Design
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Vector Icons** - Comprehensive icon library
- **Poppins & Inter Fonts** - Modern typography

### Storage
- **AsyncStorage** - Local data persistence

---

## Project Structure 📁

```
sanjeevan/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LocationModal.tsx
│   │   └── WeatherBackground.tsx
│   ├── context/             # React Context for state management
│   │   └── AirQualityDataContext.tsx
│   ├── data/                # Mock and sample data
│   │   └── mockData.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useAirQualityData.ts
│   ├── navigation/          # Navigation configuration
│   │   └── MainTabs.tsx
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx       # Main air quality display
│   │   ├── ForecastScreen.tsx   # 7-day forecast
│   │   ├── GuidanceScreen.tsx   # Health recommendations
│   │   ├── SourcesScreen.tsx    # Pollution sources
│   │   ├── ProfileScreen.tsx    # User preferences
│   │   └── OnboardingScreen.tsx # First-time setup
│   ├── services/            # API and business logic
│   │   ├── openaqService.ts
│   │   └── openMeteoService.ts
│   ├── storage/             # Data persistence
│   │   └── profile.ts
│   ├── utils/               # Utility functions
│   │   └── guidance.ts
│   ├── theme.ts             # Design tokens & styling
│   └── types.ts             # TypeScript type definitions
├── App.tsx                  # Root application component
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

---

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sanjeevan.git
   cd sanjeevan
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

### Running on Different Platforms

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

After running one of these commands, you can:
- Scan the QR code with your phone to open the app in the Expo Go app
- Or wait for the bundler to start and view the app on your device

---

## Environment Variables

The app uses the OpenAQ API with a built-in API key. For production deployment, consider:

1. Creating a `.env` file for sensitive keys
2. Moving the API key to a secure backend service
3. Implementing rate limiting and caching

---

## Key Screens Overview 📱

### Home Screen
Displays real-time AQI for the selected location with:
- Current AQI status and category
- Pollutant levels
- Current weather conditions
- Last updated timestamp

### Forecast Screen
Shows a 7-day forecast with:
- Expected AQI trends
- Weather predictions
- Air quality alerts

### Guidance Screen
Provides health recommendations:
- Activity suggestions based on AQI
- Health warnings for sensitive groups
- Indoor air quality tips

### Sources Screen
Details on pollution sources:
- Major contributors to local air quality
- Seasonal variations

### Profile Screen
User preferences and settings:
- Saved locations
- Notification preferences
- Unit selection (if applicable)

---

## API Integration 🔌

### OpenAQ API
- **Endpoint**: `https://api.openaq.org/v3`
- **Data**: Real-time and historical air quality data
- **Rate Limiting**: 1 request per 1.25 seconds (to avoid rate limits)
- **Caching**: 15-minute TTL with AsyncStorage

### Open-Meteo API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data**: Weather forecasts, current conditions
- **No API Key Required**: Free and open-source

---

## Development 💻

### Building & Compiling
- Development: `npm start`
- Build APK (Android): Use EAS Build or local build tools
- Build IPA (iOS): Use EAS Build or Xcode

### Type Checking
TypeScript is configured for strict type checking. Run type checks:
```bash
npx tsc --noEmit
```

### Code Structure Best Practices
- Components are functional and use React Hooks
- Context API for state management
- Separation of concerns (services, components, screens)
- Custom hooks for reusable logic

---

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Write meaningful commit messages
- Comment complex logic

---

## Known Limitations ⚠️

- Air quality data depends on OpenAQ's available monitoring stations
- Some regions may have limited data coverage
- Weather data has a ~7-day forecast limit
- Offline mode shows cached data only

---

## Future Enhancements 🔮

- [ ] Push notifications for high AQI alerts
- [ ] Indoor air quality tracking
- [ ] Social features to share location-based air quality data
- [ ] Historical air quality trends and analytics
- [ ] Integration with health tracking apps
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Air quality comparison between cities

---

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact & Support 📧

- **Issues**: Please report bugs via [GitHub Issues](https://github.com/yourusername/sanjeevan/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/sanjeevan/discussions)
- **Email**: your.email@example.com

---

## Acknowledgments 🙏

- **OpenAQ** for providing comprehensive air quality data
- **Open-Meteo** for free weather API
- **Expo** for streamlined React Native development
- **React Navigation** for excellent routing solutions

---

## Disclaimer ⚠️

The air quality data provided by Sanjeevan is for informational purposes only. Always consult official health authorities and environmental agencies for critical health decisions. While we strive for accuracy, the app relies on third-party data sources and should not be used as a sole basis for medical decisions.

---

Made with ❤️ for healthier breathing and informed living.
