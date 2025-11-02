# Backend Integration Guide - Vehicle Search

## Overview
The `moveo-cc` frontend now integrates with the `moveo-core` backend API to search for vehicles across the entire system. The multi-select dropdown directly calls the API service when searching.

## Architecture

### Components

#### 1. **ApiService** (`src/services/apiService.ts`)
- **Purpose**: HTTP client for communicating with the backend
- **Base URL**: Configured via `VITE_API_BASE_URL` env var (defaults to `http://localhost:3001`)
- **Features**:
  - Generic request handling with timeout support
  - Automatic JSON serialization/deserialization
  - Error handling and logging
  - Support for paginated and non-paginated responses

**Key Methods**:
```typescript
getVehicles(params?: { page?: number; limit?: number; search?: string }): Promise<Vehicle[]>
searchVehicles(searchTerm: string, limit?: number): Promise<Vehicle[]>
getVehicleById(id: string): Promise<Vehicle>
getAllVehicles(): Promise<Vehicle[]>
```

#### 2. **RealTimeTracking Page** (`src/pages/Tracking/RealTimeTracking.tsx`)
- **Updated**: Uses `apiService.searchVehicles()` directly when dropdown searches
- **Benefits**:
  - Simple and direct API calls
  - No intermediary layers
  - Easy to debug and maintain

### Data Flow

```
User Types Vehicle Name
    ↓ (debounced 300ms)
MultiSelectSearchDropdown
    ↓ (handleVehicleSearch)
apiService.searchVehicles()
    ↓ (GET /api/vehicles?search=...)
Backend Returns Results
    ↓
Display in dropdown
    ↓
User selects vehicles
    ↓
Socket.IO subscriptions
    ↓
Real-time telemetry
```

## Configuration

### Environment Variables

Create a `.env` file in `moveo-cc/` with:

```env
# Vehicle Tracking Socket.IO Server
VITE_VEHICLE_TRACKING_URL=http://localhost:3004

# Backend API Server (moveo-core)
VITE_API_BASE_URL=http://localhost:3001
```

### Backend API Requirements

The backend (`moveo-core`) should provide the following endpoints:

#### **GET /api/vehicles**
Returns list of vehicles with optional search and pagination.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search term for filtering

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle_001",
      "name": "Truck 001",
      "licensePlate": "ABC-1234",
      "make": "Volvo",
      "model": "FH16",
      "year": 2023,
      "vin": "YV2XM65D432E123456",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Types

### Vehicle Interface
```typescript
export interface Vehicle {
  id: string;                    // Unique vehicle identifier
  name: string;                  // Display name
  licensePlate: string;          // License plate
  make: string;                  // Vehicle manufacturer
  model: string;                 // Vehicle model
  year: number;                  // Model year
  vin?: string;                  // Vehicle Identification Number
  status?: string;               // Vehicle status
  createdAt?: string;            // Creation timestamp
  updatedAt?: string;            // Last update timestamp
}
```

## Usage Example

### In the RealTimeTracking Component

```typescript
const handleVehicleSearch = async (searchTerm: string): Promise<string[]> => {
  try {
    const { apiService } = await import('@/services/apiService');
    const vehicles = await apiService.searchVehicles(searchTerm);
    return vehicles.map(v => v.id); // Return IDs for dropdown
  } catch (error) {
    console.error('Error searching vehicles:', error);
    return [];
  }
};

// Used in MultiSelectSearchDropdown
<MultiSelectSearchDropdown<string>
  values={selectedVehicles}
  onChange={handleVehicleSelectionChange}
  onSearch={handleVehicleSearch}
  displayValue={(vehicle: string) => vehicle}
  renderItem={(vehicle: string) => <span>🚗 {vehicle}</span>}
  placeholder="Search vehicles..."
  minSearchLength={0}
/>
```

## Testing the Integration

### 1. **Start All Services**
```bash
# Terminal 1: Start moveo-core backend
cd moveo-core
npm run dev

# Terminal 2: Start moveo-cc-api (Socket.IO)
cd moveo-cc-api
npm run dev

# Terminal 3: Start moveo-cc frontend
cd moveo-cc
npm run dev
```

### 2. **Test Vehicle Search**
- Navigate to "Real-Time Tracking" page
- Type in the vehicle search dropdown
- Verify that vehicles from the system appear
- Select multiple vehicles
- Verify subscriptions work (markers appear on map)

### 3. **Debug in Console**
```javascript
// Check if API is working
const { apiService } = await import('/@/services/apiService');
const vehicles = await apiService.searchVehicles('truck');
console.log(vehicles);
```

## Troubleshooting

### No vehicles appearing in dropdown

**Check**:
1. Backend is running on port 3001
2. `VITE_API_BASE_URL` is correct in `.env`
3. Backend `/api/vehicles` endpoint exists and returns data
4. Check browser console for errors

**Debug**:
```javascript
// In browser console
const { apiService } = await import('/@/services/apiService');
const vehicles = await apiService.getAllVehicles();
console.log(vehicles);
```

### Slow search performance

**Check**:
1. Network latency to backend
2. Backend search is optimized
3. Backend database has indexes on searchable fields

### Search returns no results

**Check**:
1. Backend search implementation
2. Query parameter format matches backend expectations
3. Sample data exists in backend

## API Reference

### ApiService

```typescript
class ApiService {
  // Get vehicles with optional search/pagination
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Vehicle[]>

  // Search vehicles by term
  async searchVehicles(searchTerm: string, limit?: number): Promise<Vehicle[]>

  // Get specific vehicle
  async getVehicleById(id: string): Promise<Vehicle>

  // Get all vehicles (bulk, limit 1000)
  async getAllVehicles(): Promise<Vehicle[]>
}
```

## Next Steps

1. **Setup Environment**
   - Create `.env` file in `moveo-cc/`
   - Set `VITE_API_BASE_URL` to your backend URL

2. **Verify Backend**
   - Ensure `/api/vehicles` endpoint is accessible
   - Test with `?search=truck` parameter

3. **Test Integration**
   - Start all services
   - Navigate to RealTimeTracking page
   - Test vehicle search

4. **Monitor**
   - Check browser console for errors
   - Check network tab for API calls
