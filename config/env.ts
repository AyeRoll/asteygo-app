import Constants from 'expo-constants';

type Extra = {
  geocodingProvider?: 'maps-co' | 'google' | 'mapbox';
  geocodeMapsApiKey?: string;
  googlePlacesApiKey?: string;
  mapboxAccessToken?: string;
};

export function getExtra(): Extra {
  // Expo SDK 49+: use expoConfig?.extra in dev, manifest?.extra in prod builds
  const extra = (Constants?.expoConfig?.extra || (Constants as any)?.manifest?.extra || {}) as Extra;
  return extra || {};
}
