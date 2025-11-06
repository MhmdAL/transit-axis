import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/apiService';
import IncidentModal from './IncidentModal';
import VehicleMessageModal from './VehicleMessageModal';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background-color: ${theme.colors.card};
  border-left: 1px solid ${theme.colors.border};
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
`;

const ModalContent = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  min-height: 0;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${theme.colors.border}, transparent);
  margin: 0;
  flex-shrink: 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;
`;

const DetailRow = styled.div<{ index?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-left: 4px solid #0d9488;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.card};
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.1);
    border-left-color: #14b8a6;
  }
`;

const DetailLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const DetailValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  word-break: break-word;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md} ${theme.spacing.md};
  background: ${props => {
    switch(props.variant) {
      case 'primary': return '#0d9488'; // teal
      case 'secondary': return '#3b82f6'; // blue
      case 'danger': return '#ef4444'; // red
      default: return '#0d9488';
    }
  }};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 600;
  transition: all ${theme.transitions.fast};
  flex: 1;
  min-height: 40px;

  &:hover {
    background: ${props => {
      switch(props.variant) {
        case 'primary': return '#14b8a6';
        case 'secondary': return '#1d4ed8';
        case 'danger': return '#dc2626';
        default: return '#14b8a6';
      }
    }};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  margin-top: ${theme.spacing.md};
`;


const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  position: relative;
  flex: 1;
  min-height: 0;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
`;

const TimelineSectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0;
  flex-shrink: 0;
`;

const TimelineScrollWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  position: relative;
  padding: ${theme.spacing.sm} 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: ${theme.spacing.sm};
  margin-right: -${theme.spacing.sm};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;

    &:hover {
      background: #9ca3af;
    }
  }
`;

const TimelineItem = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  position: relative;
  padding: ${theme.spacing.md};
  padding-left: ${theme.spacing.lg};
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.08);
    border-color: #d1d5db;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: ${`calc(${theme.spacing.md} - 2px)`};
    top: calc(${theme.spacing.lg} + 20px);
    width: 2px;
    height: calc(100% + ${theme.spacing.md});
    background: #e5e7eb;
  }
`;

const TimelineNode = styled.div`
  position: absolute;
  left: 0;
  top: ${theme.spacing.md};
  width: 16px;
  height: 16px;
  background: #0d9488;
  border-radius: 50%;
  border: 2px solid ${theme.colors.card};
  z-index: 1;
`;

const StopInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  flex: 1;
`;

const StopName = styled.h4`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const TimeInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
`;

const TimeBox = styled.div<{ type?: 'arrival' | 'departure', status?: 'ontime' | 'behind' | 'ahead' | 'expected' | 'departed' }>`
  background: ${props => {
    switch(props.status) {
      case 'ontime': return '#f0fdf4'; // emerald-50
      case 'behind': return '#fef2f2'; // rose-50
      case 'ahead': return '#fffbeb'; // amber-50
      case 'expected': return '#f5f3ff'; // violet-50
      case 'departed': return '#eff6ff'; // sky-50
      default: return theme.colors.surface;
    }
  }};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: ${props => props.status === 'expected' ? '2px dashed' : '1px solid'} ${props => {
    switch(props.status) {
      case 'ontime': return '#86efac'; // emerald-300
      case 'behind': return '#fca5a5'; // rose-300
      case 'ahead': return '#fcd34d'; // amber-300
      case 'expected': return '#c4b5fd'; // violet-300 (dashed)
      case 'departed': return '#7dd3fc'; // sky-300
      default: return theme.colors.border;
    }
  }};
  border-left: ${props => props.status === 'expected' ? '4px dashed' : '4px solid'} ${props => {
    switch(props.status) {
      case 'ontime': return '#22c55e'; // green-500
      case 'behind': return '#ef4444'; // red-500
      case 'ahead': return '#eab308'; // amber-500
      case 'expected': return '#a78bfa'; // violet-500
      case 'departed': return '#0ea5e9'; // sky-500
      default: return props.type === 'departure' ? '#059669' : '#0d9488';
    }
  }};
  opacity: ${props => props.status === 'expected' ? 0.75 : 1};
  transition: all ${theme.transitions.fast};

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    opacity: 1;
  }
`;

const TimeLabel = styled.span<{ status?: 'ontime' | 'behind' | 'ahead' | 'expected' | 'departed' }>`
  color: ${props => {
    switch(props.status) {
      case 'ontime': return '#065f46'; // emerald-900
      case 'behind': return '#7f1d1d'; // rose-900
      case 'ahead': return '#78350f'; // amber-900
      case 'expected': return '#5b21b6'; // violet-800
      case 'departed': return '#0c4a6e'; // sky-900
      default: return theme.colors.textMuted;
    }
  }};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  font-size: ${theme.typography.fontSize.xs};
  background: transparent;
`;

const TimeValue = styled.span<{ status?: 'ontime' | 'behind' | 'ahead' | 'expected' | 'departed' }>`
  color: ${props => {
    switch(props.status) {
      case 'ontime': return '#047857'; // emerald-700
      case 'behind': return '#991b1b'; // rose-800
      case 'ahead': return '#92400e'; // amber-800
      case 'expected': return '#6d28d9'; // violet-700
      case 'departed': return '#0e5a8a'; // sky-800
      default: return theme.colors.textPrimary;
    }
  }};
  font-weight: 600;
  font-size: ${theme.typography.fontSize.xs};
  background: transparent;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.base};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: #ef4444;
  font-size: ${theme.typography.fontSize.sm};
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(239, 68, 68, 0.3);
`;

interface ExpectedTime {
  expectedArrival: string | null;
  expectedDeparture: string | null;
}

type TimeStatus = 'ontime' | 'behind' | 'ahead' | 'expected' | 'departed';

const getTimeStatus = (actual: string | null, expected: string | null, isDeparture: boolean): TimeStatus => {
  // If this is a departure and actual time exists, it's departed
  if (isDeparture && actual) {
    return 'departed';
  }

  // If no actual time, show as expected
  if (!actual) {
    return 'expected';
  }

  // If actual time exists but no expected, can't determine
  if (!expected) {
    return 'expected';
  }

  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();
  const diffMinutes = (actualTime - expectedTime) / (1000 * 60);

  // Within 1 minute is on time
  if (Math.abs(diffMinutes) <= 1) {
    return 'ontime';
  }

  // More than 1 minute late
  if (diffMinutes > 1) {
    return 'behind';
  }

  // More than 1 minute early
  return 'ahead';
};

const getTimeDifferenceLabel = (actual: string | null, expected: string | null): string => {
  if (!actual || !expected) return '';

  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();
  const diffMinutes = Math.round((actualTime - expectedTime) / (1000 * 60));

  if (diffMinutes === 0) return 'On time';
  if (diffMinutes > 0) return `${diffMinutes} min behind`;
  return `${Math.abs(diffMinutes)} min ahead`;
};

const calculateExpectedTimes = (
  tripStartTime: string,
  tripStops: any[],
  routeStops: RouteStop[]
): Map<number, ExpectedTime> => {
  const expectedTimes = new Map<number, ExpectedTime>();
  
  if (!tripStartTime || !tripStops || tripStops.length === 0) {
    return expectedTimes;
  }

  let currentTime = new Date(tripStartTime).getTime();

  tripStops.forEach((tripStop) => {
    const stopOrder = tripStop.stopOrder;
    const routeStop = routeStops.find(rs => rs.stopOrder === stopOrder);

    // For first stop, arrival is trip start time
    if (stopOrder === 0) {
      const expectedArrival = new Date(currentTime);
      
      // Departure = Arrival + wait time (if any)
      const waitTime = routeStop?.waitTime || 0;
      const departureTime = new Date(currentTime + waitTime * 60 * 1000);
      
      expectedTimes.set(stopOrder, {
        expectedArrival: expectedArrival.toISOString(),
        expectedDeparture: departureTime.toISOString()
      });

      currentTime = departureTime.getTime();
    } else {
      // For subsequent stops:
      // Arrival = Previous Departure + ETA
      const eta = routeStop?.eta || 0; // ETA in minutes
      const arrivalTime = new Date(currentTime + eta * 60 * 1000);
      
      // Departure = Arrival + wait time
      const waitTime = routeStop?.waitTime || 0;
      const departureTime = new Date(arrivalTime.getTime() + waitTime * 60 * 1000);

      expectedTimes.set(stopOrder, {
        expectedArrival: arrivalTime.toISOString(),
        expectedDeparture: departureTime.toISOString()
      });

      currentTime = departureTime.getTime();
    }
  });

  return expectedTimes;
};

interface RouteStop {
  stopOrder: number;
  eta: number | null;
  waitTime: number | null;
}

interface TripDetailsData {
  id: string;
  routeName: string;
  driverName: string;
  vehicleFleetNo: string;
  startTime: string;
  endTime: string | null;
  status: string;
  driver?: any;
  vehicle?: any;
  route?: any;
  tripStops?: Array<{
    id: string;
    stopId: string;
    stopOrder: number;
    stopName: string;
    eta: number | null;
    arrivalTime: string | null;
    departureTime: string | null;
  }>;
  routeStops?: RouteStop[];
}

interface TripDetailsModalProps {
  isOpen: boolean;
  tripId?: string | null;
  trip?: any;
  onClose: () => void;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ isOpen, tripId, trip, onClose }) => {
  const [tripDetails, setTripDetails] = useState<TripDetailsData | null>(null);
  const [expectedTimes, setExpectedTimes] = useState<Map<number, ExpectedTime>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // If trip prop is provided, use it directly
    if (trip && trip.trip) {
      const tripData: TripDetailsData = {
        id: trip.trip.id?.toString() || '',
        routeName: trip.route?.name || '',
        driverName: trip.driver?.name || '',
        vehicleFleetNo: trip.vehicle?.fleetNo || '',
        startTime: trip.trip.startTime || '',
        endTime: trip.trip.endTime || null,
        status: trip.trip.status || trip.status || 'pending',
      };
      setTripDetails(tripData);
      return;
    }

    // Otherwise, fetch trip details from API
    if (!tripId) return;

    const fetchTripDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await apiService.getTripDetails(tripId);
        setTripDetails(details);
        
        // Calculate expected times if we have routeStops data
        if (details.startTime && details.tripStops && details.routeStops) {
          const expected = calculateExpectedTimes(
            details.startTime,
            details.tripStops,
            details.routeStops
          );
          setExpectedTimes(expected);
        }
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [isOpen, tripId, trip]);

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <ModalOverlay isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>Trip Details</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

      <ModalContent>
        {loading ? (
          <LoadingMessage>Loading trip details...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : tripDetails ? (
          <>

            <Section>
            <DetailRow>
              <DetailLabel>Route</DetailLabel>
              <DetailValue>{tripDetails.routeName || 'N/A'}</DetailValue>
            </DetailRow>

              <DetailRow>
                <DetailLabel>Driver</DetailLabel>
                <DetailValue>{tripDetails.driverName || 'N/A'}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>Vehicle Fleet No.</DetailLabel>
                <DetailValue>{tripDetails.vehicleFleetNo || 'N/A'}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>Start Time</DetailLabel>
                <DetailValue>
                  {formatDate(tripDetails.startTime)} {formatTime(tripDetails.startTime)}
                </DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>End Time</DetailLabel>
                <DetailValue>
                  {tripDetails.endTime
                    ? `${formatDate(tripDetails.endTime)} ${formatTime(tripDetails.endTime)}`
                    : 'In Progress'}
                </DetailValue>
              </DetailRow>

              <ActionButtonsContainer>
                <ActionButton 
                  variant="primary"
                  onClick={() => {
                    // Call driver logic
                    const phone = tripDetails.driver?.user?.phone;
                    if (phone) {
                      window.location.href = `tel:${phone}`;
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📞</span>
                  <span>Call</span>
                </ActionButton>
                <ActionButton 
                  variant="secondary"
                  onClick={() => setShowMessageModal(true)}
                >
                  <span style={{ fontSize: '16px' }}>💬</span>
                  <span>Message</span>
                </ActionButton>
                <ActionButton 
                  variant="danger"
                  onClick={() => setShowIncidentModal(true)}
                >
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <span>Incidents</span>
                </ActionButton>
              </ActionButtonsContainer>
            </Section>

            <SectionDivider />

            {tripDetails.tripStops && tripDetails.tripStops.length > 0 && (
              <TimelineContainer>
                <TimelineSectionTitle>Trip Stops</TimelineSectionTitle>
                <TimelineScrollWrapper>
                  {tripDetails.tripStops.map((stop) => {
                    const expected = expectedTimes.get(stop.stopOrder);
                    const arrivalStatus = getTimeStatus(stop.arrivalTime || null, expected?.expectedArrival || null, false);
                    const departureStatus = getTimeStatus(stop.departureTime || null, expected?.expectedDeparture || null, true);
                    const arrivalDiff = getTimeDifferenceLabel(stop.arrivalTime || null, expected?.expectedArrival || null);
                    const departureDiff = getTimeDifferenceLabel(stop.departureTime || null, expected?.expectedDeparture || null);
                    
                    return (
                      <TimelineItem key={stop.id}>
                        <TimelineNode />
                        <StopInfo>
                          <StopName>{stop.stopName || `Stop ${stop.stopOrder}`}</StopName>
                          <TimeInfo>
                            <TimeBox type="arrival" status={arrivalStatus}>
                              <TimeLabel status={arrivalStatus}>Arrival</TimeLabel>
                              <TimeValue status={arrivalStatus}>
                                {stop.arrivalTime ? (
                                  <>
                                    {formatTime(stop.arrivalTime)}
                                    {arrivalDiff && <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>{arrivalDiff}</div>}
                                  </>
                                ) : expected?.expectedArrival ? (
                                  <>
                                    {formatTime(expected.expectedArrival)}
                                  </>
                                ) : (
                                  <>
                                    Pending
                                  </>
                                )}
                              </TimeValue>
                            </TimeBox>
                            <TimeBox type="departure" status={departureStatus}>
                              <TimeLabel status={departureStatus}>Departure</TimeLabel>
                              <TimeValue status={departureStatus}>
                                {stop.departureTime ? (
                                  <>
                                    <span style={{ marginRight: '4px' }}>Departed</span>
                                    {formatTime(stop.departureTime)}
                                    {departureDiff && <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>{departureDiff}</div>}
                                  </>
                                ) : expected?.expectedDeparture ? (
                                  <>
                                    {formatTime(expected.expectedDeparture)}
                                  </>
                                ) : (
                                  <>
                                    Pending
                                  </>
                                )}
                              </TimeValue>
                            </TimeBox>
                          </TimeInfo>
                        </StopInfo>
                      </TimelineItem>
                    );
                  })}
                </TimelineScrollWrapper>
              </TimelineContainer>
            )}
          </>
        ) : null}
        </ModalContent>
      </ModalOverlay>

      {tripDetails && createPortal(
        <IncidentModal
          isOpen={showIncidentModal}
          tripId={tripDetails?.id || ''}
          routeId={tripDetails?.route?.id?.toString() || ''}
          vehicleId={tripDetails?.vehicle?.id?.toString() || ''}
          driverId={tripDetails?.driver?.id?.toString() || ''}
          currentUserId={'1'}
          onClose={() => setShowIncidentModal(false)}
        />,
        document.body
      )}

      {tripDetails && createPortal(
        <VehicleMessageModal
          isOpen={showMessageModal}
          vehicleId={tripDetails?.vehicle?.id?.toString() || ''}
          sentByUserId={'1'}
          onClose={() => setShowMessageModal(false)}
        />,
        document.body
      )}
    </>
  );
};

export default TripDetailsModal;
