import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiMap } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  HeaderActions,
  FormCard,
  FormGrid,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  ErrorMessage,
  BackButton
} from '../../components/Common/CommonStyles';
import { Route, Trip } from '../../types';
import { dataService } from '../../services/dataService';

interface TripFormData {
  code: string;
  routeId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  notes: string;
}

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TripFormData>>({});
  const [formData, setFormData] = useState<TripFormData>({
    code: '',
    routeId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    notes: ''
  });

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await dataService.getRoutes();
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
      }
    };

    loadRoutes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof TripFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TripFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Trip code is required';
    }

    if (!formData.routeId) {
      newErrors.routeId = 'Route selection is required';
    }

    if (!formData.scheduledStartTime) {
      newErrors.scheduledStartTime = 'Start time is required';
    }

    if (!formData.scheduledEndTime) {
      newErrors.scheduledEndTime = 'End time is required';
    }

    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const startTime = new Date(formData.scheduledStartTime);
      const endTime = new Date(formData.scheduledEndTime);
      
      if (endTime <= startTime) {
        newErrors.scheduledEndTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      const newTrip = {
        routeId: formData.routeId,
        scheduledStartTime: new Date(formData.scheduledStartTime).toString(),
        scheduledEndTime: new Date(formData.scheduledEndTime).toString(),
      };

      console.log('Creating trip:', newTrip);
      
      // Simulate delay
      await dataService.createTrip(newTrip);
      
      navigate('/trips');
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/trips');
  };

  const selectedRoute = routes.find(route => route.id === formData.routeId);

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={handleCancel}>
            <FiX size={18} />
          </BackButton>
          <PageTitle>Create New Trip</PageTitle>
        </div>
        <HeaderActions>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            <FiSave />
            {loading ? 'Creating...' : 'Create Trip'}
          </Button>
        </HeaderActions>
      </PageHeader>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="code">Trip Code *</Label>
              <Input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., TR001"
                hasError={!!errors.code}
              />
              {errors.code && <ErrorMessage>{errors.code}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="routeId">Route *</Label>
              <Select
                id="routeId"
                name="routeId"
                value={formData.routeId}
                onChange={handleInputChange}
                hasError={!!errors.routeId}
              >
                <option value="">Select a route</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </Select>
              {errors.routeId && <ErrorMessage>{errors.routeId}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="scheduledStartTime">Scheduled Start Time *</Label>
              <Input
                type="datetime-local"
                id="scheduledStartTime"
                name="scheduledStartTime"
                value={formData.scheduledStartTime}
                onChange={handleInputChange}
                hasError={!!errors.scheduledStartTime}
              />
              {errors.scheduledStartTime && <ErrorMessage>{errors.scheduledStartTime}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="scheduledEndTime">Scheduled End Time *</Label>
              <Input
                type="datetime-local"
                id="scheduledEndTime"
                name="scheduledEndTime"
                value={formData.scheduledEndTime}
                onChange={handleInputChange}
                hasError={!!errors.scheduledEndTime}
              />
              {errors.scheduledEndTime && <ErrorMessage>{errors.scheduledEndTime}</ErrorMessage>}
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label htmlFor="notes">Notes</Label>
              <TextArea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional trip notes..."
                rows={3}
              />
            </FormGroup>

            {selectedRoute && (
              <FormGroup style={{ gridColumn: '1 / -1' }}>
                <Label>Route Details</Label>
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiMap size={16} />
                  {/* <div>
                    <strong>{selectedRoute.name}</strong>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      {selectedRoute.startLocation.address} → {selectedRoute.endLocation.address}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      Distance: {selectedRoute.estimatedDistance} km • Duration: {selectedRoute.estimatedDuration} min
                    </div>
                  </div> */}
                </div>
              </FormGroup>
            )}
          </FormGrid>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CreateTrip;
