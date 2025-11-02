# API Integration Guide

This document explains how the frontend is prepared for backend integration with your API running on `localhost:3000/api`.

## 🔧 Configuration

### Environment Setup

The API configuration is managed in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === 'true' || true,
  TIMEOUT: 10000, // 10 seconds
};
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_USE_MOCK_DATA=false

# OpenRouteService API Configuration (for road routing)
# Get your free API key from: https://openrouteservice.org/dev/#/signup
REACT_APP_ORS_API_KEY=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFiNjEwZDUxYmQ0YzQ0NWE4N2EzOGExZDVkNWZiMzA4IiwiaCI6Im11cm11cjY0In0=
```

- Set `REACT_APP_USE_MOCK_DATA=false` to use real API
- Set `REACT_APP_USE_MOCK_DATA=true` to use mock data for development
- Get a free OpenRouteService API key for production use (demo key has limited usage)

## 📡 API Endpoints

The frontend expects the following REST API endpoints:

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Routes
- `GET /api/routes` - List all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

### Stops
- `GET /api/stops` - List all stops
- `GET /api/stops/:id` - Get stop by ID
- `POST /api/stops` - Create new stop
- `PUT /api/stops/:id` - Update stop
- `DELETE /api/stops/:id` - Delete stop

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `PATCH /api/trips/:id/assign-vehicle` - Assign vehicle to trip
- `PATCH /api/trips/:id/assign-driver` - Assign driver to trip

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 📋 Expected API Response Format

All API responses should follow this structure:

### Success Response
```typescript
{
  "data": T, // The actual data (object or array)
  "message": "Optional success message",
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```typescript
{
  "data": T[], // Array of items
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```typescript
{
  "message": "Error description",
  "error": "Optional error code",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/vehicles"
}
```

## 🔄 Data Models

### Vehicle Request/Response
```typescript
// Create Vehicle Request
{
  "plateNumber": "ABC-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "fleetNumber": "FL001",
  "color": "White",
  "vin": "1234567890",
  "capacity": 5,
  "fuelType": "gasoline",
  "status": "active"
}

// Vehicle Response (includes additional fields)
{
  "id": "1",
  "plateNumber": "ABC-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "fleetNumber": "FL001",
  "color": "White",
  "vin": "1234567890",
  "capacity": 5,
  "fuelType": "gasoline",
  "status": "active",
  "mileage": 15000,
  "lastMaintenance": "2024-01-01T00:00:00.000Z",
  "nextMaintenance": "2024-06-01T00:00:00.000Z",
  "currentLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Driver Request/Response
```typescript
// Create Driver Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "employeeId": "EMP001",
  "licenseNumber": "DL123456",
  "licenseClass": "CDL-A",
  "licenseExpiry": "2025-12-31",
  "dateOfBirth": "1985-01-01",
  "address": "123 Main St, City, State",
  "status": "active"
}
```

### Trip Assignment Requests
```typescript
// Assign Vehicle
{
  "vehicleId": "vehicle-id"
}

// Assign Driver  
{
  "driverId": "driver-id"
}
```

## 🛠️ Usage in Components

### Using API Hooks

Replace manual API calls with the provided hooks:

```typescript
import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../hooks/useApi';

function VehiclesList() {
  // Fetch data
  const { data: vehicles, loading, error, refetch } = useVehicles();
  
  // Create mutation
  const { mutate: createVehicle } = useCreateVehicle(() => {
    refetch(); // Refresh list after creation
  });
  
  // Delete mutation
  const { mutate: deleteVehicle } = useDeleteVehicle(() => {
    refetch(); // Refresh list after deletion
  });

  // Handle loading and error states automatically
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {vehicles?.map(vehicle => (
        <div key={vehicle.id}>{vehicle.plateNumber}</div>
      ))}
    </div>
  );
}
```

### Error Handling

Errors are automatically handled by the hooks and display user-friendly messages. You can also handle them manually:

```typescript
const { mutate: createVehicle } = useCreateVehicle(
  () => {
    // Success callback
    navigate('/vehicles');
  }
);

const handleSubmit = async (data) => {
  try {
    await createVehicle(data);
  } catch (error) {
    // Error is already shown to user via toast
    // Additional error handling if needed
  }
};
```

## 🔄 Migration Steps

### 1. Switch from Mock to API

Change the configuration in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  USE_MOCK_DATA: false, // Set to false for real API
  TIMEOUT: 10000,
};
```

### 2. Update Components

Replace `mockAPI` calls with API hooks:

```typescript
// Before (using mockAPI)
const [vehicles, setVehicles] = useState([]);
useEffect(() => {
  mockAPI.getVehicles().then(setVehicles);
}, []);

// After (using API hooks)
const { data: vehicles, loading, error } = useVehicles();
```

### 3. Handle Loading States

The hooks provide loading states automatically:

```typescript
const { data, loading, error } = useVehicles();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## 🧪 Testing

### Mock Mode
- Set `USE_MOCK_DATA=true` to test with mock data
- All CRUD operations work with in-memory mock data

### API Mode
- Set `USE_MOCK_DATA=false` to test with real API
- Ensure your backend is running on `localhost:3000`
- Check browser network tab for API calls

## 🚀 Production Deployment

### Environment Variables
Set production API URL:
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
REACT_APP_USE_MOCK_DATA=false
```

### CORS Configuration
Ensure your backend allows requests from your frontend domain:
```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:3001', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

## 📝 Notes

- All API calls include proper error handling and loading states
- The system gracefully falls back to mock data if API is unavailable
- Request/response types are fully typed with TypeScript
- Automatic retry logic is implemented for failed requests
- All mutations show success/error toast notifications

## 🔍 Debugging

### Check API Calls
1. Open browser DevTools → Network tab
2. Look for requests to `/api/*` endpoints
3. Check request/response format matches expected structure

### Enable Debug Mode
Add to your `.env`:
```env
REACT_APP_DEBUG_API=true
```

This will log all API calls to the console for debugging.
