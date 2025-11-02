# Trip Stops Implementation

## Overview
This document describes the implementation of automatic trip stop creation when a trip is created.

## Feature Description
When creating a trip, the system now automatically:
1. Validates that the provided route exists
2. Fetches all stops associated with the route (in order)
3. Creates `TripStop` records for each `RouteStop` in an atomic transaction
4. Returns the complete trip with all related data including trip stops

## Implementation Details

### Modified Function: `tripController.createTrip()`

**Location:** `moveo-core/src/controllers/tripController.ts` (lines 69-130)

**Key Changes:**

#### 1. Route Validation
```typescript
const route = await prisma.route.findUnique({
  where: { id: BigInt(routeId) },
  include: {
    routeStops: {
      orderBy: { stopOrder: 'asc' }
    }
  }
});

if (!route) {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}
```
- Ensures the route exists before proceeding
- Pre-fetches all route stops in order

#### 2. Atomic Transaction
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Create trip and trip stops
});
```
- Uses Prisma transaction to ensure atomicity
- Guarantees that either both trip and trip stops are created, or none

#### 3. Trip Creation
- Creates trip with provided: `routeId`, `driverId`, `vehicleId`
- Sets `startTime` to current date/time
- Sets `startLocation` to 1 (default)

#### 4. Trip Stops Creation
```typescript
if (route.routeStops && route.routeStops.length > 0) {
  await tx.tripStop.createMany({
    data: route.routeStops.map((routeStop) => ({
      tripId: trip.id,
      stopId: routeStop.stopId,
      stopOrder: routeStop.stopOrder,
      eta: routeStop.eta
    }))
  });
}
```
- Creates one `TripStop` record for each `RouteStop`
- Preserves: stop order, stop ID, and estimated time of arrival (ETA)
- Uses `createMany` for efficiency

#### 5. Complete Data Response
- Returns trip with all nested relations:
  - `route` (with full details)
  - `driver`
  - `vehicle` (with model info)
  - `tripStops` (ordered by stopOrder, including stop location data)

## Data Flow

```
POST /api/trips
  ↓
Request: { routeId, driverId, vehicleId }
  ↓
Validate Route Exists
  ↓
START TRANSACTION
  ├─ Create Trip record
  ├─ Create TripStop records (one per RouteStop)
  └─ Fetch complete Trip with all relations
END TRANSACTION
  ↓
Response: Complete Trip object with TripStops
```

## Request/Response Examples

### Request
```http
POST http://localhost:3000/api/trips
Content-Type: application/json

{
  "routeId": 1,
  "driverId": 1,
  "vehicleId": 1
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "routeId": 1,
    "driverId": 1,
    "vehicleId": 1,
    "startTime": "2024-11-01T10:30:00.000Z",
    "startLocation": 1,
    "endTime": null,
    "endLocation": null,
    "route": {
      "id": 1,
      "name": "Downtown Route",
      "code": "DT001"
    },
    "driver": {
      "id": 1,
      "userId": 101
    },
    "vehicle": {
      "id": 1,
      "plateNo": "ABC-123",
      "model": {
        "id": 1,
        "make": "Toyota",
        "year": 2023
      }
    },
    "tripStops": [
      {
        "id": 501,
        "tripId": 123,
        "stopId": 10,
        "stopOrder": 1,
        "eta": 5,
        "stop": {
          "id": 10,
          "name": "Main Station",
          "code": "MAIN",
          "location": {
            "id": 100,
            "lat": 25.2048,
            "lon": 55.2708
          }
        }
      },
      {
        "id": 502,
        "tripId": 123,
        "stopId": 11,
        "stopOrder": 2,
        "eta": 12,
        "stop": {
          "id": 11,
          "name": "Central Hub",
          "code": "CENTRAL",
          "location": {
            "id": 101,
            "lat": 25.1972,
            "lon": 55.2744
          }
        }
      }
    ]
  },
  "message": "Trip created successfully with stops"
}
```

### Response (Error - Route Not Found)
```json
{
  "success": false,
  "message": "Route not found"
}
```

## Error Handling

The implementation handles:
1. **Route not found**: Returns 404 with appropriate message
2. **Invalid BigInt conversion**: Handled by Prisma
3. **Transaction failures**: All-or-nothing guarantees via transaction
4. **Database errors**: Passed to error handler middleware

## Database Considerations

### Tables Affected
- `trip`: One new record
- `trip_stop`: Multiple new records (one per route stop)

### Transaction Safety
- Uses `prisma.$transaction()` for ACID compliance
- Ensures consistency if either operation fails

## Testing

Use the provided HTTP requests in `moveo-core/tests/routes.http`:

```http
### Create Trip with Trip Stops (based on route)
POST http://localhost:3000/api/trips
Content-Type: application/json

{
  "routeId": 1,
  "driverId": 1,
  "vehicleId": 1
}

### Get Trip by ID (includes trip stops)
GET http://localhost:3000/api/trips/1

### Get Trip Stops
GET http://localhost:3000/api/trips/1/stops
```

## Related Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/trips` | Create trip with stops |
| GET | `/api/trips/:id` | Retrieve trip with stops |
| GET | `/api/trips/:id/stops` | List all stops for a trip |
| POST | `/api/trips/:id/:stopId/arrive` | Record arrival at stop |
| POST | `/api/trips/:id/:stopId/depart` | Record departure from stop |

## Future Enhancements

1. **Validation**: Add validation for driver and vehicle existence
2. **Scheduling**: Add scheduled start time in request
3. **Async Creation**: Consider async job processing for bulk trip creation
4. **Audit Logging**: Log trip and stop creation for compliance
5. **Notifications**: Notify driver/dispatcher when trip is created with stops
