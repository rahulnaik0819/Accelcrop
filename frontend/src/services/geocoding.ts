export interface GeocodingResult {
  place_id: number;
  display_name: string;
  name: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  boundingbox?: string[];
}

export async function searchWorldwideLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AgriVision-Platform/2.0',
      },
    });

    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json();

    return data.map((item) => {
      const address = item.address || {};
      const locality =
        address.village ||
        address.town ||
        address.city ||
        address.county ||
        address.state_district ||
        item.display_name.split(',')[0];

      const region = address.state || address.region || address.country || '';
      const country = address.country || '';

      return {
        place_id: item.place_id,
        display_name: item.display_name,
        name: locality,
        state: region,
        country: country,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        boundingbox: item.boundingbox,
      };
    });
  } catch (err) {
    console.warn('[Geocoding] Nominatim query failed, using local presets fallback:', err);
    return PRESET_WORLDWIDE_LOCATIONS.filter((loc) =>
      loc.display_name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const PRESET_WORLDWIDE_LOCATIONS: GeocodingResult[] = [
  { place_id: 1, name: 'Ludhiana Farmlands', state: 'Punjab', country: 'India', lat: 30.901, lng: 75.857, display_name: 'Ludhiana, Punjab, India' },
  { place_id: 2, name: 'Bathinda Agro Belt', state: 'Punjab', country: 'India', lat: 30.211, lng: 74.9455, display_name: 'Bathinda, Punjab, India' },
  { place_id: 3, name: 'Karnal Rice Belt', state: 'Haryana', country: 'India', lat: 29.6857, lng: 76.9905, display_name: 'Karnal, Haryana, India' },
  { place_id: 4, name: 'Coimbatore Farmlands', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558, display_name: 'Coimbatore, Tamil Nadu, India' },
  { place_id: 5, name: 'Nashik Grape Valley', state: 'Maharashtra', country: 'India', lat: 19.9975, lng: 73.7898, display_name: 'Nashik, Maharashtra, India' },
  { place_id: 6, name: 'Thanjavur Delta', state: 'Tamil Nadu', country: 'India', lat: 10.787, lng: 79.1378, display_name: 'Thanjavur, Tamil Nadu, India' },
  { place_id: 7, name: 'Guntur Chilli Belt', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365, display_name: 'Guntur, Andhra Pradesh, India' },
  { place_id: 8, name: 'Iowa Corn Belt', state: 'Iowa', country: 'USA', lat: 41.878, lng: -93.0977, display_name: 'Ames, Iowa, United States' },
  { place_id: 9, name: 'Mato Grosso Soy Corridor', state: 'Mato Grosso', country: 'Brazil', lat: -12.6819, lng: -55.8428, display_name: 'Sinop, Mato Grosso, Brazil' },
  { place_id: 10, name: 'Bordeaux Vineyards', state: 'Nouvelle-Aquitaine', country: 'France', lat: 44.8378, lng: -0.5792, display_name: 'Bordeaux, France' },
];
