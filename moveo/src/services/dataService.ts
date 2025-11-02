import { API_CONFIG } from '../config/api';
import { apiService } from './apiService';
// import { mockAPI } from './mockData';
import { 
  Vehicle, 
  Driver, 
  Route, 
  Stop, 
  Trip, 
  DashboardStats,
  VehicleModel,
  User,
  ServiceSchedule,
  Duty,
  TripDuty
} from '../types';
import { 
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
  BulkUpdateDutyAssignmentsRequest
} from '../types/api';

// Unified data service interface
interface IDataService {
  // Vehicles
  getVehicles(params?: ListQueryParams): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  createVehicle(data: CreateVehicleRequest): Promise<Vehicle>;
  updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Drivers
  getDrivers(params?: ListQueryParams): Promise<Driver[]>;
  getDriverById(id: string): Promise<Driver | null>;
  createDriver(data: CreateDriverRequest): Promise<Driver>;
  updateDriver(id: string, data: CreateDriverRequest): Promise<Driver>;
  deleteDriver(id: string): Promise<void>;

  // Routes
  getRoutes(params?: ListQueryParams): Promise<Route[]>;
  getRouteById(id: string): Promise<Route | null>;
  createRoute(data: CreateRouteRequest): Promise<Route>;
  updateRoute(id: string, data: UpdateRouteRequest): Promise<Route>;
  deleteRoute(id: string): Promise<void>;

  // Stops
  getStops(params?: ListQueryParams): Promise<Stop[]>;
  getStopById(id: string): Promise<Stop | null>;
  createStop(data: CreateStopRequest): Promise<Stop>;
  updateStop(id: string, data: UpdateStopRequest): Promise<Stop>;
  deleteStop(id: string): Promise<void>;

  // Trips
  getTrips(params?: ListQueryParams): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | null>;
  createTrip(data: CreateTripRequest): Promise<Trip>;
  updateTrip(id: string, data: UpdateTripRequest): Promise<Trip>;
  deleteTrip(id: string): Promise<void>;
  assignVehicleToTrip(data: AssignVehicleRequest): Promise<Trip>;
  assignDriverToTrip(data: AssignDriverRequest): Promise<Trip>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;

  // Vehicle Models
  getVehicleModels(params?: ListQueryParams): Promise<VehicleModel[]>;
  searchVehicleModels(search: string): Promise<VehicleModel[]>;
  getVehicleModelById(id: string): Promise<VehicleModel | null>;

  // Authentication
  generateUserOtp(username: string): Promise<{ otp: string }>;
  loginUserWithOtp(username: string, otp: string): Promise<{ token: string; user: any }>;
  createUser(data: { name: string; qid?: string; email: string; phone: string }): Promise<any>;
  activateAccount(data: { activationCode: string; password: string; username: string }): Promise<any>;
  loginWithPassword(username: string, password: string): Promise<{ token: string; user: any }>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  resetPassword(data: { resetCode: string; newPassword: string }): Promise<{ message: string }>;
  getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<User[]>;

  // Service Schedules
  getServiceSchedules(params?: ListQueryParams): Promise<ServiceSchedule[]>;
  getServiceScheduleById(id: string): Promise<ServiceSchedule | null>;
  createServiceSchedule(data: CreateServiceScheduleRequest): Promise<ServiceSchedule>;
  updateServiceSchedule(id: string, data: UpdateServiceScheduleRequest): Promise<ServiceSchedule>;
  deleteServiceSchedule(id: string): Promise<void>;

  // Duties
  getDuties(params?: DutyQueryParams): Promise<Duty[]>;
  getDutyById(id: string): Promise<Duty | null>;
  createDuty(data: CreateDutyRequest): Promise<Duty>;
  updateDuty(id: string, data: UpdateDutyRequest): Promise<Duty>;
  deleteDuty(id: string): Promise<void>;
  createBulkTripDuties(data: CreateBulkTripDutiesRequest): Promise<{ duties: Duty[]; tripDuties: TripDuty[] }>;
  bulkUpdateDutyAssignments(data: BulkUpdateDutyAssignmentsRequest): Promise<Duty[]>;
}

// Mock data adapter to match API interface
// class MockDataAdapter implements IDataService {
//   // Vehicles
//   async getVehicles(): Promise<Vehicle[]> {
//     return mockAPI.getVehicles();
//   }

//   async getVehicleById(id: string): Promise<Vehicle | null> {
//     return mockAPI.getVehicleById(id);
//   }

//   async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
//     // Convert API request to mock data format
//     const newVehicle: Vehicle = {
//       id: Date.now().toString(),
//       plateNumber: data.plateNumber,
//       make: data.make,
//       model: data.model,
//       year: data.year,
//       fleetNumber: data.fleetNumber,
//       color: data.color,
//       vin: data.vin,
//     //   capacity: data.capacity || 0,
//     //   fuelType: data.fuelType || 'gasoline',
//       status: data.status || 'active',
//       mileage: 0,
//       lastMaintenance: new Date(),
//       nextMaintenance: new Date(),
//     //   currentLocation: { lat: 0, lng: 0 },
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     // In real implementation, this would update the mock data store
//     return Promise.resolve(newVehicle);
//   }

//   async updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
//     const existing = await this.getVehicleById(id);
//     if (!existing) throw new Error('Vehicle not found');
    
//     const updated: Vehicle = {
//       ...existing,
//       ...data,
//       updatedAt: new Date()
//     };
//     return Promise.resolve(updated);
//   }

//   async deleteVehicle(id: string): Promise<void> {
//     // Mock implementation
//     return Promise.resolve();
//   }

//   // Drivers
//   async getDrivers(): Promise<Driver[]> {
//     return mockAPI.getDrivers();
//   }

//   async getDriverById(id: string): Promise<Driver | null> {
//     return mockAPI.getDriverById(id);
//   }

//   async createDriver(data: CreateDriverRequest): Promise<Driver> {
//     const newDriver: Driver = {
//       id: Date.now().toString(),
//       firstName: data.firstName,
//       lastName: data.lastName,
//       email: data.email,
//       phone: data.phone,
//       employeeId: data.employeeId,
//       licenseNumber: data.licenseNumber,
//       licenseClass: data.licenseClass,
//       licenseExpiry: new Date(data.licenseExpiry),
//       dateOfBirth: new Date(data.dateOfBirth),
//       address: data.address,
//     //   status: data.status || 'active',
//       rating: 0,
//       totalTrips: 0,
//       totalDistance: 0,
//       joinDate: new Date(),
//     //   currentLocation: { lat: 0, lng: 0 },
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     return Promise.resolve(newDriver);
//   }

//   async updateDriver(id: string, data: UpdateDriverRequest): Promise<Driver> {
//     const existing = await this.getDriverById(id);
//     if (!existing) throw new Error('Driver not found');
    
//     const updated: Driver = {
//       ...existing,
//       ...data,
//       updatedAt: new Date()
//     };
//     return Promise.resolve(updated);
//   }

//   async deleteDriver(id: string): Promise<void> {
//     return Promise.resolve();
//   }

//   // Routes
//   async getRoutes(): Promise<Route[]> {
//     return mockAPI.getRoutes();
//   }

//   async getRouteById(id: string): Promise<Route | null> {
//     return mockAPI.getRouteById(id);
//   }

//   async createRoute(data: CreateRouteRequest): Promise<Route> {
//     const newRoute: Route = {
//       id: Date.now().toString(),
//       name: data.name,
//       description: data.description,
//       startLocation: data.startLocation,
//       endLocation: data.endLocation,
//       stops: data.stops,
//       estimatedDistance: data.estimatedDistance,
//       estimatedDuration: data.estimatedDuration,
//       status: data.status || 'active',
//       assignedVehicles: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     return Promise.resolve(newRoute);
//   }

//   async updateRoute(id: string, data: UpdateRouteRequest): Promise<Route> {
//     const existing = await this.getRouteById(id);
//     if (!existing) throw new Error('Route not found');
    
//     const updated: Route = {
//       ...existing,
//       ...data,
//       updatedAt: new Date()
//     };
//     return Promise.resolve(updated);
//   }

//   async deleteRoute(id: string): Promise<void> {
//     return Promise.resolve();
//   }

//   // Stops
//   async getStops(): Promise<Stop[]> {
//     return mockAPI.getStops();
//   }

//   async getStopById(id: string): Promise<Stop | null> {
//     return mockAPI.getStopById(id);
//   }

//   async createStop(data: CreateStopRequest): Promise<Stop> {
//     const newStop: Stop = {
//       id: Date.now().toString(),
//       name: data.name,
//       code: data.code,
//       location: data.location,
//       address: data.address,
//       description: data.description,
//       type: data.type,
//       isActive: data.isActive !== false,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     return Promise.resolve(newStop);
//   }

//   async updateStop(id: string, data: UpdateStopRequest): Promise<Stop> {
//     const existing = await this.getStopById(id);
//     if (!existing) throw new Error('Stop not found');
    
//     const updated: Stop = {
//       ...existing,
//       ...data,
//       updatedAt: new Date()
//     };
//     return Promise.resolve(updated);
//   }

//   async deleteStop(id: string): Promise<void> {
//     return Promise.resolve();
//   }

//   // Trips
//   async getTrips(): Promise<Trip[]> {
//     return mockAPI.getTrips();
//   }

//   async getTripById(id: string): Promise<Trip | null> {
//     return mockAPI.getTripById(id);
//   }

//   async createTrip(data: CreateTripRequest): Promise<Trip> {
//     const newTrip: Trip = {
//       id: Date.now().toString(),
//       code: data.code,
//       routeId: data.routeId,
//       scheduledStartTime: new Date(data.scheduledStartTime),
//       scheduledEndTime: new Date(data.scheduledEndTime),
//       status: 'planned',
//       notes: data.notes,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     return Promise.resolve(newTrip);
//   }

//   async updateTrip(id: string, data: UpdateTripRequest): Promise<Trip> {
//     const existing = await this.getTripById(id);
//     if (!existing) throw new Error('Trip not found');
    
//     const updated: Trip = {
//       ...existing,
//       ...data,
//       updatedAt: new Date()
//     };
//     return Promise.resolve(updated);
//   }

//   async deleteTrip(id: string): Promise<void> {
//     return Promise.resolve();
//   }

//   async assignVehicleToTrip(data: AssignVehicleRequest): Promise<Trip> {
//     return this.updateTrip(data.tripId, { vehicleId: data.vehicleId });
//   }

//   async assignDriverToTrip(data: AssignDriverRequest): Promise<Trip> {
//     return this.updateTrip(data.tripId, { driverId: data.driverId });
//   }

//   // Dashboard
//   async getDashboardStats(): Promise<DashboardStats> {
//     return mockAPI.getDashboardStats();
//   }
// }

// API data adapter
class ApiDataAdapter implements IDataService {
  // Vehicles
  async getVehicles(params?: ListQueryParams): Promise<Vehicle[]> {
    return apiService.getVehicles(params);
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      return await apiService.getVehicleById(id);
    } catch (error) {
      return null;
    }
  }

  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    return apiService.createVehicle(data);
  }

  async updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    return apiService.updateVehicle(id, data);
  }

  async deleteVehicle(id: string): Promise<void> {
    return apiService.deleteVehicle(id);
  }

  // Drivers
  async getDrivers(params?: ListQueryParams): Promise<Driver[]> {
    return apiService.getDrivers(params);
  }

  async getDriverById(id: string): Promise<Driver | null> {
    try {
      return await apiService.getDriverById(id);
    } catch (error) {
      return null;
    }
  }

  async createDriver(data: CreateDriverRequest): Promise<Driver> {
    return apiService.createDriver(data);
  }

  async updateDriver(id: string, data: CreateDriverRequest): Promise<Driver> {
    return apiService.updateDriver(id, data);
  }

  async deleteDriver(id: string): Promise<void> {
    return apiService.deleteDriver(id);
  }

  // Routes
  async getRoutes(params?: ListQueryParams): Promise<Route[]> {
    return apiService.getRoutes(params);
  }

  async getRouteById(id: string): Promise<Route | null> {
    try {
      return await apiService.getRouteById(id);
    } catch (error) {
      return null;
    }
  }

  async createRoute(data: CreateRouteRequest): Promise<Route> {
    return apiService.createRoute(data);
  }

  async updateRoute(id: string, data: UpdateRouteRequest): Promise<Route> {
    return apiService.updateRoute(id, data);
  }

  async deleteRoute(id: string): Promise<void> {
    return apiService.deleteRoute(id);
  }

  // Stops
  async getStops(params?: ListQueryParams): Promise<Stop[]> {
    return apiService.getStops(params);
  }

  async getStopById(id: string): Promise<Stop | null> {
    try {
      return await apiService.getStopById(id);
    } catch (error) {
      return null;
    }
  }

  async createStop(data: CreateStopRequest): Promise<Stop> {
    return apiService.createStop(data);
  }

  async updateStop(id: string, data: UpdateStopRequest): Promise<Stop> {
    return apiService.updateStop(id, data);
  }

  async deleteStop(id: string): Promise<void> {
    return apiService.deleteStop(id);
  }

  // Trips
  async getTrips(params?: ListQueryParams): Promise<Trip[]> {
    return apiService.getTrips(params);
  }

  async getTripById(id: string): Promise<Trip | null> {
    try {
      return await apiService.getTripById(id);
    } catch (error) {
      return null;
    }
  }

  async createTrip(data: CreateTripRequest): Promise<Trip> {
    return apiService.createTrip(data);
  }

  async updateTrip(id: string, data: UpdateTripRequest): Promise<Trip> {
    return apiService.updateTrip(id, data);
  }

  async deleteTrip(id: string): Promise<void> {
    return apiService.deleteTrip(id);
  }

  async assignVehicleToTrip(data: AssignVehicleRequest): Promise<Trip> {
    return apiService.assignVehicleToTrip(data);
  }

  async assignDriverToTrip(data: AssignDriverRequest): Promise<Trip> {
    return apiService.assignDriverToTrip(data);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.getDashboardStats();
  }

  // Vehicle Models
  async getVehicleModels(params?: ListQueryParams): Promise<VehicleModel[]> {
    return apiService.getVehicleModels(params);
  }

  async searchVehicleModels(search: string): Promise<VehicleModel[]> {
    return apiService.searchVehicleModels(search);
  }

  async getVehicleModelById(id: string): Promise<VehicleModel | null> {
    try {
      return await apiService.getVehicleModelById(id);
    } catch (error) {
      return null;
    }
  }

  // Authentication
  async generateUserOtp(username: string): Promise<{ otp: string }> {
    return apiService.generateUserOtp(username);
  }

  async loginUserWithOtp(username: string, otp: string): Promise<{ token: string; user: any }> {
    return apiService.loginUserWithOtp(username, otp);
  }

  async createUser(data: { name: string; phone: string; email: string; qid?: string }): Promise<any> {
    return apiService.createUser(data);
  }

  async activateAccount(data: { activationCode: string; password: string; username: string }): Promise<any> {
    return apiService.activateAccount(data);
  }

  async loginWithPassword(username: string, password: string): Promise<{ token: string; user: any }> {
    return apiService.loginWithPassword(username, password);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiService.requestPasswordReset(email);
  }

  async resetPassword(data: { resetCode: string; newPassword: string }): Promise<{ message: string }> {
    return apiService.resetPassword(data);
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<User[]> {
    return apiService.getUsers(params);
  }

  // Service Schedules
  async getServiceSchedules(params?: ListQueryParams): Promise<ServiceSchedule[]> {
    return apiService.getServiceSchedules(params);
  }

  async getServiceScheduleById(id: string): Promise<ServiceSchedule | null> {
    try {
      return await apiService.getServiceScheduleById(id);
    } catch (error) {
      return null;
    }
  }

  async createServiceSchedule(data: CreateServiceScheduleRequest): Promise<ServiceSchedule> {
    return apiService.createServiceSchedule(data);
  }

  async updateServiceSchedule(id: string, data: UpdateServiceScheduleRequest): Promise<ServiceSchedule> {
    return apiService.updateServiceSchedule(id, data);
  }

  async deleteServiceSchedule(id: string): Promise<void> {
    return apiService.deleteServiceSchedule(id);
  }

  // Duties
  async getDuties(params?: DutyQueryParams): Promise<Duty[]> {
    return apiService.getDuties(params);
  }

  async getDutyById(id: string): Promise<Duty | null> {
    try {
      return await apiService.getDutyById(id);
    } catch (error) {
      return null;
    }
  }

  async createDuty(data: CreateDutyRequest): Promise<Duty> {
    return apiService.createDuty(data);
  }

  async updateDuty(id: string, data: UpdateDutyRequest): Promise<Duty> {
    return apiService.updateDuty(id, data);
  }

  async deleteDuty(id: string): Promise<void> {
    return apiService.deleteDuty(id);
  }

  async createBulkTripDuties(data: CreateBulkTripDutiesRequest): Promise<{ duties: Duty[]; tripDuties: TripDuty[] }> {
    return apiService.createBulkTripDuties(data);
  }

  async bulkUpdateDutyAssignments(data: BulkUpdateDutyAssignmentsRequest): Promise<Duty[]> {
    return apiService.bulkUpdateDutyAssignments(data);
  }
}

// Create the appropriate data service based on configuration
export const dataService: IDataService = new ApiDataAdapter();

// Export types and classes for testing
export type { IDataService };
export { ApiDataAdapter };
