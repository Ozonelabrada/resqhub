export interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export const getGeolocation = (): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding using OpenStreetMap Nominatim API (free, no key required for low volume)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          const address = data.address;

          resolve({
            latitude,
            longitude,
            city: address.city || address.town || address.village || address.suburb || '',
            state: address.state || '',
            country: address.country || ''
          });
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export interface LocationSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        state?: string;
        country?: string;
    };
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) return [];
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=ph`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Location search failed:', error);
        return [];
    }
};
