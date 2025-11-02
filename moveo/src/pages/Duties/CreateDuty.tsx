import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSettings } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer,
  PageHeader,
  PageTitle,
  HeaderActions,
  FormCard,
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../../components/Common/CommonStyles';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/apiService';
import { CreateBulkTripDutiesRequest } from '../../types/api';
import MultiSelectSearchDropdown from '../../components/UI/DropDowns/MultiSelectSearchDropdown';
import { dataService } from '../../services/dataService';
import { ServiceSchedule, Route, DutyTemplate } from '../../types';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background: ${({ active, completed }) => 
    completed ? theme.colors.success : 
    active ? theme.colors.primary : 
    theme.colors.card};
  color: ${({ active, completed }) => 
    completed || active ? 'white' : 
    theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all 0.2s;
  border: 1px solid ${({ active, completed }) => 
    completed ? theme.colors.success : 
    active ? theme.colors.primary : 
    theme.colors.border};
`;

const StepNumber = styled.div<{ active: boolean; completed: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${({ active, completed }) => 
    completed ? 'white' : 
    active ? 'white' : 
    theme.colors.surface};
  color: ${({ active, completed }) => 
    completed ? theme.colors.success : 
    active ? theme.colors.primary : 
    theme.colors.textSecondary};
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const SummaryCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.surface};
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  text-align: left;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  border-bottom: 2px solid ${theme.colors.border};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const TableCell = styled.td<{ $bgColor?: string }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  vertical-align: middle;
  background: ${props => props.$bgColor ? `color-mix(in srgb, ${props.$bgColor} 15%, transparent)` : 'transparent'};
  border-left: ${props => props.$bgColor ? `3px solid ${props.$bgColor}` : 'none'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.textMuted};
`;

interface DutyFormData {
  date: string;
  scheduleId: string;
  routeId: string;
}

interface DutyFormErrors {
  date?: string;
  scheduleId?: string;
  routeId?: string;
}

const CreateDuty: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DutyFormData>({
    date: '',
    scheduleId: '',
    routeId: ''
  });
  const [errors, setErrors] = useState<DutyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data from API
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [dutyTemplates, setDutyTemplates] = useState<DutyTemplate[]>([]);
  
  // Loading states
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  // Selections
  const [selectedSchedule, setSelectedSchedule] = useState<ServiceSchedule | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const steps = [
    { number: 1, title: 'Configure', icon: FiSettings },
    { number: 2, title: 'Review & Generate', icon: FiCheck }
  ];

  // Load schedules and routes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setSchedulesLoading(true);
        setRoutesLoading(true);
        
        const [schedulesData, routesData] = await Promise.all([
          dataService.getServiceSchedules(),
          dataService.getRoutes()
        ]);
        
        setSchedules(schedulesData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setSchedulesLoading(false);
        setRoutesLoading(false);
      }
    };

    loadData();
  }, []);

  const searchSchedules = async (searchTerm: string): Promise<ServiceSchedule[]> => {
    if (!searchTerm.trim()) return schedules;
    return schedules.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const searchRoutes = async (searchTerm: string): Promise<Route[]> => {
    if (!searchTerm.trim()) return routes;
    return routes.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof DutyFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleScheduleSelect = async (schedule: ServiceSchedule) => {
    setSelectedSchedule(schedule);
    setFormData(prev => ({ ...prev, scheduleId: schedule.id }));
    if (errors.scheduleId) {
      setErrors(prev => ({ ...prev, scheduleId: undefined }));
    }

    // Load duty templates for this schedule
    try {
      setTemplatesLoading(true);
      const templates = await apiService.getDutyTemplates(schedule.id);
      setDutyTemplates(templates);
    } catch (error) {
      console.error('Error loading duty templates:', error);
      setDutyTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setFormData(prev => ({ ...prev, routeId: route.id }));
    if (errors.routeId) {
      setErrors(prev => ({ ...prev, routeId: undefined }));
    }
  };

  const validateStep = (): boolean => {
    const newErrors: DutyFormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    if (!formData.scheduleId) {
      newErrors.scheduleId = 'Please select a schedule';
    }
    if (!formData.routeId) {
      newErrors.routeId = 'Please select a route';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const bulkRequest: CreateBulkTripDutiesRequest = {
        scheduleId: formData.scheduleId,
        routeId: formData.routeId,
        date: formData.date,
        trips: dutyTemplates.map(template => ({
          scheduledStartTime: new Date(template.startTime).toTimeString().slice(0, 5),
          scheduledEndTime: new Date(template.endTime).toTimeString().slice(0, 5),
          vehicleBlockCode: template.vehicleBlockCode,
          driverRunCode: template.driverRunCode
        }))
      };
      
      await apiService.createBulkTripDuties(bulkRequest);
      navigate('/duties');
    } catch (error) {
      console.error('Error creating duties:', error);
      alert('Failed to create duties. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/duties');
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <StepContent>
          <h3 style={{ color: theme.colors.textPrimary, margin: 0 }}>Configure Duty Generation</h3>
          
          <FormGroup>
            <Label htmlFor="date">Date *</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              hasError={!!errors.date}
            />
            {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="scheduleId">Service Schedule *</Label>
            <MultiSelectSearchDropdown
              values={selectedSchedule ? [selectedSchedule] : []}
              onChange={(schedules) => {
                if (schedules.length > 0) {
                  handleScheduleSelect(schedules[0]);
                } else {
                  setSelectedSchedule(null);
                  setFormData(prev => ({ ...prev, scheduleId: '' }));
                  setDutyTemplates([]);
                }
              }}
              onSearch={searchSchedules}
              displayValue={(schedule) => schedule.name}
              renderItem={(schedule) => (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>
                    {schedule.name}
                  </div>
                </div>
              )}
              placeholder="Search schedules..."
              disabled={schedulesLoading}
            />
            {errors.scheduleId && <ErrorMessage>{errors.scheduleId}</ErrorMessage>}
            {templatesLoading && (
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                Loading duty templates...
              </div>
            )}
            {selectedSchedule && !templatesLoading && (
              <div style={{ fontSize: '12px', color: theme.colors.success, marginTop: '4px' }}>
                ✓ {dutyTemplates.length} duty template{dutyTemplates.length !== 1 ? 's' : ''} loaded
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="routeId">Route *</Label>
            <MultiSelectSearchDropdown
              values={selectedRoute ? [selectedRoute] : []}
              onChange={(routes) => {
                if (routes.length > 0) {
                  handleRouteSelect(routes[0]);
                } else {
                  setSelectedRoute(null);
                  setFormData(prev => ({ ...prev, routeId: '' }));
                }
              }}
              onSearch={searchRoutes}
              displayValue={(route) => route.name}
              renderItem={(route) => (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>
                    {route.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {route.code}
                  </div>
                </div>
              )}
              placeholder="Search routes..."
              disabled={routesLoading}
            />
            {errors.routeId && <ErrorMessage>{errors.routeId}</ErrorMessage>}
          </FormGroup>
        </StepContent>
      );
    }

    // Step 2: Review
    return (
      <StepContent>
        <h3 style={{ color: theme.colors.textPrimary, margin: 0 }}>Review & Generate Duties</h3>
        
        <SummaryCard>
          <h4 style={{ color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>Summary</h4>
          <SummaryItem>
            <span style={{ color: theme.colors.textSecondary }}>Date:</span>
            <strong style={{ color: theme.colors.textPrimary }}>
              {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}
            </strong>
          </SummaryItem>
          <SummaryItem>
            <span style={{ color: theme.colors.textSecondary }}>Schedule:</span>
            <strong style={{ color: theme.colors.textPrimary }}>
              {selectedSchedule?.name || 'Not selected'}
            </strong>
          </SummaryItem>
          <SummaryItem>
            <span style={{ color: theme.colors.textSecondary }}>Route:</span>
            <strong style={{ color: theme.colors.textPrimary }}>
              {selectedRoute?.name || 'Not selected'}
            </strong>
          </SummaryItem>
          <SummaryItem>
            <span style={{ color: theme.colors.textSecondary }}>Total Duties:</span>
            <strong style={{ color: theme.colors.primary }}>{dutyTemplates.length}</strong>
          </SummaryItem>
        </SummaryCard>

        <h4 style={{ color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>Duty Templates</h4>
        
        {dutyTemplates.length === 0 ? (
          <EmptyState>No duty templates found for this schedule.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Vehicle Block</TableHeaderCell>
                <TableHeaderCell>Driver Run</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {dutyTemplates.map((template, index) => {
                const startTime = new Date(template.startTime).toTimeString().slice(0, 5);
                const endTime = new Date(template.endTime).toTimeString().slice(0, 5);
                
                return (
                  <TableRow key={template.id || index}>
                    <TableCell>
                      <span style={{ fontFamily: 'monospace' }}>
                        {startTime} - {endTime}
                      </span>
                    </TableCell>
                    <TableCell>{template.dutyType}</TableCell>
                    <TableCell $bgColor={template.vehicleBlockCode ? template.vehicleBlockColor : undefined}>
                      {template.vehicleBlockCode ? (
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: '600',
                          color: template.vehicleBlockColor || '#3b82f6'
                        }}>
                          {template.vehicleBlockCode}
                        </span>
                      ) : (
                        <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell $bgColor={template.driverRunCode ? template.driverRunColor : undefined}>
                      {template.driverRunCode ? (
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: '600',
                          color: template.driverRunColor || '#8b5cf6'
                        }}>
                          {template.driverRunCode}
                        </span>
                      ) : (
                        <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </StepContent>
    );
  };

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Create Duties from Schedule</PageTitle>
        <HeaderActions>
          <Button variant="secondary" onClick={handleCancel}>
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Cancel
          </Button>
        </HeaderActions>
      </PageHeader>

      <StepContainer>
        <StepIndicator>
          {steps.map((step) => {
            const IconComponent = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <Step key={step.number} active={isActive} completed={isCompleted}>
                <StepNumber active={isActive} completed={isCompleted}>
                  {isCompleted ? <FiCheck size={14} /> : step.number}
                </StepNumber>
                <IconComponent size={16} />
                {step.title}
              </Step>
            );
          })}
        </StepIndicator>

        <FormCard>
          {renderStepContent()}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border}`
          }}>
            <Button 
              variant="secondary" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Previous
            </Button>
            
            {currentStep < 2 ? (
              <Button variant="primary" onClick={handleNext}>
                Next
                <FiArrowRight style={{ marginLeft: '8px' }} />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={isSubmitting || dutyTemplates.length === 0}
              >
                {isSubmitting ? 'Creating...' : `Create ${dutyTemplates.length} Duties`}
              </Button>
            )}
          </div>
        </FormCard>
      </StepContainer>
    </PageContainer>
  );
};

export default CreateDuty;
