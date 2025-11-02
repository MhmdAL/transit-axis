import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError, 
  RequestOptions, 
  ListQueryParams,
  DutyQueryParams,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  CreateDriverRequest,
  UpdateDriverRequest,
  CreateRouteRequest,
  UpdateRouteRequest,
  CreateStopRequest,
  UpdateStopRequest,
  CreateTripRequest,
  UpdateTripRequest,
  AssignVehicleRequest,
  AssignDriverRequest,
  CreateServiceScheduleRequest,
  UpdateServiceScheduleRequest,
  CreateDutyRequest,
  UpdateDutyRequest,
  CreateBulkTripDutiesRequest,
  BulkUpdateDutyAssignmentsRequest,
  CreateDutyTemplateRequest,
  UpdateDutyTemplateRequest,
  DutyTemplateQueryParams
} from '../types/api';
import { Vehicle, Driver, Route, Stop, Trip, DashboardStats, VehicleModel, User, ServiceSchedule, Duty, TripDuty, DutyTemplate } from '../types';

// HTTP Client class
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
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
        const errorData: ApiError = await response.json().catch(() => ({
          message: `HTTP Error ${response.status}`,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
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

  async get<T>(endpoint: string, params?: ListQueryParams): Promise<T> {
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

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API Service class
class ApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
  }

  // Vehicles API
  async getVehicles(params?: ListQueryParams): Promise<Vehicle[]> {
    const response = await this.client.get<ApiResponse<Vehicle[]> | PaginatedResponse<Vehicle>>(
      API_ENDPOINTS.VEHICLES, 
      params
    );
    return 'pagination' in response ? response.data : response.data;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await this.client.get<ApiResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
    return response.data;
  }

  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await this.client.post<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES, data);
    return response.data;
  }

  async updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await this.client.put<ApiResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
  }

  // Drivers API
  async getDrivers(params?: ListQueryParams): Promise<Driver[]> {
    const response = await this.client.get<ApiResponse<Driver[]> | PaginatedResponse<Driver>>(
      API_ENDPOINTS.DRIVERS, 
      params
    );
    return 'pagination' in response ? response.data : response.data;
  }

  async getDriverById(id: string): Promise<Driver> {
    const response = await this.client.get<ApiResponse<Driver>>(`${API_ENDPOINTS.DRIVERS}/${id}`);
    return response.data;
  }

  async createDriver(data: CreateDriverRequest): Promise<Driver> {
    const response = await this.client.post<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS, data);
    return response.data;
  }

  async updateDriver(id: string, data: CreateDriverRequest): Promise<Driver> {
    const response = await this.client.put<ApiResponse<Driver>>(`${API_ENDPOINTS.DRIVERS}/${id}`, data);
    return response.data;
  }

  async deleteDriver(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.DRIVERS}/${id}`);
  }

  // Routes API
  async getRoutes(params?: ListQueryParams): Promise<Route[]> {
    const response = await this.client.get<ApiResponse<Route[]> | PaginatedResponse<Route>>(
      API_ENDPOINTS.ROUTES, 
      params
    );
    return 'pagination' in response ? response.data : response.data;
  }

  async getRouteById(id: string): Promise<Route> {
    const response = await this.client.get<ApiResponse<Route>>(`${API_ENDPOINTS.ROUTES}/${id}`);
    return response.data;
  }

  async createRoute(data: CreateRouteRequest): Promise<Route> {
    const response = await this.client.post<ApiResponse<Route>>(API_ENDPOINTS.ROUTES, data);
    return response.data;
  }

  async updateRoute(id: string, data: UpdateRouteRequest): Promise<Route> {
    const response = await this.client.put<ApiResponse<Route>>(`${API_ENDPOINTS.ROUTES}/${id}`, data);
    return response.data;
  }

  async deleteRoute(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.ROUTES}/${id}`);
  }

  // Stops API
  async getStops(params?: ListQueryParams): Promise<Stop[]> {
    const response = await this.client.get<ApiResponse<Stop[]> | PaginatedResponse<Stop>>(
      API_ENDPOINTS.STOPS, 
      params
    );
    return 'pagination' in response ? response.data : response.data;
  }

  async getStopById(id: string): Promise<Stop> {
    const response = await this.client.get<ApiResponse<Stop>>(`${API_ENDPOINTS.STOPS}/${id}`);
    return response.data;
  }

  async createStop(data: CreateStopRequest): Promise<Stop> {
    const response = await this.client.post<ApiResponse<Stop>>(API_ENDPOINTS.STOPS, data);
    return response.data;
  }

  async updateStop(id: string, data: UpdateStopRequest): Promise<Stop> {
    const response = await this.client.put<ApiResponse<Stop>>(`${API_ENDPOINTS.STOPS}/${id}`, data);
    return response.data;
  }

  async deleteStop(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.STOPS}/${id}`);
  }

  // Trips API
  async getTrips(params?: ListQueryParams): Promise<Trip[]> {
    const response = await this.client.get<ApiResponse<Trip[]> | PaginatedResponse<Trip>>(
      API_ENDPOINTS.TRIPS, 
      params
    );
    return 'pagination' in response ? response.data : response.data;
  }

  async getTripById(id: string): Promise<Trip> {
    const response = await this.client.get<ApiResponse<Trip>>(`${API_ENDPOINTS.TRIPS}/${id}`);
    return response.data;
  }

  async createTrip(data: CreateTripRequest): Promise<Trip> {
    const response = await this.client.post<ApiResponse<Trip>>(API_ENDPOINTS.TRIPS, data);
    return response.data;
  }

  async updateTrip(id: string, data: UpdateTripRequest): Promise<Trip> {
    const response = await this.client.put<ApiResponse<Trip>>(`${API_ENDPOINTS.TRIPS}/${id}`, data);
    return response.data;
  }

  async deleteTrip(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.TRIPS}/${id}`);
  }

  // Trip Assignment APIs
  async assignVehicleToTrip(data: AssignVehicleRequest): Promise<Trip> {
    const response = await this.client.put<ApiResponse<Trip>>(
      `${API_ENDPOINTS.TRIPS}/${data.tripId}/assign-vehicle`, 
      { vehicleId: data.vehicleId }
    );
    return response.data;
  }

  async assignDriverToTrip(data: AssignDriverRequest): Promise<Trip> {
    const response = await this.client.put<ApiResponse<Trip>>(
      `${API_ENDPOINTS.TRIPS}/${data.tripId}/assign-driver`, 
      { driverId: data.driverId }
    );
    return response.data;
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.DASHBOARD);
    return response.data;
  }

  // Vehicle Models API
  async getVehicleModels(params?: ListQueryParams): Promise<VehicleModel[]> {
    const response = await this.client.get<ApiResponse<VehicleModel[]>>(
      API_ENDPOINTS.VEHICLE_MODELS, 
      params
    );
    return response.data;
  }

  async searchVehicleModels(search: string): Promise<VehicleModel[]> {
    const response = await this.client.get<ApiResponse<VehicleModel[]>>(
      `${API_ENDPOINTS.VEHICLE_MODELS}/search`,
      { search }
    );
    return response.data;
  }

  async getVehicleModelById(id: string): Promise<VehicleModel> {
    const response = await this.client.get<ApiResponse<VehicleModel>>(`${API_ENDPOINTS.VEHICLE_MODELS}/${id}`);
    return response.data;
  }

  // Authentication methods
  async generateUserOtp(username: string): Promise<{ otp: string }> {
    const response = await this.client.post<ApiResponse<{ otp: string }>>(`${API_ENDPOINTS.AUTH}/generate-otp`, { username });
    if (!response.success) {
      throw new Error(response.message || 'Failed to generate OTP');
    }
    return response.data;
  }

  async loginUserWithOtp(username: string, otp: string): Promise<{ token: string; user: any }> {
    const response = await this.client.post<ApiResponse<{ token: string; user: any }>>(`${API_ENDPOINTS.AUTH}/login-otp`, { username, otp });
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  }

  async createUser(data: { name: string; phone: string; email: string; qid?: string }): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`${API_ENDPOINTS.AUTH}/users`, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create user');
    }
    return response.data;
  }

  async activateAccount(data: { activationCode: string; password: string; username: string }): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`${API_ENDPOINTS.AUTH}/activate`, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to activate account');
    }
    return response.data;
  }

  async loginWithPassword(username: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.client.post<ApiResponse<{ token: string; user: any }>>(`${API_ENDPOINTS.AUTH}/login-password`, { username, password });
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await this.client.post<ApiResponse<{ message: string }>>(`${API_ENDPOINTS.AUTH}/request-password-reset`, { email });
    if (!response.success) {
      throw new Error(response.message || 'Failed to request password reset');
    }
    return response.data;
  }

  async resetPassword(data: { resetCode: string; newPassword: string }): Promise<{ message: string }> {
    const response = await this.client.post<ApiResponse<{ message: string }>>(`${API_ENDPOINTS.AUTH}/reset-password`, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
    return response.data;
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_ENDPOINTS.AUTH}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.client.get<ApiResponse<User[]>>(url);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get users');
    }
    return response.data;
  }

  // Service Schedules API
  async getServiceSchedules(params?: ListQueryParams): Promise<ServiceSchedule[]> {
    const response = await this.client.get<ApiResponse<ServiceSchedule[]>>(
      API_ENDPOINTS.SERVICE_SCHEDULES, 
      params
    );
    return response.data;
  }

  async getServiceScheduleById(id: string): Promise<ServiceSchedule> {
    const response = await this.client.get<ApiResponse<ServiceSchedule>>(`${API_ENDPOINTS.SERVICE_SCHEDULES}/${id}`);
    return response.data;
  }

  async createServiceSchedule(data: CreateServiceScheduleRequest): Promise<ServiceSchedule> {
    const response = await this.client.post<ApiResponse<ServiceSchedule>>(API_ENDPOINTS.SERVICE_SCHEDULES, data);
    return response.data;
  }

  async updateServiceSchedule(id: string, data: UpdateServiceScheduleRequest): Promise<ServiceSchedule> {
    const response = await this.client.put<ApiResponse<ServiceSchedule>>(`${API_ENDPOINTS.SERVICE_SCHEDULES}/${id}`, data);
    return response.data;
  }

  async deleteServiceSchedule(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.SERVICE_SCHEDULES}/${id}`);
  }

  // Duty Templates API
  async getDutyTemplates(scheduleId: string, params?: DutyTemplateQueryParams): Promise<DutyTemplate[]> {
    const response = await this.client.get<ApiResponse<DutyTemplate[]>>(
      `${API_ENDPOINTS.SERVICE_SCHEDULES}/${scheduleId}/templates`,
      params
    );
    return response.data;
  }

  async createDutyTemplate(scheduleId: string, data: CreateDutyTemplateRequest): Promise<DutyTemplate> {
    const response = await this.client.post<ApiResponse<DutyTemplate>>(
      `${API_ENDPOINTS.SERVICE_SCHEDULES}/${scheduleId}/templates`,
      data
    );
    return response.data;
  }

  async updateDutyTemplate(scheduleId: string, templateId: string, data: UpdateDutyTemplateRequest): Promise<DutyTemplate> {
    const response = await this.client.put<ApiResponse<DutyTemplate>>(
      `${API_ENDPOINTS.SERVICE_SCHEDULES}/${scheduleId}/templates/${templateId}`,
      data
    );
    return response.data;
  }

  async deleteDutyTemplate(scheduleId: string, templateId: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.SERVICE_SCHEDULES}/${scheduleId}/templates/${templateId}`
    );
  }

  // Duties API
  async getDuties(params?: DutyQueryParams): Promise<Duty[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = queryParams.toString() ? `${API_ENDPOINTS.DUTIES}?${queryParams}` : API_ENDPOINTS.DUTIES;
    const response = await this.client.get<ApiResponse<Duty[]>>(url);
    return response.data;
  }

  async getDutyById(id: string): Promise<Duty> {
    const response = await this.client.get<ApiResponse<Duty>>(`${API_ENDPOINTS.DUTIES}/${id}`);
    return response.data;
  }

  async createDuty(data: CreateDutyRequest): Promise<Duty> {
    const response = await this.client.post<ApiResponse<Duty>>(API_ENDPOINTS.DUTIES, data);
    return response.data;
  }

  async updateDuty(id: string, data: UpdateDutyRequest): Promise<Duty> {
    const response = await this.client.put<ApiResponse<Duty>>(`${API_ENDPOINTS.DUTIES}/${id}`, data);
    return response.data;
  }

  async deleteDuty(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`${API_ENDPOINTS.DUTIES}/${id}`);
  }

  async createBulkTripDuties(data: CreateBulkTripDutiesRequest): Promise<{ duties: Duty[]; tripDuties: TripDuty[] }> {
    const response = await this.client.post<ApiResponse<{ duties: Duty[]; tripDuties: TripDuty[] }>>(`${API_ENDPOINTS.DUTIES}/bulk-trips`, data);
    return response.data;
  }

  async bulkUpdateDutyAssignments(data: BulkUpdateDutyAssignmentsRequest): Promise<Duty[]> {
    const response = await this.client.put<ApiResponse<Duty[]>>(`${API_ENDPOINTS.DUTIES}/bulk-assignments`, data);
    return response.data;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export for testing or custom instances
export { ApiService, HttpClient };


