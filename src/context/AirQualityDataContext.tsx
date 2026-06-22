import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getAirQualityBundle } from '../services/openaqService';
import {
  AQIReading,
  DetectedLocation,
  ForecastPoint,
  SourceShare,
  WeatherSnapshot,
} from '../types';

type AirQualityDataContextValue = {
  selectedLocation: DetectedLocation;
  aqiData: AQIReading | null;
  weatherData: WeatherSnapshot | null;
  forecastData: ForecastPoint[];
  sourcesData: SourceShare[];
  stationName: string;
  updatedAtUtc: string | null;
  sourceType: 'live' | 'cache' | 'fallback' | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AirQualityDataContext = createContext<AirQualityDataContextValue | null>(null);

type AirQualityDataProviderProps = {
  selectedLocation: DetectedLocation;
  children: ReactNode;
};

export function AirQualityDataProvider({ selectedLocation, children }: AirQualityDataProviderProps) {
  const [aqiData, setAqiData] = useState<AQIReading | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherSnapshot | null>(null);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [sourcesData, setSourcesData] = useState<SourceShare[]>([]);
  const [stationName, setStationName] = useState('');
  const [updatedAtUtc, setUpdatedAtUtc] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<'live' | 'cache' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (forceRefresh: boolean) => {
      try {
        setError(null);
        const bundle = await getAirQualityBundle(selectedLocation, forceRefresh);

        setAqiData(bundle.reading);
        setWeatherData(bundle.weather);
        setForecastData(bundle.forecast);
        setSourcesData(bundle.sources);
        setStationName(bundle.stationName);
        setUpdatedAtUtc(bundle.updatedAtUtc);
        setSourceType(bundle.source);

        if (bundle.source === 'fallback') {
          setError('Live data unavailable. Showing fallback insights.');
        }
      } catch {
        setError('Unable to update right now. Showing the most recent available data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedLocation]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        setLoading(true);
      }
      await load(false);
    };

    run();

    return () => {
      active = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
  }, [load]);

  const value = useMemo<AirQualityDataContextValue>(
    () => ({
      selectedLocation,
      aqiData,
      weatherData,
      forecastData,
      sourcesData,
      stationName,
      updatedAtUtc,
      sourceType,
      loading,
      refreshing,
      error,
      refresh,
    }),
    [
      selectedLocation,
      aqiData,
      weatherData,
      forecastData,
      sourcesData,
      stationName,
      updatedAtUtc,
      sourceType,
      loading,
      refreshing,
      error,
      refresh,
    ]
  );

  return <AirQualityDataContext.Provider value={value}>{children}</AirQualityDataContext.Provider>;
}

export function useAirQualityContext(): AirQualityDataContextValue {
  const context = useContext(AirQualityDataContext);
  if (!context) {
    throw new Error('useAirQualityContext must be used inside AirQualityDataProvider');
  }
  return context;
}
