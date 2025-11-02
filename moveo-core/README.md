# Moveo Fleet Management System

A comprehensive fleet management system built with Node.js, Express.js, and PostgreSQL.

## Features

- **Vehicle Management**: Track and manage fleet vehicles
- **Driver Management**: Manage driver profiles and assignments
- **Route Planning**: Create and manage routes with stops
- **Trip Tracking**: Real-time trip monitoring and management
- **Location Tracking**: GPS tracking and telemetry data
- **Authentication**: JWT-based authentication system
- **Role-based Access**: User and driver role management

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Using Docker (Recommended)

1. Clone the repository
2. Copy environment file:
   ```bash
   cp env.example .env
   ```
3. Update the `.env` file with your configuration
4. Start the services:
   ```bash
   docker-compose up -d
   ```

### Manual Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up postgres -d
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User/Driver login
- `POST /api/auth/register` - Register new user/driver
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/:id/location` - Get current location
- `GET /api/vehicles/:id/telemetry` - Get telemetry history

### Drivers
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get driver details
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `GET /api/drivers/:id/shifts` - Get driver shifts

### Routes
- `GET /api/routes` - List all routes
- `GET /api/routes/:id` - Get route details
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `GET /api/routes/:id/stops` - Get route stops

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/start` - Start trip
- `POST /api/trips/:id/end` - End trip

### Tracking
- `POST /api/tracking/location` - Update vehicle location
- `GET /api/tracking/:vehicleId/current` - Get current location
- `GET /api/tracking/:vehicleId/history` - Get location history
- `GET /api/tracking/live` - Live tracking (WebSocket)

## Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Drivers**: Fleet drivers with credentials and contact info
- **Vehicles**: Fleet vehicles with specifications
- **Routes**: Defined routes with multiple stops
- **Trips**: Scheduled and actual trips
- **Telemetry**: Real-time and historical tracking data
- **Shifts**: Driver-vehicle assignments

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/moveo_fleet?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

## API Documentation

Once the server is running, visit:
- Health Check: `http://localhost:3000/health`
- API Documentation: `http://localhost:3000/api-docs` (when implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

