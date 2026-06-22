export type HealthCondition = 'None' | 'Asthma / Respiratory' | 'Heart Condition' | 'Allergies';
export type ActivityPattern = 'Mostly Indoor' | 'Mixed' | 'Mostly Outdoor';
export type NotificationPreference = 'Critical Alerts Only' | 'Daily Updates' | 'All Alerts';

export type UserProfile = {
  age: string;
  healthCondition: HealthCondition;
  activityPattern: ActivityPattern;
  dailyExposure: string;
  notificationPreference: NotificationPreference;
};

export type DetectedLocation = {
  label: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'preset' | 'fallback';
};

export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export type AQIReading = {
  location: string;
  currentAqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
};

export type ForecastPoint = {
  hourLabel: string;
  aqi: number;
};

export type SourceShare = {
  name: string;
  percentage: number;
};

export type WeatherCurrent = {
  temperature2m: number;
  windSpeed10m: number;
  relativeHumidity2m: number;
  windDirection10m: number;
};

export type WeatherDailyPoint = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
};

export type WeatherHourlyPoint = {
  time: string;
  temperature2m: number;
  relativeHumidity2m: number;
  windSpeed10m: number;
  windDirection10m: number;
};

export type WeatherSnapshot = {
  current: WeatherCurrent;
  hourly: WeatherHourlyPoint[];
  updatedAtUtc: string;
  source: 'live' | 'cache' | 'fallback';
};

export type AirQualityBundle = {
  reading: AQIReading;
  forecast: ForecastPoint[];
  sources: SourceShare[];
  weather: WeatherSnapshot;
  stationName: string;
  updatedAtUtc: string;
  source: 'live' | 'cache' | 'fallback';
};
