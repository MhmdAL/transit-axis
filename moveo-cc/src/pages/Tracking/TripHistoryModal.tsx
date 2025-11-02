import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface Trip {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: string;
  distance?: number;
}

interface PathVisualizerModalProps {
  isOpen: boolean;
  vehicleId?: string;
  vehicleFleetNo?: string;
  onClose: () => void;
  onPathSelected: (path: any) => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: #1f2937;
  color: #f3f4f6;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  h2 {
    margin: 0 0 ${theme.spacing.lg} 0;
    color: #f3f4f6;
    font-size: 18px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  position: relative;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: #f3f4f6;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid #374151;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  background: none;
  border: none;
  color: ${props => props.active ? '#3b82f6' : '#9ca3af'};
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.active ? '#3b82f6' : '#d1d5db'};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #d1d5db;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 8px 12px;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 6px;
  color: #f3f4f6;
  font-size: 12px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #4b5563;
  }
`;

const TripList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${theme.spacing.lg};
`;

const TripItem = styled.div<{ isSelected: boolean }>`
  padding: 12px 14px;
  background: ${props => props.isSelected ? '#1e40af' : '#111827'};
  border: 1px solid ${props => props.isSelected ? '#2563eb' : '#374151'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${props => props.isSelected ? '#1e40af' : '#1f2937'};
    border-color: #3b82f6;
  }

  .trip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .trip-time {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.isSelected ? '#e0f2fe' : '#e0f2fe'};
  }

  .trip-duration {
    font-size: 11px;
    color: ${props => props.isSelected ? '#bae6fd' : '#9ca3af'};
  }

  .trip-distance {
    font-size: 11px;
    color: ${props => props.isSelected ? '#bae6fd' : '#9ca3af'};
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9ca3af;
  padding: ${theme.spacing.lg};
  font-size: 13px;
`;

const PathVisualizerModal: React.FC<PathVisualizerModalProps> = ({
  isOpen,
  vehicleId,
  vehicleFleetNo,
  onClose,
  onPathSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'trip' | 'timerange'>('trip');
  const [selectedDate, setSelectedDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTripsForDate = useCallback(async () => {
    if (!vehicleId || !selectedDate) return;

    setLoading(true);
    setTrips([]);
    setSelectedTrip(null);

    try {
      const { apiService } = await import('@/services/apiService');
      const allTrips = await apiService.getVehicleTrips(vehicleId, 100);
      
      const selectedDateTime = new Date(selectedDate);
      const dayStart = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const filteredTrips = allTrips.filter((trip: Trip) => {
        const tripStart = new Date(trip.startTime);
        return tripStart >= dayStart && tripStart < dayEnd;
      }).sort((a: Trip, b: Trip) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, selectedDate]);

  const fetchTripsForTimeRange = useCallback(async () => {
    if (!vehicleId || !startDate || !endDate) return;

    setLoading(true);
    setTrips([]);
    setSelectedTrip(null);

    try {
      const { apiService } = await import('@/services/apiService');
      const allTrips = await apiService.getVehicleTrips(vehicleId, 100);
      
      const rangeStart = new Date(startDate).getTime();
      const rangeEnd = new Date(endDate).getTime();

      const filteredTrips = allTrips.filter((trip: Trip) => {
        const tripStart = new Date(trip.startTime).getTime();
        return tripStart >= rangeStart && tripStart <= rangeEnd;
      }).sort((a: Trip, b: Trip) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, startDate, endDate]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handleSelectTrip = async () => {
    if (!selectedTrip) return;

    try {
      const { apiService } = await import('@/services/apiService');
      const telemetryData = await apiService.getTripTelemetry(selectedTrip.id);
      
      onPathSelected({
        trip: selectedTrip,
        telemetry: telemetryData,
      });

      onClose();
    } catch (error) {
      console.error('Error fetching trip telemetry:', error);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Path Visualizer - {vehicleFleetNo || 'Vehicle'}</h2>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab 
            active={activeTab === 'trip'}
            onClick={() => {
              setActiveTab('trip');
              setTrips([]);
              setSelectedTrip(null);
            }}
          >
            By Trip
          </Tab>
          <Tab 
            active={activeTab === 'timerange'}
            onClick={() => {
              setActiveTab('timerange');
              setTrips([]);
              setSelectedTrip(null);
            }}
          >
            By Time Range
          </Tab>
        </TabContainer>

        {activeTab === 'trip' && (
          <>
            <InputGroup>
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setTrips([]);
                  setSelectedTrip(null);
                }}
              />
              <Button onClick={fetchTripsForDate} style={{ marginTop: '8px' }}>
                Search Trips
              </Button>
            </InputGroup>

            {loading ? (
              <EmptyState>Loading trips...</EmptyState>
            ) : trips.length === 0 && selectedDate ? (
              <EmptyState>No trips found for this date</EmptyState>
            ) : (
              <>
                {trips.length > 0 && (
                  <>
                    <TripList>
                      {trips.map((trip) => (
                        <TripItem
                          key={trip.id}
                          isSelected={selectedTrip?.id === trip.id}
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <div className="trip-info">
                            <div className="trip-time">
                              {formatTime(trip.startTime)}
                            </div>
                            <div className="trip-duration">
                              Duration: {getDuration(trip.startTime, trip.endTime)}
                            </div>
                            {trip.distance && (
                              <div className="trip-distance">
                                Distance: {trip.distance.toFixed(1)} km
                              </div>
                            )}
                          </div>
                        </TripItem>
                      ))}
                    </TripList>
                    <Button 
                      onClick={handleSelectTrip} 
                      disabled={!selectedTrip}
                      style={{ width: '100%' }}
                    >
                      Visualize Path
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'timerange' && (
          <>
            <InputGroup>
              <Label>Start Date & Time</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Label>End Date & Time</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button onClick={fetchTripsForTimeRange} style={{ marginTop: '8px' }}>
                Search Trips
              </Button>
            </InputGroup>

            {loading ? (
              <EmptyState>Loading trips...</EmptyState>
            ) : trips.length === 0 && startDate && endDate ? (
              <EmptyState>No trips found in this time range</EmptyState>
            ) : (
              <>
                {trips.length > 0 && (
                  <>
                    <TripList>
                      {trips.map((trip) => (
                        <TripItem
                          key={trip.id}
                          isSelected={selectedTrip?.id === trip.id}
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <div className="trip-info">
                            <div className="trip-time">
                              {new Date(trip.startTime).toLocaleDateString()} {formatTime(trip.startTime)}
                            </div>
                            <div className="trip-duration">
                              Duration: {getDuration(trip.startTime, trip.endTime)}
                            </div>
                            {trip.distance && (
                              <div className="trip-distance">
                                Distance: {trip.distance.toFixed(1)} km
                              </div>
                            )}
                          </div>
                        </TripItem>
                      ))}
                    </TripList>
                    <Button 
                      onClick={handleSelectTrip} 
                      disabled={!selectedTrip}
                      style={{ width: '100%' }}
                    >
                      Visualize Path
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PathVisualizerModal;
