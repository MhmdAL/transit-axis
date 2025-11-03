# Trip Monitoring - TripDuty API

## Overview
Created a dedicated API endpoint for the Trip Monitoring page that fetches `TripDuty` records with related entities (Duty, Driver, Vehicle, Route) filtered by date and route IDs.

## API Endpoint

### GET `/api/trips/duties/by-date-routes`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `routeIds` (required): Comma-separated route IDs (e.g., `1,2,3`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dutyId": 123,
      "routeId": 456,
      "route": { /* Route entity */ },
      "duty": {
        "id": 123,
        "date": "2024-11-03T00:00:00Z",
        "startTime": "2024-11-03T03:00:00Z",
        "endTime": "2024-11-03T10:00:00Z",
        "driverId": 789,
        "vehicleId": 456,
        "driver": {
          "id": 789,
          "userId": 100,
          "user": { /* User entity */ }
        },
        "vehicle": {
          "id": 456,
          "plateNo": "ABC-123",
          "fleetNo": "FL-001",
          "modelId": 10,
          "model": { /* VehicleModel entity */ }
        }
      }
    }
  ]
}
```

## Implementation Details

### Backend Changes

**Controller Method:** `tripController.getTripDutiesByDateAndRoutes()`
- **File**: `moveo-core/src/controllers/tripController.ts`
- **Query Logic**:
  - Parses date string (YYYY-MM-DD) and creates full-day range
  - Converts comma-separated routeIds string to BigInt array
  - Queries TripDuty with filters on routeId and duty.date
  - Includes all related entities: route, duty.driver, duty.vehicle, etc.
  - Orders by routeId then duty.startTime

**Route Definition:**
- **File**: `moveo-core/src/routes/trips.ts`
- **Route**: `GET /api/trips/duties/by-date-routes`
- **Auth**: Required (authMiddleware)
- **Placement**: Defined before parametrized `:id` routes to avoid conflicts

### Frontend Changes

**API Service Method:** `apiService.getTripDutiesByDateAndRoutes()`
- **File**: `moveo-cc/src/services/apiService.ts`
- **Params**: `date: string, routeIds: string[]`
- **Returns**: `Promise<any[]>` - Array of TripDuty objects

**Usage in TripMonitoring:**
```typescript
const tripsData = await apiService.getTripDutiesByDateAndRoutes(
  selectedDate!, 
  selectedRoutes.map(r => r.id)
);
```

## Data Flow

1. User selects date and routes in Trip Monitoring page
2. `fetchTrips()` is triggered with date + route IDs
3. `apiService.getTripDutiesByDateAndRoutes()` is called
4. Frontend receives TripDuty data with all related entities
5. Data is displayed in timeline view filtered by routes without trips

## Key Features

✅ Fetches from TripDuty table (not Trip table)
✅ Includes all necessary related entities
✅ Filtered by specific date (full day)
✅ Filtered by multiple routes
✅ Ordered consistently for display
✅ Includes driver, vehicle, and route information
✅ Handles date parsing and time ranges correctly

## Database Relations

The query structure follows these Prisma relations:
- `TripDuty.route` → `Route`
- `TripDuty.duty` → `Duty`
  - `Duty.driver` → `Driver`
    - `Driver.user` → `User`
  - `Duty.vehicle` → `Vehicle`
    - `Vehicle.model` → `VehicleModel`

## Error Handling

- Returns 400 if `date` or `routeIds` parameters are missing
- Returns 200 with empty array if no trips found
- Errors passed to Express error handler via `next(error)`
