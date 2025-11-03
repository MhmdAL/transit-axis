# Route Subscription Integration - Updated

## Summary of Changes

Fixed the Trip Monitoring integration to use **proper route subscription methods** instead of vehicle subscription methods.

## Components Updated

### 1. **`moveo-cc/src/hooks/useVehicleTracking.ts`**

Added two new methods:

```typescript
/**
 * Subscribe to a route for trip events
 */
const subscribeRoute = useCallback(
  (routeId: string) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }

    socketRef.current.emit('subscribe:route', { routeId }, (response: any) => {
      if (!response.success) {
        setError(response.error || 'Failed to subscribe to route');
      }
      console.log('Subscribed to route:', response);
    });
  },
  [],
);

/**
 * Unsubscribe from a route
 */
const unsubscribeRoute = useCallback(
  (routeId: string) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }

    socketRef.current.emit('unsubscribe:route', { routeId }, (response: any) => {
      if (!response.success) {
        setError(response.error || 'Failed to unsubscribe from route');
      }
    });
  },
  [],
);
```

### 2. **`moveo-cc/src/context/VehicleTrackingContext.tsx`**

Updated the `VehicleTrackingContextType` interface:

```typescript
interface VehicleTrackingContextType {
  isConnected: boolean;
  subscriptions: string[];
  latestBatch: BatchedTelemetry | null;
  serverStats: ServerStats | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribeVehicle: (vehicleId: string) => void;
  unsubscribeVehicle: (vehicleId: string) => void;
  subscribeRoute: (routeId: string) => void;      // NEW
  unsubscribeRoute: (routeId: string) => void;    // NEW
  sendTelemetry: (telemetry: any) => void;
  requestStats: (callback?: (stats: ServerStats) => void) => void;
}
```

### 3. **`moveo-cc/src/pages/TripMonitoring/TripMonitoring.tsx`**

Updated the route subscription logic:

```typescript
// Get route subscription methods instead of vehicle methods
const { subscribeRoute, unsubscribeRoute } = useGlobalVehicleTracking();

// Subscribe to route events for real-time updates
React.useEffect(() => {
  if (selectedRoutes.length === 0) return;

  // Subscribe to each selected route
  selectedRoutes.forEach(route => {
    subscribeRoute(route.id);  // Direct route ID, not 'route:id'
  });

  return () => {
    // Unsubscribe from routes when component unmounts or routes change
    selectedRoutes.forEach(route => {
      unsubscribeRoute(route.id);
    });
  };
}, [selectedRoutes, subscribeRoute, unsubscribeRoute]);
```

## Data Flow

### Route Subscription Flow
```
1. TripMonitoring selects routes
2. subscribeRoute(routeId) emits 'subscribe:route' to moveo-cc-api
3. moveo-cc-api receives event and uses RouteSubscriptionManager to track subscription
4. When a trip starts/ends on that route, moveo-cc-api broadcasts to subscribed clients
5. TripMonitoring receives trip:start/trip:end events for that route
```

## Socket.IO Events

### Client to Server
- **subscribe:route** - Request subscription to a specific route's events
  ```typescript
  socket.emit('subscribe:route', { routeId: string });
  ```

- **unsubscribe:route** - Cancel subscription to a route's events
  ```typescript
  socket.emit('unsubscribe:route', { routeId: string });
  ```

### Server to Client
- **route:subscription:confirmed** - Subscription successful
- **route:subscription:removed** - Unsubscription successful
- **trip:start** - A trip has started on a subscribed route
- **trip:end** - A trip has ended on a subscribed route

## Testing

To test the route subscriptions:

1. **Navigate to Trip Monitoring**: `/trip-monitoring`
2. **Select a date** and **one or more routes**
3. **Check browser console** for subscription confirmations:
   ```
   Subscribed to route: { success: true, routeId: '...', subscribedAt: ... }
   ```
4. **Open VehicleEmulator** and create/end trips on selected routes
5. **Verify real-time updates** appear in the Trip Monitoring timeline

## Status

✅ **Complete**: 
- Route subscription methods implemented
- Context properly typed and extended
- TripMonitoring using correct route subscription
- No linting errors

The system is now ready for proper route-based event streaming!
