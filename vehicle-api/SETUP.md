# VehicleApi Setup Guide

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
PORT=3001
MOVEO_CORE_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Services

**Terminal 1 - Start Moveo-Core:**
```bash
cd ../moveo-core
npm run dev
```

**Terminal 2 - Start VehicleApi:**
```bash
npm run start:dev
```

**Terminal 3 - Start Vehicle Emulator (optional):**
```bash
cd ../moveo-cc
npm run dev
```

## Testing the API

### 1. Health Check

```bash
curl http://localhost:3001
```

Expected response:
```json
{
  "status": "ok",
  "service": "VehicleApi",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### 2. Driver Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

### 3. Start Trip

```bash
curl -X POST http://localhost:3001/trips/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "routeId": "route-id",
    "vehicleId": "vehicle-id",
    "driverId": "driver-id",
    "scheduledDepartureTime": "2025-10-30T10:00:00Z"
  }'
```

### 4. End Trip

```bash
curl -X PATCH http://localhost:3001/trips/<trip-id>/end \
  -H "Authorization: Bearer <your-token>"
```

## Integration with Vehicle Emulator

The VehicleApi is designed to work with the moveo-cc vehicle emulator:

1. Start all three services (moveo-core, vehicle-api, moveo-cc)
2. Open the emulator at http://localhost:5173/emulator
3. Use the emulator UI to:
   - Select a route
   - Start a trip (calls `/trips/start`)
   - End a trip (calls `/trips/:id/end`)

## Architecture Flow

```
┌─────────────────┐      ┌──────────────┐      ┌───────────────────┐      ┌──────────┐
│  Vehicle App/   │─────>│  VehicleApi  │─────>│   Moveo-Core      │─────>│ Database │
│  Emulator       │      │   :3001      │      │   :3000/api/*     │      │          │
│  :5173          │      │              │      │                   │      │          │
│                 │      │ /auth/login  │─────>│ /api/auth/...     │      │          │
│                 │      │ /trips/start │─────>│ /api/trips/...    │      │          │
│                 │<─────│              │<─────│                   │<─────│          │
└─────────────────┘      └──────────────┘      └───────────────────┘      └──────────┘
```

## Troubleshooting

### Connection Refused
- Ensure moveo-core is running on port 3000
- Check the `MOVEO_CORE_API_URL` in your `.env` file

### 401 Unauthorized
- Ensure you're sending the correct Authorization header
- Token format: `Bearer <token>`

### 404 Not Found
- Check the endpoint URL
- Verify moveo-core has the corresponding endpoints

## Development

### Watch Mode
```bash
npm run start:dev
```

### Build
```bash
npm run build
```

### Run Tests
```bash
npm run test
npm run test:e2e
```

