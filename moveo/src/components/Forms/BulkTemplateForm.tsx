import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiClock, FiSettings } from 'react-icons/fi';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { DutyTemplate } from '../../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
`;

const ModalContent = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${props => props.hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${props => props.hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  ${props => props.variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryHover};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background: transparent;
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.textSecondary};
    }
  `}
`;

const PreviewSection = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`;

const PreviewTitle = styled.h4`
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const PreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  max-height: 200px;
  overflow-y: auto;
`;

const PreviewItem = styled.div<{ dutyType: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => {
    switch (props.dutyType) {
      case 'TRIP': return `${theme.colors.primary}10`;
      case 'WASHING': return '#8b5cf610';
      case 'MAINTENANCE': return '#f59e0b10';
      default: return `${theme.colors.surface}`;
    }
  }};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${props => {
    switch (props.dutyType) {
      case 'TRIP': return theme.colors.primary;
      case 'WASHING': return '#8b5cf6';
      case 'MAINTENANCE': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  }};
`;

const PreviewTime = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  font-family: monospace;
`;

const PreviewName = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const InfoText = styled.div`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.sm};
`;

interface BulkTemplateFormProps {
  onClose: () => void;
  onSave: (templates: Omit<DutyTemplate, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>[]) => void;
  existingTemplates?: DutyTemplate[];
  embedded?: boolean; // If true, render without row wrapper
}

const BulkTemplateForm: React.FC<BulkTemplateFormProps> = ({
  onClose,
  onSave,
  existingTemplates = [],
  embedded = false
}) => {
  const [formData, setFormData] = useState({
    startTime: '04:00',
    endTime: '22:00',
    interval: 30, // minutes
    duration: 30, // minutes per template
    breakDuration: 0 // minutes between templates
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Array<{startTime: string, endTime: string}>>([]);

  const generatePreview = useCallback(() => {
    const templates: Array<{startTime: string, endTime: string}> = [];
    
    try {
      const startHour = parseInt(String(formData.startTime).split(':')[0]);
      const startMinute = parseInt(String(formData.startTime).split(':')[1]);
      const endHour = parseInt(String(formData.endTime).split(':')[0]);
      const endMinute = parseInt(String(formData.endTime).split(':')[1]);
      
      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        setPreview([]);
        return;
      }
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (startMinutes >= endMinutes) {
        setPreview([]);
        return;
      }
      
      const interval = Number(formData.interval) || 15;
      const duration = Number(formData.duration) || 30;
      const breakDuration = Number(formData.breakDuration) || 0;
      
      let currentMinutes = startMinutes;
      
      while (currentMinutes + duration <= endMinutes) {
        const startTime = new Date(2000, 0, 1, Math.floor(currentMinutes / 60), currentMinutes % 60);
        const endTime = new Date(2000, 0, 1, Math.floor((currentMinutes + duration) / 60), (currentMinutes + duration) % 60);
        
        templates.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        });
        
        currentMinutes += interval + breakDuration;
      }
      
      setPreview(templates);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreview([]);
    }
  }, [formData.startTime, formData.endTime, formData.interval, formData.duration, formData.breakDuration]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const startMinutes = parseInt(formData.startTime.split(':')[0]) * 60 + parseInt(formData.startTime.split(':')[1]);
      const endMinutes = parseInt(formData.endTime.split(':')[0]) * 60 + parseInt(formData.endTime.split(':')[1]);
      
      if (startMinutes >= endMinutes) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.interval < 1) {
      newErrors.interval = 'Interval must be at least 1 minute';
    }

    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }

    // Warn if duration + break is longer than interval (will create overlapping schedules)
    if (formData.interval > 0 && formData.duration + formData.breakDuration > formData.interval) {
      // This is just a warning, not an error - overlapping schedules are allowed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (preview.length === 0) {
      setErrors({ general: 'No templates would be generated with these settings' });
      return;
    }

    onSave(preview.map(template => ({
      startTime: template.startTime,
      endTime: template.endTime,
      dutyType: 'TRIP' as const
    })));
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Parse numeric values for interval, duration, and breakDuration
    const numericFields = ['interval', 'duration', 'breakDuration'];
    const parsedValue = numericFields.includes(name) ? parseInt(value) || 0 : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString;
    }
  };

  const formContent = (
    <Form onSubmit={handleSubmit}>
          <Grid>
            <FormGroup>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                hasError={!!errors.startTime}
              />
              {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                hasError={!!errors.endTime}
              />
              {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
            </FormGroup>
          </Grid>

          <Grid>
            <FormGroup>
              <Label htmlFor="interval">Interval (minutes) *</Label>
              <Input
                type="number"
                id="interval"
                name="interval"
                value={formData.interval}
                onChange={handleInputChange}
                min="5"
                max="1440"
                hasError={!!errors.interval}
              />
              {errors.interval && <ErrorMessage>{errors.interval}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="duration">Trip Duration (minutes) *</Label>
              <Input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="5"
                max="480"
                hasError={!!errors.duration}
              />
              {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
            </FormGroup>
          </Grid>

          <FormGroup>
            <Label htmlFor="breakDuration">Break Between Trips (minutes)</Label>
            <Input
              type="number"
              id="breakDuration"
              name="breakDuration"
              value={formData.breakDuration}
              onChange={handleInputChange}
              min="0"
              max="60"
            />
          </FormGroup>

          {preview.length > 0 && (
            <PreviewSection>
              <PreviewTitle>Preview ({preview.length} templates will be created)</PreviewTitle>
              <PreviewList>
                {preview.slice(0, 10).map((template, index) => (
                  <PreviewItem key={index} dutyType="TRIP">
                    <PreviewName>Trip {index + 1}</PreviewName>
                    <PreviewTime>
                      {formatTime(template.startTime)} - {formatTime(template.endTime)}
                    </PreviewTime>
                  </PreviewItem>
                ))}
                {preview.length > 10 && (
                  <InfoText>... and {preview.length - 10} more templates</InfoText>
                )}
              </PreviewList>
              <InfoText>
                Templates will be created every {formData.interval} minutes from {formData.startTime} to {formData.endTime}
              </InfoText>
            </PreviewSection>
          )}

          {preview.length === 0 && formData.startTime && formData.endTime && (
            <PreviewSection>
              <InfoText style={{ color: theme.colors.warning }}>
                ⚠️ No templates will be generated with these settings. 
                {formData.duration > 0 && formData.interval > 0 && (
                  <span> Adjust the time range, interval ({formData.interval}min), or duration ({formData.duration}min) to create templates.</span>
                )}
              </InfoText>
            </PreviewSection>
          )}

          {errors.general && (
            <ErrorMessage>{errors.general}</ErrorMessage>
          )}

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={preview.length === 0}>
              <FiClock size={16} />
              Create {preview.length} Templates
            </Button>
          </ButtonGroup>
        </Form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Bulk Create Templates</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiSettings size={20} />
          </CloseButton>
        </ModalHeader>
        {formContent}
      </ModalContent>
    </ModalOverlay>
  );
};

export default BulkTemplateForm;
