import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiUsers, FiFilter } from 'react-icons/fi';
import { theme } from '../../styles/theme';

// Mock data types
interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  routeCode: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  passengerCount?: number;
  capacity?: number;
}

interface RouteGroup {
  routeId: string;
  routeName: string;
  routeCode: string;
  trips: Trip[];
  totalTrips: number;
  totalDuration: number;
}

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: ${theme.spacing.lg};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.xs} 0 0 0;
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const DateInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const RoutesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const RouteCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: ${theme.shadows.sm};
  }
`;

const RouteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  border-bottom: 1px solid ${theme.colors.border};
`;

const RouteName = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const RouteCode = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.surface};
  padding: 2px ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fontFamily.mono};
  margin-left: ${theme.spacing.sm};
`;

const TimelineContainer = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
`;

const Timeline = styled.div`
  position: relative;
  height: 50px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
`;

const TimeGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
`;

const TimeSlot = styled.div`
  flex: 1;
  border-right: 1px solid ${theme.colors.border};
  position: relative;
  
  &:last-child {
    border-right: none;
  }
`;

const TimeLabelsRow = styled.div`
  display: flex;
  margin-top: ${theme.spacing.sm};
  height: 20px;
`;

const TimeLabel = styled.div`
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const TripBar = styled.div<{ 
  startPercent: number; 
  widthPercent: number; 
  status: Trip['status'];
}>`
  position: absolute;
  top: 8px;
  left: ${({ startPercent }) => startPercent}%;
  width: ${({ widthPercent }) => widthPercent}%;
  height: 34px;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  ${({ status }) => {
    switch (status) {
      case 'scheduled':
        return `
          background: #3b82f6;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(255, 255, 255, 0.2) 4px,
            rgba(255, 255, 255, 0.2) 8px
          );
        `;
      case 'in-progress':
        return `
          background: #10b981;
        `;
      case 'completed':
        return `
          background: #6b7280;
        `;
      case 'delayed':
        return `
          background: #f59e0b;
        `;
      case 'cancelled':
        return `
          background: #ef4444;
        `;
      default:
        return `
          background: #6b7280;
        `;
    }
  }}
`;

const TripTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  
  ${TripBar}:hover & {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
`;

const EmptyTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
  margin: 0;
`;

// Mock data
const mockTrips: Trip[] = [
  {
    id: '1',
    routeId: 'route-1',
    routeName: 'Downtown Express',
    routeCode: 'RT001',
    startTime: '06:00',
    endTime: '07:30',
    duration: 90,
    status: 'completed',
    driverName: 'John Smith',
    vehicleNumber: 'BUS-001',
    passengerCount: 45,
    capacity: 50
  },
  {
    id: '2',
    routeId: 'route-1',
    routeName: 'Downtown Express',
    routeCode: 'RT001',
    startTime: '08:00',
    endTime: '09:30',
    duration: 90,
    status: 'in-progress',
    driverName: 'Sarah Johnson',
    vehicleNumber: 'BUS-002',
    passengerCount: 38,
    capacity: 50
  },
  {
    id: '3',
    routeId: 'route-1',
    routeName: 'Downtown Express',
    routeCode: 'RT001',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    status: 'scheduled',
    driverName: 'Mike Wilson',
    vehicleNumber: 'BUS-003',
    passengerCount: 0,
    capacity: 50
  },
  {
    id: '4',
    routeId: 'route-2',
    routeName: 'Airport Shuttle',
    routeCode: 'RT002',
    startTime: '07:00',
    endTime: '08:00',
    duration: 60,
    status: 'delayed',
    driverName: 'Lisa Brown',
    vehicleNumber: 'BUS-004',
    passengerCount: 25,
    capacity: 30
  },
  {
    id: '5',
    routeId: 'route-2',
    routeName: 'Airport Shuttle',
    routeCode: 'RT002',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    status: 'scheduled',
    driverName: 'David Lee',
    vehicleNumber: 'BUS-005',
    passengerCount: 0,
    capacity: 30
  },
  {
    id: '6',
    routeId: 'route-3',
    routeName: 'University Line',
    routeCode: 'RT003',
    startTime: '06:30',
    endTime: '08:00',
    duration: 90,
    status: 'completed',
    driverName: 'Emma Davis',
    vehicleNumber: 'BUS-006',
    passengerCount: 42,
    capacity: 50
  },
  {
    id: '7',
    routeId: 'route-3',
    routeName: 'University Line',
    routeCode: 'RT003',
    startTime: '08:30',
    endTime: '10:00',
    duration: 90,
    status: 'in-progress',
    driverName: 'Tom Anderson',
    vehicleNumber: 'BUS-007',
    passengerCount: 35,
    capacity: 50
  }
];

const TripDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeGroups, setRouteGroups] = useState<RouteGroup[]>([]);

  useEffect(() => {
    // Group trips by route
    const grouped = mockTrips.reduce((acc, trip) => {
      const existing = acc.find(group => group.routeId === trip.routeId);
      if (existing) {
        existing.trips.push(trip);
        existing.totalTrips++;
        existing.totalDuration += trip.duration;
      } else {
        acc.push({
          routeId: trip.routeId,
          routeName: trip.routeName,
          routeCode: trip.routeCode,
          trips: [trip],
          totalTrips: 1,
          totalDuration: trip.duration
        });
      }
      return acc;
    }, [] as RouteGroup[]);

    // Sort trips within each route by start time
    grouped.forEach(group => {
      group.trips.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    setRouteGroups(grouped);
  }, [selectedDate]);

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#10b981';
      case 'completed': return '#6b7280';
      case 'delayed': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'scheduled': return '⏰';
      case 'in-progress': return '🚌';
      case 'completed': return '✅';
      case 'delayed': return '⏳';
      case 'cancelled': return '❌';
      default: return '⏰';
    }
  };

  const calculateTripPosition = (trip: Trip) => {
    // Convert time to percentage of day (assuming 6 AM to 10 PM = 16 hours)
    const startHour = parseInt(trip.startTime.split(':')[0]);
    const startMinute = parseInt(trip.startTime.split(':')[1]);
    const endHour = parseInt(trip.endTime.split(':')[0]);
    const endMinute = parseInt(trip.endTime.split(':')[1]);
    
    const startMinutes = (startHour - 6) * 60 + startMinute;
    const endMinutes = (endHour - 6) * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    
    const startPercent = (startMinutes / (16 * 60)) * 100;
    const widthPercent = (durationMinutes / (16 * 60)) * 100;
    
    return { startPercent, widthPercent };
  };

  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = 6 + i;
    return hour <= 22 ? `${hour.toString().padStart(2, '0')}:00` : null;
  }).filter(Boolean);

  return (
    <DashboardContainer className="fade-in">
      <PageHeader>
        <BackButton onClick={handleBack}>
          <FiArrowLeft />
        </BackButton>
        <HeaderContent>
          <PageTitle>Trip Dashboard</PageTitle>
          <PageSubtitle>Monitor and track all trips for the selected day</PageSubtitle>
        </HeaderContent>
      </PageHeader>

      <ControlsSection>
        <DateSelector>
          <FiCalendar />
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </DateSelector>
        
        <FilterButton>
          <FiFilter />
          Filter Routes
        </FilterButton>
      </ControlsSection>

      {routeGroups.length > 0 ? (
        <RoutesList>
          {routeGroups.map((routeGroup) => (
            <RouteCard key={routeGroup.routeId}>
              <RouteHeader>
                <RouteName>
                  {routeGroup.routeName}
                  <RouteCode>{routeGroup.routeCode}</RouteCode>
                </RouteName>
              </RouteHeader>
              
              <TimelineContainer>
                <Timeline>
                  <TimeGrid>
                    {timeSlots.map((time, index) => (
                      <TimeSlot key={index} />
                    ))}
                  </TimeGrid>
                  
                  {routeGroup.trips.map((trip) => {
                    const { startPercent, widthPercent } = calculateTripPosition(trip);
                    return (
                      <TripBar
                        key={trip.id}
                        startPercent={startPercent}
                        widthPercent={widthPercent}
                        status={trip.status}
                        title={`${trip.startTime} - ${trip.endTime} | ${trip.driverName} | ${trip.vehicleNumber}`}
                      >
                        <TripTooltip>
                          <div><strong>{trip.startTime} - {trip.endTime}</strong></div>
                          <div>Driver: {trip.driverName}</div>
                          <div>Vehicle: {trip.vehicleNumber}</div>
                          <div>Passengers: {trip.passengerCount}/{trip.capacity}</div>
                          <div>Status: {trip.status}</div>
                        </TripTooltip>
                      </TripBar>
                    );
                  })}
                </Timeline>
                
                <TimeLabelsRow>
                  {timeSlots.map((time, index) => (
                    <TimeLabel key={index}>{time}</TimeLabel>
                  ))}
                </TimeLabelsRow>
              </TimelineContainer>
            </RouteCard>
          ))}
        </RoutesList>
      ) : (
        <EmptyState>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyTitle>No trips scheduled</EmptyTitle>
          <EmptyDescription>
            There are no trips scheduled for the selected date.
          </EmptyDescription>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default TripDashboard;
