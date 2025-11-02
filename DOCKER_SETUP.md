# Docker Setup Guide

This master `docker-compose.yml` orchestrates all backend services and databases for the Moveo platform.

## Services Overview

### Databases
- **moveo-postgres** (port 5432): PostgreSQL for moveo-core
  - Database: `moveo_fleet`
  - User: `moveo_user`
  - Password: `moveo_password`

- **telemetry-postgres** (port 5433): PostgreSQL for telemetry-service
  - Database: `moveo_telemetry`
  - User: `telemetry_user`
  - Password: `telemetry_password`

### Services
- **moveo-core** (port 3000): Main fleet management API
  - Handles trips, routes, drivers, vehicles, duties, etc.
  - Connected to moveo-postgres
  - Can communicate with telemetry-service

- **telemetry-service** (port 3003): Vehicle telemetry tracking
  - Handles GPS coordinates, paths, and telemetry logs
  - Connected to telemetry-postgres

### Network
All services are on a shared `moveo-network` bridge network for internal communication.

## Quick Start

### 1. Start all services
```bash
docker-compose up -d
```

### 2. Setup databases
```bash
# Moveo Core
docker-compose exec moveo-core npm run prisma:push

# Telemetry Service
docker-compose exec telemetry-service npm run prisma:push
```

### 3. (Optional) Seed moveo-core database
```bash
docker-compose exec moveo-core npm run db:seed
```

### 4. View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f moveo-core
docker-compose logs -f telemetry-service
```

## Individual Service Commands

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (delete all data)
```bash
docker-compose down -v
```

### Rebuild services
```bash
docker-compose up -d --build
```

### Restart a specific service
```bash
docker-compose restart moveo-core
```

### View service status
```bash
docker-compose ps
```

## Development Workflow

### Local development with hot-reload
The services are configured with volume mounting for hot-reload:
- Edit code in `./moveo-core` or `./telemetry-service`
- Changes are automatically reflected in the running containers

### Database migrations
```bash
# Moveo Core
docker-compose exec moveo-core npm run prisma:migrate

# Telemetry Service
docker-compose exec telemetry-service npm run prisma:migrate
```

### Access PostgreSQL directly
```bash
# Moveo Core DB
docker-compose exec moveo-postgres psql -U moveo_user -d moveo_fleet

# Telemetry DB
docker-compose exec telemetry-postgres psql -U telemetry_user -d moveo_telemetry
```

## Port Mapping

| Service | Host Port | Container Port |
|---------|-----------|----------------|
| moveo-postgres | 5432 | 5432 |
| telemetry-postgres | 5433 | 5432 |
| moveo-core | 3000 | 3000 |
| telemetry-service | 3003 | 3003 |

## Environment Variables

Each service has its own environment configuration in the docker-compose.yml file. You can override these by creating a `.env` file or modifying the docker-compose.yml.

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are already in use
netstat -tuln | grep -E '3000|3003|5432|5433'
```

### Database connection issues
```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart moveo-postgres
```

### Reset everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Re-run database setup
docker-compose exec moveo-core npm run prisma:push
docker-compose exec telemetry-service npm run prisma:push
```

## Additional Services (Not in Docker)

These services are typically run locally during development:

- **vehicle-api** (port 3002): NestJS gateway for driver/vehicle apps
  ```bash
  cd vehicle-api
  npm run start:dev
  ```

- **moveo-cc** (port 5173): React command center for tracking
  ```bash
  cd moveo-cc
  npm run dev
  ```

- **moveo** (frontend): Main fleet management web UI
  ```bash
  cd moveo
  npm start
  ```

