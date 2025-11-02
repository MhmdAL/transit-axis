export interface Vehicle {
  id: string;
  plateNo: string;
  fleetNo: string;
  model: VehicleModel;
}

export interface Driver {
  id: string;
  name: string;
  qid: string;
  phone: string;
  email: string;
}

export interface Stop {
  id: string;
  name: string;
  code: string;
  order: number;
  location: {
    lat: number;
    lon: number;
  };
}

export interface Route {
  id: string;
  name: string;
  code: string;
  description?: string;
  stops?: Array<Stop>;
}

export interface Trip {
  id: string;
  routeId: string;
  scheduledStartTime: string; // ISO string from backend
  scheduledEndTime: string;   // ISO string from backend
  scheduledDriverId?: string;
  scheduledVehicleId?: string;
  startTime?: string;         // ISO string from backend (actual start)
  endTime?: string;           // ISO string from backend (actual end)
  startLocation?: string;
  endLocation?: string;
  driverId?: string;
  vehicleId?: string;
  // Related data (populated by backend)
  route?: Route;
  driver?: Driver;
  vehicle?: Vehicle;
  tripStops?: TripStop[];
}

export interface TripStop {
  id: string;
  tripId: string;
  stopId: string;
  stopOrder: number;
  arrivalTime?: string;    // ISO string from backend
  departureTime?: string;  // ISO string from backend
  eta?: number;           // estimated time of arrival in minutes
  trip?: Trip;
  stop?: Stop;
}

export interface TrackingData {
  id: string;
  vehicleId: string;
  driverId: string;
  location: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  timestamp: Date;
  address: string;
}

export interface VehicleModel {
  id: number;
  make: string;
  year: number;
  manufacturer: string;
  capacity: number;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalRoutes: number;
  activeTrips: number;
  maintenanceDue: number;
  fuelEfficiency: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  type: string;
  roles: string[];
  isActive?: boolean;
}

export interface ServiceSchedule {
  id: string;
  name: string;
  startDate: string; // ISO string from backend
  endDate: string;   // ISO string from backend
  dutyTemplates?: DutyTemplate[];
  vehicleBlockCount?: number;
  driverRunCount?: number;
  dutyTemplateCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Duty {
  id: string;
  date: string; // ISO string from backend
  startTime: string; // ISO string from backend
  endTime: string; // ISO string from backend
  scheduleId: string;
  schedule?: ServiceSchedule;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
  tripDuties: TripDuty[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TripDuty {
  id: string;
  dutyId: string;
  routeId: string;
  route?: Route;
  duty?: Duty;
}

export interface DutyTemplate {
  id: string;
  name?: string;
  startTime: string; // Time of day (HH:MM format)
  endTime: string;   // Time of day (HH:MM format)
  dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
  scheduleId: string;
  schedule?: ServiceSchedule;
  vehicleBlockCode?: string;
  vehicleBlockColor?: string;
  driverRunCode?: string;
  driverRunColor?: string;
  createdAt?: string;
  updatedAt?: string;
}
