# VehicleApi

NestJS API Gateway for driver/vehicle applications. This service acts as a proxy between the driver mobile app (or emulator) and the main Moveo-Core backend.

## Features

- **Driver Authentication**: Login endpoint for drivers
- **Trip Management**: Start and end trip endpoints
- **Telemetry**: Send vehicle telemetry data
- **API Gateway**: Forwards requests to moveo-core and telemetry-service
- **CORS Enabled**: Ready for web-based vehicle emulator

## Prerequisites

- Node.js (v18 or higher)
- npm
- Moveo-Core backend running on port 3000

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3002
MOVEO_CORE_API_URL=http://localhost:3000
TELEMETRY_SERVICE_API_URL=http://localhost:3003
```

## Running the API

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3002`

## API Endpoints

### Authentication

#### Driver Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "password123"
}
```

> **Note:** This endpoint forwards to `POST /api/auth/driver-login` on moveo-core

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "driver@example.com",
    "role": "DRIVER"
  }
}
```

### Trips

#### Start Trip
```http
POST /trips/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "routeId": "route-id",
  "vehicleId": "vehicle-id",
  "driverId": "driver-id",
  "scheduledDepartureTime": "2025-10-30T10:00:00Z"
}
```

**Response:**
```json
{
  "id": "trip-id",
  "status": "IN_PROGRESS",
  "startTime": "2025-10-30T10:00:00Z",
  ...
}
```

#### End Trip
```http
PATCH /trips/:id/end
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "trip-id",
  "status": "COMPLETED",
  "endTime": "2025-10-30T12:00:00Z",
  ...
}
```

### Telemetry

#### Send Telemetry
```http
POST /telemetry
Content-Type: application/json

{
  "vehicleId": 1,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 45.5,
  "heading": 180,
  "altitude": 750,
  "accuracy": 10
}
```

> **Note:** This endpoint forwards to `POST /api/telemetry` on telemetry-service

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vehicleId": 1,
    "latitude": 31.9454,
    "longitude": 35.9284,
    ...
  }
}
```

## Project Structure

```
vehicle-api/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── trips/             # Trips module
│   │   ├── trips.controller.ts
│   │   ├── trips.service.ts
│   │   └── trips.module.ts
│   ├── telemetry/         # Telemetry module
│   │   ├── telemetry.controller.ts
│   │   ├── telemetry.service.ts
│   │   └── telemetry.module.ts
│   ├── config/            # Configuration
│   │   └── configuration.ts
│   ├── app.module.ts      # Main app module
│   └── main.ts            # Entry point
├── .env                   # Environment variables
└── package.json
```

## Architecture

This API serves as a lightweight gateway that:
1. Receives requests from driver apps/emulator
2. Forwards authenticated requests to moveo-core
3. Returns responses from moveo-core to the client

```
[Driver App/Emulator] <--> [VehicleApi:3001] <--> [Moveo-Core:3000] <--> [Database]
```

## Integration with Moveo-CC

The `moveo-cc` vehicle emulator can connect to this API for testing:

1. Start moveo-core on port 3000
2. Start vehicle-api on port 3001
3. Start moveo-cc (vehicle emulator)
4. Use the emulator to test trip start/end functionality

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `500`: Internal Server Error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```
