import { AQIReading, ForecastPoint, SourceShare } from '../types';

export const availableLocations = ['Pune', 'New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'];

const aqiByLocation: Record<string, AQIReading> = {
  Pune: {
    location: 'Pune',
    currentAqi: 92,
    category: 'Moderate',
    pm25: 41,
    pm10: 68,
  },
  'New Delhi': {
    location: 'New Delhi',
    currentAqi: 186,
    category: 'Poor',
    pm25: 94,
    pm10: 162,
  },
  Mumbai: {
    location: 'Mumbai',
    currentAqi: 112,
    category: 'Moderate',
    pm25: 48,
    pm10: 89,
  },
  Bengaluru: {
    location: 'Bengaluru',
    currentAqi: 84,
    category: 'Moderate',
    pm25: 38,
    pm10: 62,
  },
  Kolkata: {
    location: 'Kolkata',
    currentAqi: 154,
    category: 'Poor',
    pm25: 77,
    pm10: 121,
  },
};

const forecastByLocation: Record<string, ForecastPoint[]> = {
  Pune: [
    { hourLabel: 'Now', aqi: 92 },
    { hourLabel: '6h', aqi: 88 },
    { hourLabel: '12h', aqi: 97 },
    { hourLabel: '24h', aqi: 90 },
    { hourLabel: '48h', aqi: 84 },
    { hourLabel: '72h', aqi: 79 },
  ],
  'New Delhi': [
    { hourLabel: 'Now', aqi: 186 },
    { hourLabel: '6h', aqi: 179 },
    { hourLabel: '12h', aqi: 192 },
    { hourLabel: '24h', aqi: 168 },
    { hourLabel: '48h', aqi: 149 },
    { hourLabel: '72h', aqi: 132 },
  ],
  Mumbai: [
    { hourLabel: 'Now', aqi: 112 },
    { hourLabel: '6h', aqi: 106 },
    { hourLabel: '12h', aqi: 98 },
    { hourLabel: '24h', aqi: 104 },
    { hourLabel: '48h', aqi: 96 },
    { hourLabel: '72h', aqi: 88 },
  ],
  Bengaluru: [
    { hourLabel: 'Now', aqi: 84 },
    { hourLabel: '6h', aqi: 80 },
    { hourLabel: '12h', aqi: 76 },
    { hourLabel: '24h', aqi: 81 },
    { hourLabel: '48h', aqi: 72 },
    { hourLabel: '72h', aqi: 68 },
  ],
  Kolkata: [
    { hourLabel: 'Now', aqi: 154 },
    { hourLabel: '6h', aqi: 147 },
    { hourLabel: '12h', aqi: 160 },
    { hourLabel: '24h', aqi: 142 },
    { hourLabel: '48h', aqi: 131 },
    { hourLabel: '72h', aqi: 124 },
  ],
};

const sourcesByLocation: Record<string, SourceShare[]> = {
  Pune: [
    { name: 'Vehicles', percentage: 33 },
    { name: 'Industry', percentage: 22 },
    { name: 'Dust', percentage: 27 },
    { name: 'Burning', percentage: 18 },
  ],
  'New Delhi': [
    { name: 'Vehicles', percentage: 34 },
    { name: 'Industry', percentage: 25 },
    { name: 'Dust', percentage: 23 },
    { name: 'Burning', percentage: 18 },
  ],
  Mumbai: [
    { name: 'Vehicles', percentage: 37 },
    { name: 'Industry', percentage: 21 },
    { name: 'Dust', percentage: 25 },
    { name: 'Burning', percentage: 17 },
  ],
  Bengaluru: [
    { name: 'Vehicles', percentage: 29 },
    { name: 'Industry', percentage: 24 },
    { name: 'Dust', percentage: 31 },
    { name: 'Burning', percentage: 16 },
  ],
  Kolkata: [
    { name: 'Vehicles', percentage: 31 },
    { name: 'Industry', percentage: 27 },
    { name: 'Dust', percentage: 19 },
    { name: 'Burning', percentage: 23 },
  ],
};

export const getReadingByLocation = (location: string): AQIReading =>
  aqiByLocation[location] ?? aqiByLocation['New Delhi'];

export const getForecastByLocation = (location: string): ForecastPoint[] =>
  forecastByLocation[location] ?? forecastByLocation['New Delhi'];

export const getSourcesByLocation = (location: string): SourceShare[] =>
  sourcesByLocation[location] ?? sourcesByLocation['New Delhi'];

export const getHealthGuidance = (category: string): string[] => {
  switch (category) {
    case 'Good':
      return ['Air quality is considered satisfactory, and air pollution poses little or no risk.', 'It is a great day to be active outside.'];
    case 'Moderate':
      return ['Air quality is acceptable; however, for some pollutants there may be a moderate health concern.', 'Unusually sensitive people should consider reducing prolonged or heavy exertion.'];
    case 'Poor':
      return ['Members of sensitive groups may experience health effects.', 'The general public is not likely to be affected.', 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.'];
    default:
      return ['Everyone may begin to experience health effects.', 'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion.'];
  }
};
