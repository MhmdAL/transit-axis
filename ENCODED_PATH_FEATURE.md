# Encoded Path Storage Feature

## Overview
Routes now store encoded polyline paths between consecutive stops in the `RouteStop.path` field. This allows for accurate road-based path visualization and distance calculations.

## What Changed

### 1. Backend Route Controller (`moveo-core/src/controllers/routeController.ts`)

#### Added Helper Functions
- `getEncodedPathBetweenStops()` - Calls OpenRouteService API to get the road path between two stops
- `encodePolyline()` - Encodes coordinates using Google's polyline encoding algorithm
- `encodeValue()` - Encodes individual delta values

#### Updated createRoute() Function
**Before:** Created RouteStops without path data
**After:**
1. Fetches stop locations with coordinates
2. For each consecutive pair of stops:
   - Calls OpenRouteService to get actual road route
   - Gets encoded polyline geometry
   - Stores in RouteStop.path field
3. Returns complete route with all paths

#### Updated updateRoute() Function
**Before:** Replaced stops but no path data
**After:** Same as createRoute - calculates and stores paths for all new stop combinations

### 2. Database Schema (Already Existed)
The `RouteStop` model already had a `path` field for storing encoded polylines:
```prisma
model RouteStop {
  ...
  path      String? // JSON path data
  ...
}
```

## How It Works

### Creating a Route
```
1. User creates route with stops
2. Backend receives stops array
3. For each consecutive pair:
   - Call ORS API: POST /directions with coordinates
   - Get encoded polyline from response
   - Store in RouteStop.path
4. Save route with all paths
```

### Encoded Path Data
- **Format:** Google Polyline Encoded string (compressed)
- **Storage:** UTF-8 text in database
- **Size:** ~90% smaller than raw coordinates
- **Usage:** Can be decoded in frontend for visualization

### Path Calculation Algorithm
```typescript
// Calculate road path from stop A to stop B
const coordinates = [
  [stopA.lon, stopA.lat],  // ORS format: [lng, lat]
  [stopB.lon, stopB.lat]
];

// Call OpenRouteService
POST /v2/directions/driving-car
{
  "coordinates": [[lon, lat], [lon, lat]]
}

// Get encoded polyline
response.routes[0].geometry  // "encoding result"
```

## API Integration

### OpenRouteService Configuration
- **Base URL:** `https://api.openrouteservice.org/v2/directions`
- **Profile:** `driving-car`
- **API Key:** From `process.env.ORS_API_KEY`
- **Rate Limiting:** Consider for bulk operations

### Error Handling
- If ORS API fails, `path` is stored as `null`
- Route creation continues (non-blocking)
- Path will be `null` rather than empty string

## Data Flow

### Create Route
```
Frontend Form
  ↓
CreateRoute POST /routes
  ↓
Backend separates new vs existing stops
  ↓
Creates missing Stop records
  ↓
Fetches location data for all stops
  ↓
For each consecutive pair:
  - Calls ORS API
  - Gets encoded path
  ↓
Creates RouteStop records with paths
  ↓
Returns complete route
```

### Edit Route
- Same process as create
- Deletes old RouteStops
- Creates new RouteStops with updated paths
- Handles mixed new/existing stops

## Database Queries

### Retrieving Routes with Paths
```typescript
const route = await prisma.route.findUnique({
  where: { id: routeId },
  include: {
    routeStops: {
      include: {
        stop: { include: { location: true } }
      },
      orderBy: { stopOrder: 'asc' }
    }
  }
});

// route.routeStops[i].path contains encoded polyline
```

## Performance Considerations

### Route Creation
- Sequential ORS API calls (one per stop pair)
- N stops = N-1 API calls
- ~500ms per call average
- Total time scales linearly with stop count

### Optimization Opportunities
- Batch API calls with Promise.all (if ORS supports)
- Cache paths for duplicate routes
- Pre-calculate common routes
- Async path calculation in background

## Example Usage

### Storing Paths
```typescript
const newRoute = {
  name: "Downtown Loop",
  code: "DL-001",
  stops: [
    { id: 1, name: "Stop A", order: 0 },
    { id: 2, name: "Stop B", order: 1 },
    { id: 3, name: "Stop C", order: 2 }
  ]
};

POST /routes → 3 stops = 2 path calculations
RouteStop 1 → path to Stop 2
RouteStop 2 → path to Stop 3
RouteStop 3 → path is null (last stop)
```

### Retrieving Paths
```typescript
route.routeStops.map(rs => ({
  stopId: rs.stopId,
  stopOrder: rs.stopOrder,
  encodedPath: rs.path  // Use for map rendering
}));
```

## Files Modified

1. `moveo-core/src/controllers/routeController.ts`
   - Added helper functions for path calculation
   - Updated createRoute() and updateRoute()

2. `moveo-core/prisma/schema.prisma`
   - Schema already had path field (no changes needed)

## Future Enhancements

- [ ] Decode paths on frontend for map visualization
- [ ] Store additional metrics (distance, duration)
- [ ] Background path recalculation job
- [ ] Multi-modal routing support
- [ ] Path caching layer
- [ ] Real-time path updates

## Testing

- [ ] Create route with 3+ stops - verify paths stored
- [ ] Edit route - verify paths updated
- [ ] Mix new and existing stops - verify all paths correct
- [ ] ORS API failure - verify graceful degradation
- [ ] Retrieve route - verify path data included

## Troubleshooting

**Issue:** Paths are null
- Check ORS_API_KEY environment variable
- Verify stop coordinates are valid
- Check ORS API status

**Issue:** Slow route creation
- Reduce number of stops
- Check ORS API latency
- Consider batch operations

**Issue:** Invalid encoded polylines
- Verify ORS API response format
- Check encoding algorithm
- Debug coordinate order [lng, lat] vs [lat, lng]

