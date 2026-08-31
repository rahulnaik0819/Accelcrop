import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center: [number, number];
  zoom?: number;
}

export default function MapController({ center, zoom = 15 }: MapControllerProps) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    if (!map || !center || typeof center[0] !== 'number' || typeof center[1] !== 'number' || isNaN(center[0]) || isNaN(center[1])) {
      return;
    }

    const prevCenter = prevCenterRef.current;
    if (prevCenter && typeof prevCenter[0] === 'number' && typeof prevCenter[1] === 'number') {
      const [prevLat, prevLng] = prevCenter;
      const [newLat, newLng] = center;

      if (Math.abs(prevLat - newLat) > 0.00005 || Math.abs(prevLng - newLng) > 0.00005) {
        prevCenterRef.current = center;
        map.flyTo(center, zoom, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    } else {
      prevCenterRef.current = center;
      map.setView(center, zoom);
    }

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) {
        console.warn('[MapController] invalidateSize error:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
}
