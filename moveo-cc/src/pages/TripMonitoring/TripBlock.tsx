import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import type { TripBlockData, TripStatus } from './mockData';

interface TripBlockProps {
  trip: TripBlockData;
  onTripClick?: (trip: TripBlockData) => void;
  timelineStartHour?: number;
}

// Status color mapping
const statusColorMap: Record<TripStatus, string> = {
  completed: 'blue',
  inProgress: 'green',
  scheduled: theme.colors.textMuted,
  pending: theme.colors.warning,
  delayed: 'orange',
  unknown: theme.colors.textMuted,
};

const TripBlockContainer = styled.div<{ $status: TripStatus; $leftPercent: number; $widthPercent: number }>`
  position: absolute;
  left: ${props => props.$leftPercent}%;
  width: ${props => props.$widthPercent}%;
  min-width: 24px;
  height: 50px;
  background-color: ${props => statusColorMap[props.$status]};
  border: 1px solid ${props => `${statusColorMap[props.$status]}80`};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  &:hover::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid ${theme.colors.surface};
  }
`;

const Tooltip = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 65px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  min-width: 220px;
  z-index: 1000;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  opacity: ${props => props.$isVisible ? 1 : 0};
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  transition: opacity ${theme.transitions.fast};
  white-space: normal;
`;

const TooltipRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const TooltipLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TooltipValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const StatusBadge = styled.span<{ $status: TripStatus }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${props => `${statusColorMap[props.$status]}20`};
  color: ${props => statusColorMap[props.$status]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const TripBlock: React.FC<TripBlockProps> = ({ trip, onTripClick, timelineStartHour = 0 }) => {
  const [isHovering, setIsHovering] = useState(false);

  // Calculate position and width based on time
  const startDate = new Date(trip.startTime);
  const endDate = new Date(trip.endTime);

  const startHour = startDate.getUTCHours() + startDate.getUTCMinutes() / 60;
  const endHour = endDate.getUTCHours() + endDate.getUTCMinutes() / 60;

  // Adjust for timeline offset
  const adjustedStartHour = (startHour - timelineStartHour + 24) % 24;
  const adjustedEndHour = (endHour - timelineStartHour + 24) % 24;

  // Handle trips that cross the timeline boundary
  const duration = adjustedEndHour > adjustedStartHour 
    ? adjustedEndHour - adjustedStartHour 
    : (adjustedEndHour + 24) - adjustedStartHour;

  const leftPercent = (adjustedStartHour / 24) * 100;
  const widthPercent = (duration / 24) * 100;

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get status label
  const getStatusLabel = () => {
    const statusLabels: Record<TripStatus, string> = {
      completed: 'Completed',
      inProgress: 'In Progress',
      scheduled: 'Scheduled',
      pending: 'Pending',
      delayed: 'Delayed',
      unknown: 'Unknown',
    };
    return statusLabels[trip.status];
  };

  const durationInMinutes = Math.round(duration * 60);

  return (
    <TripBlockContainer
      $status={trip.status}
      $leftPercent={leftPercent}
      $widthPercent={widthPercent}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onTripClick?.(trip)}
      title={`${trip.driverName || 'Unknown Driver'} - ${formatTime(startDate)}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%' }}>
        {trip.vehicleFleetNo && (
          <span style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.9 }}>
            {trip.vehicleFleetNo}
          </span>
        )}
      </div>
      <Tooltip $isVisible={isHovering}>
        <TooltipRow>
          <TooltipLabel>Trip Time</TooltipLabel>
          <TooltipValue>
            {formatTime(startDate)} - {formatTime(endDate)}
          </TooltipValue>
          <TooltipValue style={{ fontSize: theme.typography.fontSize.xs }}>
            ({durationInMinutes} min)
          </TooltipValue>
        </TooltipRow>
        <TooltipRow>
          <TooltipLabel>Status</TooltipLabel>
          <StatusBadge $status={trip.status}>{getStatusLabel()}</StatusBadge>
        </TooltipRow>
        {trip.driverName && (
          <TooltipRow>
            <TooltipLabel>Driver</TooltipLabel>
            <TooltipValue>{trip.driverName}</TooltipValue>
          </TooltipRow>
        )}
        {trip.vehicleFleetNo && (
          <TooltipRow>
            <TooltipLabel>Vehicle</TooltipLabel>
            <TooltipValue>{trip.vehicleFleetNo}</TooltipValue>
          </TooltipRow>
        )}
      </Tooltip>
    </TripBlockContainer>
  );
};

export default TripBlock;
