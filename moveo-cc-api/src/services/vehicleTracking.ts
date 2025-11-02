import { VehicleTelemetry, BatchedTelemetry } from '@/types';
import { logger } from '@/utils/logger';
import { subscriptionManager } from './subscriptionManager';
import { telemetryBatcher } from './telemetryBatcher';
import { cacheService } from './cacheService';

export class VehicleTracking {
  private onBatchEmission: ((batch: BatchedTelemetry) => void) | null = null;
  private stats = { totalTelemetryReceived: 0 };

  constructor() {
    telemetryBatcher.onBatchReady((batch) => {
      this.handleBatchReady(batch);
    });
    logger.info('VehicleTracking service initialized');
  }

  public setOnBatchEmission(callback: (batch: BatchedTelemetry) => void): void {
    this.onBatchEmission = callback;
  }

  public receiveTelemetry(telemetry: VehicleTelemetry): void {
    if (!this.validateTelemetry(telemetry)) {
      logger.warn('Invalid telemetry received', { vehicleId: telemetry.vehicleId });
      return;
    }

    this.stats.totalTelemetryReceived++;
    telemetryBatcher.addTelemetry(telemetry);

    logger.debug(`Telemetry received for vehicle ${telemetry.vehicleId}`, {
      speed: telemetry.speed,
      lat: telemetry.latitude,
      lon: telemetry.longitude,
    });
  }

  public subscribeClient(vehicleId: string, socketId: string): boolean {
    return subscriptionManager.subscribe(vehicleId, socketId);
  }

  public unsubscribeClient(vehicleId: string, socketId: string): boolean {
    return subscriptionManager.unsubscribe(vehicleId, socketId);
  }

  public removeClient(socketId: string): string[] {
    return subscriptionManager.removeClient(socketId);
  }

  public isClientSubscribed(vehicleId: string, socketId: string): boolean {
    return subscriptionManager.isSubscribed(vehicleId, socketId);
  }

  public flushPendingBatches(): void {
    const batches = telemetryBatcher.flushAll();
    logger.info(`Flushed ${batches.length} batches`);
  }

  public getStats(): {
    totalTelemetryReceived: number;
    subscriptions: {
      totalVehicles: number;
      totalClients: number;
      totalSubscriptions: number;
      vehicleSubscriptions: Record<string, number>;
    };
    batcher: {
      totalBatches: number;
      totalPoints: number;
      totalVehicleUpdates: number;
      pendingBatches: number;
      bufferedVehicles: number;
    };
  } {
    return {
      totalTelemetryReceived: this.stats.totalTelemetryReceived,
      subscriptions: subscriptionManager.getStats(),
      batcher: telemetryBatcher.getStats(),
    };
  }

  public clear(): void {
    subscriptionManager.clear();
    telemetryBatcher.clear();
    this.stats.totalTelemetryReceived = 0;
    logger.info('VehicleTracking cleared');
  }

  private handleBatchReady(batch: BatchedTelemetry): void {
    logger.debug(`Processing batch with ${batch.pointCount} vehicles`, {
      batchId: batch.batchId,
    });

    (async () => {
      try {
        const enrichedDataPoints = await Promise.all(
          batch.dataPoints.map(point => cacheService.enrichTelemetry(point))
        );

        const enrichedBatch: BatchedTelemetry = {
          ...batch,
          dataPoints: enrichedDataPoints,
        };

        if (this.onBatchEmission) {
          try {
            this.onBatchEmission(enrichedBatch);
          } catch (error) {
            logger.error('Error in batch emission callback', error);
          }
        }
      } catch (error) {
        logger.error('Error enriching batch telemetry', error);
        if (this.onBatchEmission) {
          try {
            this.onBatchEmission(batch);
          } catch (emitError) {
            logger.error('Error emitting fallback batch', emitError);
          }
        }
      }
    })();
  }

  private validateTelemetry(telemetry: VehicleTelemetry): boolean {
    if (!telemetry.vehicleId || typeof telemetry.vehicleId !== 'string') {
      return false;
    }

    if (typeof telemetry.timestamp !== 'number' || telemetry.timestamp <= 0) {
      return false;
    }

    if (typeof telemetry.latitude !== 'number' || telemetry.latitude < -90 || telemetry.latitude > 90) {
      return false;
    }

    if (typeof telemetry.longitude !== 'number' || telemetry.longitude < -180 || telemetry.longitude > 180) {
      return false;
    }

    if (typeof telemetry.speed !== 'number' || telemetry.speed < 0) {
      return false;
    }

    if (typeof telemetry.bearing !== 'number' || telemetry.bearing < 0 || telemetry.bearing > 360) {
      return false;
    }

    return true;
  }
}

export const vehicleTracking = new VehicleTracking();
export default vehicleTracking;
