# MoveoCC-API Implementation Plan

## Project Overview
- **Name**: `moveo-cc-api`
- **Purpose**: Real-time vehicle live tracking using Socket.IO
- **Key Features**:
  - Clients subscribe to specific vehicles
  - Vehicles broadcast telemetry data
  - Server batches telemetry and filters for each client
  - No database (in-memory data management)

---

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Real-time**: Socket.IO 4.7.x
- **Security**: Helmet, CORS
- **Middleware**: Compression, Morgan
- **Dev Tools**: Nodemon, ESLint, Jest
- **Build**: TSC (TypeScript Compiler)

---

## Directory Structure
```
moveo-cc-api/
├── src/
│   ├── index.ts                  # Main entry point with Express + Socket.IO
│   ├── config/
│   │   └── config.ts             # Configuration management
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces & types
│   ├── middleware/
│   │   ├── errorHandler.ts       # Error handling middleware
│   │   └── notFoundHandler.ts    # 404 handler
│   ├── services/
│   │   ├── vehicleTracking.ts    # Vehicle tracking logic
│   │   ├── telemetryBatcher.ts   # Batching engine
│   │   └── subscriptionManager.ts # Client subscriptions
│   ├── utils/
│   │   └── logger.ts             # Logging utility
│   └── routes/
│       └── health.ts             # Health check endpoint
├── dist/                         # Compiled output
├── tests/                        # Test files
├── package.json
├── tsconfig.json
├── .eslintrc
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Implementation Steps

### Phase 1: Project Setup
- [ ] Create project directory structure
- [ ] Initialize `package.json` with dependencies
- [ ] Set up TypeScript configuration
- [ ] Create `.env.example`
- [ ] Set up ESLint configuration
- [ ] Create Docker files

### Phase 2: Core Infrastructure
- [ ] Create config/config.ts
- [ ] Create types/index.ts with:
  - `VehicleTelemetry` interface
  - `ClientSubscription` interface
  - `BatchedTelemetry` interface
  - `SocketMessage` types
- [ ] Create middleware (error handler, not found handler)
- [ ] Create utility logger

### Phase 3: Core Services
- [ ] **SubscriptionManager**: Manage client subscriptions
  - Store active connections per vehicle
  - Track which clients subscribe to which vehicles
  - Handle subscription/unsubscription
  
- [ ] **TelemetryBatcher**: Batch telemetry data
  - Collect vehicle telemetry in time-based batches (e.g., every 1-5 seconds)
  - Aggregate data from same vehicle within batch window
  - Queue batches for emission
  
- [ ] **VehicleTracking**: Main coordination service
  - Receive telemetry from vehicles
  - Pass to batcher
  - Filter batched data for subscribed clients
  - Emit to relevant clients

### Phase 4: Socket.IO Implementation
- [ ] Set up Socket.IO server with Express
- [ ] Implement socket event handlers:
  - `connect` - New client connects
  - `subscribe:vehicle` - Client subscribes to vehicle
  - `unsubscribe:vehicle` - Client unsubscribes
  - `vehicle:telemetry` - Vehicle sends telemetry
  - `disconnect` - Client disconnects
- [ ] Implement batched telemetry emission logic
- [ ] Handle client disconnection cleanup

### Phase 5: Express API Routes
- [ ] Health check endpoint (`/health`)
- [ ] Server stats endpoint (`/stats`) - Connected clients, subscriptions, batches
- [ ] Optional: REST endpoints for non-real-time operations

### Phase 6: Testing & Documentation
- [ ] Unit tests for services
- [ ] Integration tests for Socket.IO
- [ ] Create comprehensive README
- [ ] Document API and Socket events
- [ ] Add example client code

### Phase 7: Docker & Deployment
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Document deployment instructions

---

## Key Architectural Decisions

### 1. Telemetry Batching Strategy
- **Time-based batching**: Collect telemetry for X milliseconds (configurable, default 1000ms)
- **Benefits**: 
  - Reduces socket emissions
  - Groups related data
  - Smoother client-side updates
  
### 2. Subscription Model
```
subscriptions: {
  [vehicleId]: Set<socketId>,  // Track which clients subscribe to each vehicle
  ...
}
```

### 3. Data Structure
```typescript
// Vehicle telemetry
{
  vehicleId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  altitude?: number;
}

// Batched telemetry
{
  vehicleId: string;
  batchId: string;
  startTime: number;
  endTime: number;
  dataPoints: VehicleTelemetry[];
  averaged?: {
    speed: number;
    latitude: number;
    longitude: number;
  }
}
```

### 4. In-Memory Storage
- Use Maps for O(1) lookups
- Implement cleanup for disconnected clients
- Optional: Add memory monitoring

---

## Socket Events Reference

### Client → Server
```
subscribe:vehicle
├─ payload: { vehicleId: string }
└─ error: VehicleNotFound

unsubscribe:vehicle
├─ payload: { vehicleId: string }
└─ error: SubscriptionNotFound

request:stats
└─ returns: ServerStats
```

### Server → Client
```
vehicle:telemetry:batch
├─ payload: {
│   vehicleId: string;
│   batchId: string;
│   dataPoints: VehicleTelemetry[];
│   timestamp: number;
│ }

subscription:confirmed
├─ payload: { vehicleId: string }

subscription:removed
├─ payload: { vehicleId: string }

error
├─ payload: { message: string, code: string }
```

### Vehicle → Server
```
vehicle:telemetry
├─ payload: VehicleTelemetry
```

---

## Configuration (from .env)
```
NODE_ENV=development
PORT=3001
SOCKET_IO_PORT=3001
LOG_LEVEL=debug
BATCH_INTERVAL_MS=1000
BATCH_MAX_SIZE=100
```

---

## Performance Considerations
1. **Memory**: Use Sets instead of arrays for subscriptions
2. **CPU**: Batch interval tuning based on vehicle count
3. **Network**: Compress batched data, filter early
4. **Scalability**: Design for horizontal scaling (namespaces, rooms)

---

## Future Enhancements
1. Redis adapter for multi-server deployment
2. Geofencing and alerts
3. Route optimization
4. Persistent telemetry storage option
5. Real-time analytics dashboard
6. Vehicle grouping/fleet management
7. Rate limiting per vehicle
8. Data encryption for sensitive coordinates

---

## Success Criteria
✅ Vehicle can connect and send telemetry
✅ Clients can subscribe/unsubscribe to vehicles
✅ Telemetry is batched and filtered correctly
✅ Minimal latency between telemetry send and client receive
✅ Proper cleanup on disconnection
✅ Full TypeScript type safety
✅ Comprehensive error handling
✅ Unit and integration tests

