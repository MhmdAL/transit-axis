import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiCalendar, FiEye } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  HeaderActions,
  SearchContainer,
  SearchInput,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionButtons,
  ActionButton
} from '../../components/Common/CommonStyles';
import { ServiceSchedule } from '../../types';
import { apiService } from '../../services/apiService';

const ServiceSchedulesList: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getServiceSchedules();
      setSchedules(response);
    } catch (error: any) {
      console.error('Error loading service schedules:', error);
      setError(error.message || 'Failed to load service schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSchedule = () => {
    navigate('/service-schedules/create');
  };

  const handleViewSchedule = (scheduleId: string) => {
    navigate(`/service-schedules/view/${scheduleId}`);
  };

  const handleDeleteSchedule = async (scheduleId: string, scheduleName: string) => {
    if (window.confirm(`Are you sure you want to delete "${scheduleName}"?`)) {
      try {
        await apiService.deleteServiceSchedule(scheduleId);
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } catch (error) {
        console.error('Error deleting service schedule:', error);
        alert('Failed to delete service schedule. Please try again.');
      }
    }
  };

  const getScheduleStatus = (schedule: ServiceSchedule) => {
    const now = new Date();
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    
    if (now < start) return { label: 'Upcoming', color: '#3B82F6' };
    if (now >= start && now <= end) return { label: 'Active', color: '#10B981' };
    return { label: 'Completed', color: '#6B7280' };
  };

  if (loading) {
    return <div>Loading service schedules...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Service Schedules</PageTitle>
        <HeaderActions>
          <Button onClick={handleCreateSchedule} variant="primary">
            <FiPlus style={{ marginRight: '8px' }} />
            Create Schedule
          </Button>
        </HeaderActions>
      </PageHeader>

      {error && (
        <div style={{ padding: '16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search service schedules..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </SearchContainer>

      <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Duty Templates</TableHeaderCell>
          <TableHeaderCell>Vehicle Blocks</TableHeaderCell>
          <TableHeaderCell>Driver Runs</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {filteredSchedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                {searchTerm ? 'No service schedules found matching your search.' : 'No service schedules found. Create one to get started.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredSchedules.map((schedule) => {
              const status = getScheduleStatus(schedule);
              
              return (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiCalendar size={16} color="#6366F1" />
                      {schedule.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: '#F3F4F6',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#374151',
                      width: 'fit-content'
                    }}>
                      {schedule.dutyTemplateCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: '#EEF2FF',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#4F46E5',
                      width: 'fit-content'
                    }}>
                      {schedule.vehicleBlockCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: '#FEF3C7',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#D97706',
                      width: 'fit-content'
                    }}>
                      {schedule.driverRunCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'white',
                      background: status.color
                    }}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton 
                        onClick={() => handleViewSchedule(schedule.id)}
                        title="View"
                      >
                        <FiEye />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleDeleteSchedule(schedule.id, schedule.name)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </PageContainer>
  );
};

export default ServiceSchedulesList;
