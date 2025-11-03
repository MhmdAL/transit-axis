# Trip Events API - moveo-cc-api Integration

## Overview

The moveo-cc-api now supports real-time trip start/end event broadcasting to clients subscribed to routes. When a trip starts or ends, the tripController can notify all monitoring clients watching that route.

## Architecture

### Components

1. **RouteSubscriptionManager** (`src/services/routeSubscriptionManager.ts`)
   - Manages route subscriptions similar to vehicle subscriptions
   - Tracks which clients are subscribed to each route
   - Provides subscriber lookup for broadcasting

2. **Trip Events Endpoint** (`POST /api/trip-events`)
   - Receives trip start/end events from tripController
   - Validates event data
   - Broadcasts to all subscribers of the affected route

3. **Socket.IO Route Handlers**
   - `subscribe:route` - Client subscribes to route events
   - `unsubscribe:route` - Client unsubscribes from route
   - `trip:start` - Trip start event (emitted to subscribers)
   - `trip:end` - Trip end event (emitted to subscribers)

## Usage from tripController

### Step 1: Send Trip Event to moveo-cc-api

After creating or ending a trip, call the trip events endpoint:

```typescript
// In tripController.ts - startTrip or endTrip method
const tripEventUrl = process.env.TRIP_EVENTS_API_URL || 'http://localhost:3004/api/trip-events';

const tripEvent = {
  id: trip.id.toString(),
  routeId: trip.routeId.toString(),
  vehicleId: trip.vehicleId.toString(),
  driverId: trip.driverId.toString(),
  eventType: 'trip:start', // or 'trip:end'
  timestamp: Date.now(),
  startTime: trip.startTime?.toISOString(),
  endTime: trip.endTime?.toISOString(),
  status: trip.status,
};

try {
  const response = await fetch(tripEventUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripEvent),
  });

  const data = await response.json();
  logger.info(`Trip event sent, notified ${data.subscribersNotified} clients`);
} catch (error) {
  logger.error('Failed to send trip event:', error);
  // Continue regardless - events are best effort
}
```

### Step 2: Frontend Subscribes to Route Events

In RealTimeTracking or any monitoring component:

```typescript
import { useGlobalVehicleTracking } from '@/context/VehicleTrackingContext';

const MyComponent = () => {
  const tracking = useGlobalVehicleTracking();

  useEffect(() => {
    // Subscribe to route events
    const socket = tracking.subscribeRoute('route-123');

    // Listen for trip events
    socket.on('trip:start', (event) => {
      console.log('Trip started:', event);
      // Update UI with trip start event
    });

    socket.on('trip:end', (event) => {
      console.log('Trip ended:', event);
      // Update UI with trip end event
    });

    return () => {
      socket.off('trip:start');
      socket.off('trip:end');
      tracking.unsubscribeRoute('route-123');
    };
  }, []);
};
```

## API Reference

### Trip Event Object

```typescript
interface TripEvent {
  id: string;              // Trip ID
  routeId: string;         // Route ID
  vehicleId: string;       // Vehicle ID
  driverId: string;        // Driver ID
  eventType: 'trip:start' | 'trip:end';
  timestamp: number;       // ms since epoch
  startTime?: string;      // ISO 8601
  endTime?: string;        // ISO 8601
  status?: string;         // Trip status
}
```

### Endpoint: POST /api/trip-events

**Request Body:**
```json
{
  "id": "trip-123",
  "routeId": "route-456",
  "vehicleId": "vehicle-789",
  "driverId": "driver-111",
  "eventType": "trip:start",
  "timestamp": 1699000000000,
  "startTime": "2024-11-03T14:30:00Z",
  "status": "active"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Trip event broadcasted",
  "subscribersNotified": 5
}
```

**Response (No Subscribers):**
```json
{
  "success": true,
  "message": "Trip event received but no subscribers"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Trip event must include id, routeId, and eventType"
}
```

## Socket.IO Events

### Client → Server

**Subscribe to route:**
```typescript
socket.emit('subscribe:route', { routeId: 'route-123' }, (response) => {
  console.log('Subscribed:', response.success);
});
```

**Unsubscribe from route:**
```typescript
socket.emit('unsubscribe:route', { routeId: 'route-123' }, (response) => {
  console.log('Unsubscribed:', response.success);
});
```

### Server → Client

**Route subscription confirmed:**
```typescript
socket.on('route:subscription:confirmed', (payload) => {
  console.log('Subscribed to route:', payload.routeId);
  console.log('Subscribed at:', new Date(payload.subscribedAt));
});
```

**Route subscription removed:**
```typescript
socket.on('route:subscription:removed', (payload) => {
  console.log('Unsubscribed from route:', payload.routeId);
});
```

**Trip start event:**
```typescript
socket.on('trip:start', (event: TripEvent) => {
  console.log('Trip started:', event.id, 'on route:', event.routeId);
});
```

**Trip end event:**
```typescript
socket.on('trip:end', (event: TripEvent) => {
  console.log('Trip ended:', event.id, 'on route:', event.routeId);
});
```

## Implementation Steps

1. **In tripController.ts (moveo-core)**:
   - After `createTrip`: Send `trip:start` event
   - After `endTrip`: Send `trip:end` event
   - Include all trip details in the event payload

2. **In frontend (moveo-cc)**:
   - Add route subscription handlers to components that need real-time updates
   - Listen for `trip:start` and `trip:end` events
   - Update local state or UI based on events

3. **Environment Variables**:
   - Set `TRIP_EVENTS_API_URL` in `.env` (default: `http://localhost:3004/api/trip-events`)

## Error Handling

- Trip event sending is **best-effort**: If the API call fails, the trip is still created/ended
- If no subscribers exist for a route, the API returns success with `subscribersNotified: 0`
- Validate event data before sending to ensure all required fields are present

## Performance Considerations

- Route subscriptions use in-memory Maps similar to vehicle subscriptions
- Broadcasting is O(n) where n is the number of subscribers to that route
- No database queries are performed for event broadcasting
- Events are emitted synchronously with quick dispatch to multiple clients
