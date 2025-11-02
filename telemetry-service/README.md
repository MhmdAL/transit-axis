# TelemetryService

Vehicle telemetry service for real-time GPS tracking and historical path data.

## Features

- **Current Telemetry**: Latest position and state for all vehicles
- **Historical Logs**: Complete history of vehicle movements
- **Polyline Encoding**: Efficient path representation for map rendering
- **Auto-archiving**: Current state automatically archived to logs

## Setup

### Option 1: Docker (Recommended)

1. Start the service with Docker Compose:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec app npm run prisma:push
```

3. View logs:
```bash
docker-compose logs -f app
```

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=3003
NODE_ENV=development
DATABASE_URL="postgresql://telemetry_user:telemetry_password@localhost:5433/moveo_telemetry"
```

3. Start PostgreSQL (if using Docker for DB only):
```bash
docker-compose up -d postgres
```

4. Setup database:
```bash
npm run prisma:push
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Create/Update Telemetry
```http
POST /api/telemetry
Content-Type: application/json

{
  "vehicleId": 1,
  "tripId": 1,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 45.5,
  "heading": 180,
  "altitude": 750,
  "accuracy": 10
}
```

**Note:** `tripId` is optional - use it to associate telemetry with a specific trip.

### List All Current Telemetry
```http
GET /api/telemetry
```

### Get Telemetry for Specific Vehicle
```http
GET /api/telemetry/:vehicleId
```

### Get Telemetry Logs
```http
GET /api/telemetry/:vehicleId/logs?startTime=2025-10-30T00:00:00Z&endTime=2025-10-30T23:59:59Z&limit=1000
```

### Get Telemetry Path (Polyline Encoded)
```http
GET /api/telemetry/:vehicleId/path?startTime=2025-10-30T00:00:00Z&endTime=2025-10-30T23:59:59Z
```

## Database Schema

### Telemetry (Current State)
- Only 1 entry per vehicle (upsert on vehicleId)
- Automatically updated with latest data

### TelemetryLog (History)
- Append-only historical records
- Indexed on vehicleId and timestamp
- Efficient for time-range queries

## Port

Service runs on **port 3003**

## Docker Configuration

### Services
- **telemetry-api**: Main application (port 3003)
- **telemetry-postgres**: PostgreSQL database (port 5433 on host)

### Database
- **Database Name**: `moveo_telemetry`
- **User**: `telemetry_user`
- **Password**: `telemetry_password`
- **Host Port**: 5433 (mapped from container port 5432)

### Network
- Uses isolated `telemetry-network` bridge network
- Containers communicate via service names

### Volumes
- `telemetry_postgres_data`: Persistent database storage

