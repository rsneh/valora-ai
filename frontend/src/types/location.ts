export interface Location {
  location_text?: string;
  latitude?: number;
  longitude?: number;
  location_source?: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}