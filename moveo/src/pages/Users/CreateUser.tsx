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
import { dataService } from '../../services/dataService';

interface UserFormData {
  name: string;
  qid: string;
  email: string;
  phone: string;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    qid: '',
    email: '',
    phone: ''
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

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Name is required');
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

    setIsSubmitting(true);
    
    try {
      await dataService.createUser(formData);
      navigate('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      setErrors([error.message || 'Failed to create user. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton onClick={handleCancel}>
            <FiArrowLeft size={18} />
          </BackButton>
          <PageTitle>Create New User</PageTitle>
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
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </HeaderActions>
      </PageHeader>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                hasError={errors.length > 0}
              />
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
                hasError={errors.length > 0}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone "
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
                placeholder="Enter qid "
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

export default CreateUser;
