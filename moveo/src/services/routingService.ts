import polyline from '@mapbox/polyline';

// OpenRouteService configuration
// You can get a free API key from https://openrouteservice.org/dev/#/signup
const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFiNjEwZDUxYmQ0YzQ0NWE4N2EzOGExZDVkNWZiMzA4IiwiaCI6Im11cm11cjY0In0='; // Demo key (limited usage)
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteResponse {
  coordinates: RouteCoordinate[];
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: string; // raw encoded polyline from ORS
}

export class RoutingService {
  /**
   * Calculate route between multiple waypoints using OpenRouteService
   * @param waypoints Array of coordinates in order
   * @param signal Optional AbortSignal for request cancellation
   * @returns Promise with route coordinates and metadata
   */
  static async calculateRoute(waypoints: RouteCoordinate[], signal?: AbortSignal): Promise<RouteResponse | null> {
    if (waypoints.length < 2) {
      return null;
    }

    try {
      // Convert coordinates to ORS format [lng, lat]
      const coordinates = waypoints.map(point => [point.lng, point.lat]);

      const requestBody = {
        coordinates: coordinates
      };

      const response = await fetch(`${ORS_BASE_URL}/driving-car?api_key=${ORS_API_KEY}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(requestBody),
        signal // Add AbortSignal to the fetch request
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ORS API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Debug: log the response structure
      // console.log('ORS API Response:', JSON.stringify(data, null, 2));

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
                
        // Check if geometry exists and what format it's in
        if (!route.geometry) {
          console.error('No geometry found in route');
          return null;
        }
        
        let routeCoordinates: RouteCoordinate[] = [];
        
        // Handle different possible geometry formats
        if (route.geometry.coordinates && Array.isArray(route.geometry.coordinates)) {
          // GeoJSON format with coordinate array
          routeCoordinates = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
              lng: coord[0],
              lat: coord[1]
            })
          );
        } else if (typeof route.geometry === 'string') {
          // Encoded polyline format - decode it
          // console.log('Decoding polyline:', route.geometry);
          try {
            const decodedCoords = polyline.decode(route.geometry);
            routeCoordinates = decodedCoords.map(
              (coord: [number, number]) => ({
                lat: coord[0], // polyline.decode returns [lat, lng]
                lng: coord[1]
              })
            );
            // console.log('Successfully decoded', routeCoordinates.length, 'coordinates');
          } catch (error) {
            console.error('Failed to decode polyline:', error);
            // Fallback to straight line
            return {
              coordinates: waypoints,
              distance: route.summary?.distance || 0,
              duration: route.summary?.duration || 0,
              geometry: route.geometry
            };
          }
        } else {
          console.error('Unknown geometry format:', route.geometry);
          return null;
        }

        return {
          coordinates: routeCoordinates,
          distance: route.summary.distance,
          duration: route.summary.duration,
          geometry: route.geometry // Include the raw encoded polyline
        };
      }

      return null;
    } catch (error) {
      console.error('Error calculating route:', error);
      
      // Fallback to straight line if routing fails
      return {
        coordinates: waypoints,
        distance: 0,
        duration: 0,
        geometry: undefined
      };
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Used as fallback when routing service is unavailable
   */
  static calculateStraightLineDistance(point1: RouteCoordinate, point2: RouteCoordinate): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
