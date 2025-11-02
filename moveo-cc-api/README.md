# MoveoCC-API 🚗📡

Real-time vehicle live tracking API powered by Socket.IO. This service enables clients to subscribe to specific vehicles and receive batched, filtered telemetry data in real-time.

## Features ✨

- 🔌 **Real-time Communication**: Socket.IO-based bidirectional communication
- 📦 **Telemetry Batching**: Intelligently batch telemetry data to reduce network traffic
- 🎯 **Selective Filtering**: Send data only to clients subscribed to specific vehicles
- 🚀 **High Performance**: In-memory data management optimized for low latency
- 📊 **Server Statistics**: Real-time metrics on connections and subscriptions
- 🔒 **Type-Safe**: Full TypeScript support with strict type checking
- 🐳 **Docker Ready**: Pre-configured Docker and Docker Compose setup
- 📝 **Well Documented**: Comprehensive API documentation

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript 5
- **Framework**: Express.js 4
- **Real-time**: Socket.IO 4
- **Development**: Nodemon, ESLint, Jest
- **Containerization**: Docker

## Project Structure

```
moveo-cc-api/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config/
│   │   └── config.ts         # Configuration management
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── middleware/
│   │   ├── errorHandler.ts   # Error handling
│   │   └── notFoundHandler.ts# 404 handler
│   ├── services/
│   │   ├── vehicleTracking.ts
│   │   ├── telemetryBatcher.ts
│   │   └── subscriptionManager.ts
│   ├── routes/
│   │   └── health.ts         # Health check endpoint
│   └── utils/
│       └── logger.ts         # Logging utility
├── dist/                     # Compiled output
├── tests/                    # Test files
├── package.json
├── tsconfig.json
├── .eslintrc
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+ or Docker
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
```bash
cd moveo-cc-api
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

4. **Start development server**:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up

# Or build manually
docker build -t moveo-cc-api .
docker run -p 3001:3001 moveo-cc-api
```

## Configuration

Configure the service via environment variables in `.env`:

```env
# Server
NODE_ENV=development
PORT=3001
SOCKET_IO_PORT=3001

# Logging
LOG_LEVEL=debug

# Telemetry batching
BATCH_INTERVAL_MS=1000      # Time to batch telemetry (ms)
BATCH_MAX_SIZE=100          # Max points per batch

# Socket.IO
SOCKET_IO_PING_INTERVAL=25000
SOCKET_IO_PING_TIMEOUT=60000
SOCKET_IO_MAX_HTTP_BUFFER_SIZE=1000000
```

## API Documentation

### REST Endpoints

#### Health Check
```
GET /health
```

Returns server health status:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

#### Server Statistics
```
GET /stats
```

Returns server metrics and connected clients:
```json
{
  "timestamp": 1704067200000,
  "connectedClients": 10,
  "activeVehicles": 5,
  "totalSubscriptions": 12,
  "vehicleSubscriptions": {
    "vehicle_001": 2,
    "vehicle_002": 1
  },
  "telemetryBatches": {
    "total": 1245,
    "pending": 3
  },
  "uptime": 3600
}
```

## Socket.IO Events

### Client Events (Client → Server)

#### Subscribe to Vehicle
```javascript
socket.emit('subscribe:vehicle', {
  vehicleId: 'vehicle_001'
}, (response) => {
  console.log(response); // { success: true }
});
```

#### Unsubscribe from Vehicle
```javascript
socket.emit('unsubscribe:vehicle', {
  vehicleId: 'vehicle_001'
}, (response) => {
  console.log(response); // { success: true }
});
```

#### Request Server Statistics
```javascript
socket.emit('request:stats', {
  includeVehicleDetails: true
}, (stats) => {
  console.log(stats);
});
```

### Server Events (Server → Client)

#### Batched Telemetry Data
```javascript
socket.on('vehicle:telemetry:batch', (data) => {
  console.log(data);
  // {
  //   vehicleId: 'vehicle_001',
  //   batchId: 'batch_12345',
  //   dataPoints: [...],
  //   timestamp: 1704067200000,
  //   count: 5
  // }
});
```

#### Subscription Confirmed
```javascript
socket.on('subscription:confirmed', (data) => {
  console.log(`Subscribed to ${data.vehicleId}`);
});
```

#### Subscription Removed
```javascript
socket.on('subscription:removed', (data) => {
  console.log(`Unsubscribed from ${data.vehicleId}`);
});
```

#### Error Notification
```javascript
socket.on('error', (error) => {
  console.error(error);
  // { message: '...', code: 'ERROR_CODE', timestamp: ... }
});
```

### Vehicle Events (Vehicle → Server)

#### Send Telemetry
```javascript
socket.emit('vehicle:telemetry', {
  vehicleId: 'vehicle_001',
  timestamp: Date.now(),
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 55,
  bearing: 270,
  altitude: 10,
  accuracy: 5
});
```

## TypeScript Types

Key types available from `@/types`:

```typescript
interface VehicleTelemetry {
  vehicleId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  altitude?: number;
  accuracy?: number;
}

interface BatchedTelemetry {
  vehicleId: string;
  batchId: string;
  startTime: number;
  endTime: number;
  dataPoints: VehicleTelemetry[];
  pointCount: number;
  averaged?: {
    latitude: number;
    longitude: number;
    speed: number;
    bearing: number;
  };
}

interface ServerStats {
  timestamp: number;
  connectedClients: number;
  activeVehicles: number;
  totalSubscriptions: number;
  vehicleSubscriptions: Record<string, number>;
  telemetryBatches: {
    total: number;
    pending: number;
  };
  uptime: number;
}
```

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Linting
```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix issues automatically
```

### Testing
```bash
npm test            # Run tests
npm run test:watch  # Watch mode
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |

## Architecture

### Component Overview

1. **SubscriptionManager**: Manages vehicle subscriptions
   - Tracks which clients are subscribed to which vehicles
   - Efficient lookups using Maps and Sets
   - Automatic cleanup on client disconnect

2. **TelemetryBatcher**: Batches vehicle telemetry
   - Collects points in time-based windows
   - Configurable batch size and interval
   - Averages position and speed data

3. **VehicleTracking**: Coordinates data flow
   - Receives telemetry from vehicles
   - Routes to batcher
   - Filters and emits to subscribed clients

### Data Flow

```
Vehicle sends telemetry
    ↓
VehicleTracking receives
    ↓
TelemetryBatcher collects
    ↓
Batch timer expires or max size reached
    ↓
Filter for subscribed clients
    ↓
Emit to each subscribed client
```

## Performance Considerations

- **Memory**: Uses Sets for O(1) subscription lookups
- **CPU**: Configurable batch intervals for tuning
- **Network**: Batches reduce message overhead
- **Scalability**: Architecture ready for Redis adapter for clustering

## Future Enhancements

- Redis adapter for multi-server deployment
- Persistent telemetry storage
- Geofencing and alerts
- Real-time analytics
- Rate limiting per vehicle
- Data encryption

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3002 npm run dev
```

### TypeScript Errors
```bash
# Rebuild type definitions
npm run build
```

### Socket Connection Issues
Check firewall settings and CORS configuration in `src/index.ts`

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for real-time fleet tracking**

