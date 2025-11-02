# VehicleApi Test Files

HTTP test files for testing the VehicleApi endpoints using REST Client.

## Prerequisites

1. **VS Code REST Client Extension**
   - Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension
   - Or use any HTTP client that supports `.http` files

2. **Running Services**
   - Moveo-Core must be running on port 3000
   - VehicleApi must be running on port 3001

## Test Files

### 📄 `api-tests.http`
**Complete test suite with all endpoints**

Features:
- Health check
- Authentication tests
- Trip management (start/end)
- Error case handling
- Full workflow test with chained requests

**Usage:**
1. Open the file in VS Code
2. Click "Send Request" above any request
3. View the response in the right panel

### 📄 `auth.http`
**Authentication-focused tests**

Includes:
- Successful login
- Invalid credentials
- Missing fields
- Multiple driver logins

**Best for:**
- Testing authentication logic
- Debugging login issues
- Validating error messages

### 📄 `trips.http`
**Trip management tests**

Includes:
- Start trip variations
- End trip scenarios
- Error cases
- Complete workflows
- Multiple trip creation

**Best for:**
- Testing trip lifecycle
- Debugging trip operations
- Load testing

## Quick Start

### 1. Basic Test Flow

```http
# Step 1: Login
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "password123"
}

# Step 2: Copy the token from response

# Step 3: Start a trip
POST http://localhost:3001/trips/start
Authorization: Bearer YOUR_TOKEN_HERE

{
  "routeId": "1",
  "vehicleId": "1",
  "driverId": "1",
  "scheduledDepartureTime": "2025-10-30T10:00:00Z"
}

# Step 4: Copy trip ID from response

# Step 5: End the trip
PATCH http://localhost:3001/trips/TRIP_ID/end
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2. Using Variables

The test files use variables for easier testing:

```http
@baseUrl = http://localhost:3001
@token = YOUR_TOKEN_HERE

### Request using variables
GET {{baseUrl}}/health
Authorization: Bearer {{token}}
```

### 3. Chained Requests

Use `@name` to reference previous responses:

```http
### Login
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json
{ ... }

### Use token from login
POST {{baseUrl}}/trips/start
Authorization: Bearer {{login.response.body.token}}
{ ... }
```

## Testing Checklist

### ✅ Authentication
- [ ] Successful driver login
- [ ] Invalid email
- [ ] Wrong password
- [ ] Missing credentials
- [ ] Token extraction

### ✅ Trip Start
- [ ] Valid trip creation
- [ ] Without authentication (should fail)
- [ ] Missing required fields (should fail)
- [ ] Invalid route/vehicle/driver IDs
- [ ] Multiple trips on same route

### ✅ Trip End
- [ ] Successfully end active trip
- [ ] Without authentication (should fail)
- [ ] Invalid trip ID (should fail)
- [ ] Already ended trip (should fail)

### ✅ Integration
- [ ] Complete workflow (login → start → end)
- [ ] Multiple trips in sequence
- [ ] Concurrent trip operations

## Environment Setup

### Default Configuration
```env
VehicleApi: http://localhost:3001
Moveo-Core: http://localhost:3000
```

### Change Ports
If your services run on different ports, update the `@baseUrl` variable:

```http
@baseUrl = http://localhost:YOUR_PORT
```

## Common Issues

### 1. Connection Refused
**Problem:** Cannot connect to the API
**Solution:** 
- Check if VehicleApi is running: `npm run start:dev`
- Verify port 3001 is not in use

### 2. 502 Bad Gateway
**Problem:** VehicleApi can't reach Moveo-Core
**Solution:**
- Ensure Moveo-Core is running on port 3000
- Check `.env` file: `MOVEO_CORE_API_URL=http://localhost:3000`

### 3. 401 Unauthorized
**Problem:** Invalid or missing auth token
**Solution:**
- Re-run the login request
- Copy fresh token from response
- Ensure token format: `Bearer <token>`

### 4. 404 Not Found
**Problem:** Endpoint doesn't exist
**Solution:**
- Check the URL path
- Verify VehicleApi routes are registered
- Ensure you're using the correct HTTP method

## Tips & Tricks

### 1. Save Commonly Used Values
Create variables at the top of your file:

```http
@baseUrl = http://localhost:3001
@driverEmail = driver@example.com
@driverPassword = password123
@routeId = 101
@vehicleId = 1
@driverId = 1
```

### 2. Use Dynamic Timestamps
```http
"scheduledDepartureTime": "{{$datetime iso8601}}"
```

### 3. Generate Random Values
```http
"routeId": "{{$randomInt 1 100}}"
```

### 4. View Response Headers
In VS Code REST Client, responses show:
- Status code
- Headers
- Response time
- Body (formatted JSON)

### 5. Keyboard Shortcuts (VS Code)
- `Ctrl+Alt+R` (Windows) / `Cmd+Alt+R` (Mac): Send request
- `Ctrl+Alt+E` (Windows) / `Cmd+Alt+E` (Mac): Switch environment

## Advanced Testing

### Load Testing
Run multiple requests in sequence:

```bash
# Use a load testing tool like Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  -T "application/json" \
  -p trip-data.json \
  http://localhost:3001/trips/start
```

### Automated Testing
Integrate with CI/CD:

```bash
# Install newman (Postman CLI)
npm install -g newman

# Export Postman collection and run
newman run vehicle-api-tests.json
```

## Support

For issues or questions:
1. Check the VehicleApi logs: `npm run start:dev`
2. Check the Moveo-Core logs
3. Review the SETUP.md file
4. Verify environment configuration

