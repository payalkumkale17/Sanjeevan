import { useCallback, useEffect, useState } from 'react';

import { AirQualityBundle, DetectedLocation } from '../types';
import { getAirQualityBundle } from '../services/openaqService';

type UseAirQualityState = {
  data: AirQualityBundle | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAirQualityData(selectedLocation: DetectedLocation): UseAirQualityState {
  const [data, setData] = useState<AirQualityBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (forceRefresh: boolean) => {
      try {
        setError(null);
        const next = await getAirQualityBundle(selectedLocation, forceRefresh);
        setData(next);
        if (next.source === 'fallback') {
          setError('Live data unavailable. Showing fallback data.');
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
    let mounted = true;

    const run = async () => {
      if (mounted) {
        setLoading(true);
      }
      await load(false);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
}
