import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiMap, FiClock, FiUser, FiTruck } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import Sidebar from '../../components/Sidebar/Sidebar';

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
  overflow-y: auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textMuted};
`;

const TripGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
`;

const TripCard = styled.div`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const TripId = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StatusBadge = styled.div<{ $hasPath: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${props => props.$hasPath ? theme.colors.success : theme.colors.textMuted}33;
  color: ${props => props.$hasPath ? theme.colors.success : theme.colors.textMuted};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const TripInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};

  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }
`;

const ViewPathButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primaryHover});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:disabled {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.lg};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.lg};
`;

interface Trip {
  id: string;
  routeId: string;
  startTime: string | null;
  endTime: string | null;
  path: string | null;
  route?: {
    name: string;
    code: string;
  };
  driver?: {
    user: {
      name: string;
    };
  };
  vehicle?: {
    plateNumber: string;
    model: {
      make: string;
    };
  };
}

const TripsList: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trips');
      const data = await response.json();
      
      if (data.success) {
        setTrips(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPath = (trip: Trip) => {
    if (trip.path) {
      navigate('/', { state: { polyline: trip.path, tripId: trip.id } });
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <PageContainer>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <MainContent>
        <ContentArea>
          <Header>
            <Title>Trip History</Title>
            <Subtitle>View completed trips and their paths</Subtitle>
          </Header>

          {loading ? (
            <LoadingMessage>Loading trips...</LoadingMessage>
          ) : trips.length === 0 ? (
            <EmptyMessage>No trips found</EmptyMessage>
          ) : (
            <TripGrid>
              {trips.map(trip => (
                <TripCard key={trip.id}>
                  <TripHeader>
                    <TripId>Trip #{trip.id}</TripId>
                    <StatusBadge $hasPath={!!trip.path}>
                      {trip.path ? 'Has Path' : 'No Path'}
                    </StatusBadge>
                  </TripHeader>

                  <TripInfo>
                    {trip.route && (
                      <InfoRow>
                        <FiMap size={16} />
                        <span>{trip.route.name}</span>
                      </InfoRow>
                    )}
                    
                    {/* {trip.driver && (
                      <InfoRow>
                        <FiUser size={16} />
                        <span>{trip.driver.user.name}</span>
                      </InfoRow>
                    )}
                    
                    {trip.vehicle && (
                      <InfoRow>
                        <FiTruck size={16} />
                        <span>{trip.vehicle.model.make} - {trip.vehicle.plateNumber}</span>
                      </InfoRow>
                    )} */}
                    
                    <InfoRow>
                      <FiClock size={16} />
                      <span>{formatDateTime(trip.startTime)} → {formatDateTime(trip.endTime)}</span>
                    </InfoRow>
                  </TripInfo>

                  <ViewPathButton
                    onClick={() => handleViewPath(trip)}
                    disabled={!trip.path}
                  >
                    <FiMap size={16} />
                    {trip.path ? 'View on Map' : 'No Path Data'}
                  </ViewPathButton>
                </TripCard>
              ))}
            </TripGrid>
          )}
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default TripsList;

