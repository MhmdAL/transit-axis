// API Request/Response Types

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  success: boolean;
  timestamp: string;
}

// API Error response
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Query parameters for list endpoints
export interface DutyQueryParams {
  page?: number;
  limit?: number;
  date?: string; // ISO date string
  startDate?: string; // ISO date string for date range start
  endDate?: string; // ISO date string for date range end
  scheduleId?: string;
  driverId?: string; // Single driver ID
  driverIds?: string[]; // Array of driver IDs for multi-select
  vehicleId?: string; // Single vehicle ID
  vehicleIds?: string[]; // Array of vehicle IDs for multi-select
  dutyType?: 'TRIP' | 'WASHING' | 'MAINTENANCE';
  routeId?: string; // Single route ID
  routeIds?: string[]; // Array of route IDs for multi-select
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Create/Update request types
export interface CreateVehicleRequest {
  plateNo: string;
  fleetNo: string;
  vehicleModelId: number;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

export interface CreateDriverRequest {
  name: string;
  qid: string;
  phone: string;
  email: string;
}

export interface UpdateDriverRequest extends Partial<CreateDriverRequest> {
  id: string;
}

export interface CreateRouteRequest {
  name: string;
  code: string;
  stops: any[];
}

export interface UpdateRouteRequest extends Partial<CreateRouteRequest> {
  id: string;
}

export interface CreateStopRequest {
  name: string;
  code: string;
  lat: number;
  lon: number;
}

export interface UpdateStopRequest extends Partial<CreateStopRequest> {
  id: string;
}

export interface CreateTripRequest {
  routeId: string;
  scheduledStartTime: string; // ISO string
  scheduledEndTime: string; // ISO string
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  id: string;
  vehicleId?: string;
  driverId?: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  actualStartTime?: string;
  actualEndTime?: string;
  actualDistance?: number;
  actualDuration?: number;
  fuelConsumed?: number;
}

// Assignment requests
export interface AssignVehicleRequest {
  tripId: string;
  vehicleId: string;
}

export interface AssignDriverRequest {
  tripId: string;
  driverId: string;
}

export interface CreateServiceScheduleRequest {
  name: string;
  vehicleBlockCodes?: Array<{
    code: string;
    color: string;
  }>;
  driverRunCodes?: Array<{
    code: string;
    color: string;
  }>;
  dutyTemplates?: Array<{
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
    vehicleBlockCode?: string;
    driverRunCode?: string;
  }>;
}

export interface UpdateServiceScheduleRequest {
  name: string;
  vehicleBlockCodes?: Array<{
    code: string;
    color: string;
  }>;
  driverRunCodes?: Array<{
    code: string;
    color: string;
  }>;
  dutyTemplates?: Array<{
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
    vehicleBlockCode?: string;
    driverRunCode?: string;
  }>;
}

export interface CreateDutyRequest {
  date: string; // ISO date string
  startTime: string; // ISO time string
  endTime: string; // ISO time string
  scheduleId: string;
  driverId?: string;
  vehicleId?: string;
  dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
}

export interface UpdateDutyRequest extends Partial<CreateDutyRequest> {
  id: string;
}

export interface CreateBulkTripDutiesRequest {
  scheduleId: string;
  routeId: string;
  date: string; // ISO date string
  trips: Array<{
    scheduledStartTime: string; // HH:MM format
    scheduledEndTime: string; // HH:MM format
    vehicleBlockCode?: string;
    driverRunCode?: string;
  }>;
}

export interface BulkUpdateDutyAssignmentsRequest {
  assignments: Array<{
    dutyId: string;
    driverId?: string;
    vehicleId?: string;
  }>;
}

// Duty Template API types
export interface CreateDutyTemplateRequest {
  name?: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
  scheduleId: string;
  vehicleBlockCode?: string;
  driverRunCode?: string;
}

export interface UpdateDutyTemplateRequest extends Partial<CreateDutyTemplateRequest> {
  id: string;
}

export interface DutyTemplateQueryParams extends ListQueryParams {
  scheduleId: string;
  dutyType?: 'TRIP' | 'WASHING' | 'MAINTENANCE';
}
