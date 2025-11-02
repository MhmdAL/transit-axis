# Duties Management System - Trip Generation Plan

## Overview
A system for managing duties (trip scheduling) that allows users to specify schedules, routes, and trip parameters to generate and manage trips.

## User Flow

### 1. Create New Duty Schedule
- **Schedule Selection**: Choose from existing service schedules or create new one
- **Route Selection**: Select from available routes
- **Date Configuration**:
  - Select specific date or date range
  - Choose start and end times
  - Set trip frequency (e.g., every 30 minutes, every hour)
- **Preview Generation**: Review generated trips before saving
- **Save & Execute**: Create trips in the system

### 2. Manage Duties
- View all generated duties/trips
- Filter by schedule, route, date range
- Edit individual trips
- Delete duties/schedules

## Components Needed

### Frontend Components

1. **DutiesList.tsx** - Main list view
   - Display all duties/trips
   - Filtering by schedule, route, date
   - Search functionality
   - Action buttons (edit, delete)

2. **CreateDuty.tsx** - Duty creation form
   - Multi-step form:
     - Step 1: Select service schedule
     - Step 2: Select route
     - Step 3: Configure date/time parameters
     - Step 4: Generate and preview trips
   - Trip generation logic
   - Validation for date/time ranges

3. **Trip Preview Component** - Display generated trips
   - Table showing all generated trips
   - Ability to edit individual trips before saving
   - Summary statistics (total trips, duration, etc.)

## Data Model (Frontend)

```typescript
interface DutyConfiguration {
  scheduleId: string;
  routeId: string;
  selectedDate: string; // Date range or single date
  startTime: string;
  endTime: string;
  frequency: number; // in minutes
  numberOfTrips?: number; // calculated
}

interface GeneratedTrip {
  scheduleId: string;
  routeId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  tripNumber: number;
}
```

## Implementation Steps

### Phase 1: Basic Structure
1. Create Duties folder in pages
2. Create DutiesList component
3. Create CreateDuty component with basic form
4. Add navigation to sidebar
5. Add routes to App.tsx

### Phase 2: Trip Generation Logic
1. Implement date/time calculations
2. Generate trip list based on frequency
3. Create trip preview component
4. Add validation

### Phase 3: Integration
1. Connect to backend API (when ready)
2. Save/load duty configurations
3. Create actual trips

## UI/UX Considerations

- **Multi-step form** for duty creation (4 steps)
- **Progress indicator** showing current step
- **Cancel/Save** buttons on each step
- **Preview before save** - let user review before committing
- **Real-time validation** on date/time inputs
- **Frequency options**: Every 15 min, 30 min, 1 hour, 2 hours, etc.
- **Visual date picker** for date selection
- **Time range picker** for start/end times

## Next Steps

1. Build basic UI components
2. Implement trip generation algorithm
3. Test with sample data
4. Add integration with backend when ready
