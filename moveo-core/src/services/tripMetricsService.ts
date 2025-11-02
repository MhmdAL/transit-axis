/**
 * Trip Metrics Service
 * Calculates trip statistics from telemetry data
 */

interface TelemetryLog {
  speed: number | null;
  odometer: number | null;
  timestamp: Date;
}

interface TripMetrics {
  averageSpeed: number | null;
  maxSpeed: number | null;
  totalDistance: number | null;
  totalDuration: number | null; // in minutes
}

export const tripMetricsService = {
  /**
   * Calculate trip metrics from telemetry logs
   * @param logs - Array of telemetry logs for the trip (must be sorted by timestamp)
   * @returns Trip metrics object
   */
  calculateMetrics(logs: TelemetryLog[]): TripMetrics {
    if (!logs || logs.length === 0) {
      return {
        averageSpeed: null,
        maxSpeed: null,
        totalDistance: null,
        totalDuration: null
      };
    }

    // If only one log entry, we can't calculate metrics
    if (logs.length === 1) {
      return {
        averageSpeed: logs[0].speed || null,
        maxSpeed: logs[0].speed || null,
        totalDistance: null,
        totalDuration: null
      };
    }

    // Sort logs by timestamp to ensure correct order
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstLog = sortedLogs[0];
    const lastLog = sortedLogs[sortedLogs.length - 1];

    // Calculate total duration in minutes
    const durationMs = new Date(lastLog.timestamp).getTime() - new Date(firstLog.timestamp).getTime();
    const totalDuration = durationMs > 0 ? Math.round(durationMs / (1000 * 60)) : 0;

    // Calculate total distance from odometer readings
    let totalDistance: number | null = null;
    if (firstLog.odometer != null && lastLog.odometer != null) {
      totalDistance = Math.max(0, lastLog.odometer - firstLog.odometer);
    }

    // Calculate max speed (filter out null/zero values)
    let maxSpeed: number | null = null;
    const validSpeeds = sortedLogs
      .map((log) => log.speed)
      .filter((speed) => speed != null && speed > 0) as number[];

    if (validSpeeds.length > 0) {
      maxSpeed = Math.max(...validSpeeds);
    }

    // Calculate average speed = total distance / total duration
    let averageSpeed: number | null = null;
    if (totalDistance != null && totalDistance > 0 && totalDuration > 0) {
      averageSpeed = totalDistance / (totalDuration / 60); // Convert minutes to hours
    }

    return {
      averageSpeed: averageSpeed ? Math.round(averageSpeed * 100) / 100 : null,
      maxSpeed: maxSpeed ? Math.round(maxSpeed * 100) / 100 : null,
      totalDistance: totalDistance ? Math.round(totalDistance * 100) / 100 : null,
      totalDuration: totalDuration > 0 ? totalDuration : null
    };
  },

  /**
   * Fetch telemetry logs for a trip and calculate metrics
   * @param vehicleId - Vehicle ID
   * @param tripId - Trip ID
   * @returns Trip metrics
   */
  async calculateTripMetricsFromTelemetry(
    vehicleId: bigint,
    tripId: bigint
  ): Promise<TripMetrics> {
    try {
      const telemetryServiceUrl = process.env.TELEMETRY_SERVICE_API_URL || 'http://localhost:3003';
      const url = `${telemetryServiceUrl}/api/telemetry/${vehicleId}/logs?tripId=${tripId}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch telemetry logs for trip ${tripId}: ${response.statusText}`);
        return {
          averageSpeed: null,
          maxSpeed: null,
          totalDistance: null,
          totalDuration: null
        };
      }

      const data: any = await response.json();

      if (!data?.success || !Array.isArray(data?.data)) {
        console.warn(`Invalid telemetry response for trip ${tripId}`);
        return {
          averageSpeed: null,
          maxSpeed: null,
          totalDistance: null,
          totalDuration: null
        };
      }

      const logs: TelemetryLog[] = data.data.map((log: any) => ({
        speed: log.speed ? parseFloat(log.speed) : null,
        odometer: log.odometer ? parseFloat(log.odometer) : null,
        timestamp: new Date(log.timestamp)
      }));

      return this.calculateMetrics(logs);
    } catch (error) {
      console.error(`Error calculating trip metrics for trip ${tripId}:`, error);
      return {
        averageSpeed: null,
        maxSpeed: null,
        totalDistance: null,
        totalDuration: null
      };
    }
  }
};
