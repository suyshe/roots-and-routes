import { useCallback, useEffect, useState } from 'react';
import { api, isDemo } from '../services/api.js';

// Loads only API markers. Never substitute fake sample data on API errors.
export function useMarkers({ onError } = {}) {
  const [markers, setMarkers] = useState([]);
  const [demo, setDemo] = useState(false);

  const loadMarkers = useCallback(async () => {
    try {
      setMarkers(await api.markers());
    } catch (err) {
      onError?.(err);
    } finally {
      setDemo(isDemo());
    }
  }, [onError]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  return { markers, setMarkers, demo, loadMarkers };
}
