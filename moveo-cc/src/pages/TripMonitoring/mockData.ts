/**
 * Mock data for Trip Monitoring page
 * This provides sample routes and trips for frontend development
 */

export type TripStatus = 'completed' | 'inProgress' | 'scheduled' | 'pending' | 'delayed' | 'unknown';

export interface TripDuty {
  id: string;
  routeId: string;
  startTime: string; // ISO string (scheduled)
  endTime: string;   // ISO string (scheduled)
  status: TripStatus;
  // Old mock format
  driverName?: string;
  vehiclePlateNo?: string;
  stopsCount?: number;
  // New API format
  driver?: {
    name: string;
  };
  vehicle?: {
    fleetNo: string;
  };
  // Actual trip data (if available)
  trip?: Trip;
};

export interface Trip {
  id: string;
  routeId: string;
  startTime: string; // ISO string (scheduled)
  endTime: string;   // ISO string (scheduled)
  status: TripStatus;
  tripDutyId: string;
}

export interface TripBlockData {
    id: string;
    startTime: string;
    endTime: string;
    status: TripStatus;
    driverName: string;
    vehicleFleetNo: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
}

// Sample routes
export const mockRoutes: Route[] = [
  { id: 'route-1', name: 'Downtown Express', code: 'DT-01' },
  { id: 'route-2', name: 'Airport Shuttle', code: 'AP-02' },
  { id: 'route-3', name: 'Suburban Loop', code: 'SB-03' },
  { id: 'route-4', name: 'Harbor Route', code: 'HR-04' },
  { id: 'route-5', name: 'Industrial District', code: 'ID-05' },
];

// Helper function to create trips for a specific day
const createTripsForDay = (date: Date): TripDuty[] => {
  const dateStr = date.toISOString().split('T')[0];

  return [
    // Route 1 - Downtown Express
    {
      id: 'trip-1',
      routeId: 'route-1',
      startTime: `${dateStr}T06:00:00Z`,
      endTime: `${dateStr}T07:30:00Z`,
      status: 'completed',
      driverName: 'John Smith',
      vehiclePlateNo: 'ABC-123',
      stopsCount: 8,
    },
    {
      id: 'trip-2',
      routeId: 'route-1',
      startTime: `${dateStr}T08:00:00Z`,
      endTime: `${dateStr}T09:45:00Z`,
      status: 'completed',
      driverName: 'John Smith',
      vehiclePlateNo: 'ABC-123',
      stopsCount: 10,
    },
    {
      id: 'trip-3',
      routeId: 'route-1',
      startTime: `${dateStr}T10:30:00Z`,
      endTime: `${dateStr}T12:00:00Z`,
      status: 'inProgress',
      driverName: 'John Smith',
      vehiclePlateNo: 'ABC-123',
      stopsCount: 7,
    },
    {
      id: 'trip-4',
      routeId: 'route-1',
      startTime: `${dateStr}T13:00:00Z`,
      endTime: `${dateStr}T14:30:00Z`,
      status: 'pending',
      driverName: 'John Smith',
      vehiclePlateNo: 'ABC-123',
      stopsCount: 9,
    },

    // Route 2 - Airport Shuttle
    {
      id: 'trip-5',
      routeId: 'route-2',
      startTime: `${dateStr}T05:00:00Z`,
      endTime: `${dateStr}T06:15:00Z`,
      status: 'completed',
      driverName: 'Sarah Johnson',
      vehiclePlateNo: 'XYZ-789',
      stopsCount: 5,
    },
    {
      id: 'trip-6',
      routeId: 'route-2',
      startTime: `${dateStr}T09:30:00Z`,
      endTime: `${dateStr}T10:45:00Z`,
      status: 'completed',
      driverName: 'Sarah Johnson',
      vehiclePlateNo: 'XYZ-789',
      stopsCount: 4,
    },
    {
      id: 'trip-7',
      routeId: 'route-2',
      startTime: `${dateStr}T15:00:00Z`,
      endTime: `${dateStr}T16:30:00Z`,
      status: 'delayed',
      driverName: 'Sarah Johnson',
      vehiclePlateNo: 'XYZ-789',
      stopsCount: 5,
    },
    {
      id: 'trip-8',
      routeId: 'route-2',
      startTime: `${dateStr}T20:00:00Z`,
      endTime: `${dateStr}T21:15:00Z`,
      status: 'pending',
      driverName: 'Sarah Johnson',
      vehiclePlateNo: 'XYZ-789',
      stopsCount: 4,
    },

    // Route 3 - Suburban Loop
    {
      id: 'trip-9',
      routeId: 'route-3',
      startTime: `${dateStr}T07:00:00Z`,
      endTime: `${dateStr}T08:45:00Z`,
      status: 'completed',
      driverName: 'Mike Chen',
      vehiclePlateNo: 'DEF-456',
      stopsCount: 12,
    },
    {
      id: 'trip-10',
      routeId: 'route-3',
      startTime: `${dateStr}T11:00:00Z`,
      endTime: `${dateStr}T12:45:00Z`,
      status: 'inProgress',
      driverName: 'Mike Chen',
      vehiclePlateNo: 'DEF-456',
      stopsCount: 11,
    },
    {
      id: 'trip-11',
      routeId: 'route-3',
      startTime: `${dateStr}T16:00:00Z`,
      endTime: `${dateStr}T17:30:00Z`,
      status: 'completed',
      driverName: 'Mike Chen',
      vehiclePlateNo: 'DEF-456',
      stopsCount: 10,
    },

    // Route 4 - Harbor Route
    {
      id: 'trip-12',
      routeId: 'route-4',
      startTime: `${dateStr}T08:30:00Z`,
      endTime: `${dateStr}T10:00:00Z`,
      status: 'completed',
      driverName: 'Emma Davis',
      vehiclePlateNo: 'GHI-234',
      stopsCount: 6,
    },
    {
      id: 'trip-13',
      routeId: 'route-4',
      startTime: `${dateStr}T14:00:00Z`,
      endTime: `${dateStr}T15:30:00Z`,
      status: 'pending',
      driverName: 'Emma Davis',
      vehiclePlateNo: 'GHI-234',
      stopsCount: 7,
    },
    {
      id: 'trip-14',
      routeId: 'route-4',
      startTime: `${dateStr}T18:00:00Z`,
      endTime: `${dateStr}T19:00:00Z`,
      status: 'delayed',
      driverName: 'Emma Davis',
      vehiclePlateNo: 'GHI-234',
      stopsCount: 5,
    },

    // Route 5 - Industrial District
    {
      id: 'trip-15',
      routeId: 'route-5',
      startTime: `${dateStr}T06:00:00Z`,
      endTime: `${dateStr}T07:15:00Z`,
      status: 'completed',
      driverName: 'Robert Wilson',
      vehiclePlateNo: 'JKL-567',
      stopsCount: 15,
    },
    {
      id: 'trip-16',
      routeId: 'route-5',
      startTime: `${dateStr}T12:30:00Z`,
      endTime: `${dateStr}T14:00:00Z`,
      status: 'completed',
      driverName: 'Robert Wilson',
      vehiclePlateNo: 'JKL-567',
      stopsCount: 14,
    },
    {
      id: 'trip-17',
      routeId: 'route-5',
      startTime: `${dateStr}T17:00:00Z`,
      endTime: `${dateStr}T18:30:00Z`,
      status: 'inProgress',
      driverName: 'Robert Wilson',
      vehiclePlateNo: 'JKL-567',
      stopsCount: 13,
    },
  ];
};

// Export function to get mock data for a specific date
export const getMockTripsForDate = (date: Date): TripDuty[] => {
  return createTripsForDay(date);
};

// Export today's mock data
export const mockTrips = createTripsForDay(new Date());
