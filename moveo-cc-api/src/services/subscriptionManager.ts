import { logger } from '@/utils/logger';

export class SubscriptionManager {
  private subscriptions: Map<string, Set<string>> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map();

  public subscribe(vehicleId: string, socketId: string): boolean {
    if (!this.subscriptions.has(vehicleId)) {
      this.subscriptions.set(vehicleId, new Set());
    }

    const vehicleSubscribers = this.subscriptions.get(vehicleId)!;
    const isNewSubscription = !vehicleSubscribers.has(socketId);

    if (isNewSubscription) {
      vehicleSubscribers.add(socketId);

      if (!this.clientSubscriptions.has(socketId)) {
        this.clientSubscriptions.set(socketId, new Set());
      }
      this.clientSubscriptions.get(socketId)!.add(vehicleId);

      logger.debug(`Client ${socketId} subscribed to vehicle ${vehicleId}`, {
        totalSubscribersForVehicle: vehicleSubscribers.size,
      });
    }

    return isNewSubscription;
  }

  public unsubscribe(vehicleId: string, socketId: string): boolean {
    const vehicleSubscribers = this.subscriptions.get(vehicleId);

    if (!vehicleSubscribers) {
      return false;
    }

    const wasSubscribed = vehicleSubscribers.has(socketId);

    if (wasSubscribed) {
      vehicleSubscribers.delete(socketId);

      const clientVehicles = this.clientSubscriptions.get(socketId);
      if (clientVehicles) {
        clientVehicles.delete(vehicleId);
      }

      if (vehicleSubscribers.size === 0) {
        this.subscriptions.delete(vehicleId);
      }

      logger.debug(`Client ${socketId} unsubscribed from vehicle ${vehicleId}`);
    }

    return wasSubscribed;
  }

  public getSubscribers(vehicleId: string): Set<string> {
    return this.subscriptions.get(vehicleId) ?? new Set();
  }

  public getClientSubscriptions(socketId: string): Set<string> {
    return this.clientSubscriptions.get(socketId) ?? new Set();
  }

  public removeClient(socketId: string): string[] {
    const vehicleIds = Array.from(this.clientSubscriptions.get(socketId) ?? []);

    for (const vehicleId of vehicleIds) {
      this.unsubscribe(vehicleId, socketId);
    }

    this.clientSubscriptions.delete(socketId);

    if (vehicleIds.length > 0) {
      logger.debug(`Removed client ${socketId} from ${vehicleIds.length} vehicles`);
    }

    return vehicleIds;
  }

  public isSubscribed(vehicleId: string, socketId: string): boolean {
    return this.subscriptions.get(vehicleId)?.has(socketId) ?? false;
  }

  public getStats(): {
    totalVehicles: number;
    totalClients: number;
    totalSubscriptions: number;
    vehicleSubscriptions: Record<string, number>;
  } {
    const vehicleSubscriptions: Record<string, number> = {};
    let totalSubscriptions = 0;

    for (const [vehicleId, subscribers] of this.subscriptions.entries()) {
      vehicleSubscriptions[vehicleId] = subscribers.size;
      totalSubscriptions += subscribers.size;
    }

    return {
      totalVehicles: this.subscriptions.size,
      totalClients: this.clientSubscriptions.size,
      totalSubscriptions,
      vehicleSubscriptions,
    };
  }

  public clear(): void {
    this.subscriptions.clear();
    this.clientSubscriptions.clear();
    logger.info('All subscriptions cleared');
  }
}

export const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;

