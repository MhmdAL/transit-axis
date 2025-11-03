# Trip Monitoring - Quick Reference Guide

## 🎯 Quick Start

### Access the Page
```
URL: http://localhost:3000/trip-monitoring
Sidebar: Click "Trip Monitoring" under Main section
```

### How to Use
1. **Pick a Date** - Use the date picker to select any day
2. **Select Routes** - Search and select multiple routes
3. **View Timeline** - See all trips in a 24-hour timeline
4. **Hover Trips** - Hover over trip blocks to see details
5. **Click Trips** - Ready for future modal implementation

---

## 📂 File Locations

```
/moveo-cc/src/pages/TripMonitoring/
├── TripMonitoring.tsx          # Main page (START HERE)
├── TripTimeline.tsx            # Timeline container
├── TimelineHeader.tsx          # Hour markers
├── RouteRow.tsx                # Route rows
├── TripBlock.tsx               # Trip blocks
└── mockData.ts                 # Mock data & types
```

---

## 🔧 Common Modifications

### Change Mock Data
**File:** `mockData.ts`
- Edit `mockRoutes` array to add/remove routes
- Edit `createTripsForDay()` to modify trip data
- Add new status types to `TripStatus` type

### Change Colors
**File:** `TripBlock.tsx`
```typescript
const statusColorMap: Record<TripStatus, string> = {
  completed: theme.colors.success,      // Change here
  inProgress: theme.colors.info,
  pending: theme.colors.warning,
  delayed: theme.colors.error,
  unknown: theme.colors.textMuted,
};
```

### Adjust Timeline Width
**File:** `TimelineHeader.tsx` & `RouteRow.tsx`
```typescript
// Change from 100px per hour to something else
<HourBlock key={hour}>  // Each block is 100px
```

### Add More Trip Information
**File:** `TripBlock.tsx` - In the `Tooltip` section:
```typescript
{trip.newField && (
  <TooltipRow>
    <TooltipLabel>New Field</TooltipLabel>
    <TooltipValue>{trip.newField}</TooltipValue>
  </TooltipRow>
)}
```

### Handle Trip Click
**File:** `TripMonitoring.tsx`
```typescript
const handleTripClick = (trip: Trip) => {
  // Future: Open modal with trip details
  console.log('Trip clicked:', trip);
};
```

---

## 📊 Data Structure

### Trip Interface
```typescript
interface Trip {
  id: string;
  routeId: string;
  startTime: string;      // ISO format: "2024-11-03T09:30:00Z"
  endTime: string;
  status: 'completed' | 'inProgress' | 'pending' | 'delayed' | 'unknown';
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehiclePlateNo?: string;
  stopsCount?: number;
}
```

### Route Interface
```typescript
interface Route {
  id: string;
  name: string;
  code: string;
}
```

---

## 🎨 Styling Quick Reference

### Theme Colors (from existing theme)
```
Primary:    #14B8A6 (Teal)
Success:    #10B981 (Green)    ← Completed trips
Info:       #3B82F6 (Blue)     ← In Progress
Warning:    #F59E0B (Yellow)   ← Pending
Error:      #EF4444 (Red)      ← Delayed
TextMuted:  #94A3B8 (Gray)     ← Unknown
```

### Common Spacing
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
```

---

## 🚀 For Backend Integration

### What Needs to Change

1. **Replace Mock Data with API Call**
   ```typescript
   // In TripMonitoring.tsx
   const response = await fetch(`/api/trips?date=${selectedDate}&routeIds=${routeIds}`);
   const trips = await response.json();
   ```

2. **Update Route Search**
   ```typescript
   // In handleSearchRoutes function
   const response = await fetch(`/api/routes/search?query=${searchTerm}`);
   const routes = await response.json();
   ```

3. **Handle Loading & Errors**
   - Add loading spinner
   - Add error toast/notification
   - Add retry mechanism

4. **Optional Enhancements**
   - Real-time WebSocket updates
   - Trip details modal on click
   - Export timeline as image/PDF

---

## 🧪 Testing

### Test with Different Scenarios

**1. Empty Timeline**
- Select a date with no trips
- Verify "No trips scheduled" message

**2. Single Route**
- Select one route
- Verify all trips for that route appear

**3. Multiple Routes**
- Select 2-3 routes
- Verify horizontal scroll works
- Verify vertical scroll works

**4. Trip Details Tooltip**
- Hover over various trips
- Verify all information displays correctly
- Check positioning doesn't overflow

**5. Time Accuracy**
- Verify trip blocks align with hours
- Test trips at hour boundaries (09:00, 14:00, etc.)
- Test short trips (< 30 min)
- Test long trips (> 2 hours)

---

## 🐛 Troubleshooting

### Trips not appearing?
- Check date is correct
- Check routes are selected
- Verify trip data in browser console

### Timeline looks wrong?
- Check if scrolling is working (left arrow ◀ on route rows)
- Verify 100px per hour calculation
- Check browser zoom level

### Tooltips not showing?
- Ensure you're hovering on the trip block itself
- Check z-index isn't being overridden
- Verify CSS visibility rules

### Performance issues?
- Check number of trips (>50 might need optimization)
- Consider virtual scrolling for large datasets
- Profile in DevTools

---

## 📋 Checklist Before Going Live

- [ ] Connect to real API endpoint
- [ ] Add loading spinner
- [ ] Add error handling
- [ ] Test with production data
- [ ] Test with large datasets (100+ trips)
- [ ] Verify responsive on mobile
- [ ] Implement trip click modal
- [ ] Add real-time updates (if needed)
- [ ] Test in all major browsers
- [ ] Security check (authorization)
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 🔍 Key Code Snippets

### Get trips for a date
```typescript
import { getMockTripsForDate } from './mockData';

const date = new Date('2024-11-03');
const trips = getMockTripsForDate(date);
```

### Calculate trip position
```typescript
const startHour = startDate.getUTCHours() + startDate.getUTCMinutes() / 60;
const leftPercent = (startHour / 24) * 100;  // 0-100%
```

### Get status color
```typescript
const statusColorMap = {
  completed: '#10B981',
  inProgress: '#3B82F6',
  pending: '#F59E0B',
  delayed: '#EF4444',
  unknown: '#94A3B8',
};

const color = statusColorMap[trip.status];
```

### Format time for display
```typescript
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
```

---

## 💡 Tips & Best Practices

1. **Always use UTC times** for calculations to avoid timezone issues
2. **Group trips by route** before rendering for better performance
3. **Use Map instead of array find** for route lookups
4. **Memoize color calculations** that don't change
5. **Test scrolling behavior** on different screen sizes
6. **Consider lazy loading** for large trip datasets
7. **Use keyboard navigation** for accessibility

---

## 📞 Support

For issues or questions:
1. Check the implementation docs: `TRIP_MONITORING_IMPLEMENTATION.md`
2. Review the plan: `TRIP_MONITORING_PAGE_PLAN.md`
3. Check component props in TypeScript interfaces
4. Look at mock data examples in `mockData.ts`
