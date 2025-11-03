# Trip Monitoring Page - Implementation Plan

## Overview
This document outlines the frontend implementation plan for a trip monitoring page in the moveo-cc application. This page will allow operations specialists to track trip statuses for specific routes on a selected day using a timeline visualization.

## Features

### 1. **Filters Section**
- **Date Picker**: Single day selection (using a native date input or a calendar component)
- **Multi-Select Routes Dropdown**: Leveraging the existing `MultiSelectSearchDropdown.tsx` component
  - Users can search for and select multiple routes
  - Shows count badge of selected routes
  - Displays selected routes in a panel below the dropdown

### 2. **Timeline View**
A horizontal scrollable timeline displaying:
- **Time axis**: 24-hour timeline (00:00 - 23:59) at the top
- **Routes (vertical)**: Each selected route displayed as a row
- **Trips (horizontal)**: Trips for each route displayed as blocks in their respective time slots
- **Scrollability**: Horizontal scroll for the entire timeline to view all 24 hours

### 3. **Trip Blocks/Cards**
Each trip block will display:
- **Trip ID** or identifier
- **Status color coding** based on conditions:
  - **Green (#10B981)**: Completed
  - **Blue (#3B82F6)**: In Progress
  - **Yellow (#F59E0B)**: Pending/Scheduled
  - **Red (#EF4444)**: Delayed/Cancelled
  - **Gray (#94A3B8)**: Unknown/No Status
- **Trip time**: Start and end time within the timeline
- **Hover tooltip**: Show more details (trip ID, driver, vehicle, stops count, etc.)
- **Click interaction**: Can click for more details (to be added later with backend integration)

### 4. **Visual Layout**

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIP MONITORING                          │
├─────────────────────────────────────────────────────────────┤
│  Date: [2024-11-03▼]  Routes: [🔍 2 items selected ▼]     │
├─────────────────────────────────────────────────────────────┤
│  00:00  02:00  04:00  06:00  08:00  10:00  12:00  14:00   │
│┌──────────────────────────────────────────────────────────┐ │
││ Route A │[Trip-1]     [Trip-2]     [Trip-3]              │ │
│├──────────────────────────────────────────────────────────┤ │
││ Route B │            [Trip-4]      [Trip-5]             │ │
│├──────────────────────────────────────────────────────────┤ │
││ Route C │[Trip-6][Trip-7]    [Trip-8]                   │ │
│└──────────────────────────────────────────────────────────┘ │
│◄ ─────────────────────────────────► (Horizontal Scroll)    │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### New Files to Create

1. **`TripMonitoring.tsx`** - Main page component
   - Manages state for selected date and routes
   - Handles API calls (future integration)
   - Renders layout

2. **`TripTimeline.tsx`** - Timeline visualization component
   - Renders the 24-hour timeline
   - Manages horizontal scrolling
   - Renders route rows with trips

3. **`TimelineHeader.tsx`** - Time axis component
   - Displays hourly markers (00:00, 01:00, ..., 23:00)
   - Sticky at top during horizontal scroll

4. **`RouteRow.tsx`** - Individual route row component
   - Displays route name/identifier
   - Renders trip blocks for that route
   - Handles interaction

5. **`TripBlock.tsx`** - Individual trip block component
   - Displays trip with status color
   - Shows trip info
   - Tooltip on hover
   - Click handler (future)

### Reusing Existing Components

- **`MultiSelectSearchDropdown.tsx`**: For route selection
- **`Sidebar.tsx`**: For navigation
- **Theme system**: Using existing theme colors and spacing

## Styling Approach

Using styled-components to align with existing project patterns:

### Color Mapping (Status Colors)
```typescript
const statusColors = {
  completed: theme.colors.success,      // #10B981 (green)
  inProgress: theme.colors.info,        // #3B82F6 (blue)
  pending: theme.colors.warning,        // #F59E0B (yellow)
  delayed: theme.colors.error,          // #EF4444 (red)
  unknown: theme.colors.textMuted,      // #94A3B8 (gray)
};
```

### Layout Key Properties
- Timeline container: `display: flex` with horizontal scroll
- Route rows: `display: flex` vertically stacked
- Trip blocks: Positioned with `left` and `width` based on time
- Sticky time header: `position: sticky`
- Scrollable container: `overflow-x: auto`

## Data Structure (Frontend Only)

### Mock Trip Data Interface
```typescript
interface Trip {
  id: string;
  routeId: string;
  startTime: string;      // ISO format or timestamp
  endTime: string;
  status: 'completed' | 'inProgress' | 'pending' | 'delayed' | 'unknown';
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehiclePlateNo?: string;
  stopsCount?: number;
}

interface Route {
  id: string;
  name: string;
  code: string;
}
```

### Mock Data
For frontend-only implementation, create mock data with:
- 3-5 sample routes
- 10-15 sample trips distributed across different times
- Various trip statuses
- Different trip durations

## Implementation Steps

### Phase 1: Setup & Layout
- [ ] Create new page component `TripMonitoring.tsx`
- [ ] Create main timeline container with flex layout
- [ ] Add sidebar integration
- [ ] Create route for `/trip-monitoring` in `App.tsx`

### Phase 2: Filter UI
- [ ] Implement date picker input
- [ ] Implement route multi-select using existing dropdown component
- [ ] Add filter state management

### Phase 3: Timeline Visualization
- [ ] Create `TimelineHeader.tsx` with hourly markers
- [ ] Create `RouteRow.tsx` for route rows
- [ ] Create `TripBlock.tsx` for individual trip blocks
- [ ] Implement horizontal scrolling
- [ ] Add sticky header for time axis

### Phase 4: Styling & Polish
- [ ] Apply theme colors and spacing
- [ ] Implement status color coding
- [ ] Add hover effects and tooltips
- [ ] Responsive adjustments
- [ ] Add animations (optional)

### Phase 5: Mock Data & Testing
- [ ] Create mock trips data
- [ ] Create mock routes data
- [ ] Test with various scenarios (many trips, few trips, different times)
- [ ] Test scrolling behavior

## Key Considerations

### 1. **Time Calculation**
- Convert trip start/end times to pixel positions on 24-hour timeline
- Account for partial hours (e.g., trip from 09:30 to 11:45)
- Formula: `(hours + minutes/60) * pixelsPerHour`

### 2. **Responsive Design**
- Timeline width: Fixed width or responsive
- Minimum trip width to ensure visibility
- Horizontal scrollbar for overflow
- Mobile considerations (might need different layout)

### 3. **Performance**
- For now: Mock data won't have performance issues
- Future optimization needed for large datasets (virtual scrolling)

### 4. **Accessibility**
- Keyboard navigation for timeline scrolling
- ARIA labels for trip blocks
- Color contrast ratios meet WCAG standards
- Semantic HTML

### 5. **Future Backend Integration**
- API endpoint: `GET /api/trips?date=YYYY-MM-DD&routeIds=route1,route2,...`
- Loading states during data fetch
- Error handling
- Real-time updates (WebSocket ready)

## Styling Variables

```typescript
// Timeline dimensions
const TIMELINE_HOURS = 24;
const PIXELS_PER_HOUR = 100;
const TOTAL_TIMELINE_WIDTH = TIMELINE_HOURS * PIXELS_PER_HOUR; // 2400px

// Route row
const ROUTE_ROW_HEIGHT = 80;
const ROUTE_LABEL_WIDTH = 150;

// Trip block
const MIN_TRIP_WIDTH = 20;
const TRIP_BLOCK_HEIGHT = 50;
const TRIP_BLOCK_MARGIN = 2;
```

## Navigation Integration

Add link to TripMonitoring in Sidebar:
```typescript
// Link text: "Trip Monitoring"
// Route: "/trip-monitoring"
// Icon: Calendar or similar
```

## Testing Scenarios

1. **Empty state**: No routes selected
2. **Single route**: Only one route with multiple trips
3. **Multiple routes**: 3+ routes with different trip densities
4. **Edge cases**: 
   - Trips at midnight (00:00)
   - Trips at end of day (23:00-23:59)
   - Very short trips (5 minutes)
   - Very long trips (spanning multiple hours)
5. **Scrolling**: Verify horizontal scroll functionality
6. **Interaction**: Hover tooltips, click handlers (when backend ready)

## Files to Create/Modify

### New Files
```
/moveo-cc/src/pages/TripMonitoring/
  ├── TripMonitoring.tsx          (Main page)
  ├── TripTimeline.tsx            (Timeline container)
  ├── TimelineHeader.tsx          (Time axis)
  ├── RouteRow.tsx                (Route row)
  ├── TripBlock.tsx               (Trip block)
  └── mockData.ts                 (Mock data for frontend)
```

### Modified Files
```
/moveo-cc/src/App.tsx             (Add route)
/moveo-cc/src/components/Sidebar/Sidebar.tsx (Add navigation link)
```

## Estimated Development Time
- Setup & Layout: 1 hour
- Filter UI: 1 hour
- Timeline Visualization: 2-3 hours
- Styling & Polish: 1-2 hours
- Mock Data & Testing: 1 hour
- **Total**: 6-8 hours for complete frontend implementation
