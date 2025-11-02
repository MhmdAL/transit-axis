// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface Vehicle {
  id: string;
  fleetNo: string;
  plateNo: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleTelemetry {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  timestamp: string;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

    try {
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      };

      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP Error ${response.status}`,
        }));
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  // Vehicle API methods
  async getVehicles(params?: { page?: number; limit?: number; search?: string }): Promise<Vehicle[]> {
    try {
      const response = await this.get<ApiResponse<Vehicle[]> | PaginatedResponse<Vehicle>>(
        '/api/vehicles',
        params
      );
      
      if ('pagination' in response) {
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async searchVehicles(searchTerm: string, limit: number = 50): Promise<Vehicle[]> {
    try {
      return await this.getVehicles({
        search: searchTerm,
        limit,
      });
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      const response = await this.get<ApiResponse<Vehicle>>(`/api/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      return await this.getVehicles({ limit: 1000 });
    } catch (error) {
      console.error('Error fetching all vehicles:', error);
      throw error;
    }
  }

  // Route API methods
  async searchRoutes(searchTerm: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await this.get<ApiResponse<any[]>>(
        '/api/routes',
        { search: searchTerm, limit }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching routes:', error);
      throw error;
    }
  }

  async getAllRoutes(): Promise<any[]> {
    try {
      const response = await this.get<ApiResponse<any[]>>(
        '/api/routes',
        { limit: 1000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all routes:', error);
      throw error;
    }
  }

  async getRouteStops(routeId: string): Promise<any[]> {
    try {
      const response = await this.get<ApiResponse<any[]>>(
        `/api/routes/${routeId}/stops`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching route stops:', error);
      throw error;
    }
  }

  async getVehicleTrips(vehicleId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.get<ApiResponse<any[]>>(
        `/api/trips`,
        { vehicleId, limit }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle trips:', error);
      throw error;
    }
  }

  async getTripTelemetry(tripId: string): Promise<any[]> {
    try {
      const response = await this.get<ApiResponse<any[]>>(
        `/api/trips/${tripId}/telemetry`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trip telemetry:', error);
      throw error;
    }
  }

  async getTripPath(tripId: string): Promise<any> {
    try {
      const response = await this.get<ApiResponse<any>>(
        `/api/tracking/trips/${tripId}/path`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trip path:', error);
      throw error;
    }
  }

  async getTimeRangePath(vehicleId: string, startTime: string, endTime: string): Promise<any> {
    try {
      const response = await this.get<ApiResponse<any>>(
        `/api/tracking/vehicles/${vehicleId}/path`,
        { startTime, endTime }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching time range path:', error);
      throw error;
    }
  }

  // Telemetry API methods
  async getVehiclesTelemetry(vehicleIds: string[]): Promise<VehicleTelemetry[]> {
    try {
      const response = await this.post<ApiResponse<VehicleTelemetry[]>>(
        '/api/tracking/vehicles-telemetry',
        { vehicleIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles telemetry:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

export { ApiService };
export default apiService;

