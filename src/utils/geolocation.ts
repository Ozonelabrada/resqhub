export interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
    country?: string;
  };
}

interface GeocoderResponse {
  address: Record<string, string | undefined>;
}

interface PhotonFeature {
  properties: Record<string, string | undefined>;
  geometry: {
    coordinates: [number, number];
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
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
          const data = (await response.json()) as GeocoderResponse;
          const address = data.address;

          resolve({
            latitude,
            longitude,
            city: address.city || address.town || address.village || address.suburb || '',
            state: address.state || '',
            country: address.country || ''
          });
        } catch (error) {
          // Fallback to just coordinates
          console.error('Reverse geocoding failed:', error);
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const url = `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=10&lang=en`;

    const response = await fetch(url);
    const data = (await response.json()) as PhotonResponse;

    if (data.features && Array.isArray(data.features)) {
      const results: LocationSuggestion[] = data.features
        .map((feature: PhotonFeature) => {
          const props = feature.properties;

          // Build full address from all available components
          const addressParts: string[] = [];

          // Add street/name first
          if (props.street) {
            addressParts.push(props.street);
          } else if (props.name) {
            addressParts.push(props.name);
          }

          // Add house number if available
          if (props.housenumber && addressParts.length > 0) {
            addressParts[0] = `${addressParts[0]} ${props.housenumber}`;
          }

          // Add locality/village
          if (props.village) {
            addressParts.push(props.village);
          } else if (props.suburb) {
            addressParts.push(props.suburb);
          } else if (props.town) {
            addressParts.push(props.town);
          }

          // Add city
          if (props.city) {
            addressParts.push(props.city);
          }

          // Add postal code
          if (props.postcode) {
            addressParts.push(props.postcode);
          }

          // Add state/province
          if (props.state) {
            addressParts.push(props.state);
          }

          // Add country
          if (props.country) {
            addressParts.push(props.country);
          }

          // Build display name (full address)
          const displayName = addressParts.join(', ') || props.name || 'Location';

          return {
            display_name: displayName,
            name: props.name,
            lat: String(feature.geometry.coordinates[1]),
            lon: String(feature.geometry.coordinates[0]),
            address: {
              city: props.city || undefined,
              town: props.town || undefined,
              village: props.village || undefined,
              suburb: props.suburb || undefined,
              state: props.state || undefined,
              country: props.country || undefined
            }
          };
        });

      return results;
    }

    return [];
  } catch (error) {
    console.error('Location search failed:', error);
    return [];
  }
};
