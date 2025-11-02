# Trip Metrics Enhancement Plan

## Objective
Enhance the `endTrip` function to calculate and store trip statistics:
- **Average Speed** (km/h)
- **Max Speed** (km/h)
- **Total Distance** (km)
- **Total Duration** (minutes)

## Current State
The `endTrip` function currently:
- Fetches telemetry path (polyline) from telemetry service
- Updates trip with `endTime`, `endLocation`, and `path`
- ❌ Does NOT calculate or store speed/distance metrics

## Data Available

### From Telemetry Service
The telemetry service stores logs with:
- `latitude`, `longitude` (location)
- `speed` (current speed at that moment)
- `timestamp` (when measurement was taken)
- `tripId` (associated trip)

**Available Endpoint:**
```
GET /api/telemetry/{vehicleId}/logs?tripId={tripId}
```

Returns an array of telemetry logs with speed and location data.

**Alternative Endpoint (with path):**
```
GET /api/telemetry/{vehicleId}/path?tripId={tripId}
```

Returns:
```json
{
  "success": true,
  "data": {
    "polyline": "encoded_string",
    "points": [
      {
        "latitude": 31.9454,
        "longitude": 35.9284,
        "speed": 45.5,
        "heading": 180,
        "timestamp": "2025-10-30T10:00:00Z"
      },
      // ... more points
    ]
  }
}
```

## Calculation Strategy

### 1. Average Speed
**Formula:** Total distance traveled ÷ Total duration

**Implementation Steps:**
1. Fetch all telemetry logs for the trip
2. Get total distance (from odometer, see below)
3. Calculate duration from first to last timestamp
4. Average speed = Total distance ÷ Duration

### 2. Max Speed
**Formula:** Maximum speed value from all telemetry points

**Implementation Steps:**
1. Fetch all telemetry logs for the trip
2. Filter out null/zero speeds
3. Get maximum value from speed array

### 3. Total Distance
**Formula:** Last odometer reading - First odometer reading

**Implementation Steps:**
1. Get first telemetry log (earliest timestamp)
2. Get last telemetry log (latest timestamp)
3. Total distance = last_odometer - first_odometer

**Note:** Much simpler than Haversine calculation - assumes vehicle provides accurate odometer data

### 4. Total Duration
**Formula:** Last timestamp - First timestamp (in minutes)

**Implementation Steps:**
1. Get first telemetry log timestamp
2. Get last telemetry log timestamp
3. Calculate difference in milliseconds and convert to minutes

## Implementation Steps

### Step 1: Update Telemetry Schema
**Files:** 
- `telemetry-service/prisma/schema.prisma` - Add `odometer` field
- `telemetry-service/src/controllers/telemetryController.ts` - Accept odometer in API

**Changes:**
- Add `odometer: Float?` to both Telemetry and TelemetryLog models
- Update `createTelemetry` to parse odometer from request body

**Migration needed:** Yes, need to run prisma migration to add column

### Step 2: Create Metrics Calculation Service
**File:** `moveo-core/src/services/tripMetricsService.ts`

Create service with function:
```typescript
async function calculateTripMetrics(
  vehicleId: bigint,
  tripId: bigint
): Promise<{
  averageSpeed: number;
  maxSpeed: number;
  totalDistance: number;
  totalDuration: number;
}>
```

This function should:
1. Fetch telemetry logs from telemetry service
2. Calculate metrics using odometer readings
3. Handle edge cases (no logs, missing odometer data)
4. Return metrics object

### Step 3: Update `endTrip` Function
**File:** `moveo-core/src/controllers/tripController.ts`

Enhance `endTrip` to:
1. Fetch telemetry logs and calculate metrics (parallel with path fetch)
2. Store metrics in trip update
3. Handle errors gracefully (if telemetry service fails, trip should still end)

## Schema Validation
Trip model already has these fields (no migration needed):
```prisma
model Trip {
  // ... existing fields
  averageSpeed        Decimal? @db.Decimal(5, 2) // km/h
  maxSpeed            Decimal? @db.Decimal(5, 2) // km/h
  totalDistance       Decimal? @db.Decimal(10, 2) // km
  totalDuration       Int? // in minutes
}
```

## Implementation Code Structure

### Before (Current)
```typescript
async endTrip(req, res, next) {
  // Get trip
  // Fetch telemetry path
  // Update trip with: endTime, endLocation, path
}
```

### After (Enhanced)
```typescript
async endTrip(req, res, next) {
  // Get trip
  // Parallel: Fetch telemetry path + Calculate metrics
  // Update trip with:
  //   - endTime
  //   - endLocation
  //   - path
  //   - averageSpeed
  //   - maxSpeed
  //   - totalDistance
  //   - totalDuration
}
```

## Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| Telemetry service unavailable | Log error, proceed with endTrip (fail gracefully) |
| No telemetry logs found | Store null/zero for metrics |
| Invalid coordinates | Skip distance calculation for that segment |
| Missing speed data | Handle gracefully, use available data |

## Testing

### Test Cases

1. **Basic Trip End**
   - Create trip → Send multiple telemetry points → End trip
   - Verify all metrics are calculated correctly

2. **No Telemetry Data**
   - End trip without telemetry logs
   - Verify trip ends with null metrics

3. **Partial Data**
   - Send telemetry without speed values
   - Verify max speed handling

4. **Telemetry Service Error**
   - Simulate telemetry service failure
   - Verify trip still ends

### Test HTTP Requests

```http
### End Trip with Metrics
POST http://localhost:3000/api/trips/1/end
Content-Type: application/json

{
  "endLocation": 5
}

### Get Trip with Metrics
GET http://localhost:3000/api/trips/1
```

## Performance Considerations

1. **API Calls:** Fetch telemetry logs once (reuse for both path and metrics)
2. **Calculations:** Run in parallel with database update
3. **Database:** Use transactions for atomic update
4. **Caching:** Consider caching telemetry logs during calculation

## Future Enhancements

1. **Idle Time Calculation:** Detect when vehicle is stationary (speed ≈ 0)
2. **Fuel Consumption:** If available from telemetry
3. **Route Efficiency:** Compare actual vs. optimal distance
4. **Speeding Events:** Track instances where vehicle exceeded speed limits
5. **Real-time Metrics:** Stream metrics during trip for live tracking

## Dependencies

- **No external libraries needed** - Odometer-based calculation is simple math
- Uses only built-in JavaScript for calculations

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `telemetry-service/prisma/schema.prisma` | Modify | Add odometer field to Telemetry models |
| `telemetry-service/src/controllers/telemetryController.ts` | Modify | Parse and store odometer in telemetry API |
| `moveo-core/src/services/tripMetricsService.ts` | Create | Trip metrics calculation logic |
| `moveo-core/src/controllers/tripController.ts` | Modify | Update endTrip function |
| `moveo-core/tests/routes.http` | Modify | Add test requests for metrics |

## Estimated Complexity

- **Schema Updates:** Low (add one field)
- **Telemetry API Update:** Low (parse one parameter)
- **Metrics Service:** Low (simple math with odometer)
- **Controller Update:** Low (integrate existing logic)
- **Testing:** Medium (multiple scenarios)

**Total Effort:** 1-2 hours for full implementation with tests

---

## Summary of Changes

### Telemetry Service
1. Add `odometer: Float?` to schema
2. Accept `odometer` in POST `/api/telemetry` endpoint
3. Run Prisma migration

### moveo-core
1. Create `tripMetricsService.ts` to calculate metrics from telemetry logs
2. Update `endTrip()` in `tripController.ts` to use metrics service
3. Store calculated metrics in trip record

### Result
When trip ends:
```json
{
  "trip": {
    "averageSpeed": 45.2,
    "maxSpeed": 72.5,
    "totalDistance": 23.4,
    "totalDuration": 31,
    // ... other fields
  }
}
```
