# Docker Compose Refactoring Plan: Database Extraction

## Overview
Extract PostgreSQL database services into a separate docker-compose file while maintaining the same `moveo-network` for inter-service communication.

## Current Structure
- **Database Services**: `moveo-postgres`, `telemetry-postgres`
- **Application Services**: `moveo-core`, `telemetry-service`, `vehicle-api`, `moveo-cc-api`
- **Network**: `moveo-network` (bridge driver)
- **Volumes**: `moveo_postgres_data`, `telemetry_postgres_data`

## Proposed Structure

### File 1: `docker-compose.databases.yml` (New)
Contains:
- PostgreSQL services:
  - `moveo-postgres` 
  - `telemetry-postgres`
- Database volumes:
  - `moveo_postgres_data`
  - `telemetry_postgres_data`
- Shared network:
  - `moveo-network` (external reference)

### File 2: `docker-compose.yml` (Updated)
Contains:
- Application services:
  - `moveo-core`
  - `telemetry-service`
  - `vehicle-api`
  - `moveo-cc-api`
- Network reference:
  - `moveo-network` as external network

## Network Strategy
Since both compose files need to communicate over the same network:
- **Option A**: Both files define the `moveo-network` (Docker will reuse if it exists) - **RECOMMENDED**
- **Option B**: Mark the network as `external: true` in app compose (requires manual network creation)

**Recommended approach (Option A)**: Both files define the same network independently. Docker's compose will recognize it's the same network and reuse it.

## Usage Instructions

### Starting Services
```bash
# Start databases first
docker-compose -f docker-compose.databases.yml up -d

# Start applications (depends on databases via network)
docker-compose up -d
```

### Stopping Services
```bash
# Stop applications
docker-compose down

# Stop databases
docker-compose -f docker-compose.databases.yml down
```

### Viewing Logs
```bash
# Database logs
docker-compose -f docker-compose.databases.yml logs -f

# Application logs
docker-compose logs -f
```

## Key Changes

### Database Compose File
- PostgreSQL configurations remain identical
- Healthchecks preserved for startup validation
- Both databases use `moveo-network`

### Application Compose File
- Remove PostgreSQL service definitions
- Keep `depends_on` references (containers can still reference database service names across compose files in same network)
- Network remains `moveo-network`

## Verification Steps
1. Database services can start independently
2. Application services can connect to databases via hostname (e.g., `moveo-postgres:5432`)
3. All services are on the same network and can communicate
4. Container names remain consistent for DNS resolution

## Benefits
✅ Clear separation of concerns  
✅ Database infrastructure independently managed  
✅ Easier to scale or replace databases  
✅ Simpler to backup/manage database volumes  
✅ Application services can be redeployed without touching databases  
