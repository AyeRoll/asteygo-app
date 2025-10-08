import { getExtra } from '../config/env';

export type PlaceSuggestion = {
  id: string;
  label: string;
  lat?: number;
  lon?: number;
  raw?: any;
};

async function searchMapsCo(query: string, apiKey?: string): Promise<PlaceSuggestion[]> {
  const url = new URL('https://geocode.maps.co/search');
  url.searchParams.set('q', query);
  if (apiKey) url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`maps.co error ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.slice(0, 5).map((d: any, idx: number) => ({
    id: String(d.place_id ?? idx),
    label: d.display_name ?? `${d.name ?? d.address ?? 'Unknown'} ${d.country ?? ''}`.trim(),
    lat: d.lat ? Number(d.lat) : undefined,
    lon: d.lon ? Number(d.lon) : undefined,
    raw: d,
  }));
}

// Placeholders for other providers if/when you switch
async function searchMapbox(query: string, token?: string): Promise<PlaceSuggestion[]> {
  if (!token) return [];
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('autocomplete', 'true');
  url.searchParams.set('access_token', token);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`mapbox error ${res.status}`);
  const data = await res.json();
  const features = data?.features ?? [];
  return features.map((f: any) => ({
    id: f.properties?.mapbox_id ?? f.id,
    label: f.properties?.full_address ?? f.properties?.place_formatted ?? f.properties?.name ?? 'Unknown',
    lat: f.properties?.coordinates?.latitude ?? f.geometry?.coordinates?.[1],
    lon: f.properties?.coordinates?.longitude ?? f.geometry?.coordinates?.[0],
    raw: f,
  }));
}

async function searchGooglePlaces(query: string, key?: string): Promise<PlaceSuggestion[]> {
  // Note: This uses legacy HTTP Autocomplete. For production, consider new Places API.
  if (!key) return [];
  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', query);
  url.searchParams.set('key', key);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`google places error ${res.status}`);
  const data = await res.json();
  const preds = data?.predictions ?? [];
  return preds.slice(0, 5).map((p: any) => ({
    id: p.place_id,
    label: p.description,
    raw: p,
  }));
}

export async function geocodeSearch(query: string): Promise<PlaceSuggestion[]> {
  const { geocodingProvider = 'maps-co', geocodeMapsApiKey, mapboxAccessToken, googlePlacesApiKey } = getExtra();
  if (!query?.trim()) return [];
  const q = query.trim();
  switch (geocodingProvider) {
    case 'mapbox':
      return searchMapbox(q, mapboxAccessToken);
    case 'google':
      return searchGooglePlaces(q, googlePlacesApiKey);
    case 'maps-co':
    default:
      return searchMapsCo(q, geocodeMapsApiKey);
  }
}

// Tiny debounce helper for hooks/components
export function debounce<T extends (...args: any[]) => Promise<any>>(fn: T, wait = 300) {
  let t: any;
  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> =>
    new Promise((resolve, reject) => {
      if (t) clearTimeout(t);
      t = setTimeout(async () => {
        try {
          const out = await fn(...args);
          resolve(out as Awaited<ReturnType<T>>);
        } catch (e) {
          reject(e);
        }
      }, wait);
    });
}
