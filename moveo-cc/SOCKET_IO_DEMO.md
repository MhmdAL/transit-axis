# MoveoCC-API Socket.IO Demo 🚗📡

This directory contains demonstrations of how to connect to and use the MoveoCC-API real-time vehicle tracking service.

## Quick Start

### 1. HTML Demo (Standalone)

The easiest way to test the Socket.IO connection is with the HTML demo file.

```bash
# Open in browser
open public/socket-io-demo.html
# or navigate to: http://localhost:3000/socket-io-demo.html
```

**Features:**
- ✅ Visual connection status indicator
- ✅ Subscribe/unsubscribe to vehicles
- ✅ Send test telemetry data
- ✅ Real-time batch reception
- ✅ Server statistics
- ✅ Live event log with timestamps
- ✅ Responsive design

**How to use:**
1. Enter server URL (default: `http://localhost:3004`)
2. Click **Connect** button
3. Enter a vehicle ID (e.g., `truck_001`)
4. Click **Subscribe** to watch the vehicle
5. Modify telemetry values (lat, lon, speed, bearing)
6. Click **Send Telemetry** to simulate vehicle data
7. Watch the **Latest Batch Data** section update in real-time

---

### 2. React Hook (In Components)

Use the `useVehicleTracking` hook in your React components for seamless integration.

#### Installation

First, install Socket.IO client:
```bash
npm install socket.io-client
```

#### Basic Usage

```typescript
import { useVehicleTracking } from '@/hooks/useVehicleTracking';

function VehicleTracker() {
  const {
    isConnected,
    subscriptions,
    latestBatch,
    error,
    subscribeVehicle,
    unsubscribeVehicle,
    sendTelemetry,
    requestStats,
  } = useVehicleTracking();

  return (
    <div>
      <div>
        Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}
        {error && <p>Error: {error}</p>}
      </div>

      <button onClick={() => subscribeVehicle('truck_001')}>
        Subscribe to Truck 001
      </button>

      {latestBatch && (
        <div>
          <h3>Latest Updates</h3>
          {latestBatch.dataPoints.map((point) => (
            <div key={point.vehicleId}>
              <p>{point.vehicleId}</p>
              <p>
                📍 {point.latitude}, {point.longitude}
              </p>
              <p>💨 {point.speed} km/h | 🧭 {point.bearing}°</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => requestStats((stats) => console.log(stats))}>
        Get Server Stats
      </button>
    </div>
  );
}
```

#### Hook API

```typescript
const {
  // State
  isConnected: boolean;
  subscriptions: string[];  // Array of vehicle IDs
  latestBatch: BatchedTelemetry | null;
  serverStats: ServerStats | null;
  error: string | null;

  // Methods
  connect(): void;
  disconnect(): void;
  subscribeVehicle(vehicleId: string): void;
  unsubscribeVehicle(vehicleId: string): void;
  sendTelemetry(telemetry: VehicleTelemetry): void;
  requestStats(callback?: (stats: ServerStats) => void): void;
} = useVehicleTracking(options);
```

#### Options

```typescript
interface UseVehicleTrackingOptions {
  serverUrl?: string;        // Default: process.env.REACT_APP_VEHICLE_TRACKING_URL || 'http://localhost:3004'
  autoConnect?: boolean;     // Default: true
}
```

#### Environment Variables

Create a `.env` file for configuration:
```env
REACT_APP_VEHICLE_TRACKING_URL=http://localhost:3004
```

---

## Advanced Usage

### Example: Real-time Vehicle Map

```typescript
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import { useEffect, useState } from 'react';

function VehicleMap() {
  const { latestBatch, subscribeVehicle } = useVehicleTracking();
  const [vehicles, setVehicles] = useState<Record<string, any>>({});

  useEffect(() => {
    // Subscribe to multiple vehicles
    ['truck_001', 'truck_002', 'truck_003'].forEach(subscribeVehicle);
  }, [subscribeVehicle]);

  useEffect(() => {
    if (!latestBatch) return;

    // Update vehicles with latest data
    setVehicles((prev) => {
      const updated = { ...prev };
      for (const point of latestBatch.dataPoints) {
        updated[point.vehicleId] = {
          ...point,
          lastUpdate: new Date(),
        };
      }
      return updated;
    });
  }, [latestBatch]);

  return (
    <div>
      {Object.entries(vehicles).map(([id, data]) => (
        <div key={id}>
          <h4>{id}</h4>
          <p>Position: {data.latitude}, {data.longitude}</p>
          <p>Speed: {data.speed} km/h</p>
          <p>Bearing: {data.bearing}°</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Manual Connection Management

```typescript
function VehicleTracker() {
  const { connect, disconnect, isConnected } = useVehicleTracking({
    autoConnect: false,  // Don't auto-connect
  });

  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

---

## Socket.IO Events Reference

### Client → Server

```typescript
// Subscribe to vehicle
socket.emit('subscribe:vehicle', 
  { vehicleId: 'truck_001' }, 
  (response) => { /* callback */ }
);

// Unsubscribe from vehicle
socket.emit('unsubscribe:vehicle', 
  { vehicleId: 'truck_001' }, 
  (response) => { /* callback */ }
);

// Send telemetry (as vehicle)
socket.emit('vehicle:telemetry', {
  vehicleId: 'truck_001',
  timestamp: Date.now(),
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 55,
  bearing: 270,
});

// Request server stats
socket.emit('request:stats', {}, (stats) => { /* callback */ });
```

### Server → Client

```typescript
// Subscription confirmed
socket.on('subscription:confirmed', (data) => {
  // { vehicleId: string, subscribedAt: number }
});

// Subscription removed
socket.on('subscription:removed', (data) => {
  // { vehicleId: string }
});

// Telemetry batch (multi-vehicle)
socket.on('vehicle:telemetry:batch', (batch) => {
  // {
  //   batchId: string,
  //   timestamp: number,
  //   dataPoints: VehicleTelemetry[],
  //   count: number
  // }
});

// Error
socket.on('error', (error) => {
  // { message: string, code: string, timestamp: number }
});
```

---

## Testing the Full Flow

### Step 1: Start MoveoCC-API

```bash
# In moveo-cc-api directory
npm run dev
# or with docker-compose
docker-compose up moveo-cc-api
```

Server should be running at: `http://localhost:3004`

### Step 2: Open HTML Demo

```bash
# Open in browser
open moveo-cc/public/socket-io-demo.html
```

### Step 3: Test Connection Flow

1. **Connect** → See green indicator
2. **Subscribe** → Vehicle added to subscriptions list
3. **Send Telemetry** → Triggers batch creation
4. **Observe Batch** → Latest data appears in "Latest Batch Data" section
5. **Get Stats** → View server statistics

### Step 4: Multi-Vehicle Test

Change the vehicle ID and repeat steps 2-3 with multiple vehicles:
- `truck_001`
- `truck_002`
- `truck_003`

**Result:** Each telemetry update creates a batch with multiple vehicles

---

## Troubleshooting

### Connection Refused
```
Error: Connection refused
```
**Solution:** Ensure MoveoCC-API is running on port 3004
```bash
# Check if service is running
curl http://localhost:3004/health
```

### CORS Issues
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** CORS is configured in MoveoCC-API, but ensure:
- Server URL is correct
- Both services are on the same network (if using Docker)

### Telemetry Not Received
1. Verify you're subscribed to the vehicle
2. Check browser console for errors
3. View server logs: `docker logs moveo-cc-api`

---

## Performance Tips

1. **Subscribe Strategically**
   - Only subscribe to vehicles you need
   - Unsubscribe when done to save bandwidth

2. **Batch Processing**
   - Batches arrive every 1 second (configurable)
   - All subscribed vehicles per client in one message

3. **Monitor Server**
   - Use `/stats` endpoint to monitor load
   - Track connected clients and active vehicles

---

## File Structure

```
moveo-cc/
├── public/
│   └── socket-io-demo.html        # Standalone HTML demo
├── src/
│   ├── hooks/
│   │   └── useVehicleTracking.ts   # React hook for Socket.IO
│   └── types/
│       └── index.ts               # TypeScript types
└── SOCKET_IO_DEMO.md              # This file
```

---

## Next Steps

- 📚 Read the [MoveoCC-API README](../moveo-cc-api/README.md) for full API docs
- 🚀 Integrate into your main application
- 📊 Build real-time dashboards
- 🗺️ Create live tracking maps

---

**Need Help?** Check the HTML demo logs or server logs for detailed error messages.

