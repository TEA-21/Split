import * as Location from 'expo-location';
import { Coordinates } from '../types';

export const LOCATION_PRESETS: { name: string; coordinates: Coordinates }[] = [
  { name: 'Bengaluru, KA', coordinates: { latitude: 12.9716, longitude: 77.5946 } },
  { name: 'Mumbai, MH', coordinates: { latitude: 19.0760, longitude: 72.8777 } },
  { name: 'Delhi NCR (Gurgaon / Noida)', coordinates: { latitude: 28.4595, longitude: 77.0266 } },
  { name: 'Pune, MH', coordinates: { latitude: 18.5204, longitude: 73.8567 } },
  { name: 'Hyderabad, TS', coordinates: { latitude: 17.3850, longitude: 78.4867 } },
  { name: 'Chennai, TN', coordinates: { latitude: 13.0827, longitude: 80.2707 } },
];

/**
 * Calculates geodesic distance between two points on Earth using Haversine formula in kilometers.
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const earthRadiusKm = 6371.0;
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 10) / 10;
}

/**
 * Calculates geodesic distance between two points on Earth in miles (backward compat).
 */
export function calculateDistanceMiles(coord1: Coordinates, coord2: Coordinates): number {
  return Math.round((calculateDistanceKm(coord1, coord2) / 1.60934) * 10) / 10;
}

/**
 * Request device GPS coordinates with fallback to Bengaluru default.
 */
export async function getCurrentDeviceLocation(): Promise<{ coordinates: Coordinates; name: string } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        coordinates: { latitude: 12.9352, longitude: 77.6245 },
        name: 'Bengaluru, KA',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords: Coordinates = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    let name = 'Current Location';
    try {
      const reverse = await Location.reverseGeocodeAsync(coords);
      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        name = [item.city || item.subregion, item.region].filter(Boolean).join(', ');
      }
    } catch {
      // Ignore geocode failure
    }

    return { coordinates: coords, name: name || 'Current Vicinity' };
  } catch (error) {
    console.warn('Location retrieval error:', error);
    return {
      coordinates: { latitude: 12.9352, longitude: 77.6245 },
      name: 'Bengaluru, KA',
    };
  }
}
