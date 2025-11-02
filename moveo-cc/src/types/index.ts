/**
 * Vehicle Telemetry Data
 * Represents real-time location and movement data from a vehicle
 */
export interface VehicleTelemetry {
  vehicleId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  lastUpdate?: Date;
  
  // Enriched fields from cache service
  vehicleFleetNo?: string;
  vehiclePlateNo?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  driverName?: string;
  driverId?: string;
  routeName?: string;
  routeId?: string;
  tripId?: string;
  tripStartTime?: string;
  tripEndTime?: string;
  tripStatus?: string;
}

/**
 * Batched Telemetry Data (Multi-Vehicle)
 * Each batch contains the latest telemetry point for multiple vehicles
 */
export interface BatchedTelemetry {
  batchId: string;
  timestamp: number;
  startTime: number;
  endTime: number;
  dataPoints: VehicleTelemetry[];
  pointCount: number;
}

/**
 * Server Statistics
 */
export interface ServerStats {
  timestamp: number;
  connectedClients: number;
  activeVehicles: number;
  totalSubscriptions: number;
  vehicleSubscriptions: Record<string, number>;
  telemetryBatches: {
    total: number;
    pending: number;
  };
  uptime: number;
}

