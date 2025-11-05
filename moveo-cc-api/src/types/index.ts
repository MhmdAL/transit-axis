/**
 * Vehicle Telemetry Data
 * Represents real-time location and movement data from a vehicle
 */
export interface VehicleTelemetry {
  vehicleId: string;
  tripId?: string;
  routeId?: string;
  driverId?: string;
  timestamp: number; // milliseconds since epoch
  latitude: number;
  longitude: number;
  speed: number; // km/h
  bearing: number; // degrees (0-360)
  altitude?: number; // meters
  accuracy?: number; // GPS accuracy in meters
  heading?: number; // compass heading
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
  dataPoints: VehicleTelemetry[]; // One latest point per vehicle
  pointCount: number; // Number of vehicles in this batch
}

/**
 * Client Subscription
 * Tracks a client's subscription to a specific vehicle
 */
export interface ClientSubscription {
  clientId: string;
  vehicleId: string;
  subscribedAt: number;
}

/**
 * Active Subscriptions Map
 * Maps vehicleId to Set of client socket IDs
 */
export interface SubscriptionsMap {
  [vehicleId: string]: Set<string>;
}

/**
 * Server Statistics
 * Real-time server metrics
 */
export interface ServerStats {
  timestamp: number;
  connectedClients: number;
  activeVehicles: number;
  totalSubscriptions: number;
  vehicleSubscriptions: {
    [vehicleId: string]: number;
  };
  telemetryBatches: {
    total: number;
    pending: number;
  };
  uptime: number;
}

/**
 * Trip Event Types
 * Represents trip start/end events
 */
export interface TripEvent {
  id: string; // Trip ID
  routeId: string;
  vehicleId: string;
  driverId: string;
  tripDutyId?: string;
  eventType: 'trip:start' | 'trip:end';
  timestamp: number; // milliseconds since epoch
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  status?: string;
}

/**
 * Socket Event Payloads
 */
export namespace SocketEvents {
  // Client subscription requests
  export interface SubscribeVehiclePayload {
    vehicleId: string;
  }

  export interface UnsubscribeVehiclePayload {
    vehicleId: string;
  }

  // Route subscription
  export interface SubscribeRoutePayload {
    routeId: string;
  }

  export interface UnsubscribeRoutePayload {
    routeId: string;
  }

  // Vehicle telemetry
  export interface VehicleTelemetryPayload extends VehicleTelemetry {}

  // Batched telemetry emission (multi-vehicle batch)
  export interface TelemetryBatchPayload {
    batchId: string;
    timestamp: number;
    dataPoints: VehicleTelemetry[];
    count: number;
  }

  // Trip events
  export interface TripEventPayload extends TripEvent {}

  // Subscription confirmations
  export interface SubscriptionConfirmedPayload {
    vehicleId: string;
    subscribedAt: number;
  }

  export interface SubscriptionRemovedPayload {
    vehicleId: string;
  }

  export interface RouteSubscriptionConfirmedPayload {
    routeId: string;
    subscribedAt: number;
  }

  export interface RouteSubscriptionRemovedPayload {
    routeId: string;
  }

  // Error handling
  export interface ErrorPayload {
    message: string;
    code: string;
    timestamp: number;
  }

  // Stats request/response
  export interface StatsRequestPayload {
    includeVehicleDetails?: boolean;
  }

  export interface StatsResponsePayload extends ServerStats {}
}

/**
 * Configuration interface
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  socketIOPort: number;
  logLevel: string;
  batchIntervalMs: number;
  batchMaxSize: number;
  socketIO: {
    pingInterval: number;
    pingTimeout: number;
    maxHttpBufferSize: number;
  };
  moveoCore: {
    baseUrl: string;
  };
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
}

/**
 * Batch Queue Item
 */
export interface BatchQueueItem {
  batchId: string;
  batch: BatchedTelemetry;
  createdAt: number;
}

/**
 * Connection Metadata
 */
export interface ConnectionMetadata {
  socketId: string;
  connectedAt: number;
  type: 'client' | 'vehicle' | 'unknown';
  subscriptions: Set<string>;
  lastActivity: number;
}
