# Telemetry Service to Live Tracking Integration

## Overview

This integration forwards telemetry data from the `telemetry-service` to `moveo-cc-api` for real-time vehicle live tracking. When telemetry is received and saved in the database, it's automatically sent to the live tracking API for real-time streaming to connected clients.

## Architecture

```
Telemetry Source (HTTP/Mobile/GPS Device)
    ↓
telemetry-service POST /telemetry
    ↓
telemetryController.createTelemetry()
    ├─ Save to Prisma (Telemetry + TelemetryLog)
    └─ Forward to Live Tracking API (async, fire-and-forget)
    ↓
moveo-cc-api POST /api/telemetry
    ↓
telemetryBatcher.addTelemetry()
    ↓
Batch aggregation
    ↓
Socket.IO emit to subscribed clients
    ↓
Real-time map updates in moveo-cc
```

## Components

### 1. **Live Tracking Service** (`telemetry-service/src/services/liveTrackingService.ts`)

Service that forwards telemetry to the live tracking API with:
- Automatic retry logic (3 attempts)
- Exponential backoff delays
- Format conversion from telemetry-service to live tracking format
- Fire-and-forget async operation

**Configuration:**
```env
LIVE_TRACKING_API_URL=http://localhost:3004
```

### 2. **Telemetry Controller** (`telemetry-service/src/controllers/telemetryController.ts`)

Updated `createTelemetry()` method now:
1. Saves telemetry to database
2. Calls `liveTrackingService.forwardTelemetry()`
3. Returns response without waiting for live tracking call

### 3. **Live Tracking API Endpoint** (`moveo-cc-api/src/index.ts`)

New POST endpoint:
```
POST /api/telemetry
```

Receives telemetry and adds it to the batcher for real-time streaming.

## Data Flow

### Telemetry Received
```
POST /telemetry HTTP/1.1
Host: telemetry-service:3002
Content-Type: application/json

{
  "vehicleId": 123,
  "tripId": 456,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 65.5,
  "heading": 270,
  "altitude": 850,
  "accuracy": 5.2,
  "timestamp": "2024-01-15T12:30:45.123Z"
}
```

### Live Tracking API Called
```
POST /api/telemetry HTTP/1.1
Host: moveo-cc-api:3004
Content-Type: application/json

{
  "vehicleId": "123",
  "timestamp": 1705329045123,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 65.5,
  "bearing": 270,
  "altitude": 850,
  "accuracy": 5.2,
  "heading": 270
}
```

### Socket.IO Batched and Sent
```javascript
{
  batchId: "batch_1705329045123",
  timestamp: 1705329045123,
  dataPoints: [
    {
      vehicleId: "123",
      timestamp: 1705329045123,
      latitude: 31.9454,
      longitude: 35.9284,
      speed: 65.5,
      bearing: 270,
      ...
    }
  ],
  count: 1
}
```

## Configuration

### Environment Variables

**telemetry-service:**
```env
# .env or docker-compose.yml
LIVE_TRACKING_API_URL=http://localhost:3004
```

**moveo-cc-api:**
```env
# .env
BATCH_INTERVAL_MS=1000
BATCH_MAX_SIZE=100
```

## Retry Logic

The live tracking service implements exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay

If all retries fail, the error is logged but the telemetry is still saved in the database.

## Error Handling

- **Live Tracking API Down:** Telemetry still saved, real-time updates paused
- **Invalid Telemetry:** Returns 400, not forwarded
- **Network Issues:** Automatic retry with backoff
- **Timeout:** Failed attempt, logged and retried

## API Endpoints

### Telemetry Service
```
POST /telemetry
Content-Type: application/json

{
  "vehicleId": 123,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 65.5,
  "heading": 270
}

Response: 201 Created
{
  "success": true,
  "data": { ...saved telemetry... }
}
```

### Live Tracking API
```
POST /api/telemetry
Content-Type: application/json

{
  "vehicleId": "123",
  "timestamp": 1705329045123,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 65.5,
  "bearing": 270
}

Response: 201 Created
{
  "success": true,
  "message": "Telemetry received",
  "data": { ...received telemetry... }
}
```

## Testing

### 1. Start All Services
```bash
# Terminal 1: moveo-core
cd moveo-core && npm run dev

# Terminal 2: telemetry-service
cd telemetry-service && npm run dev

# Terminal 3: moveo-cc-api
cd moveo-cc-api && npm run dev

# Terminal 4: moveo-cc frontend
cd moveo-cc && npm run dev
```

### 2. Send Telemetry
```bash
curl -X POST http://localhost:3002/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "latitude": 31.9454,
    "longitude": 35.9284,
    "speed": 65,
    "heading": 270,
    "altitude": 850,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
```

### 3. Verify Real-Time Update
- Open moveo-cc frontend
- Navigate to RealTime Tracking page
- Select vehicle 1
- Check DevTools Network tab for Socket.IO message
- Verify vehicle position updates on map

### 4. Check Logs
```bash
# telemetry-service
tail -f logs/telemetry-service.log | grep "live tracking"

# moveo-cc-api
tail -f logs/moveo-cc-api.log | grep "Received telemetry"
```

## Troubleshooting

### Telemetry saved but not appearing in real-time
**Check:**
1. moveo-cc-api is running on port 3004
2. `LIVE_TRACKING_API_URL` is set correctly
3. Check telemetry-service logs for forwarding errors
4. Network connectivity between services

**Debug:**
```bash
# Test live tracking API directly
curl -X POST http://localhost:3004/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "test_vehicle",
    "timestamp": 1705329045123,
    "latitude": 31.9454,
    "longitude": 35.9284,
    "speed": 50,
    "bearing": 270
  }'
```

### Retry failures
**Check:**
1. Network connectivity
2. API endpoint responds with correct format
3. Timeout not too aggressive

### Batching delays
**Check:**
1. `BATCH_INTERVAL_MS` setting (default 1000ms)
2. Number of subscribers
3. Network latency

## Performance Considerations

- **Async Operation:** Live tracking forwarding doesn't block telemetry save
- **Retry Logic:** 3 attempts with backoff prevent network hiccups
- **Batching:** Server-side batching optimizes Socket.IO messages
- **Fire-and-Forget:** Errors logged but don't affect main flow

## Future Enhancements

1. **Caching Layer:** Cache telemetry before forwarding
2. **Queue:** Use message queue (RabbitMQ/Kafka) for reliability
3. **Metrics:** Track forwarding success/failure rates
4. **Deduplication:** Prevent duplicate telemetry
5. **Rate Limiting:** Control telemetry throughput per vehicle
6. **Filtering:** Only forward critical updates

## Support

For issues:
1. Check service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check network connectivity
5. Review retry logs for specific errors

