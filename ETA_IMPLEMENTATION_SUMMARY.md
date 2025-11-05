# ETA & Wait Time Implementation - Complete Documentation ✅

## Overview
Successfully implemented:
1. **ETA Tracking** - Travel time between consecutive stops calculated via routing service
2. **Wait Time Collection** - Users can specify wait time at each stop during route creation
3. **ETA Display** - ETAs shown in stop popups on the route map

## Changes Made

### 1. Frontend: CreateRoute.tsx

#### Updated Functions:

**a) `handleConfirmManualStop()` (Lines 330-365)**
   - Added `eta` variable to capture travel time
   - Extracts `duration` from `RoutingService.calculateRoute()` response
   - Converts seconds to minutes: `Math.round(duration / 60)`
   - Stores `_eta` on the stop object alongside `_segmentPath`
   - Stores `_waitTime` from modal input field

**b) `handleAddStop()` (Lines 387-417)**
   - Added `eta` variable for existing stops
   - Calculates ETA when adding stops from the available stops list
   - Stores `_eta` and `_waitTime: null` on the stop object

**c) `handleRemoveStop()` (Lines 457-477)**
   - Updated to recalculate both `_segmentPath` and `_eta` when removing a stop
   - When removing stop N, recalculates path and ETA for the connection between stop N-1 and N+1

**d) `handleSubmit()` (Lines 508-567)**
   - Added `etas` array parallel to `segmentPaths` array
   - Collects pre-calculated ETAs from each stop's `_eta` property
   - Falls back to calculating ETA if not pre-calculated
   - Added `waitTimes` array parallel to `etas`
   - Collects pre-calculated wait times from each stop's `_waitTime` property
   - Sends both `etas` and `waitTimes` arrays to the API in the request payload

**e) Manual Stop Modal UI**
   - Added "Wait Time (minutes)" input field to the modal
   - Accepts numeric input with 5-minute steps (step="5")
   - Users can enter wait time at each stop (optional field)
   - Defaults to null if not specified

#### Data Flow (Frontend):
```
Route segment calculation
    ↓
Extract: duration (seconds) from OpenRouteService
    ↓
Convert: Math.round(duration / 60) → ETA in minutes
    ↓
Store: _eta property on stop object
    ↓
Collect: etas array at submission time
    ↓
Send: { name, code, stops, segmentPaths, etas }
```

### 2. Backend: routeController.ts

#### Updated Functions:

**a) `createRoute()` (Lines 72-128)**
   - Added `etas` parameter to destructuring from `req.body`
   - Updated `routeStopsData` mapping to include: `eta: etas?.[index] || null`
   - Now saves ETA values to the database when creating a new route

**b) `updateRoute()` (Lines 152-207)**
   - Added `etas` parameter to destructuring from `req.body`
   - Updated `routeStopsData` mapping to include: `eta: etas?.[index] || null`
   - Now saves ETA values to the database when updating a route

#### Data Flow (Backend):
```
Receive request with etas array
    ↓
Create RouteStop records
    ↓
Map: eta: etas?.[index] || null
    ↓
Save to database via Prisma
    ↓
Return updated route with ETA data
```

## ETA Semantics

The ETA value represents the travel time **from the previous stop to the current stop**:

```
routeStop[0].eta = null (first stop, no incoming travel)
routeStop[1].eta = travel time from stop[0] → stop[1]
routeStop[2].eta = travel time from stop[1] → stop[2]
routeStop[N].eta = travel time from stop[N-1] → stop[N]
```

## Data Types & Conversions

- **OpenRouteService Duration**: Seconds (from API)
- **Frontend Storage**: Minutes (Math.round(duration / 60))
- **Database Storage**: Minutes (Int field in RouteStop model)
- **Formula**: `ETA (minutes) = duration (seconds) / 60`

## Database Schema

The Prisma schema already had the necessary field:
```prisma
model RouteStop {
  id        BigInt @id @default(autoincrement())
  routeId   BigInt
  stopId    BigInt
  stopOrder Int
  isActive  Boolean @default(true)
  path      String?     // JSON path data
  eta       Int?        // ✅ Already present - estimated time of arrival in minutes
  waitTime  Int?        // wait time in minutes
  // ... relations
}
```

## Testing Checklist

- ✅ No breaking changes (eta is nullable)
- ✅ Linter validation passed
- ✅ Manual stop creation calculates ETA
- ✅ Stop list additions calculate ETA
- ✅ Stop removal recalculates affected ETA
- ✅ Submission sends etas array
- ✅ Create route endpoint accepts etas
- ✅ Update route endpoint accepts etas
- ✅ ETA values saved to database
- ✅ First stop always has null ETA

### 2. Frontend: RouteMap.tsx

**Updated PopUp Display** (Lines 855-862)
   - Added ETA display in stop popups
   - Shows: "ETA: 15 min from previous stop" when available
   - Conditionally displays only if `_eta` is set and not null
   - Non-intrusive, only shown when user clicks on a marker

### 3. Backend: routeController.ts

**a) `createRoute()` method**
   - Added `waitTimes` parameter to destructuring from `req.body`
   - Updated `routeStopsData` mapping to include: `waitTime: waitTimes?.[index] || null`
   - Now saves wait times to database when creating a new route

**b) `updateRoute()` method**
   - Added `waitTimes` parameter to destructuring from `req.body`
   - Updated `routeStopsData` mapping to include: `waitTime: waitTimes?.[index] || null`
   - Now saves wait times to database when updating a route

## Files Modified

1. `/home/mhmdal/Projects/moveo-master/moveo/src/pages/Routes/CreateRoute.tsx`
   - 5 functions/UI elements updated
   - ETA and wait time collection added
   - Modal now includes wait time input field

2. `/home/mhmdal/Projects/moveo-master/moveo/src/components/Map/RouteMap.tsx`
   - Stop popup updated to display ETA

3. `/home/mhmdal/Projects/moveo-master/moveo-core/src/controllers/routeController.ts`
   - 2 functions updated (createRoute, updateRoute)
   - Wait time persistence added alongside ETA

## No Database Migration Required

Both `eta` and `waitTime` fields already existed in the Prisma schema RouteStop model, so no migration is needed. The implementation is fully backward compatible.

## Example API Payload

```json
{
  "name": "Route A",
  "code": "RT-001",
  "stops": [
    { "id": 1, "name": "Stop A", "location": { "lat": 25.123, "lon": 55.456 } },
    { "id": 2, "name": "Stop B", "location": { "lat": 25.234, "lon": 55.567 } },
    { "id": 0, "name": "Stop C", "location": { "lat": 25.345, "lon": 55.678 } }
  ],
  "segmentPaths": [null, "polyline_data_1", "polyline_data_2"],
  "etas": [null, 15, 22],
  "waitTimes": [null, 5, 10]
}
```

In this example:
- Stop A (first): eta = null, wait = null
- Stop B: eta = 15 minutes (from A to B), wait = 5 minutes
- Stop C: eta = 22 minutes (from B to C), wait = 10 minutes

---

## System Architecture Overview

```
FRONTEND (CreateRoute.tsx)
└─ User adds stops
   ├─ handleConfirmManualStop() → Calculate ETA
   ├─ handleAddStop() → Calculate ETA  
   └─ handleRemoveStop() → Recalculate affected ETA
   
   All functions:
   1. Call RoutingService.calculateRoute()
   2. Extract duration (seconds)
   3. Convert: Math.round(duration / 60) → minutes
   4. Store _eta on stop object
   
   On Submit:
   └─ Build etas array: [null, eta1, eta2, ...]
   └─ Send to API: { name, code, stops, segmentPaths, etas }

BACKEND (routeController.ts)
└─ createRoute() / updateRoute()
   ├─ Receive etas array
   ├─ Map to RouteStop records
   └─ Save: eta: etas?.[index] || null

DATABASE (Prisma)
└─ RouteStop.eta field (Int, nullable, in minutes)
```

## Key Code Patterns

### ETA Calculation (used 3 places)
```typescript
const routeData = await RoutingService.calculateRoute(waypoints) as any;
const eta = routeData?.duration ? Math.round(routeData.duration / 60) : null;
```

### ETA Storage
```typescript
{ ...stop, _segmentPath: segmentPath, _eta: eta, order: newStopOrder }
```

### Request Payload
```typescript
{ name, code, stops, segmentPaths, etas: [null, 15, 22, ...] }
```

### Backend Save
```typescript
eta: etas?.[index] || null
```

## ETA Semantics

- **routeStop[0].eta** = null (first stop, no incoming travel)
- **routeStop[1].eta** = travel time from stop[0] → stop[1]
- **routeStop[2].eta** = travel time from stop[1] → stop[2]

## Conversion Formula

```
OpenRouteService Duration (seconds) ÷ 60 = ETA (minutes)
Math.round() → Rounded to nearest minute

Examples:
- 900 sec → 15 min
- 750 sec → 12.5 → 12 min (rounded)
- 1800 sec → 30 min
```

## Testing Scenarios

1. ✅ Add manual stop → ETA calculated
2. ✅ Add stop from list → ETA calculated
3. ✅ Remove middle stop → Affected ETA recalculated
4. ✅ Submit route → etas array sent to API
5. ✅ Backend saves ETAs to database
6. ✅ Edit existing route → ETAs properly handled
7. ✅ First stop always has null ETA
8. ✅ Route calculation fails → eta = null (graceful)

## User Flow

### Creating a Route with ETA & Wait Time

1. User creates a new route and fills in name/code
2. User adds stops (manually or from list)
3. For **manual stops**, a modal appears where user enters:
   - Stop name (required)
   - Stop code (required)
   - Wait time (optional, numeric input, 5-min steps)
4. System automatically calculates **ETA** from routing service
5. User can see **ETA in popup** when clicking any stop marker:
   - "ETA: 15 min from previous stop"
6. User submits route
7. Both ETAs and wait times are saved to database

## Display Features

### On the Map
- **Stop Popup** (click marker): Shows stop info + ETA if available
- **No cluttered UI**: ETA only shown in popups, not on summary panel

### In the Modal
- **Wait Time Input**: Number field with 5-minute increments
- **Optional**: Users don't have to enter wait time

### Data Saved
- Each route stop stores: path, eta (minutes), waitTime (minutes)

## Trip Monitoring - Expected Time Calculation

### What's New
When viewing trip details in the Trip Monitoring modal:
- **Expected Arrival Times** calculated based on:
  - Trip start time
  - ETAs for each segment (travel time)
  - Wait times at each stop
- **Expected Departure Times** calculated as:
  - Expected Arrival + Wait Time at that stop
- **Display Logic**:
  - Shows actual times if driver has reached/left the stop
  - Shows calculated expected times with "(ETA)" label if not yet reached
  - First stop arrival = trip start time

### Implementation Details

**Backend Changes** (tripController.ts)
- Updated `getTripDetails()` to fetch route stops with ETAs and wait times
- Returns `routeStops` array with: stopOrder, eta (minutes), waitTime (minutes)

**Frontend Changes** (TripDetailsModal.tsx)
- Added `calculateExpectedTimes()` function that:
  1. Starts with trip start time at first stop
  2. For each stop, calculates: Arrival = Previous Departure + ETA
  3. Then calculates: Departure = Arrival + Wait Time
  4. Continues to next stop
- Displays expected times in timeline when actual times not available

### Example Calculation
```
Trip Start: 08:00 AM

Stop A (order 0): 
  - ETA: null (first stop)
  - Wait: 5 min
  - Expected Arrival: 08:00 AM
  - Expected Departure: 08:05 AM

Stop B (order 1):
  - ETA: 15 min (from A to B)
  - Wait: 10 min
  - Expected Arrival: 08:20 AM (08:05 + 15 min)
  - Expected Departure: 08:30 AM (08:20 + 10 min)

Stop C (order 2):
  - ETA: 22 min (from B to C)
  - Wait: 5 min
  - Expected Arrival: 08:52 AM (08:30 + 22 min)
  - Expected Departure: 08:57 AM (08:52 + 5 min)
```

## Color Coding & Status Indicators

### Timeline Stop Status Colors

The trip details modal now shows color-coded status for each stop's arrival and departure times:

**Arrival Status:**
- 🟢 **On Time** (within 1 minute of expected): Light green background
- 🔴 **Behind** (more than 1 minute late): Light red background
- 🟡 **Ahead** (more than 1 minute early): Light amber background
- ⚪ **Expected** (not yet arrived): Light gray background

**Departure Status:**
- 🔵 **Departed**: Light blue background with special indicator
- Same color coding as arrival for completed stops

### Time Difference Display

When a stop has been visited (arrival/departure recorded), shows the variance:
- "On time" - if within 1 minute
- "X min behind" - if late
- "X min ahead" - if early

Example display:
```
ARRIVAL: 08:20 AM
         2 min behind

DEPARTURE: 08:30 AM
           Departed
```

### Status Determination Logic

```javascript
// For each time point:
1. If no actual time → "expected" (gray, shows calculated time)
2. If departure time exists → "departed" (blue)
3. If arrival time exists:
   - Calculate difference between actual and expected
   - |diff| ≤ 1 min → "ontime" (green)
   - diff > 1 min → "behind" (red)
   - diff < -1 min → "ahead" (amber)
```

## Verification Status

- ✅ No linter errors
- ✅ Code compiles
- ✅ No database migration needed (both fields already exist)
- ✅ Backward compatible (eta & waitTime are nullable)
- ✅ All files updated correctly
- ✅ Frontend → Backend data flow complete
- ✅ Wait time input working
- ✅ ETA display in popups
- ✅ Clean UI (no cluttered route summary)
- ✅ Expected times calculated for trip monitoring
- ✅ Timeline shows both actual and expected times
- ✅ Color coding implemented for status tracking
- ✅ Time variance displayed (on-time/behind/ahead)
- ✅ Special indication for departed stops

