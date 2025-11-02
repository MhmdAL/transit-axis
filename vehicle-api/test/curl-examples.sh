#!/bin/bash

# VehicleApi cURL Test Examples
# Run these commands from terminal to test the API

BASE_URL="http://localhost:3001"

echo "================================"
echo "VehicleApi cURL Test Suite"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

###############################################################################
# Health Check
###############################################################################

echo -e "${BLUE}=== Health Check ===${NC}"
curl -X GET "$BASE_URL" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n\n"

###############################################################################
# Authentication
###############################################################################

echo -e "${BLUE}=== Driver Login ===${NC}"
LOGIN_RESPONSE=$(curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }' \
  -s)

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token (requires jq)
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful. Token received.${NC}"
  echo "Token: $TOKEN"
else
  echo -e "${RED}✗ Login failed. No token received.${NC}"
  exit 1
fi

echo ""

###############################################################################
# Start Trip
###############################################################################

echo -e "${BLUE}=== Start Trip ===${NC}"
START_TRIP_RESPONSE=$(curl -X POST "$BASE_URL/trips/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "routeId": "1",
    "vehicleId": "1",
    "driverId": "1",
    "scheduledDepartureTime": "2025-10-30T10:00:00Z"
  }' \
  -s)

echo "$START_TRIP_RESPONSE" | jq '.'
echo ""

# Extract trip ID
TRIP_ID=$(echo "$START_TRIP_RESPONSE" | jq -r '.id')

if [ "$TRIP_ID" != "null" ] && [ -n "$TRIP_ID" ]; then
  echo -e "${GREEN}✓ Trip started successfully.${NC}"
  echo "Trip ID: $TRIP_ID"
else
  echo -e "${RED}✗ Failed to start trip.${NC}"
  exit 1
fi

echo ""

###############################################################################
# End Trip
###############################################################################

echo -e "${BLUE}=== End Trip ===${NC}"
END_TRIP_RESPONSE=$(curl -X PATCH "$BASE_URL/trips/$TRIP_ID/end" \
  -H "Authorization: Bearer $TOKEN" \
  -s)

echo "$END_TRIP_RESPONSE" | jq '.'
echo ""

if [ -n "$END_TRIP_RESPONSE" ]; then
  echo -e "${GREEN}✓ Trip ended successfully.${NC}"
else
  echo -e "${RED}✗ Failed to end trip.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}=== All tests completed ===${NC}"

###############################################################################
# Error Test Cases
###############################################################################

echo ""
echo -e "${BLUE}=== Testing Error Cases ===${NC}"
echo ""

# Invalid login
echo -e "${BLUE}Test: Invalid credentials (should fail)${NC}"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }' \
  -s \
  -w "\nStatus: %{http_code}\n\n"

# Start trip without auth
echo -e "${BLUE}Test: Start trip without auth (should fail)${NC}"
curl -X POST "$BASE_URL/trips/start" \
  -H "Content-Type: application/json" \
  -d '{
    "routeId": "1",
    "vehicleId": "1",
    "driverId": "1",
    "scheduledDepartureTime": "2025-10-30T10:00:00Z"
  }' \
  -s \
  -w "\nStatus: %{http_code}\n\n"

# End non-existent trip
echo -e "${BLUE}Test: End non-existent trip (should fail)${NC}"
curl -X PATCH "$BASE_URL/trips/999999/end" \
  -H "Authorization: Bearer $TOKEN" \
  -s \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo -e "${GREEN}=== Test suite finished ===${NC}"

