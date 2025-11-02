import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiSave, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer,
  PageHeader,
  PageTitle,
  HeaderActions,
  BackButton,
  FormCard,
  FormGrid,
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../../components/Common/CommonStyles';
import { Vehicle, VehicleModel } from '../../types';
import { dataService } from '../../services/dataService';
import VehicleModelSearchDropdown from '../../components/UI/DropDowns/VehicleModelSearchDropdown';

interface VehicleFormData {
  plateNo: string;
  fleetNo: string;
  vehicleModel: VehicleModel | null;
}

const CreateVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VehicleFormData>({
    plateNo: '',
    fleetNo: '',
    vehicleModel: null
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleVehicleModelChange = (model: VehicleModel | null) => {
    setFormData(prev => ({ ...prev, vehicleModel: model }));
    
    // Clear errors when user selects a model
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.plateNo.trim()) {
      newErrors.push('Plate number is required');
    }

    if (!formData.fleetNo.trim()) {
      newErrors.push('Fleet number is required');
    }

    if (!formData.vehicleModel) {
      newErrors.push('Vehicle model is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const vehicleData = {
        plateNo: formData.plateNo,
        fleetNo: formData.fleetNo,
        vehicleModelId: formData.vehicleModel?.id || 0,
      };  
      
      await dataService.createVehicle(vehicleData);
      navigate('/vehicles');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to create vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={handleCancel}>
            <FiArrowLeft size={18} />
          </BackButton>
          <PageTitle>Create New Vehicle</PageTitle>
        </div>
        <HeaderActions>
          <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <FiSave />
            {isSubmitting ? 'Creating...' : 'Create Vehicle'}
          </Button>
        </HeaderActions>
      </PageHeader>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="plateNo">Plate Number *</Label>
              <Input
                type="text"
                id="plateNo"
                name="plateNo"
                value={formData.plateNo}
                onChange={handleInputChange}
                placeholder="e.g., ABC-123"
                hasError={errors.length > 0}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="fleetNo">Fleet Number *</Label>
              <Input
                type="text"
                id="fleetNo"
                name="fleetNo"
                value={formData.fleetNo}
                onChange={handleInputChange}
                placeholder="e.g., FL001"
                hasError={errors.length > 0}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="vehicleModel">Vehicle Model *</Label>
              <VehicleModelSearchDropdown
                value={formData.vehicleModel}
                onChange={handleVehicleModelChange}
                placeholder="Search for vehicle model..."
                hasError={errors.length > 0}
              />
            </FormGroup>

            {errors.length > 0 && (
              <FormGroup>
                {errors.map((error, index) => (
                  <ErrorMessage key={index}>{error}</ErrorMessage>
                ))}
              </FormGroup>
            )}
          </FormGrid>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CreateVehicle;