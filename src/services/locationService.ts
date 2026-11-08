import * as Location from 'expo-location';
import { Coordinates } from '../types';

export const LOCATION_PRESETS: { name: string; coordinates: Coordinates }[] = [
  { name: 'Seattle, WA', coordinates: { latitude: 47.6062, longitude: -122.3321 } },
  { name: 'Manhattan, NY', coordinates: { latitude: 40.7580, longitude: -73.9855 } },
  { name: 'Brooklyn, NY', coordinates: { latitude: 40.6782, longitude: -73.9442 } },
  { name: 'San Francisco, CA', coordinates: { latitude: 37.7749, longitude: -122.4194 } },
  { name: 'Austin, TX', coordinates: { latitude: 30.2672, longitude: -97.7431 } },
  { name: 'Chicago, IL', coordinates: { latitude: 41.8781, longitude: -87.6298 } },
];

/**
 * Calculates geodesic distance between two points on Earth using Haversine formula in miles.
 */
export function calculateDistanceMiles(coord1: Coordinates, coord2: Coordinates): number {
  const earthRadiusMiles = 3958.8;

  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusMiles * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Request device GPS coordinates with fallback to Seattle default.
 */
export async function getCurrentDeviceLocation(): Promise<{ coordinates: Coordinates; name: string } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
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
    return null;
  }
}

