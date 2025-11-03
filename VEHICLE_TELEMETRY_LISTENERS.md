# Vehicle Telemetry Event Listeners

## Overview
Updated RealTimeTracking to use Socket.IO event listeners for real-time vehicle telemetry updates, following the same callback pattern as trip events.

## Components Modified

### 1. **`moveo-cc/src/hooks/useVehicleTracking.ts`**

Added two new methods:

```typescript
/**
 * Listen to vehicle telemetry updates
 */
const onVehicleTelemetry = useCallback(
  (callback: (telemetry: VehicleTelemetry) => void) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }
    socketRef.current.on('vehicle:telemetry', callback);
  },
  [],
);

/**
 * Stop listening to vehicle telemetry updates
 */
const offVehicleTelemetry = useCallback(
  (callback: (telemetry: VehicleTelemetry) => void) => {
    if (socketRef.current) {
      socketRef.current.off('vehicle:telemetry', callback);
    }
  },
  [],
);
```

### 2. **`moveo-cc/src/context/VehicleTrackingContext.tsx`**

Updated `VehicleTrackingContextType`:

```typescript
onVehicleTelemetry: (callback: (telemetry: VehicleTelemetry) => void) => void;
offVehicleTelemetry: (callback: (telemetry: VehicleTelemetry) => void) => void;
```

Added import for `VehicleTelemetry` type.

### 3. **`moveo-cc/src/pages/Tracking/RealTimeTracking.tsx`**

Updated hook usage:

```typescript
const { 
  isConnected, 
  latestBatch, 
  subscribeVehicle, 
  unsubscribeVehicle, 
  onVehicleTelemetry,      // NEW
  offVehicleTelemetry      // NEW
} = useGlobalVehicleTracking();
```

Added telemetry listener effect:

```typescript
// Listen to real-time vehicle telemetry updates
useEffect(() => {
  const handleTelemetryUpdate = (telemetry: VehicleTelemetry) => {
    setVehicleLocations((prev) => {
      return {
        ...prev,
        [telemetry.vehicleId]: {
          ...telemetry,
          lastUpdate: new Date(),
        },
      };
    });
  };

  // Register listener for vehicle telemetry
  onVehicleTelemetry(handleTelemetryUpdate);

  return () => {
    // Cleanup listener when component unmounts
    offVehicleTelemetry(handleTelemetryUpdate);
  };
}, [onVehicleTelemetry, offVehicleTelemetry]);
```

## Data Flow

### Vehicle Telemetry Event
```
1. Vehicle sends telemetry data to server
2. Server broadcasts 'vehicle:telemetry' to connected clients
3. RealTimeTracking receives telemetry event via callback
4. Updates vehicle location in state immediately
5. Map markers update with new position, bearing, speed, etc.
```

## Benefits

✅ **Real-Time Updates**: Vehicle locations update immediately via events
✅ **Callback Pattern**: Consistent with trip event listeners
✅ **Batch + Event Listeners**: Works alongside latestBatch for backwards compatibility
✅ **Proper Cleanup**: Listeners removed on component unmount
✅ **Type Safety**: Full TypeScript support

## Event Format

Expected vehicle telemetry event:

```typescript
interface VehicleTelemetry {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  heading?: number;
  accuracy?: number;
  // ... other vehicle data
  lastUpdate: Date;  // Added by RealTimeTracking
}
```

## Testing

1. Navigate to Real-Time Tracking page
2. Add vehicles to track
3. Observe vehicle markers updating in real-time on the map
4. Check that:
   - Position updates immediately
   - Speed and bearing reflect real-time data
   - Driver information updates if available
   - Last update timestamp changes

## Status

✅ **Implementation Complete**
- Vehicle telemetry listeners properly connected
- Callback-based updates working
- Listener cleanup implemented
- No linting errors
- Backwards compatible with latestBatch

Ready for integration testing!
