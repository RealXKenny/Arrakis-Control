import { useEffect, useRef, useState } from 'react';

import { REFRESH_INTERVAL } from '../config/progression';
import { extractBases, getBaseId } from '../utils/bases';
import { requestJson } from '../../utils/requestCache';

export function usePlayerData() {

  const [player, setPlayer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [statusLoading, setStatusLoading] =
    useState(false);

  const refreshInProgress = useRef(false);
  const mounted = useRef(true);

  const [basesTelemetry, setBasesTelemetry] =
    useState({});

  const [basesLoading, setBasesLoading] =
    useState(false);

  const [baseTab, setBaseTab] =
    useState('owned');

  const [vehicleTab, setVehicleTab] =
    useState('owned');

  async function loadBaseTelemetry(bases) {
    if (
      !Array.isArray(bases) ||
      bases.length === 0
    ) {
      setBasesTelemetry({});
      setBasesLoading(false);
      return;
    }

    setBasesLoading(true);

    const results = bases.map((base) => {
      const baseId = getBaseId(base);
      return {
        id: baseId,
        water: base?.water ?? base?.waterData ?? base?.waterSummary ?? null,
        inventory: base?.inventory ?? base?.inventoryData ?? null,
        waterError: null,
        inventoryError: null,
      };
    });

    const nextTelemetry = {};

    for (const result of results) {
      if (result.id) {
        nextTelemetry[result.id] =
          result;
      }
    }

    if (mounted.current) {
      setBasesTelemetry(nextTelemetry);
    }

    if (mounted.current) {
      setBasesLoading(false);
    }
  }

  async function loadPlayerData(showLoading = false) {
    if (refreshInProgress.current) {
      return;
    }

    refreshInProgress.current = true;

    try {
      if (showLoading) {
        setLoading(true);
      }

      setStatusLoading(true);

      const data = await requestJson('/api/player', {
        ttl: REFRESH_INTERVAL,
      });

      if (!mounted.current) {
        return;
      }

      if (data?.error === 'Unauthorized' || data?.error === 'Session expired or invalid') {
        window.location.href = '/auth/login';
        return;
      }
      const bases = extractBases(data);

      /*
      * Keep the old telemetry visible.
      * This prevents cards from disappearing/reappearing
      * during refresh.
      */
      setPlayer(data);

      await loadBaseTelemetry(bases);
    } catch (error) {
      if (error?.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      console.error(
        'Failed to fetch player data:',
        error
      );
    } finally {
      if (mounted.current) {
        setStatusLoading(false);
      }
      refreshInProgress.current = false;

      if (showLoading && mounted.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    mounted.current = true;

    async function initialLoad() {
      if (cancelled) {
        return;
      }

      await loadPlayerData(true);
    }

    initialLoad();

    const interval = setInterval(() => {
      if (!cancelled) {
        loadPlayerData(false);
      }
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);
  return {
    player,
    loading,
    statusLoading,
    basesTelemetry,
    basesLoading,
    baseTab,
    setBaseTab,
    vehicleTab,
    setVehicleTab,
  };
}
