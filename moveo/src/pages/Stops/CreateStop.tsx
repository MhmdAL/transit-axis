import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiSave, FiArrowLeft } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Card, Button, Input, Select } from '../../styles/GlobalStyles';
import InteractiveMap from '../../components/Map/InteractiveMap';
import { Stop } from '../../types';
import { dataService } from '../../services/dataService';

const CreateStopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const BackButton = styled(Button)`
  padding: ${theme.spacing.sm};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const FormCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const RequiredIndicator = styled.span`
  color: ${theme.colors.error};
`;

const LocationInfo = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const LocationIcon = styled.div`
  color: ${theme.colors.primary};
`;

const LocationText = styled.div`
  flex: 1;
`;

const LocationCoords = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const LocationAddress = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const CreateStop: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !selectedLocation) {
      alert('Please fill in all required fields and select a location on the map.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const newStop = {
        name: formData.name,
        code: formData.code,
        lat: selectedLocation.lat,
        lon: selectedLocation.lng
      };

      await dataService.createStop(newStop);
      
      // Navigate back to stops list
      navigate('/stops');
    } catch (error) {
      console.error('Error creating stop:', error);
      alert('Error creating stop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/stops');
  };

  return (
    <CreateStopContainer className="fade-in">
      <PageHeader>
        <BackButton variant="secondary" onClick={handleCancel}>
          <FiArrowLeft />
        </BackButton>
        <PageTitle>Create New Stop</PageTitle>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormSection>
            <SectionTitle>
              <FiMapPin />
              Stop Information
            </SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label>
                  Stop Name <RequiredIndicator>*</RequiredIndicator>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter stop name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>
                  Stop Code <RequiredIndicator>*</RequiredIndicator>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter stop code (e.g., WH001)"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FiMapPin />
              Location Selection <RequiredIndicator>*</RequiredIndicator>
            </SectionTitle>
            
            <InteractiveMap
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
            
            {selectedLocation && (
              <LocationInfo>
                <LocationIcon>
                  <FiMapPin size={20} />
                </LocationIcon>
                <LocationText>
                  <LocationCoords>
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </LocationCoords>
                  <LocationAddress>
                    Selected location coordinates
                  </LocationAddress>
                </LocationText>
              </LocationInfo>
            )}
          </FormSection>

          <ActionButtons>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              <FiSave />
              {isSubmitting ? 'Creating...' : 'Create Stop'}
            </Button>
          </ActionButtons>
        </FormCard>
      </form>
    </CreateStopContainer>
  );
};

export default CreateStop;


