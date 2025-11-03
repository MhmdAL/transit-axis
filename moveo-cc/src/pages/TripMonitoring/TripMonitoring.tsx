import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Sidebar from '../../components/Sidebar/Sidebar';
import RouteSelector, { type Route } from '../../components/UI/RouteSelector';
import TripTimeline from './TripTimeline';
import { apiService } from '../../services/apiService';
import { useGlobalVehicleTracking } from '../../context/VehicleTrackingContext';
import { type TripBlockData, type TripDuty } from './mockData';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${theme.spacing.xl};
  gap: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: flex-end;
  flex-wrap: wrap;
  background: linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.card});
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  flex: 1;
  min-width: 250px;
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.card};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const DisabledOverlay = styled.div`
  opacity: 0.5;
  pointer-events: none;
`;

const TimelineWrapper = styled.div`
  flex: 0 1 auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
`;

const StatsBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(90deg, ${theme.colors.surface}, ${theme.colors.card});
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const StatLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.base};
`;

const TripMonitoring: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<TripDuty[]>([]);
  const [isSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRouteSelector, setShowRouteSelector] = useState(false);

  // Get global vehicle tracking for real-time events
  const { subscribeRoute, unsubscribeRoute, onTripEvent, offTripEvent } = useGlobalVehicleTracking();

  // Fetch trips when date or routes change
  React.useEffect(() => {
    if (selectedDate && selectedRoutes.length > 0) {
      fetchTrips();
    } else {
      setTrips([]);
    }
  }, [selectedDate, selectedRoutes]);

  // Subscribe to route events for real-time updates
  React.useEffect(() => {
    if (selectedRoutes.length === 0) return;

    // Subscribe to each selected route
    selectedRoutes.forEach(route => {
        console.log('Subscribing to route:', route.id);
      subscribeRoute(route.id);
    });

    return () => {
      // Unsubscribe from routes when component unmounts or routes change
      selectedRoutes.forEach(route => {
        unsubscribeRoute(route.id);
      });
    };
  }, [selectedRoutes, subscribeRoute, unsubscribeRoute]);

  // Listen for real-time trip events
  React.useEffect(() => {
    if (!selectedRoutes.length) return;

    const handleTripStartEvent = (event: any) => {
      console.log('Trip start event received:', event);
      // Only process events for selected routes
      const isRelevantRoute = selectedRoutes.some(r => r.id === event.routeId);
      if (!isRelevantRoute) return;

      setTrips(prevTrips => {
        const updatedTrips = [...prevTrips];
        // Find and update the trip duty with the actual trip data
        const tripIndex = updatedTrips.findIndex(t => t.id === event.tripDutyId);
        if (tripIndex !== -1) {
          updatedTrips[tripIndex] = {
            ...updatedTrips[tripIndex],
            trip: {
              id: event.id,
              routeId: event.routeId,
              tripDutyId: event.tripDutyId,
              startTime: event.startTime,
              endTime: event.endTime,
              status: event.status || 'inProgress',
            }
          };
        }
        return updatedTrips;
      });
    };

    const handleTripEndEvent = (event: any) => {
      console.log('Trip end event received:', event);
      // Only process events for selected routes
      const isRelevantRoute = selectedRoutes.some(r => r.id === event.routeId);
      if (!isRelevantRoute) return;

      setTrips(prevTrips => {
        const updatedTrips = [...prevTrips];
        // Update the trip with end time
        const tripIndex = updatedTrips.findIndex(t => t.trip?.id === event.id);
        if (tripIndex !== -1 && updatedTrips[tripIndex].trip) {
          updatedTrips[tripIndex].trip = {
            ...updatedTrips[tripIndex].trip!,
            endTime: event.endTime,
            status: event.status || 'completed',
          };
        }
        return updatedTrips;
      });
    };

    // Listen for trip events
    onTripEvent('trip:start', handleTripStartEvent);
    onTripEvent('trip:end', handleTripEndEvent);

    return () => {
      // Cleanup listeners when component unmounts or routes change
      offTripEvent('trip:start', handleTripStartEvent);
      offTripEvent('trip:end', handleTripEndEvent);
    };
  }, [selectedRoutes, onTripEvent, offTripEvent]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const routeIds = selectedRoutes.map(r => r.id);
      const tripsData = await apiService.getTripDutiesByDateAndRoutes(selectedDate!, routeIds);
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (trip: TripBlockData) => {
    // Future: Handle trip click to show details modal
    console.log('Trip clicked:', trip);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setShowRouteSelector(!!newDate);
    // Reset routes when date changes
    setSelectedRoutes([]);
  };

  const handleRoutesChange = (routes: Route[]) => {
    setSelectedRoutes(routes);
  };

  // Calculate statistics
  const totalTrips = selectedRoutes.reduce((count, route) => {
    return count + trips.filter(t => t.routeId === route.id).length;
  }, 0);

  const completedTrips = trips.filter(
    t =>
      t.status === 'completed' &&
      selectedRoutes.some(r => r.id === t.routeId)
  ).length;

  const inProgressTrips = trips.filter(
    t =>
      t.status === 'inProgress' &&
      selectedRoutes.some(r => r.id === t.routeId)
  ).length;

  return (
    <PageContainer>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <MainContent>
        <ContentArea>
          <Header>
            <Title>
              Trip Monitoring
            </Title>
          </Header>

          <FiltersContainer>
            <FilterGroup>
              <FilterLabel htmlFor="date-picker">Select Date</FilterLabel>
              <DateInput
                id="date-picker"
                type="date"
                value={selectedDate || undefined}
                onChange={handleDateChange}
              />
            </FilterGroup>

            {showRouteSelector ? (
              <RouteSelector
                selectedRoutes={selectedRoutes}
                onRoutesChange={handleRoutesChange}
              />
            ) : (
              <DisabledOverlay>
                <FilterGroup>
                  <FilterLabel>Select Routes</FilterLabel>
                  <DateInput disabled placeholder="Select a date first" />
                </FilterGroup>
              </DisabledOverlay>
            )}
          </FiltersContainer>

          {selectedRoutes.length > 0 && (
            <StatsBar>
              <StatItem>
                <StatLabel>Total Trips</StatLabel>
                <StatValue>{totalTrips}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Completed</StatLabel>
                <StatValue style={{ color: theme.colors.success }}>{completedTrips}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>In Progress</StatLabel>
                <StatValue style={{ color: theme.colors.info }}>{inProgressTrips}</StatValue>
              </StatItem>
            </StatsBar>
          )}

          <TimelineWrapper>
            {loading ? (
              <LoadingMessage>Loading trips...</LoadingMessage>
            ) : (
              <TripTimeline
                routes={selectedRoutes}
                trips={trips}
                onTripClick={handleTripClick}
              />
            )}
          </TimelineWrapper>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default TripMonitoring;
