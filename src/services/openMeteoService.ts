import { DetectedLocation, WeatherSnapshot } from '../types';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_REQUEST_SPACING_MS = 1000;
const OPEN_METEO_CACHE_TTL_MS = 10 * 60 * 1000;

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
  };
};

type CacheEntry = {
  timestamp: number;
  value: WeatherSnapshot;
};

const inFlight = new Map<string, Promise<WeatherSnapshot>>();
const cache = new Map<string, CacheEntry>();

let lastRequestAtMs = 0;
let blockedUntilMs = 0;

const minuteCalls: number[] = [];
const hourCalls: number[] = [];
const dayCalls: number[] = [];
const monthCalls: number[] = [];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pruneWindow(now: number, bucket: number[], windowMs: number): void {
  while (bucket.length && now - bucket[0] >= windowMs) {
    bucket.shift();
  }
}

function guardrailWaitMs(now: number): number {
  pruneWindow(now, minuteCalls, 60_000);
  pruneWindow(now, hourCalls, 3_600_000);
  pruneWindow(now, dayCalls, 86_400_000);
  pruneWindow(now, monthCalls, 30 * 86_400_000);

  if (minuteCalls.length >= 600) {
    return 60_000 - (now - minuteCalls[0]);
  }
  if (hourCalls.length >= 5000) {
    return 3_600_000 - (now - hourCalls[0]);
  }
  if (dayCalls.length >= 10_000) {
    return 86_400_000 - (now - dayCalls[0]);
  }
  if (monthCalls.length >= 300_000) {
    return 30 * 86_400_000 - (now - monthCalls[0]);
  }

  return 0;
}

function registerCall(now: number): void {
  minuteCalls.push(now);
  hourCalls.push(now);
  dayCalls.push(now);
  monthCalls.push(now);
}

async function enforceOpenMeteoRatePolicy(): Promise<void> {
  const now = Date.now();

  if (blockedUntilMs > now) {
    await delay(blockedUntilMs - now);
  }

  const throttleGap = now - lastRequestAtMs;
  if (throttleGap < OPEN_METEO_REQUEST_SPACING_MS) {
    await delay(OPEN_METEO_REQUEST_SPACING_MS - throttleGap);
  }

  const guardWait = guardrailWaitMs(Date.now());
  if (guardWait > 0) {
    await delay(guardWait);
  }

  lastRequestAtMs = Date.now();
}

function buildLocationKey(location: DetectedLocation): string {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
}

function fallbackWeather(): WeatherSnapshot {
  const now = Date.now();
  const hours = [0, 24, 48, 72].map((offset) => {
    const d = new Date(now + offset * 60 * 60 * 1000);
    return d.toISOString();
  });

  return {
    current: {
      temperature2m: 28,
      windSpeed10m: 10,
      relativeHumidity2m: 55,
      windDirection10m: 160,
    },
    hourly: [
      {
        time: hours[0],
        temperature2m: 28,
        relativeHumidity2m: 55,
        windSpeed10m: 10,
        windDirection10m: 160,
      },
      {
        time: hours[1],
        temperature2m: 29,
        relativeHumidity2m: 58,
        windSpeed10m: 9,
        windDirection10m: 170,
      },
      {
        time: hours[2],
        temperature2m: 30,
        relativeHumidity2m: 60,
        windSpeed10m: 8,
        windDirection10m: 185,
      },
      {
        time: hours[3],
        temperature2m: 29,
        relativeHumidity2m: 57,
        windSpeed10m: 11,
        windDirection10m: 175,
      },
    ],
    updatedAtUtc: new Date().toISOString(),
    source: 'fallback',
  };
}

function round(value: number | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(1)) : fallback;
}

function findNearestIndex(timeList: string[], targetTime?: string): number {
  if (!targetTime || timeList.length === 0) {
    return Math.max(0, timeList.length - 1);
  }

  const exact = timeList.findIndex((item) => item === targetTime);
  if (exact >= 0) {
    return exact;
  }

  const targetMs = new Date(targetTime).getTime();
  let bestIndex = 0;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (let i = 0; i < timeList.length; i += 1) {
    const diff = Math.abs(new Date(timeList[i]).getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}

async function fetchOpenMeteo(location: DetectedLocation): Promise<WeatherSnapshot> {

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m',
    models: 'best_match',
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m',
    timezone: 'auto',
    forecast_days: '3',
  });

  await enforceOpenMeteoRatePolicy();

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${params.toString()}`);
  registerCall(Date.now());

  if (response.status === 429) {
    blockedUntilMs = Math.max(blockedUntilMs, Date.now() + 60_000);
    throw new Error('Open-Meteo rate limit reached');
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status}`);
  }

  const body = (await response.json()) as OpenMeteoResponse;
  const currentTime = body.current?.time;
  const hourlyTimeline = body.hourly?.time || [];
  const nearest = findNearestIndex(hourlyTimeline, currentTime);

  const humidity = body.current?.relative_humidity_2m ?? body.hourly?.relative_humidity_2m?.[nearest];
  const windDirection = body.current?.wind_direction_10m ?? body.hourly?.wind_direction_10m?.[nearest];

  const hourlyTime = body.hourly?.time || [];
  const hourlyTemp = body.hourly?.temperature_2m || [];
  const hourlyHumidity = body.hourly?.relative_humidity_2m || [];
  const hourlyWindSpeed = body.hourly?.wind_speed_10m || [];
  const hourlyWindDirection = body.hourly?.wind_direction_10m || [];

  const hourly = hourlyTime.slice(0, 72).map((time, index) => ({
    time,
    temperature2m: round(hourlyTemp[index], 0),
    relativeHumidity2m: round(hourlyHumidity[index], 0),
    windSpeed10m: round(hourlyWindSpeed[index], 0),
    windDirection10m: round(hourlyWindDirection[index], 0),
  }));

  return {
    current: {
      temperature2m: round(body.current?.temperature_2m, 0),
      windSpeed10m: round(body.current?.wind_speed_10m, 0),
      relativeHumidity2m: round(humidity, 0),
      windDirection10m: round(windDirection, 0),
    },
    hourly: hourly.length ? hourly : fallbackWeather().hourly,
    updatedAtUtc: new Date().toISOString(),
    source: 'live',
  };
}

function withSource(data: WeatherSnapshot, source: WeatherSnapshot['source']): WeatherSnapshot {
  return {
    ...data,
    source,
  };
}

export async function getWeatherSnapshot(location: DetectedLocation, forceRefresh = false): Promise<WeatherSnapshot> {
  const key = buildLocationKey(location);
  const cached = cache.get(key);
  const isFresh = cached && Date.now() - cached.timestamp <= OPEN_METEO_CACHE_TTL_MS;

  if (!forceRefresh && isFresh) {
    return withSource(cached.value, 'cache');
  }

  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }

  const task = (async () => {
    try {
      const live = await fetchOpenMeteo(location);
      cache.set(key, {
        timestamp: Date.now(),
        value: live,
      });
      return live;
    } catch {
      if (cached) {
        return withSource(cached.value, 'cache');
      }
      return fallbackWeather();
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, task);
  return task;
}
