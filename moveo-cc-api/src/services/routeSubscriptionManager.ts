import { logger } from '@/utils/logger';

/**
 * Manages route subscriptions for trip events
 * Maps routeId -> Set of client socket IDs
 */
export class RouteSubscriptionManager {
  private subscriptions: Map<string, Set<string>> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map();

  public subscribe(routeId: string, socketId: string): boolean {
    if (!this.subscriptions.has(routeId)) {
      this.subscriptions.set(routeId, new Set());
    }

    const routeSubscribers = this.subscriptions.get(routeId)!;
    const isNewSubscription = !routeSubscribers.has(socketId);

    if (isNewSubscription) {
      routeSubscribers.add(socketId);

      if (!this.clientSubscriptions.has(socketId)) {
        this.clientSubscriptions.set(socketId, new Set());
      }
      this.clientSubscriptions.get(socketId)!.add(routeId);

      logger.debug(`Client ${socketId} subscribed to route ${routeId}`, {
        totalSubscribersForRoute: routeSubscribers.size,
      });
    }

    return isNewSubscription;
  }

  public unsubscribe(routeId: string, socketId: string): boolean {
    const routeSubscribers = this.subscriptions.get(routeId);

    if (!routeSubscribers) {
      return false;
    }

    const wasSubscribed = routeSubscribers.has(socketId);

    if (wasSubscribed) {
      routeSubscribers.delete(socketId);

      const clientRoutes = this.clientSubscriptions.get(socketId);
      if (clientRoutes) {
        clientRoutes.delete(routeId);
      }

      if (routeSubscribers.size === 0) {
        this.subscriptions.delete(routeId);
      }

      logger.debug(`Client ${socketId} unsubscribed from route ${routeId}`);
    }

    return wasSubscribed;
  }

  public getSubscribers(routeId: string): Set<string> {
    return this.subscriptions.get(routeId) ?? new Set();
  }

  public getClientSubscriptions(socketId: string): Set<string> {
    return this.clientSubscriptions.get(socketId) ?? new Set();
  }

  public removeClient(socketId: string): string[] {
    const routeIds = Array.from(this.clientSubscriptions.get(socketId) ?? []);

    for (const routeId of routeIds) {
      this.unsubscribe(routeId, socketId);
    }

    this.clientSubscriptions.delete(socketId);

    if (routeIds.length > 0) {
      logger.debug(`Removed client ${socketId} from ${routeIds.length} routes`);
    }

    return routeIds;
  }

  public isSubscribed(routeId: string, socketId: string): boolean {
    return this.subscriptions.get(routeId)?.has(socketId) ?? false;
  }

  public getStats(): {
    totalRoutes: number;
    totalClients: number;
    totalSubscriptions: number;
    routeSubscriptions: Record<string, number>;
  } {
    const routeSubscriptions: Record<string, number> = {};
    let totalSubscriptions = 0;

    for (const [routeId, subscribers] of this.subscriptions.entries()) {
      routeSubscriptions[routeId] = subscribers.size;
      totalSubscriptions += subscribers.size;
    }

    return {
      totalRoutes: this.subscriptions.size,
      totalClients: this.clientSubscriptions.size,
      totalSubscriptions,
      routeSubscriptions,
    };
  }

  public clear(): void {
    this.subscriptions.clear();
    this.clientSubscriptions.clear();
    logger.info('All route subscriptions cleared');
  }
}

export const routeSubscriptionManager = new RouteSubscriptionManager();
export default routeSubscriptionManager;
