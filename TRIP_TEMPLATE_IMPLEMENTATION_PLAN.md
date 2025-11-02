# Trip Template Implementation Plan

## Overview
Add the ability for users to specify trip placeholders (DutyTemplate) as part of service schedule creation. These will be timing templates that can later be assigned to specific routes and drivers.

## Current State Analysis
- `DutyTemplate` model exists but lacks proper relation to `ServiceSchedule`
- Service schedule creation form only handles basic info (name, dates)
- No UI for managing trip templates within schedules
- Missing API endpoints for duty template management

## Implementation Steps

### 1. Database Schema Updates
**File**: `moveo-core/prisma/schema.prisma`
- Add proper relation between `DutyTemplate` and `ServiceSchedule`
- Add `dutyType` field to `DutyTemplate` to specify TRIP/WASHING/MAINTENANCE
- Add optional `name` field for template identification

### 2. TypeScript Type Definitions
**Files**: `moveo/src/types/api.ts`, `moveo/src/types/index.ts`
- Create `DutyTemplate` interface
- Add API request/response types for duty template operations
- Update `ServiceSchedule` interface to include templates

### 3. Backend API Endpoints
**Files**: `moveo-core/src/controllers/serviceScheduleController.ts`, `moveo-core/src/routes/serviceSchedules.ts`
- `POST /service-schedules/:id/templates` - Create duty template
- `GET /service-schedules/:id/templates` - Get all templates for schedule
- `PUT /service-schedules/:id/templates/:templateId` - Update template
- `DELETE /service-schedules/:id/templates/:templateId` - Delete template

### 4. Frontend API Service
**File**: `moveo/src/services/apiService.ts`
- Add methods for duty template CRUD operations
- Update service schedule creation to include templates

### 5. UI Components
**New File**: `moveo/src/components/Forms/TripTemplateManager.tsx`
- Component for managing trip templates within schedule creation
- Features:
  - Add new template with start/end time and duty type
  - Edit existing templates
  - Delete templates
  - Visual timeline view of templates
  - Validation for time conflicts

### 6. Update Service Schedule Form
**File**: `moveo/src/pages/ServiceSchedules/CreateServiceSchedule.tsx`
- Integrate TripTemplateManager component
- Update form submission to include templates
- Add validation for template data

## Technical Considerations

### Data Structure
```typescript
interface DutyTemplate {
  id: string;
  name?: string;
  startTime: string; // Time of day (HH:MM format)
  endTime: string;    // Time of day (HH:MM format)
  dutyType: 'TRIP' | 'WASHING' | 'MAINTENANCE';
  scheduleId: string;
}
```

### UI/UX Design
- Timeline view showing all templates for the day
- Drag-and-drop for easy time adjustment
- Color coding by duty type
- Conflict detection and warnings
- Quick add buttons for common patterns

### Validation Rules
- Start time must be before end time
- No overlapping templates for same duty type
- Templates must fit within schedule date range
- Minimum duration requirements per duty type

## Implementation Priority
1. Schema updates (foundation)
2. Backend API (data layer)
3. Frontend API service (integration layer)
4. UI components (user interface)
5. Form integration (user experience)

## Testing Strategy
- Unit tests for API endpoints
- Integration tests for template management
- UI tests for form interactions
- End-to-end tests for complete workflow

## Future Enhancements
- Template duplication/copying
- Template libraries for common patterns
- Bulk template operations
- Template scheduling across multiple days
- Integration with route planning

