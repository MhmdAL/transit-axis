# Docker Compose Usage Guide

After splitting the database services into a separate compose file, use the following commands:

## Understanding Service Dependencies

**Important:** Services in `docker-compose.yml` depend on database services in `docker-compose.databases.yml`. However, Docker Compose **cannot enforce cross-file dependencies** with health conditions. Instead:

- **Databases are referenced by hostname** (e.g., `moveo-postgres:5432`) in application connection strings
- **Applications handle reconnection automatically** - they will retry connecting to databases until they're ready
- **Start databases first** to avoid initial connection errors in the logs

## Starting Services

### ✅ Recommended: Start Databases First
```bash
# Start database containers
docker-compose -f docker-compose.databases.yml up -d

# Wait a moment for databases to be ready, then start applications
sleep 5
docker-compose up -d
```

### Alternative: Start Everything Together
```bash
# Both compose files at once (applications will retry until databases are ready)
docker-compose -f docker-compose.databases.yml up -d && docker-compose up -d
```

Applications will show connection errors briefly while waiting for databases, which is normal behavior.

## Stopping Services

### Stop Applications Only
```bash
docker-compose down
```

### Stop Everything (Including Databases)
```bash
# Stop applications
docker-compose down

# Stop databases
docker-compose -f docker-compose.databases.yml down
```

## Viewing Logs

```bash
# Database logs
docker-compose -f docker-compose.databases.yml logs -f

# Application logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f moveo-core
docker-compose -f docker-compose.databases.yml logs -f moveo-postgres

# Follow all logs from both files
docker-compose -f docker-compose.databases.yml logs -f & docker-compose logs -f
```

## Useful Commands

```bash
# Check container status
docker-compose ps
docker-compose -f docker-compose.databases.yml ps

# Rebuild images
docker-compose build
docker-compose -f docker-compose.databases.yml build

# Connect to database
docker exec -it moveo-postgres psql -U moveo_user -d moveo_fleet

# View network
docker network ls | grep moveo-network
docker network inspect moveo-network

# Check service connectivity
docker exec moveo-core-api nc -zv moveo-postgres 5432
docker exec telemetry-service-api nc -zv telemetry-postgres 5432
```

## Troubleshooting

### Applications Show Database Connection Errors
This is **normal** if applications start before databases are fully ready. They will retry automatically:
1. Check database status: `docker-compose -f docker-compose.databases.yml logs moveo-postgres`
2. Check database health: `docker-compose -f docker-compose.databases.yml ps`
3. Wait for "database system is ready to accept connections" message

### If Applications Still Can't Connect After Databases Start
1. Ensure databases are running and healthy:
   ```bash
   docker-compose -f docker-compose.databases.yml ps
   ```
2. Verify network connectivity:
   ```bash
   docker network inspect moveo-network
   ```
3. Check application logs for specific errors:
   ```bash
   docker-compose logs moveo-core
   ```

### Resetting Everything
```bash
# Stop all containers
docker-compose down
docker-compose -f docker-compose.databases.yml down

# Remove volumes (⚠️ This deletes database data)
docker volume rm moveo_postgres_data telemetry_postgres_data

# Restart fresh
docker-compose -f docker-compose.databases.yml up -d
sleep 3
docker-compose up -d
```

## Architecture Notes

- **Database services** (postgres) are in `docker-compose.databases.yml`
- **Application services** (moveo-core, telemetry-service, vehicle-api, moveo-cc-api) are in `docker-compose.yml`
- Both share the `moveo-network` for inter-container communication
- Applications connect to databases via **Docker DNS** (e.g., `moveo-postgres` resolves to the database container IP)
- No cross-file `depends_on` is possible - applications handle retries internally

## File Organization

- **`docker-compose.databases.yml`**: PostgreSQL services, volumes, and shared network
- **`docker-compose.yml`**: Application services (moveo-core, telemetry-service, vehicle-api, moveo-cc-api)
- **`DOCKER_SPLIT_PLAN.md`**: Detailed refactoring plan and rationale
- **`DOCKER_USAGE.md`**: This file - quick reference guide
