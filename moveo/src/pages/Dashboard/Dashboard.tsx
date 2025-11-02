import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiTruck, 
  FiUsers, 
  FiMap, 
  FiNavigation, 
  FiAlertTriangle,
  FiTrendingUp,
  FiActivity,
  FiClock
} from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Card } from '../../styles/GlobalStyles';
import StatCard from '../../components/UI/StatCard';
import { DashboardStats, Vehicle, Driver } from '../../types';
import { dataService } from '../../services/dataService';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivityCard = styled(Card)`
  height: 400px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-height: 320px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const ActivityIcon = styled.div<{ type: 'success' | 'warning' | 'info' | 'error' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
        `;
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error};
        `;
      default:
        return `
          background: rgba(59, 130, 246, 0.1);
          color: ${theme.colors.primary};
        `;
    }
  }}
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ActivityDescription = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const ActivityTime = styled.div`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.xs};
`;

const VehicleStatusCard = styled(Card)`
  height: 400px;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-height: 320px;
  overflow-y: auto;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const VehicleInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const VehicleName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

const VehicleDetails = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const StatusBadge = styled.span<{ status: 'active' | 'maintenance' | 'inactive' }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${({ status }) => {
    switch (status) {
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      case 'maintenance':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: ${theme.colors.secondary};
          border: 1px solid rgba(107, 114, 128, 0.2);
        `;
    }
  }}
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, vehiclesData] = await Promise.all([
          dataService.getDashboardStats(),
          dataService.getVehicles()
        ]);
        
        setStats(statsData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading || !stats) {
    return <div>Loading...</div>;
  }

  const recentActivities = [
    {
      id: '1',
      type: 'success' as const,
      icon: <FiTruck />,
      title: 'Vehicle ABC-123 completed delivery',
      description: 'Downtown delivery route completed successfully',
      time: '5 minutes ago'
    },
    {
      id: '2',
      type: 'warning' as const,
      icon: <FiAlertTriangle />,
      title: 'Maintenance due for XYZ-789',
      description: 'Scheduled maintenance required within 7 days',
      time: '1 hour ago'
    },
    {
      id: '3',
      type: 'info' as const,
      icon: <FiUsers />,
      title: 'New driver Sarah Johnson assigned',
      description: 'Driver assigned to vehicle DEF-456',
      time: '2 hours ago'
    },
    {
      id: '4',
      type: 'success' as const,
      icon: <FiNavigation />,
      title: 'Route optimization completed',
      description: 'Downtown delivery route optimized for efficiency',
      time: '3 hours ago'
    }
  ];

  return (
    <DashboardContainer className="fade-in">
      <PageHeader>
        <PageTitle>Fleet Dashboard</PageTitle>
      </PageHeader>

      <StatsGrid>
        <StatCard
          icon={<FiTruck />}
          value={stats.totalVehicles}
          label="Total Vehicles"
          change={{ value: `${stats.activeVehicles} active`, positive: true }}
          color={theme.colors.primary}
        />
        <StatCard
          icon={<FiUsers />}
          value={stats.totalDrivers}
          label="Total Drivers"
          change={{ value: `${stats.activeDrivers} active`, positive: true }}
          color={theme.colors.success}
        />
        <StatCard
          icon={<FiMap />}
          value={stats.totalRoutes}
          label="Active Routes"
          change={{ value: `${stats.activeTrips} trips`, positive: true }}
          color={theme.colors.info}
        />
        <StatCard
          icon={<FiAlertTriangle />}
          value={stats.maintenanceDue}
          label="Maintenance Due"
          change={{ value: 'This week', positive: false }}
          color={theme.colors.warning}
        />
      </StatsGrid>

      <ContentGrid>
        <RecentActivityCard>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <FiActivity color={theme.colors.textSecondary} />
          </CardHeader>
          <ActivityList>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon type={activity.type}>
                  {activity.icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                </ActivityContent>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivityCard>

        <VehicleStatusCard>
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
            <FiTruck color={theme.colors.textSecondary} />
          </CardHeader>
          {/* <StatusList>
            {vehicles.map((vehicle) => (
              <StatusItem key={vehicle.id}>
                <VehicleInfo>
                  <VehicleName>{vehicle.plateNumber} - {vehicle.make} {vehicle.model}</VehicleName>
                  <VehicleDetails>
                    {vehicle.currentLocation?.address || 'Location unknown'} • {vehicle.mileage.toLocaleString()} miles
                  </VehicleDetails>
                </VehicleInfo>
                <StatusBadge status={vehicle.status}>
                  {vehicle.status}
                </StatusBadge>
              </StatusItem>
            ))}
          </StatusList> */}
        </VehicleStatusCard>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
