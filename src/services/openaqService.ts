import AsyncStorage from '@react-native-async-storage/async-storage';

import { getForecastByLocation, getReadingByLocation, getSourcesByLocation } from '../data/mockData';
import {
  AQICategory,
  AirQualityBundle,
  DetectedLocation,
  ForecastPoint,
  SourceShare,
  WeatherHourlyPoint,
} from '../types';
import { getWeatherSnapshot } from './openMeteoService';

const OPENAQ_API_KEY = 'f2bbbc36c01ac48f869db0f187974acb9cd6830939ee8035d1c1d8101f30c2f3';
const OPENAQ_BASE_URL = 'https://api.openaq.org/v3';
const CACHE_KEY = 'sanjeevan:openaq-cache:v2';
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_SPACING_MS = 1250;

type CityCoords = {
  lat: number;
  lon: number;
};

const CITY_COORDS: Record<string, CityCoords> = {
  Pune: { lat: 18.52, lon: 73.85 },
  'New Delhi': { lat: 28.6139, lon: 77.209 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
};

type OpenAQSensor = {
  id: number;
  name: string;
  parameter: {
    name: string;
    displayName: string | null;
    units: string;
  };
};

type OpenAQLocation = {
  id: number;
  name: string;
  country: {
    code: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  datetimeLast: {
    utc: string;
  } | null;
  sensors: OpenAQSensor[];
};

type OpenAQLocationsResponse = {
  results: OpenAQLocation[];
};

type OpenAQLatestResult = {
  sensorsId: number;
  value: number;
  datetime: {
    utc: string;
  };
};

type OpenAQLatestResponse = {
  results: OpenAQLatestResult[];
};

type PollutantLatest = {
  parameter: string;
  displayName: string;
  units: string;
  value: number;
  sensorId: number;
  updatedAtUtc: string;
};

type CacheEntry = {
  timestamp: number;
  data: AirQualityBundle;
};

let hydrated = false;
const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<AirQualityBundle>>();

let lastRequestTs = 0;
let blockedUntilTs = 0;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
}

function buildLocationKey(location: DetectedLocation): string {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
}

function distanceSq(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = aLat - bLat;
  const dLon = aLon - bLon;
  return dLat * dLat + dLon * dLon;
}

function nearestKnownCity(location: DetectedLocation): string {
  const candidates = Object.entries(CITY_COORDS)
    .map(([name, coords]) => ({
      name,
      dist: distanceSq(location.latitude, location.longitude, coords.lat, coords.lon),
    }))
    .sort((a, b) => a.dist - b.dist);

  return candidates[0]?.name ?? 'Pune';
}

function defaultWeatherSnapshot() {
  const now = Date.now();
  const time = [0, 24, 48, 72].map((offset) => new Date(now + offset * 60 * 60 * 1000).toISOString());
  return {
    current: {
      temperature2m: 28,
      windSpeed10m: 10,
      relativeHumidity2m: 55,
      windDirection10m: 160,
    },
    hourly: [
      {
        time: time[0],
        temperature2m: 28,
        relativeHumidity2m: 55,
        windSpeed10m: 10,
        windDirection10m: 160,
      },
      {
        time: time[1],
        temperature2m: 29,
        relativeHumidity2m: 58,
        windSpeed10m: 9,
        windDirection10m: 175,
      },
      {
        time: time[2],
        temperature2m: 30,
        relativeHumidity2m: 61,
        windSpeed10m: 8,
        windDirection10m: 185,
      },
      {
        time: time[3],
        temperature2m: 29,
        relativeHumidity2m: 57,
        windSpeed10m: 11,
        windDirection10m: 170,
      },
    ],
    updatedAtUtc: new Date().toISOString(),
    source: 'fallback' as const,
  };
}

function ensureBundleCompatibility(bundle: AirQualityBundle): AirQualityBundle {
  if (bundle.weather) {
    return bundle;
  }

  return {
    ...bundle,
    weather: defaultWeatherSnapshot(),
  };
}

async function hydrateCache(): Promise<void> {
  if (hydrated) {
    return;
  }

  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    Object.entries(parsed).forEach(([key, entry]) => {
      if (entry?.timestamp && entry?.data) {
        memoryCache.set(key, {
          timestamp: entry.timestamp,
          data: ensureBundleCompatibility(entry.data),
        });
      }
    });
  } catch {
    // Ignore cache hydration failures.
  }
}

async function persistCache(): Promise<void> {
  try {
    const entries = [...memoryCache.entries()]
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, 12);

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore cache persistence failures.
  }
}

async function enforceRequestPacing(): Promise<void> {
  const now = Date.now();

  if (blockedUntilTs > now) {
    await delay(blockedUntilTs - now);
  }

  const gap = now - lastRequestTs;
  if (gap < REQUEST_SPACING_MS) {
    await delay(REQUEST_SPACING_MS - gap);
  }

  lastRequestTs = Date.now();
}

function updateRateWindow(headers: Headers): void {
  const remaining = parseNumber(headers.get('x-ratelimit-remaining'), NaN);
  const resetInSeconds = parseNumber(headers.get('x-ratelimit-reset'), 0);

  if (Number.isFinite(remaining) && remaining <= 1 && resetInSeconds > 0) {
    blockedUntilTs = Math.max(blockedUntilTs, Date.now() + resetInSeconds * 1000);
  }
}

async function openaqGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      query.set(key, String(value));
    });
  }

  const url = query.size > 0 ? `${OPENAQ_BASE_URL}${path}?${query.toString()}` : `${OPENAQ_BASE_URL}${path}`;

  await enforceRequestPacing();

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': OPENAQ_API_KEY,
      },
    });

    updateRateWindow(response.headers);

    if (response.status === 429) {
      const retryAfter = parseNumber(response.headers.get('retry-after'), 30);
      blockedUntilTs = Math.max(blockedUntilTs, Date.now() + retryAfter * 1000);
      throw new Error('OpenAQ rate limit reached');
    }

    if (!response.ok) {
      throw new Error(`OpenAQ request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`OpenAQ API error at ${path}:`, error);
    throw error;
  }
}

function getFallbackBundle(location: DetectedLocation): AirQualityBundle {
  const nearest = nearestKnownCity(location);
  const reading = getReadingByLocation(nearest);

  return {
    reading: {
      ...reading,
      location: location.label,
    },
    forecast: getForecastByLocation(nearest),
    sources: getSourcesByLocation(nearest),
    weather: defaultWeatherSnapshot(),
    stationName: location.label,
    updatedAtUtc: new Date().toISOString(),
    source: 'fallback',
  };
}

function toAqiFromBreakpoint(cp: number, il: number, ih: number, bpl: number, bph: number): number {
  return Math.round(((ih - il) / (bph - bpl)) * (cp - bpl) + il);
}

function pm25ToAqi(pm25: number): number {
  if (pm25 <= 12.0) return toAqiFromBreakpoint(pm25, 0, 50, 0.0, 12.0);
  if (pm25 <= 35.4) return toAqiFromBreakpoint(pm25, 51, 100, 12.1, 35.4);
  if (pm25 <= 55.4) return toAqiFromBreakpoint(pm25, 101, 150, 35.5, 55.4);
  if (pm25 <= 150.4) return toAqiFromBreakpoint(pm25, 151, 200, 55.5, 150.4);
  if (pm25 <= 250.4) return toAqiFromBreakpoint(pm25, 201, 300, 150.5, 250.4);
  return toAqiFromBreakpoint(Math.min(pm25, 500.4), 301, 500, 250.5, 500.4);
}

function pm10ToAqi(pm10: number): number {
  if (pm10 <= 54) return toAqiFromBreakpoint(pm10, 0, 50, 0, 54);
  if (pm10 <= 154) return toAqiFromBreakpoint(pm10, 51, 100, 55, 154);
  if (pm10 <= 254) return toAqiFromBreakpoint(pm10, 101, 150, 155, 254);
  if (pm10 <= 354) return toAqiFromBreakpoint(pm10, 151, 200, 255, 354);
  if (pm10 <= 424) return toAqiFromBreakpoint(pm10, 201, 300, 355, 424);
  return toAqiFromBreakpoint(Math.min(pm10, 604), 301, 500, 425, 604);
}

function aqiCategoryFromValue(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  return 'Very Poor';
}

function clampAqi(value: number): number {
  return Math.max(0, Math.min(400, Math.round(value)));
}

function nearestHourlyPoint(hourly: WeatherHourlyPoint[], hoursAhead: number): WeatherHourlyPoint | null {
  if (!hourly.length) {
    return null;
  }

  const targetMs = Date.now() + hoursAhead * 60 * 60 * 1000;
  let nearest = hourly[0];
  let diff = Number.POSITIVE_INFINITY;

  hourly.forEach((point) => {
    const d = Math.abs(new Date(point.time).getTime() - targetMs);
    if (d < diff) {
      diff = d;
      nearest = point;
    }
  });

  return nearest;
}

function buildRuleBasedForecast(currentAqi: number, hourly: WeatherHourlyPoint[], fallback: ForecastPoint[]): ForecastPoint[] {
  if (!hourly.length) {
    return fallback;
  }

  const horizons = [0, 24, 48, 72];
  const labels = ['Now', '24h', '48h', '72h'];

  return horizons.map((h, index) => {
    const weather = nearestHourlyPoint(hourly, h);
    if (!weather) {
      return {
        hourLabel: labels[index],
        aqi: currentAqi,
      };
    }

    let adjustment = 0;

    if (weather.windSpeed10m >= 18) {
      adjustment -= 18;
    } else if (weather.windSpeed10m >= 12) {
      adjustment -= 9;
    }

    if (weather.windSpeed10m <= 6 && weather.relativeHumidity2m >= 70) {
      adjustment += 20;
    } else if (weather.windSpeed10m <= 10 && weather.relativeHumidity2m >= 60) {
      adjustment += 10;
    }

    if (weather.temperature2m >= 35) {
      adjustment += 4;
    }

    return {
      hourLabel: labels[index],
      aqi: clampAqi(currentAqi + adjustment),
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSourceBands(values: { Vehicles: number; Dust: number; Industry: number; Burning: number }): SourceShare[] {
  const bands = {
    Vehicles: { min: 30, max: 50 },
    Dust: { min: 20, max: 30 },
    Industry: { min: 10, max: 20 },
    Burning: { min: 10, max: 20 },
  };

  const current = {
    Vehicles: clamp(values.Vehicles, bands.Vehicles.min, bands.Vehicles.max),
    Dust: clamp(values.Dust, bands.Dust.min, bands.Dust.max),
    Industry: clamp(values.Industry, bands.Industry.min, bands.Industry.max),
    Burning: clamp(values.Burning, bands.Burning.min, bands.Burning.max),
  };

  let sum = current.Vehicles + current.Dust + current.Industry + current.Burning;

  const increaseOrder: Array<keyof typeof current> = ['Vehicles', 'Dust', 'Industry', 'Burning'];
  const decreaseOrder: Array<keyof typeof current> = ['Vehicles', 'Dust', 'Burning', 'Industry'];

  while (sum < 100) {
    let changed = false;
    for (const key of increaseOrder) {
      if (current[key] < bands[key].max) {
        current[key] += 1;
        sum += 1;
        changed = true;
      }
      if (sum >= 100) {
        break;
      }
    }
    if (!changed) {
      break;
    }
  }

  while (sum > 100) {
    let changed = false;
    for (const key of decreaseOrder) {
      if (current[key] > bands[key].min) {
        current[key] -= 1;
        sum -= 1;
        changed = true;
      }
      if (sum <= 100) {
        break;
      }
    }
    if (!changed) {
      break;
    }
  }

  return [
    { name: 'Vehicles', percentage: current.Vehicles },
    { name: 'Dust', percentage: current.Dust },
    { name: 'Industry', percentage: current.Industry },
    { name: 'Burning', percentage: current.Burning },
  ];
}

function buildSmartSources(currentAqi: number, weather: AirQualityBundle['weather']): SourceShare[] {
  let vehicles = 40;
  let dust = 25;
  let industry = 18;
  let burning = 17;

  if (currentAqi > 200) {
    vehicles -= 5;
    dust += 2;
    industry += 1;
    burning += 2;
  } else if (currentAqi > 120) {
    vehicles -= 2;
    dust += 1;
    burning += 1;
  }

  const wind = weather.current.windSpeed10m;
  const humidity = weather.current.relativeHumidity2m;

  if (wind >= 16) {
    dust -= 2;
    vehicles += 1;
    industry += 1;
  }

  if (wind <= 6) {
    dust += 2;
    vehicles -= 1;
  }

  if (humidity >= 70) {
    burning += 2;
    dust -= 1;
    vehicles -= 1;
  }

  return normalizeSourceBands({
    Vehicles: vehicles,
    Dust: dust,
    Industry: industry,
    Burning: burning,
  });
}

function parameterLabel(name: string, displayName: string): string {
  switch (name) {
    case 'pm25':
      return 'PM2.5';
    case 'pm10':
      return 'PM10';
    case 'o3':
      return 'O3';
    case 'no2':
      return 'NO2';
    case 'so2':
      return 'SO2';
    case 'co':
      return 'CO';
    default:
      return displayName || name.toUpperCase();
  }
}

function pickLatestByParameter(latest: OpenAQLatestResult[], sensorById: Map<number, OpenAQSensor>): PollutantLatest[] {
  const byParameter = new Map<string, PollutantLatest>();

  latest.forEach((item) => {
    const sensor = sensorById.get(item.sensorsId);
    if (!sensor) {
      return;
    }

    const parameter = sensor.parameter.name;
    const current = byParameter.get(parameter);
    const candidateTime = new Date(item.datetime.utc).getTime();
    const currentTime = current ? new Date(current.updatedAtUtc).getTime() : -1;

    if (!current || candidateTime >= currentTime) {
      byParameter.set(parameter, {
        parameter,
        displayName: parameterLabel(parameter, sensor.parameter.displayName || sensor.parameter.name),
        units: sensor.parameter.units,
        value: parseNumber(item.value),
        sensorId: item.sensorsId,
        updatedAtUtc: item.datetime.utc,
      });
    }
  });

  return [...byParameter.values()];
}

function pickBestLocation(location: DetectedLocation, locations: OpenAQLocation[]): OpenAQLocation | null {
  const ranked = locations
    .filter((item) => item.country.code === 'IN')
    .map((item) => {
      const hasPm25 = item.sensors.some((sensor) => sensor.parameter.name === 'pm25');
      const hasPm10 = item.sensors.some((sensor) => sensor.parameter.name === 'pm10');
      const freshness = item.datetimeLast ? new Date(item.datetimeLast.utc).getTime() : 0;
      const proximity = distanceSq(item.coordinates.latitude, item.coordinates.longitude, location.latitude, location.longitude);

      let score = 0;
      if (hasPm25) score += 5;
      if (hasPm10) score += 3;
      if (freshness > 0) score += 4;
      score -= proximity * 7;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item ?? null;
}

async function resolveLocationByCoordinates(location: DetectedLocation): Promise<OpenAQLocation | null> {
  const response = await openaqGet<OpenAQLocationsResponse>('/locations', {
    coordinates: `${location.latitude},${location.longitude}`,
    radius: 25000,
    limit: 100,
    page: 1,
  });

  if (!response.results?.length) {
    return null;
  }

  return pickBestLocation(location, response.results);
}

async function fetchLiveBundle(location: DetectedLocation, forceRefreshWeather = false): Promise<AirQualityBundle> {
  const fallback = getFallbackBundle(location);
  const weather = await getWeatherSnapshot(location, forceRefreshWeather);
  const openaqLocation = await resolveLocationByCoordinates(location);

  if (!openaqLocation) {
    return {
      ...fallback,
      weather,
    };
  }

  const latestResponse = await openaqGet<OpenAQLatestResponse>(`/locations/${openaqLocation.id}/latest`);
  const latestResults = latestResponse.results || [];

  if (!latestResults.length) {
    return {
      ...fallback,
      weather,
      stationName: openaqLocation.name,
    };
  }

  const sensorById = new Map<number, OpenAQSensor>();
  openaqLocation.sensors.forEach((sensor) => {
    sensorById.set(sensor.id, sensor);
  });

  const pollutantLatest = pickLatestByParameter(latestResults, sensorById);

  const pm25 = pollutantLatest.find((item) => item.parameter === 'pm25')?.value ?? fallback.reading.pm25;
  const pm10 = pollutantLatest.find((item) => item.parameter === 'pm10')?.value ?? fallback.reading.pm10;

  const currentAqi = Math.max(pm25ToAqi(pm25), pm10ToAqi(pm10));
  const category = aqiCategoryFromValue(currentAqi);
  const forecast = buildRuleBasedForecast(currentAqi, weather.hourly, fallback.forecast);
  const sources = buildSmartSources(currentAqi, weather);

  const updatedAtUtc = pollutantLatest
    .map((item) => item.updatedAtUtc)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || new Date().toISOString();

  return {
    reading: {
      location: location.label,
      currentAqi,
      category,
      pm25: Number(pm25.toFixed(1)),
      pm10: Number(pm10.toFixed(1)),
    },
    forecast,
    sources,
    weather,
    stationName: openaqLocation.name,
    updatedAtUtc,
    source: 'live',
  };
}

function withSource(data: AirQualityBundle, source: AirQualityBundle['source']): AirQualityBundle {
  const compatible = ensureBundleCompatibility(data);
  return {
    ...compatible,
    source,
  };
}

export async function getAirQualityBundle(location: DetectedLocation, forceRefresh = false): Promise<AirQualityBundle> {
  await hydrateCache();

  const key = buildLocationKey(location);
  const cached = memoryCache.get(key);
  const cacheAge = cached ? Date.now() - cached.timestamp : Number.POSITIVE_INFINITY;

  if (!forceRefresh && cached && cacheAge <= CACHE_TTL_MS) {
    return withSource(cached.data, 'cache');
  }

  const ongoing = inFlight.get(key);
  if (ongoing) {
    return ongoing;
  }

  const task = (async () => {
    try {
      const live = await fetchLiveBundle(location, forceRefresh);
      memoryCache.set(key, {
        timestamp: Date.now(),
        data: live,
      });
      await persistCache();
      return live;
    } catch {
      if (cached) {
        return withSource(cached.data, 'cache');
      }
      return getFallbackBundle(location);
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, task);
  return task;
}

export function formatUpdatedAgo(updatedAtUtc: string): string {
  const diffMs = Date.now() - new Date(updatedAtUtc).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Updated just now';
  }
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes}m ago`;
  }

  const hours = Math.round(diffMinutes / 60);
  return `Updated ${hours}h ago`;
}
