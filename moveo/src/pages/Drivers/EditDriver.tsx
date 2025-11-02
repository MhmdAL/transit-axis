import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditDriver: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    qid: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDriver = async () => {
      if (!id) return;
      
      try {
        const driver = await dataService.getDriverById(id);
        if (driver) {
          setFormData({
            name: driver.name,
            qid: driver.qid,
            phone: driver.phone,
            email: driver.email || ''
          });
        } else {
          alert('Driver not found');
          navigate('/drivers');
        }
      } catch (error) {
        console.error('Error loading driver:', error);
        alert('Failed to load driver data');
        navigate('/drivers');
      } finally {
        setIsLoading(false);
      }
    };

    loadDriver();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Driver name is required');
    }

    if (!formData.qid.trim()) {
      newErrors.push('QID is required');
    }

    if (!formData.phone.trim()) {
      newErrors.push('Phone number is required');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    
    try {
      await dataService.updateDriver(id, formData);
      navigate('/drivers');
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/drivers');
  };

  if (isLoading) {
    return (
      <PageContainer className="fade-in">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading driver data...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={handleCancel}>
            <FiArrowLeft size={18} />
          </BackButton>
          <PageTitle>Edit Driver</PageTitle>
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
            {isSubmitting ? 'Updating...' : 'Update Driver'}
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
                hasError={errors.length > 0}
              />
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
                hasError={errors.length > 0}
              />
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
                hasError={errors.length > 0}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
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

export default EditDriver;
