'use client';

import { useCallback, useEffect, useState } from 'react';
import { requestJson } from '../../utils/requestCache';

const REFRESH_INTERVAL = 30_000;

function getMarkerArray(data) {
    if (Array.isArray(data?.markers)) {
        return data.markers;
    }

    if (Array.isArray(data)) {
        return data;
    }

    return [];
}

function getMapConfig(data) {
    if (data?.map && typeof data.map === 'object') {
        return data.map;
    }

    if (
        data?.maps &&
        data?.defaultMap &&
        data.maps[data.defaultMap]
    ) {
        return data.maps[data.defaultMap];
    }

    if (data?.maps && typeof data.maps === 'object') {
        const firstMap = Object.values(data.maps)[0];

        if (firstMap) {
            return firstMap;
        }
    }

    if (data?.config && typeof data.config === 'object') {
        return data.config;
    }

    return null;
}

export default function useMapData(mapName = 'HaggaBasin') {
    const [mapConfig, setMapConfig] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadMap = useCallback(async () => {
        try {
            setLoading(true);

            const data = await requestJson(
                `/api/map?map=${encodeURIComponent(mapName)}`,
                {
                    ttl: REFRESH_INTERVAL,
                }
            );

            if (!data?.ok) {
                throw new Error(
                    data?.error ||
                    'Map API returned an error.'
                );
            }

            const map = getMapConfig(data);
            const rows = getMarkerArray(data);

            if (!map) {
                throw new Error(
                    'Map API did not return a map configuration.'
                );
            }

            setMapConfig(map);
            setMarkers(rows);
            setError('');
        } catch (err) {
            if (err?.name === 'AbortError') {
                return;
            }

            if (err?.status === 401) {
                window.location.href = '/auth/login';
                return;
            }

            setError(
                err?.message ||
                'Unable to load map data.'
            );
        } finally {
            setLoading(false);
        }
    }, [mapName]);

    useEffect(() => {
        void loadMap();

        const interval = window.setInterval(() => {
            if (!document.hidden) void loadMap();
        }, REFRESH_INTERVAL);

        const handleVisibilityChange = () => {
            if (!document.hidden) void loadMap();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadMap]);

    const reload = useCallback(() => {
        void loadMap();
    }, [loadMap]);

    return {
        mapConfig,
        markers,
        error,
        loading,
        loadMap,
        reload,
    };
}
