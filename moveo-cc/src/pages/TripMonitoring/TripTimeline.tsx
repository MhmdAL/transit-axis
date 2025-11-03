import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import RouteRow from './RouteRow';
import type { TripDuty, Route, TripBlockData } from './mockData';

interface TripTimelineProps {
  routes: Route[];
  trips: TripDuty[];
  onTripClick?: (trip: TripBlockData) => void;
}

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: auto;
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  overflow: visible;
  box-shadow: ${theme.shadows.md};
`;

const RoutesContainer = styled.div`
  flex: 0 1 auto;
  overflow-y: visible;
  background-color: ${theme.colors.surface};
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${theme.colors.textMuted};
    }
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${theme.colors.textMuted};
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const EmptyStateText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  text-align: center;
`;

const EmptyStateSubtext = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
  opacity: 0.7;
  max-width: 300px;
`;

const TripTimeline: React.FC<TripTimelineProps> = ({ routes, trips, onTripClick }) => {
  const noRoutesSelected = routes.length === 0;

  // Group trips by route
  const tripsByRoute = new Map<string, TripDuty[]>();
  routes.forEach(route => {
    tripsByRoute.set(route.id, []);
  });
  trips.forEach(trip => {
    const routeTrips = tripsByRoute.get(trip.routeId);
    if (routeTrips) {
      routeTrips.push(trip);
    }
  });

  // Filter routes to only show those with trips
  const routesWithTrips = routes.filter(route => 
    tripsByRoute.get(route.id)?.length ?? 0 > 0
  );

  return (
    <TimelineContainer>
      <RoutesContainer>
        {noRoutesSelected ? (
          <EmptyStateContainer>
            <EmptyStateIcon>📅</EmptyStateIcon>
            <EmptyStateText>No Routes Selected</EmptyStateText>
            <EmptyStateSubtext>
              Select routes from the dropdown above to see trip schedules
            </EmptyStateSubtext>
          </EmptyStateContainer>
        ) : routesWithTrips.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateIcon>🚫</EmptyStateIcon>
            <EmptyStateText>No Trips Found</EmptyStateText>
            <EmptyStateSubtext>
              No trips scheduled for the selected routes on this date
            </EmptyStateSubtext>
          </EmptyStateContainer>
        ) : (
          routesWithTrips.map(route => (
            <RouteRow
              key={route.id}
              route={route}
              trips={tripsByRoute.get(route.id) || []}
              onTripClick={onTripClick}
            />
          ))
        )}
      </RoutesContainer>
    </TimelineContainer>
  );
};

export default TripTimeline;
