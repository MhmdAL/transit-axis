#!/bin/bash

echo "🚀 Starting Moveo Platform..."
echo ""

# Start all services
echo "Starting Docker services..."
docker-compose up -d

# Wait for databases to be healthy
echo ""
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Setup moveo-core database
echo ""
echo "📦 Setting up moveo-core database..."
docker-compose exec -T moveo-core npm run prisma:push

# Setup telemetry-service database
echo ""
echo "📦 Setting up telemetry-service database..."
docker-compose exec -T telemetry-service npm run prisma:push

echo ""
echo "✅ All services are running!"
echo ""
echo "📍 Service URLs:"
echo "   Moveo Core API:      http://localhost:3000"
echo "   Telemetry Service:   http://localhost:3003"
echo ""
echo "📦 Databases:"
echo "   Moveo Core DB:       localhost:5432 (moveo_fleet)"
echo "   Telemetry DB:        localhost:5433 (moveo_telemetry)"
echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
echo ""

