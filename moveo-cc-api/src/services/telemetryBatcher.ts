import { VehicleTelemetry, BatchedTelemetry } from '@/types';
import { logger } from '@/utils/logger';
import config from '@/config/config';

export class TelemetryBatcher {
  private buffer: Map<string, VehicleTelemetry> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private batchQueue: BatchedTelemetry[] = [];
  private batchReadyCallbacks: Array<(batch: BatchedTelemetry) => void> = [];
  private batchWindowStart: number = 0;
  private stats = {
    totalBatches: 0,
    totalPoints: 0,
    totalVehicleUpdates: 0,
  };

  constructor(private batchIntervalMs: number = config.batchIntervalMs) {
    logger.info(`TelemetryBatcher initialized`, { batchIntervalMs: this.batchIntervalMs });
    this.startBatchTimer();
  }

  public setBatchInterval(intervalMs: number): void {
    if (intervalMs < 100 || intervalMs > 60000) {
      logger.warn('Invalid batch interval, ignoring', { intervalMs });
      return;
    }

    if (this.batchIntervalMs === intervalMs) {
      return;
    }

    this.batchIntervalMs = intervalMs;
    logger.info(`Batch interval updated to ${intervalMs}ms`);

    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.startBatchTimer();
  }

  public addTelemetry(telemetry: VehicleTelemetry): void {
    const vehicleId = telemetry.vehicleId;
    this.buffer.set(vehicleId, telemetry);
    this.stats.totalVehicleUpdates++;

    logger.debug(`Telemetry updated for vehicle ${vehicleId}`, {
      speed: telemetry.speed,
      lat: telemetry.latitude,
      lon: telemetry.longitude,
      bufferSize: this.buffer.size,
    });
  }

  public onBatchReady(callback: (batch: BatchedTelemetry) => void): void {
    this.batchReadyCallbacks.push(callback);
  }

  public flushBatch(): BatchedTelemetry | undefined {
    if (this.buffer.size === 0) {
      return undefined;
    }

    const dataPoints = Array.from(this.buffer.values());
    const timestamps = dataPoints.map(p => p.timestamp);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);

    const batch = this.createBatch(dataPoints, startTime, endTime);
    this.buffer.clear();
    this.emitBatch(batch);

    return batch;
  }

  public flushAll(): BatchedTelemetry[] {
    const batch = this.flushBatch();
    return batch ? [batch] : [];
  }

  public getPendingBatches(): BatchedTelemetry[] {
    return [...this.batchQueue];
  }

  public dequeueBatch(): BatchedTelemetry | undefined {
    return this.batchQueue.shift();
  }

  public getStats(): {
    totalBatches: number;
    totalPoints: number;
    totalVehicleUpdates: number;
    pendingBatches: number;
    bufferedVehicles: number;
    batchIntervalMs: number;
  } {
    return {
      totalBatches: this.stats.totalBatches,
      totalPoints: this.stats.totalPoints,
      totalVehicleUpdates: this.stats.totalVehicleUpdates,
      pendingBatches: this.batchQueue.length,
      bufferedVehicles: this.buffer.size,
      batchIntervalMs: this.batchIntervalMs,
    };
  }

  public clear(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.buffer.clear();
    this.batchQueue = [];
    logger.info('TelemetryBatcher cleared');
  }

  private createBatch(
    dataPoints: VehicleTelemetry[],
    startTime: number,
    endTime: number,
  ): BatchedTelemetry {
    if (dataPoints.length === 0) {
      throw new Error('Cannot create batch from empty data');
    }

    const batchId = this.generateBatchId();
    const batch: BatchedTelemetry = {
      batchId,
      timestamp: endTime,
      startTime,
      endTime,
      dataPoints,
      pointCount: dataPoints.length,
    };

    this.stats.totalPoints += dataPoints.length;
    return batch;
  }

  private emitBatch(batch: BatchedTelemetry): void {
    this.batchQueue.push(batch);
    this.stats.totalBatches++;

    for (const callback of this.batchReadyCallbacks) {
      try {
        callback(batch);
      } catch (error) {
        logger.error('Error in batch ready callback', error);
      }
    }

    logger.debug(`Batch emitted`, {
      batchId: batch.batchId,
      vehicleCount: batch.pointCount,
      timeWindow: `${batch.startTime} - ${batch.endTime}`,
    });
  }

  private startBatchTimer(): void {
    this.batchWindowStart = Date.now();

    this.batchTimer = setInterval(() => {
      const batch = this.flushBatch();
      if (batch) {
        logger.debug(`Batch timer fired`, {
          vehicleCount: batch.pointCount,
          interval: this.batchIntervalMs,
        });
      }
    }, this.batchIntervalMs);
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const telemetryBatcher = new TelemetryBatcher();
export default telemetryBatcher;
