# Vehicle Blocks and Driver Runs Implementation Plan

## Overview
Add the ability to organize duty templates into vehicle blocks and driver runs. These are independent grouping mechanisms that allow users to better organize and manage templates at the template level (before duties are created).

## Concepts

### Vehicle Blocks
- Independent grouping of duty templates
- Can have 0 to N vehicle blocks
- Each block can contain multiple duty templates
- A template can belong to at most one vehicle block (or none)
- Used for organizing templates that will be assigned to vehicles

### Driver Runs
- Independent grouping of duty templates  
- Can have 0 to N driver runs
- Each run can contain multiple duty templates
- A template can belong to at most one driver run (or none)
- Used for organizing templates that will be assigned to drivers

### Key Requirements
- Vehicle blocks and driver runs are completely independent
- You can have 2 vehicle blocks and 0 driver runs (or any combination)
- Easy to use interface
- Assign duty templates to blocks/runs

## UI/UX Recommendation

### Proposed: Table-Based View with Grouping
Given the requirement for ease of use and the need to manage multiple blocks/runs and their assigned templates, a **table-based interface** would be more efficient than the current timeline view for this use case. However, we can keep both views:

1. **Main View: Table with Expandable Rows**
   - Shows all vehicle blocks and driver runs in separate sections
   - Each block/run as a row that can be expanded to show assigned templates
   - Easy to add/remove templates from blocks/runs via drag-and-drop or checkboxes
   - Quick actions (add block, add run, delete, edit name)

2. **Secondary View: Keep Timeline**
   - Keep existing timeline view for visual representation
   - Show color-coding based on block/run assignment

### Alternative: Card-Based Layout
- Sections for "Vehicle Blocks" and "Driver Runs"
- Each block/run is a card showing name and assigned templates
- Drag templates between blocks/runs or to unassigned

## Implementation Steps

### Phase 1: Data Model & Types (Frontend Only Initially)

#### 1.1 Type Definitions
**File**: `moveo/src/types/index.ts`
- Add `VehicleBlock` interface
- Add `DriverRun` interface  
- Update `DutyTemplate` to include optional `vehicleBlockId` and `driverRunId`

```typescript
export interface VehicleBlock {
  id: string;
  bin: string;
  scheduleId: string;
  templateIds: string[]; // IDs of assigned duty templates
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverRun {
  id: string;
  name: string;
  scheduleId: string;
  templateIds: string[]; // IDs of assigned duty templates
  createdAt?: string;
  updatedAt?: string;
}

// Update DutyTemplate
export interface DutyTemplate {
  // ... existing fields
  vehicleBlockId?: string;
  driverRunId?: string;
}
```

#### 1.2 State Management in Component
- Add state for `vehicleBlocks` and `driverRuns`
- Store as arrays in component state (initially, before backend support)
- Templates store references to their assigned block/run

### Phase 2: UI Components

#### 2.1 Main Table View Component
**File**: `moveo/src/components/Forms/TripTemplateManager.tsx`
- Add tabs or sections for:
  1. "Duties" (current template management)
  2. "Vehicle Blocks" (new section)
  3. "Driver Runs" (new section)

#### 2.2 Vehicle Block Manager
- Table/card view showing:
  - Block name (editable)
  - Number of assigned templates
  - Expandable list of assigned templates
  - Actions: Edit, Delete, Add Template
- "Add Block" button
- Template assignment via:
  - Multi-select dropdown
  - Drag-and-drop
  - Checkbox selection from unassigned templates list

#### 2.3 Driver Run Manager
- Similar structure to Vehicle Block Manager
- Independent section

#### 2.4 Template Assignment Interface
- Show unassigned templates
- Show which block/run each template belongs to (if any)
- Quick assignment buttons/selectors

### Phase 3: Backend Integration (Future)

If backend support is needed:
1. Database schema updates (Prisma)
2. API endpoints for CRUD operations on blocks/runs
3. Update DutyTemplate model to include foreign keys

## UI Structure Proposal

```
┌─────────────────────────────────────────────────────────┐
│ Duties                                                   │
│                                                           │
│ [+ Add Block]  [+ Add Run]  [+ Add Template]            │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Vehicle Blocks                                      │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Block A (3 templates)    [Edit] [Delete] [Expand ▼]│ │
│ │   • 08:00-10:00 Trip                               │ │
│ │   • 10:00-12:00 Trip                               │ │
│ │   • 14:00-16:00 Trip                               │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │535 Block B (2 templates)    [Edit] [Delete] [▼]    │ │
│ │   • 09:00-11:00 Washing                            │ │
│ │   • 13:00-14:00 Maintenance                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Driver Runs                                         │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Run 1 (2 templates)      [Edit] [Delete] [Expand ▼]│ │
│ │   • 08:00-12:00 Trip                               │ │
│ │   • 14:00-18:00 Trip                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Unassigned Templates                                │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ • 07:00-08:00 Trip     [Assign to Block ▼] [Assign] │ │
│ │ • 12:00-13:00 Trip     [Assign mood ▼] [Assign Run]│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Timeline View Toggle]                                   │
│ (Keep existing timeline visualization)                   │
└─────────────────────────────────────────────────────────┘
```

## Initial Implementation (Frontend-Only)

For the initial implementation, we can:
1. Store blocks/runs in component state
2. Use local state management (useState)
3. Pass block/run data along with templates when saving
4. Later migrate to backend persistence

## Questions to Consider

1. **Persistence**: Should blocks/runs be saved to the backend immediately, or only when the schedule is saved?
2. **Naming**: Should blocks/runs have unique names? Any naming conventions?
3. **Assignment Rules**: Can a template be in both a block and a run simultaneously?
   - **Proposed**: Yes, a template can be in one block AND one run (they're independent dimensions)
4. **Validation**: Any constraints on which templates can be in which blocks/runs?

## Next Steps

1. Review and approve this plan
2. Implement frontend types
3. Build UI components
4. Integrate with existing template management
5. Test with sample data
6. Consider backend persistence (if needed)

