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
import { dataService } from '../../services/dataService';

interface UserFormData {
  name: string;
  username: string;
}

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      
      try {
        // For now, we'll get the user from the users list
        // In a real app, you'd have a get user by ID endpoint
        const response = await dataService.getUsers({ page: 1, limit: 1000 });
        const user = response.find(u => u.id === id);
        
        if (user) {
          setFormData({
            name: user.name,
            username: user.username
          });
        } else {
          alert('User not found');
          navigate('/users');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        alert('Failed to load user data');
        navigate('/users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
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
      newErrors.push('Name is required');
    }

    if (!formData.username.trim()) {
      newErrors.push('Username is required');
    } else if (formData.username.length < 3) {
      newErrors.push('Username must be at least 3 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.push('Username can only contain letters, numbers, and underscores');
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
      // TODO: Implement update user API
      console.log('Update user:', id, formData);
      alert('User update functionality not implemented yet');
      navigate('/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      setErrors([error.message || 'Failed to update user. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoading) {
    return (
      <PageContainer className="fade-in">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading user data...</div>
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
          <PageTitle>Edit User</PageTitle>
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
            {isSubmitting ? 'Updating...' : 'Update User'}
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
              <Label htmlFor="username">Username *</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username (letters, numbers, underscores only)"
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

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        backgroundColor: '#fef3c7', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '0.875rem' }}>
          <FiUser style={{ marginRight: '0.5rem' }} />
          Note
        </h4>
        <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem' }}>
          User update functionality is not yet implemented. This is a placeholder page.
        </p>
      </div>
    </PageContainer>
  );
};

export default EditUser;
