# Fleet Management System - Backend Implementation Plan

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma (for type-safe database operations)
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Environment**: Docker for development

## Project Structure
```
moveo-core/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models (Prisma)
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── types/           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── tests/               # Test files
├── docs/                # API documentation
├── docker/              # Docker configuration
└── scripts/             # Utility scripts
```

## Implementation Steps

### Phase 1: Project Foundation
1. **Initialize Node.js project** with TypeScript
2. **Set up PostgreSQL** with Docker
3. **Configure Prisma** for database management
4. **Create basic Express server** with middleware
5. **Set up environment configuration**

### Phase 2: Database Schema
1. **Design core entities**:
   - Users (drivers, admins, managers)
   - Vehicles (cars, trucks, etc.)
   - Fleet (vehicle groups)
   - Trips/Routes
   - Maintenance records
   - Fuel logs
   - Driver assignments

2. **Create Prisma schema** with relationships
3. **Set up database migrations**
4. **Seed initial data**

### Phase 3: Authentication & Authorization
1. **Implement JWT authentication**
2. **Create user registration/login endpoints**
3. **Add role-based access control** (RBAC)
4. **Password hashing and validation**

### Phase 4: Core Fleet Management APIs
1. **Vehicle management** (CRUD operations)
2. **Fleet management** (grouping vehicles)
3. **Driver management** (assignments, schedules)
4. **Trip management** (start/end, tracking)
5. **Maintenance scheduling** and records

### Phase 5: Vehicle Tracking
1. **Real-time location tracking** (WebSocket/SSE)
2. **GPS data processing**
3. **Route optimization**
4. **Geofencing** capabilities
5. **Historical tracking data**

### Phase 6: Advanced Features
1. **Reporting and analytics**
2. **Fuel consumption tracking**
3. **Maintenance alerts**
4. **Performance metrics**
5. **API rate limiting and security**

### Phase 7: Testing & Documentation
1. **Unit tests** for services
2. **Integration tests** for APIs
3. **API documentation** with Swagger
4. **Deployment configuration**

## Database Schema Overview

Based on your existing schema, the system includes:

### Core Entities
- **Users**: System users with role-based access (user, user_role, role tables)
- **Drivers**: Fleet drivers with QID, phone, and credentials
- **Vehicles**: Fleet vehicles with plate numbers and model references
- **Vehicle Models**: Vehicle specifications (make, year, manufacturer, capacity)
- **Routes**: Defined routes with stops and estimated duration
- **Stops**: Physical locations with GPS coordinates
- **Trips**: Scheduled and actual trips with start/end times and locations
- **Shifts**: Driver-vehicle assignments with time periods
- **Telemetry**: Real-time and historical vehicle tracking data

### Key Relationships
- Routes have multiple stops (route_stop junction table)
- Trips follow routes and are assigned to drivers and vehicles
- Trips have multiple stops with arrival/departure times (trip_stop)
- Vehicles have telemetry data for real-time tracking
- Users have roles for access control
- Shifts link drivers to vehicles for specific time periods

### Schema Improvements Needed
The current schema has data type issues that need correction:
- String fields (names, codes, usernames) are defined as BIGINT
- Boolean fields (isActive, ignition) are defined as BIGINT  
- Timestamp fields (tracked_on, start_time, end_time) are defined as BIGINT
- Location coordinates (lat, lon) should be DECIMAL, not BIGINT

## API Endpoints Structure

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Fleet Management
- `GET /api/fleets` - List all fleets
- `POST /api/fleets` - Create new fleet
- `GET /api/fleets/:id` - Get fleet details
- `PUT /api/fleets/:id` - Update fleet
- `DELETE /api/fleets/:id` - Delete fleet

### Vehicle Management
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Add new vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/:id/location` - Get current location

### Tracking
- `POST /api/tracking/location` - Update vehicle location
- `GET /api/tracking/:vehicleId/history` - Get location history
- `GET /api/tracking/live` - WebSocket for real-time tracking

### Trips
- `POST /api/trips/start` - Start new trip
- `POST /api/trips/:id/end` - End trip
- `GET /api/trips` - List trips
- `GET /api/trips/:id` - Get trip details

## Next Steps
1. Review and approve this plan
2. Set up the development environment
3. Begin with Phase 1 implementation
4. Iterate based on specific requirements

Would you like me to proceed with implementing any specific phase, or would you like to modify this plan first?
