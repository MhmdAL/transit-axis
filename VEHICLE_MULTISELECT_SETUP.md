# Vehicle Multi-Select Setup Documentation

## Overview
This document describes the implementation of a vehicle multi-select search dropdown in the `moveo-cc` frontend application, along with a fleet number selection field for telemetry transmission.

## Changes Made

### 1. MultiSelectSearchDropdown Component
**File**: `moveo-cc/src/components/UI/MultiSelectSearchDropdown.tsx`

A reusable, generic React component that provides:
- **Multi-select functionality** with checkboxes
- **Search/filter capability** with debouncing (300ms default)
- **Selected items display** with visibility toggle
- **Clear all functionality**
- **Beautiful, themed UI** using styled-components

#### Features:
- Generic type support (`<T>`)
- Async search via `onSearch` callback
- Customizable rendering via `renderItem` and `displayValue` props
- Auto-close on outside click
- Selected count badge
- Touch and keyboard friendly

#### Props:
```typescript
values: T[]                              // Selected items
onChange: (items: T[]) => void          // Called when selection changes
onSearch: (searchTerm: string) => Promise<T[]>  // Async search function
displayValue: (item: T) => string       // How to display selected items
renderItem: (item: T) => React.ReactNode // How to render dropdown items
placeholder?: string                     // Input placeholder
hasError?: boolean                       // Error state styling
disabled?: boolean                       // Disabled state
debounceMs?: number                      // Debounce delay (default: 300ms)
minSearchLength?: number                 // Minimum characters to trigger search
```

### 2. RealTimeTracking Page Updates
**File**: `moveo-cc/src/pages/Tracking/RealTimeTracking.tsx`

#### Changes:
- **Integrated MultiSelectSearchDropdown** for vehicle selection
- **Replaced simple vehicle cards** with multi-select functionality
- **Updated state management** from `Set<string>` to `string[]` for easier handling
- **Added async search function** that filters vehicles based on available telemetry
- **Multi-marker map display** showing all selected vehicles simultaneously
- **Smart subscription management** that subscribes/unsubscribes vehicles based on selection

#### How It Works:
1. User types in the dropdown to search for vehicles
2. Available vehicles from telemetry are filtered and displayed
3. User can select multiple vehicles
4. Each selected vehicle:
   - Gets subscribed to via Socket.IO
   - Displays a marker on the map with bearing icon
   - Shows location, speed, and bearing in the popup

#### Key Functions:
```typescript
handleVehicleSearch(searchTerm: string): Promise<string[]>
  // Searches available vehicles by ID

handleVehicleSelectionChange(selected: string[]): void
  // Syncs subscriptions when selection changes
  // Automatically subscribes to new vehicles
  // Automatically unsubscribes from removed vehicles
```

### 3. VehicleTracker Page - Fleet Selection
**File**: `moveo-cc/src/pages/VehicleTracker/VehicleTracker.tsx`

#### New Fleet Configuration Panel:
- **Fleet Number Selector**: Dropdown with 5 predefined fleet options
- **Current Fleet Display**: Shows the currently selected fleet
- **Information Text**: Explains the purpose of fleet selection

#### Fleet Options:
- Fleet 001 - Main
- Fleet 002 - Secondary
- Fleet 003 - Regional
- Fleet 004 - Express
- Fleet 005 - Custom

#### State:
```typescript
const [fleetNumber, setFleetNumber] = useState('fleet_001');
```

#### Usage:
The fleet number is stored in component state and can be:
- Used when sending telemetry data
- Displayed in the UI for user confirmation
- Modified based on the active connection status

## Integration Details

### Type Definitions
All types are defined in `moveo-cc/src/types/index.ts`:
- `VehicleTelemetry`: Single vehicle location/telemetry point
- `BatchedTelemetry`: Multiple vehicles' latest telemetry in one batch
- `ServerStats`: Server statistics

### Path Aliases
The following aliases are configured in `tsconfig.app.json`:
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/types/*` → `src/types/*`
- `@/pages/*` → `src/pages/*`
- `@/utils/*` → `src/utils/*`
- `@/styles/*` → `src/styles/*`
- `@/*` → `src/*` (catch-all)

### Socket.IO Integration
The `useVehicleTracking` hook handles:
- Socket.IO connection to `moveo-cc-api`
- Vehicle subscription/unsubscription
- Real-time telemetry batches
- Server statistics

## Usage Example

### RealTimeTracking Page:
```tsx
// Users can:
1. Type vehicle ID in the search box (e.g., "truck_001")
2. Select multiple vehicles from dropdown
3. See all selected vehicles as markers on the map
4. Click markers to see vehicle details
5. Use the eye icon to toggle selected items visibility
6. Use the X icon to clear all selections
```

### VehicleTracker Page:
```tsx
// The fleet number selector shows:
- Current fleet selection
- Dropdown with available fleet options
- Information about the selected fleet
- Disabled state when not connected
```

## Testing the Feature

1. **Start the socket.io server**:
   ```bash
   cd moveo-cc-api
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd moveo-cc
   npm run dev
   ```

3. **Send vehicle telemetry** (e.g., via the Vehicle Emulator page)

4. **In RealTimeTracking page**:
   - Search for vehicle IDs
   - Select multiple vehicles
   - See them appear on the map
   - Toggle visibility of selected items
   - Clear selections

5. **In VehicleTracker page**:
   - See the fleet selection dropdown
   - Change fleet number
   - Observe state changes

## Styling
The component uses the theme from `moveo-cc/src/styles/theme.ts`:
- Primary color for selections
- Consistent spacing and typography
- Responsive design
- Smooth transitions and animations

## Performance Considerations
- **Debounced search**: 300ms delay prevents excessive filtering
- **Efficient subscriptions**: Only subscribes/unsubscribes on actual changes
- **Memoization ready**: Component structure allows for future optimization with `React.memo`
- **Set-based tracking**: Quick lookup for subscription status

## Future Enhancements
1. Add vehicle count badge
2. Group vehicles by fleet
3. Add favorites/pinned vehicles
4. Persist fleet selection to localStorage
5. Add vehicle geofencing
6. Add vehicle status indicators (online/offline)
7. Export vehicle tracking data

