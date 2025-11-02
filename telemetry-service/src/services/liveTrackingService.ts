/**
 * Live Tracking Service
 * Forwards telemetry data to moveo-cc-api for real-time vehicle tracking
 */

const LIVE_TRACKING_API_URL = process.env.LIVE_TRACKING_API_URL || 'http://moveo-cc-api:3004';

interface VehicleTelemetry {
  vehicleId: string;
  tripId?: string;
  routeId?: string;
  driverId?: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
}

class LiveTrackingService {
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Forward telemetry to live tracking API
   */
  async forwardTelemetry(telemetry: VehicleTelemetry): Promise<boolean> {
    try {
      const payload = {
        vehicleId: telemetry.vehicleId,
        timestamp: telemetry.timestamp || Date.now(),
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        speed: telemetry.speed,
        bearing: telemetry.bearing || 0,
        altitude: telemetry.altitude,
        accuracy: telemetry.accuracy,
        heading: telemetry.heading,
      };

      const response = await this.sendWithRetry(telemetry);
      return response.ok;
    } catch (error) {
      console.error('Failed to forward telemetry to live tracking API:', error);
      return false;
    }
  }

  /**
   * Send telemetry with retry logic
   */
  private async sendWithRetry(payload: any, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(`${LIVE_TRACKING_API_URL}/api/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && attempt < this.retryAttempts) {
        console.warn(`Live tracking API returned ${response.status}, retrying (${attempt}/${this.retryAttempts})...`);
        await this.delay(this.retryDelay * attempt);
        return this.sendWithRetry(payload, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`Live tracking API connection failed, retrying (${attempt}/${this.retryAttempts})...`, error);
        await this.delay(this.retryDelay * attempt);
        return this.sendWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convert telemetry-service format to live tracking format
   */
  convertToLiveTrackingFormat(vehicleId: any, telemetryData: any): VehicleTelemetry {
    return {
      vehicleId: String(vehicleId),
      tripId: String(telemetryData.tripId),
      routeId: String(telemetryData.routeId),
      driverId: String(telemetryData.driverId),
      timestamp: telemetryData.timestamp?.getTime() || Date.now(),
      latitude: parseFloat(telemetryData.latitude),
      longitude: parseFloat(telemetryData.longitude),
      speed: telemetryData.speed ? parseFloat(telemetryData.speed) : 0,
      bearing: telemetryData.heading ? parseFloat(telemetryData.heading) : 0,
      altitude: telemetryData.altitude ? parseFloat(telemetryData.altitude) : undefined,
      accuracy: telemetryData.accuracy ? parseFloat(telemetryData.accuracy) : undefined,
      heading: telemetryData.heading ? parseFloat(telemetryData.heading) : undefined,
    };
  }
}

export const liveTrackingService = new LiveTrackingService();
export default liveTrackingService;

