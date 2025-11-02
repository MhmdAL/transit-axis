# Vehicle Emulator - Odometer Feature

## Overview
Enhanced the Vehicle Emulator component to track and display a realistic odometer that increases during active trips based on the vehicle's speed.

## Changes Made

### 1. Odometer State Management
**File:** `moveo-cc/src/pages/VehicleEmulator/VehicleEmulator.tsx`

**Added:**
- New state: `const [odometer, setOdometer] = useState(0);`
- Initialized to 0 by default
- Set to 1000 km when trip starts
- Reset to 0 when trip ends

### 2. Odometer Calculation Logic
**Function:** `sendTelemetry()`

**How it works:**
1. Generate random speed: 20-80 km/h
2. Calculate odometer increment: `speed (km/h) ÷ 360`
   - Telemetry sent every 10 seconds
   - 10 seconds = 1/360 of an hour
   - Example: 60 km/h × (10 sec / 3600 sec) = 0.167 km increase per telemetry send
3. Update odometer: `newOdometer = currentOdometer + increment`
4. Send odometer value with telemetry data

**Formula:**
```
odometerIncrement = speed / 360
newOdometer = odometer + odometerIncrement
```

**Example Progression:**
- Start: 1000.00 km
- After 10 sec at 60 km/h: 1000.17 km
- After 20 sec at 50 km/h: 1000.31 km
- After 30 sec at 70 km/h: 1000.60 km
- Total distance traveled in 30 sec: 0.60 km (realistic!)

### 3. UI Display
**Location:** Trip Status Info Grid

**Displays:**
- **Elapsed Time** - Time since trip started
- **Route** - Route name
- **Odometer** - Current odometer reading (km)
- **Current Speed** - Placeholder for future enhancement

**Visual:**
```
┌─────────────────────────┐
│ Elapsed Time │ Route    │
│  00:05:23    │  Route A │
├─────────────────────────┤
│ Odometer     │ Spd      │
│  1023.45 km  │   -      │
└─────────────────────────┘
```

### 4. Telemetry Data Sent
**Telemetry payload now includes:**
```json
{
  "vehicleId": 1,
  "tripId": 123,
  "latitude": 31.9454,
  "longitude": 35.9284,
  "speed": 45.5,
  "heading": 180,
  "accuracy": 10,
  "odometer": 1010.50
}
```

## Usage Flow

### Trip Lifecycle

1. **Trip Start**
   ```
   User clicks "Start Trip"
   ↓
   Trip created on server
   ↓
   Odometer initialized to 1000 km
   ↓
   Telemetry starts sending every 10 seconds
   ```

2. **During Trip**
   ```
   Every 10 seconds:
   ├─ Generate random speed (20-80 km/h)
   ├─ Calculate: increment = speed / 360
   ├─ Update: odometer += increment
   ├─ Display: odometer.toFixed(2) km
   └─ Send: telemetry with odometer value
   ```

3. **Trip End**
   ```
   User clicks "End Trip"
   ↓
   Trip ended on server
   ↓
   Odometer reset to 0
   ↓
   Telemetry sends stop
   ```

## Realistic Data

### Speed vs Distance Example
Running a 2-minute (120 second) trip:

| Avg Speed | Distance | Odometer |
|-----------|----------|----------|
| 30 km/h   | 1.0 km   | 1001.0 km |
| 50 km/h   | 1.67 km  | 1001.67 km |
| 70 km/h   | 2.33 km  | 1002.33 km |

### Real Trip Scenario
```
Start: 1000.00 km
After 10 sec @ 40 km/h: +0.11 km → 1000.11 km
After 10 sec @ 60 km/h: +0.17 km → 1000.28 km
After 10 sec @ 45 km/h: +0.13 km → 1000.41 km
After 10 sec @ 50 km/h: +0.14 km → 1000.55 km
After 10 sec @ 75 km/h: +0.21 km → 1000.76 km

Total trip time: 50 seconds
Total distance: 0.76 km
Average speed: 54.7 km/h ✓ Realistic!
```

## Integration with Trip Metrics

### How Odometer Feeds Metrics Calculation
When trip ends:
1. **Telemetry logs** include all odometer readings
2. **Trip metrics service** fetches logs
3. **Calculates total distance:** `lastOdometer - firstOdometer`
4. **Stores in trip record:** `totalDistance` field

**Example:**
```
Trip telemetry logs:
- 1000.00 km (first)
- 1000.17 km
- 1000.34 km
- 1000.52 km (last)

Calculation:
totalDistance = 1000.52 - 1000.00 = 0.52 km
```

## Testing Checklist

- [ ] Trip starts → odometer shows 1000.00 km
- [ ] Odometer increases every 10 seconds
- [ ] Odometer display updates in real-time
- [ ] Odometer value sent in telemetry data
- [ ] Trip ends → odometer resets to 0
- [ ] Distance calculation matches actual odometer delta
- [ ] Multiple consecutive trips work correctly
- [ ] Telemetry service receives odometer values

## Code Changes Summary

**File Modified:** `moveo-cc/src/pages/VehicleEmulator/VehicleEmulator.tsx`

**Lines Added/Modified:**
- L240: Added odometer state
- L293: Initialize odometer on trip start
- L329-348: Enhanced sendTelemetry() with odometer calculation
- L320: Reset odometer on trip end
- L491-497: Added odometer display in UI

**Total Changes:** ~40 lines added/modified

## Performance Impact

- **Computation:** Minimal (simple division per 10 seconds)
- **Memory:** One additional number variable
- **Network:** Added one float field to telemetry payload (~10 bytes)
- **UI:** Additional grid item (negligible impact)

## Future Enhancements

1. **Current Speed Display**
   - Track last sent speed value
   - Display in UI info grid
   - Update with each telemetry send

2. **Trip Summary**
   - Show final odometer reading
   - Display total distance traveled
   - Average speed calculation

3. **Realistic Odometer UI**
   - Animated odometer gauge
   - Speedometer display
   - Distance/time statistics

4. **Data Validation**
   - Ensure odometer never decreases
   - Validate against server values
   - Handle network delays gracefully

## Files Modified

```
moveo-cc/src/pages/VehicleEmulator/VehicleEmulator.tsx
├── Added odometer state (line 240)
├── Initialize on trip start (line 293)
├── Calculate in sendTelemetry (lines 329-348)
├── Reset on trip end (line 320)
└── Display in UI (lines 491-497)
```
