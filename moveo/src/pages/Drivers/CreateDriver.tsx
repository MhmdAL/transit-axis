import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSave, FiArrowLeft } from 'react-icons/fi';
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
import { Driver } from '../../types';
import { dataService } from '../../services/dataService';

interface DriverFormData {
  name: string;
  qid: string;
  phone: string;
  email: string;
}

const CreateDriver: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    qid: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<Partial<DriverFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof DriverFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DriverFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Driver name is required';
    }

    if (!formData.qid.trim()) {
      newErrors.qid = 'QID is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dataService.createDriver(formData);
      navigate('/drivers');
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Failed to create driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/drivers');
  };

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={handleCancel}>
            <FiArrowLeft size={18} />
          </BackButton>
          <PageTitle>Create New Driver</PageTitle>
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
            {isSubmitting ? 'Creating...' : 'Create Driver'}
          </Button>
        </HeaderActions>
      </PageHeader>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="name">Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter driver name"
                hasError={!!errors.name}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="qid">QID *</Label>
              <Input
                type="text"
                id="qid"
                name="qid"
                value={formData.qid}
                onChange={handleInputChange}
                placeholder="Enter QID"
                hasError={!!errors.qid}
              />
              {errors.qid && <ErrorMessage>{errors.qid}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                hasError={!!errors.phone}
              />
              {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                hasError={!!errors.email}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

          </FormGrid>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CreateDriver;