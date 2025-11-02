import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTruck, FiUser, FiClock, FiMapPin, FiBarChart } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { theme } from '../../styles/theme';
import AssignmentModal from '../../components/Modals/AssignmentModal';
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  HeaderActions,
  FiltersCard,
  SearchContainer,
  SearchInput,
  SearchIcon,
  TableCard,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  ActionButtons,
  ActionButton,
  EmptyState,
  EmptyStateIcon
} from '../../components/Common/CommonStyles';
import { Trip, Route, Vehicle, Driver, TripStop, VehicleModel } from '../../types';
import { dataService } from '../../services/dataService';

// Styled components for assignment
const AssignmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
`;

const AssignmentInfo = styled.div`
  fontSize: 13px;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const AssignmentButton = styled(Button)<{ isAssigned: boolean }>`
  padding: 6px 12px;
  font-size: 12px;
  min-width: ${({ isAssigned }) => isAssigned ? '80px' : '100px'};
  height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ isAssigned }) => 
    isAssigned 
      ? 'rgba(16, 185, 129, 0.1)' 
      : theme.colors.primary};
  color: ${({ isAssigned }) => isAssigned ? '#059669' : '#ffffff'};
  border: ${({ isAssigned }) => 
    isAssigned 
      ? '1px solid rgba(16, 185, 129, 0.3)' 
      : `1px solid ${theme.colors.primary}`};
  
  &:hover {
    background: ${({ isAssigned }) => 
      isAssigned 
        ? 'rgba(16, 185, 129, 0.15)' 
        : theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Custom components for assign actions
const AssignButton = ({ 
  isAssigned, 
  onClick, 
  icon: Icon, 
  assignedText, 
  unassignedText,
  assignedInfo
}: {
  isAssigned: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  assignedText: string;
  unassignedText: string;
  assignedInfo?: string;
}) => (
  <AssignmentContainer>
    {isAssigned && assignedInfo && (
      <AssignmentInfo>
        {assignedInfo}
      </AssignmentInfo>
    )}
    <AssignmentButton
      isAssigned={isAssigned}
      onClick={onClick}
    >
      <Icon size={14} />
      {isAssigned ? 'Change' : unassignedText}
    </AssignmentButton>
  </AssignmentContainer>
);

const TripsList: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripsData, routesData, vehiclesData, driversData] = await Promise.all([
          dataService.getTrips(),
          dataService.getRoutes(),
          dataService.getVehicles(),
          dataService.getDrivers()
        ]);
        
        setTrips(tripsData);
        setRoutes(routesData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setFilteredTrips(tripsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip => {
        const route = routes.find(r => r.id === trip.routeId);
        const vehicle = vehicles.find(v => v.id === trip.scheduledVehicleId);
        const driver = drivers.find(d => d.id === trip.scheduledDriverId);
        
        return (
          route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle?.plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredTrips(filtered);
  }, [trips, routes, vehicles, drivers, searchTerm]);

  const handleCreateTrip = () => {
    navigate('/trips/create');
  };

  const handleTripDashboard = () => {
    navigate('/trips/dashboard');
  };

  const handleEditTrip = (tripId: string) => {
    navigate(`/trips/edit/${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await dataService.deleteTrip(tripId);
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleAssignVehicle = (tripId: string) => {
    setSelectedTripId(tripId);
    setVehicleModalOpen(true);
  };

  const handleAssignDriver = (tripId: string) => {
    setSelectedTripId(tripId);
    setDriverModalOpen(true);
  };

  const handleVehicleAssignment = async (vehicle: Vehicle) => {
    if (selectedTripId) {
      try {
        // Update the trip via API
        const updatedTrip = await dataService.assignVehicleToTrip({
          tripId: selectedTripId,
          vehicleId: vehicle.id
        });

        // Update local state
        setTrips(prev => prev.map(trip => 
          trip.id === selectedTripId 
            ? { ...trip, scheduledVehicleId: vehicle.id, vehicle: vehicle }
            : trip
        ));
      } catch (error) {
        console.error('Error assigning vehicle:', error);
        alert('Failed to assign vehicle. Please try again.');
      }
    }
    setVehicleModalOpen(false);
    setSelectedTripId(null);
  };

  const handleDriverAssignment = async (driver: Driver) => {
    if (selectedTripId) {
      try {
        // Update the trip via API
        const updatedTrip = await dataService.assignDriverToTrip({
          tripId: selectedTripId,
          driverId: driver.id
        });

        // Update local state
        setTrips(prev => prev.map(trip => 
          trip.id === selectedTripId 
            ? { ...trip, scheduledDriverId: driver.id, driver: driver }
            : trip
        ));
      } catch (error) {
        console.error('Error assigning driver:', error);
        alert('Failed to assign driver. Please try again.');
      }
    }
    setDriverModalOpen(false);
    setSelectedTripId(null);
  };

  const getRouteInfo = (routeId: string) => {
    return routes.find(r => r.id === routeId);
  };

  const getVehicleInfo = (vehicleId?: string) => {
    return vehicleId ? vehicles.find(v => v.id === vehicleId) : null;
  };

  const getDriverInfo = (driverId?: string) => {
    return driverId ? drivers.find(d => d.id === driverId) : null;
  };

  const getTripStatus = (trip: Trip): 'planned' | 'in-progress' | 'completed' | 'cancelled' => {
    if (trip.endTime) {
      return 'completed';
    }
    if (trip.startTime) {
      return 'in-progress';
    }
    return 'planned';
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Trips</PageTitle>
        <HeaderActions>
          <Button variant="secondary" onClick={handleTripDashboard}>
            <FiBarChart />
            Trip Dashboard
          </Button>
          <Button variant="primary" onClick={handleCreateTrip}>
            <FiPlus />
            Create Trip
          </Button>
        </HeaderActions>
      </PageHeader>

      <FiltersCard>
        <SearchContainer>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </FiltersCard>

      {filteredTrips.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🚛</EmptyStateIcon>
          <h3>No trips found</h3>
          <p>Try adjusting your search criteria or create a new trip.</p>
          <Button variant="primary" onClick={handleCreateTrip} style={{ marginTop: '16px' }}>
            <FiPlus />
            Create Trip
          </Button>
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Route</TableHeaderCell>
                <TableHeaderCell>Schedule</TableHeaderCell>
                <TableHeaderCell>Vehicle</TableHeaderCell>
                <TableHeaderCell>Driver</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => {
                const route = trip.route || getRouteInfo(trip.routeId);
                const vehicle = trip.vehicle || getVehicleInfo(trip.scheduledVehicleId);
                const driver = trip.driver || getDriverInfo(trip.scheduledDriverId);
                const status = getTripStatus(trip);

                return (
                  <TableRow key={trip.id}>
                    <TableCell>
                      {route ? (
                        <div>
                          <div style={{ fontWeight: 'medium' }}>{route.name}</div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px'
                          }}>
                            <FiMapPin size={10} />
                            {route.code}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Route not found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}>
                          <FiClock size={10} />
                          Start: {formatDateTime(trip.scheduledStartTime)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#6b7280'
                        }}>
                          <FiClock size={10} />
                          End: {formatDateTime(trip.scheduledEndTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AssignButton
                        isAssigned={!!vehicle}
                        onClick={() => handleAssignVehicle(trip.id)}
                        icon={FiTruck}
                        assignedText="Assigned"
                        unassignedText="Assign Vehicle"
                        assignedInfo={vehicle ? `${vehicle.plateNo} - ${vehicle.fleetNo}` : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <AssignButton
                        isAssigned={!!driver}
                        onClick={() => handleAssignDriver(trip.id)}
                        icon={FiUser}
                        assignedText="Assigned"
                        unassignedText="Assign Driver"
                        assignedInfo={driver ? `${driver.name} (${driver.qid})` : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status}>
                        {status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton onClick={() => handleEditTrip(trip.id)}>
                          <FiEdit size={16} />
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteTrip(trip.id)}>
                          <FiTrash2 size={16} />
                        </ActionButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableCard>
      )}

    </PageContainer>
  );
};

export default TripsList;
