# Route Edit Feature Implementation

## Overview
The CreateRoute component has been converted to support both **creating new routes** and **editing existing routes**. The same component handles both operations based on whether a route ID is present in the URL.

## Changes Made

### 1. Frontend Changes

#### a) CreateRoute Component (`moveo/src/pages/Routes/CreateRoute.tsx`)
- **Added `useParams()` hook** to detect if editing (route ID in URL)
- **Auto-load mode selection**: 
  - When creating: Automatically enables "Add Stops" mode
  - When editing: Loads existing route data and pre-populates form
- **Dynamic page title**: Shows "Edit Route" or "Create New Route" based on mode
- **Dynamic submit button**: Shows "Update Route" or "Create Route" 
- **Unified handler**: `handleSubmit()` detects mode and calls appropriate API method

**Key Logic:**
```typescript
const { id } = useParams<{ id?: string }>();
// Load route data if editing
if (id) {
  const route = await dataService.getRouteById(id);
  // Pre-populate form and stops
}
// Call update or create based on mode
if (id) {
  await dataService.updateRoute(id, {...});
} else {
  await dataService.createRoute(...);
}
```

#### b) App Routes (`moveo/src/App.tsx`)
- **Added new route**: `/routes/edit/:id` → Uses same CreateRoute component
- Routes page already had `handleEditRoute()` that navigates to edit page

#### c) Type Updates (`moveo/src/types/index.ts`)
- **Extended Route interface** to include:
  - `description?: string`
  - `stops?: Array<Stop & { order?: number }>`

### 2. Backend Changes

#### RouteController (`moveo-core/src/controllers/routeController.ts`)
- **Updated `createRoute()`**: Already handles new stops with id === 0
- **Enhanced `updateRoute()`**: Now handles both route field updates AND stop management
  - Separates new stops (id === 0) from existing stops
  - Creates new stops first, then links them to route
  - Deletes old route-stops and creates new ones
  - Returns complete route with updated stops

**Stop Handling Logic:**
```typescript
// Separate new vs existing stops
const newStops = stops.filter(s => !s.id || s.id === 0);
const existingStops = stops.filter(s => s.id && s.id !== 0);

// Create new stops
const createdStops = await Promise.all(
  newStops.map(stop => prisma.stop.create({...}))
);

// Delete and recreate routeStops
await prisma.routeStop.deleteMany({ where: { routeId } });
await prisma.routeStop.createMany({ data: [...] });
```

## Features Enabled

### Create New Route
1. Click "Create Route" from Routes page
2. Route opens in Add Stops mode automatically
3. Click map to add manual stops or search existing stops
4. Fill in route name and code
5. Click "Create Route"
6. Route is created with all stops

### Edit Existing Route
1. Click edit icon on a route in Routes list
2. Opens same form with pre-populated data
3. Can:
   - Change route name and code
   - Add new manual stops (id === 0)
   - Remove stops
   - Reorder stops
   - Replace existing stops with different ones
4. Click "Update Route"
5. Route is updated with all changes

## API Endpoints Used

### Routes
- `GET /routes` - List all routes
- `GET /routes/:id` - Get single route with stops
- `POST /routes` - Create new route
- `PUT /routes/:id` - Update route (now supports stop changes)
- `DELETE /routes/:id` - Delete route

## Data Flow

### Creating a Route
```
Form → handleSubmit() → dataService.createRoute() 
→ apiService.post() → routeController.createRoute() 
→ Creates Stop records (if new) + Creates Route + Creates RouteStops
```

### Editing a Route
```
Load Route → Pre-populate form → handleSubmit() → dataService.updateRoute()
→ apiService.put() → routeController.updateRoute()
→ Creates new Stop records (if new) + Updates Route + Replaces RouteStops
```

## Special Cases Handled

### New Manual Stops
- Frontend: `id: '0'` indicates new stop
- Backend: Filters by `id === 0` and creates stop record
- Created stop ID is used for route-stop link

### Existing Stops
- Frontend: Has numeric/bigint ID from database
- Backend: Linked directly to route without creating new stop

### Stop Replacement
- When editing: Old route-stops are deleted
- New stops array is created entirely fresh
- Preserves order based on array index

## Testing Checklist

- [ ] Create route with all manual stops
- [ ] Create route with mix of manual and existing stops
- [ ] Create route with existing stops only
- [ ] Edit route - change name/code
- [ ] Edit route - add new manual stop
- [ ] Edit route - remove a stop
- [ ] Edit route - reorder stops
- [ ] Edit route - replace stops entirely
- [ ] Verify route calculations show correct path
- [ ] Verify stops persist after save

## Files Modified

1. `moveo/src/pages/Routes/CreateRoute.tsx`
2. `moveo/src/App.tsx`
3. `moveo/src/types/index.ts`
4. `moveo-core/src/controllers/routeController.ts`

## Notes

- Modal for manual stop creation already existed, just needed to be rendered
- Route map styling improved with prominent visible path
- Add Stops button moved to map sidebar for better UX
- Component maintains edit history in URL params for deep linking
- All validation remains consistent between create and edit modes

