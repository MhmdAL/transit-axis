#!/bin/bash

echo "🛑 Stopping Moveo Platform..."
echo ""

docker-compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To also remove volumes (delete data), run: docker-compose down -v"
echo ""

