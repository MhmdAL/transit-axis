import { logger } from '@/utils/logger';

interface Vehicle {
  id: string;
  fleetNo: string;
  plateNo: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  status?: string;
}

interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface Route {
  id: string;
  routeName: string;
  startLocation?: string;
  endLocation?: string;
  distance?: number;
  estimatedDuration?: number;
}

interface Trip {
  id: string;
  vehicleId: string;
  driverId?: string;
  routeId?: string;
  startTime: string;
  endTime?: string;
  status?: string;
}

class CacheService {
  private vehicles: Map<string, Vehicle> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private routes: Map<string, Route> = new Map();
  private trips: Map<string, Trip> = new Map();

  private refreshIntervalMs = 4 * 60 * 60 * 1000;
  private refreshInterval: NodeJS.Timeout | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  public async initialize(baseUrl?: string): Promise<void> {
    try {
      if (baseUrl) {
        this.baseUrl = baseUrl;
      }
      logger.info('Initializing cache service...');
      await this.refreshAll();
      this.startPeriodicRefresh();
      logger.info('Cache service initialized');
    } catch (error) {
      logger.error('Error initializing cache service', error);
      throw error;
    }
  }

  private async refreshAll(): Promise<void> {
    try {
      logger.info('Refreshing all cache entities...');
      await Promise.all([
        this.refreshVehicles(),
        this.refreshDrivers(),
        this.refreshRoutes(),
        this.refreshTrips(),
      ]);
      logger.info('Cache refresh completed');
    } catch (error) {
      logger.error('Error refreshing cache', error);
    }
  }

  private startPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      logger.info('Running periodic cache refresh...');
      await this.refreshAll();
    }, this.refreshIntervalMs);

    logger.info(`Cache refresh scheduled every ${this.refreshIntervalMs / 1000 / 60 / 60} hours`);
  }

  private async refreshVehicles(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vehicles`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const vehicles = data.data || data;

      this.vehicles.clear();
      for (const vehicle of vehicles) {
        this.vehicles.set(vehicle.id, vehicle);
      }

      logger.info(`Cached ${this.vehicles.size} vehicles`);
    } catch (error) {
      logger.error('Error refreshing vehicles', error);
    }
  }

  private async refreshDrivers(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/drivers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch drivers: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const drivers = data.data || data;

      this.drivers.clear();
      for (const driver of drivers) {
        this.drivers.set(driver.id, driver);
      }

      logger.info(`Cached ${this.drivers.size} drivers`);
    } catch (error) {
      logger.error('Error refreshing drivers', error);
    }
  }

  private async refreshRoutes(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const routes = data.data || data;

      this.routes.clear();
      for (const route of routes) {
        this.routes.set(route.id, route);
      }

      logger.info(`Cached ${this.routes.size} routes`);
    } catch (error) {
      logger.error('Error refreshing routes', error);
    }
  }

  private async refreshTrips(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/trips`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const trips = data.data || data;

      this.trips.clear();
      for (const trip of trips) {
        this.trips.set(trip.id, trip);
      }

      logger.info(`Cached ${this.trips.size} trips`);
    } catch (error) {
      logger.error('Error refreshing trips', error);
    }
  }

  public async getVehicle(vehicleId: string): Promise<Vehicle | null> {
    if (this.vehicles.has(vehicleId)) {
      return this.vehicles.get(vehicleId) || null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const vehicle = data.data;
        this.vehicles.set(vehicleId, vehicle);
        return vehicle;
      }
    } catch (error) {
      logger.warn(`Error fetching vehicle ${vehicleId}`, error);
    }

    return null;
  }

  public async getDriver(driverId: string): Promise<Driver | null> {
    if (this.drivers.has(driverId)) {
      return this.drivers.get(driverId) || null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/drivers/${driverId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const driver = data.data;
        this.drivers.set(driverId, driver);
        return driver;
      }
    } catch (error) {
      logger.warn(`Error fetching driver ${driverId}`, error);
    }

    return null;
  }

  public async getRoute(routeId: string): Promise<Route | null> {
    if (this.routes.has(routeId)) {
      return this.routes.get(routeId) || null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/routes/${routeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const route = data.data;
        this.routes.set(routeId, route);
        return route;
      }
    } catch (error) {
      logger.warn(`Error fetching route ${routeId}`, error);
    }

    return null;
  }

  public getTripByVehicleId(vehicleId: string): Trip | null {
    for (const trip of this.trips.values()) {
      if (trip.vehicleId === vehicleId) {
        return trip;
      }
    }
    return null;
  }

  public async enrichTelemetry(telemetry: any): Promise<any> {
    const enriched = { ...telemetry };

    try {
      const vehicle = await this.getVehicle(telemetry.vehicleId);
      if (vehicle) {
        enriched.vehicleFleetNo = vehicle.fleetNo;
        enriched.vehiclePlateNo = vehicle.plateNo;
        enriched.vehicleMake = vehicle.make;
        enriched.vehicleModel = vehicle.model;
      }

      if (telemetry.driverId) {
        const driver = await this.getDriver(telemetry.driverId);
        if (driver) {
          enriched.driverName = driver.name;
          enriched.driverId = driver.id;
        }
      }

      const trip = this.getTripByVehicleId(telemetry.vehicleId);
      if (trip) {
        enriched.tripId = trip.id;
        enriched.tripStartTime = trip.startTime;
        enriched.tripEndTime = trip.endTime;
        enriched.tripStatus = trip.status;

        if (trip.routeId) {
          const route = await this.getRoute(trip.routeId);
          if (route) {
            enriched.routeName = route.routeName;
            enriched.routeId = route.id;
          }
        }
      }
    } catch (error) {
      logger.warn('Error enriching telemetry', error);
    }

    return enriched;
  }

  public getStats(): Record<string, any> {
    return {
      vehicles: this.vehicles.size,
      drivers: this.drivers.size,
      routes: this.routes.size,
      trips: this.trips.size,
      refreshIntervalHours: this.refreshIntervalMs / 1000 / 60 / 60,
    };
  }

  public clear(): void {
    this.vehicles.clear();
    this.drivers.clear();
    this.routes.clear();
    this.trips.clear();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    logger.info('Cache cleared');
  }

  public shutdown(): void {
    this.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
