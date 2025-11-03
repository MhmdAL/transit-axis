import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import TripBlock from './TripBlock';
import type { TripDuty, Route, TripBlockData, TripStatus } from './mockData';

interface RouteRowProps {
  route: Route;
  trips: TripDuty[];
  onTripClick?: (trip: TripBlockData) => void;
}

const RouteContainer = styled.div`
  border-bottom: 1px solid ${theme.colors.border};
  background: linear-gradient(135deg, ${theme.colors.surfaceHover}, ${theme.colors.surface});
  transition: all ${theme.transitions.fast};
  margin-bottom: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.primary}40;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 ${theme.colors.primary}20;
  flex-shrink: 0;
  min-height: 150px;

  &:hover {
    background: linear-gradient(135deg, ${theme.colors.surfaceHover}dd, ${theme.colors.surface}dd);
    border-color: ${theme.colors.primary}60;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${theme.colors.primary}30;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const RouteLabel = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.primary};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  background: linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primaryHover}10);
  backdrop-filter: blur(4px);
`;

const RouteName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  letter-spacing: 0.5px;
`;

const RouteCode = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ScrollableTimeline = styled.div`
  flex: 0 1 auto;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 6px;
    border: 2px solid ${theme.colors.background};

    &:hover {
      background: ${theme.colors.primary};
    }

    &:active {
      background: ${theme.colors.primaryHover};
    }
  }
`;

const HourHeaderContent = styled.div`
  display: flex;
  min-width: 2400px;
  height: 40px;
  background: linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover} 100%);
  border-bottom: 1px solid ${theme.colors.border};
`;

const HourBlock = styled.div`
  flex: 0 0 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-right: 1px solid ${theme.colors.border};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};

  &:last-child {
    border-right: none;
  }
`;

const HourLabel = styled.span`
  background: linear-gradient(180deg, ${theme.colors.primary}, ${theme.colors.primaryHover});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: ${theme.typography.fontWeight.bold};
`;

const TimelineRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const TimelineRowLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};

  &:first-of-type {
    margin-top: 0;
  }
`;

const TimelineRowContent = styled.div`
  position: relative;
  min-width: 2400px;
  height: 60px;
  display: flex;
  align-items: center;
`;

const EmptyState = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
  opacity: 0.5;
`;

const HourGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  pointer-events: none;
`;

const HourGridLine = styled.div`
  flex: 0 0 100px;
  border-right: 1px solid ${theme.colors.border}22;

  &:last-child {
    border-right: none;
  }
`;

const RouteRow: React.FC<RouteRowProps> = ({ route, trips, onTripClick }) => {
  const TIMELINE_START_HOUR = 3; // Start timeline at 03:00
  const hours = Array.from({ length: 24 }, (_, i) => (TIMELINE_START_HOUR + i) % 24);

    function calculateTripStatus(tripDuty: TripDuty) {
        if (!tripDuty.trip) {
        // No actual trip reported yet (in progress)
        return 'scheduled';
        }

        const scheduledEnd = new Date(tripDuty.endTime).getTime();
        const actualEnd = new Date(tripDuty.trip.endTime).getTime();

        // Add a 5 minute (300,000 ms) grace period for considering a trip as 'completed'
        const GRACE_PERIOD_MS = 5 * 60 * 1000;
        if (actualEnd <= scheduledEnd + GRACE_PERIOD_MS) {
            return 'completed';
        }
        // otherwise actual ended late
        return 'delayed';
    }

  return (
    <RouteContainer>
      <RouteLabel>
        <RouteName>{route.name}</RouteName>
        <RouteCode>{route.code}</RouteCode>
      </RouteLabel>

      <ScrollableTimeline>
        <HourHeaderContent>
          {hours.map(hour => (
            <HourBlock key={`header-${hour}`}>
              <HourLabel>{String(hour).padStart(2, '0')}:00</HourLabel>
            </HourBlock>
          ))}
        </HourHeaderContent>

        <TimelineRowsContainer>
          {/* Scheduled Timeline */}
          <TimelineRowLabel>Scheduled</TimelineRowLabel>
          <TimelineRowContent>
            <HourGrid>
              {hours.map(hour => (
                <HourGridLine key={`scheduled-grid-${hour}`} />
              ))}
            </HourGrid>
            {trips.length === 0 ? (
              <EmptyState>No trips scheduled</EmptyState>
            ) : (
              trips.map(trip => (
                <TripBlock
                  key={`scheduled-${trip.id}`}
                  trip={{
                    ...trip,
                    status: 'scheduled',
                    vehicleFleetNo: trip.vehicle?.fleetNo || '',
                    driverName: trip.driver?.name || ''
                  }}
                  onTripClick={onTripClick}
                  timelineStartHour={TIMELINE_START_HOUR}
                />
              ))
            )}
          </TimelineRowContent>

          {/* Actual Timeline */}
          <TimelineRowLabel>Actual</TimelineRowLabel>
          <TimelineRowContent>
            <HourGrid>
              {hours.map(hour => (
                <HourGridLine key={`actual-grid-${hour}`} />
              ))}
            </HourGrid>
            {!trips.some(trip => trip.trip) ? (
              <EmptyState>No actual trips yet</EmptyState>
            ) : (
              trips
                .filter(trip => trip.trip)
                .map(trip => {
                  const actualTrip = {
                    ...trip.trip!,
                    status: calculateTripStatus(trip) as TripStatus,
                    routeId: trip.routeId,
                    vehicleFleetNo: trip.vehicle?.fleetNo || '',
                    driverName: trip.driver?.name || ''
                  };
                  return (
                    <TripBlock
                      key={`actual-${actualTrip.id}`}
                      trip={actualTrip}
                      onTripClick={onTripClick}
                      timelineStartHour={TIMELINE_START_HOUR}
                    />
                  );
                })
            )}
          </TimelineRowContent>
        </TimelineRowsContainer>
      </ScrollableTimeline>
    </RouteContainer>
  );
};

export default RouteRow;
