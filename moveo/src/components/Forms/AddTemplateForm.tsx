import React, { useState } from 'react';
import { FiX, FiClock } from 'react-icons/fi';
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
  max-width: 500px;
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

const TimeInputGroup = styled.div`
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

const DutyTypeOption = styled.div<{ dutyType: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  background: ${props => {
    switch (props.dutyType) {
      case 'TRIP': return `${theme.colors.primary}10`;
      case 'WASHING': return '#8b5cf610';
      case 'MAINTENANCE': return '#f59e0b10';
      default: return `${theme.colors.surface}`;
    }
  }};
  border: 1px solid ${props => {
    switch (props.dutyType) {
      case 'TRIP': return `${theme.colors.primary}30`;
      case 'WASHING': return '#8b5cf630';
      case 'MAINTENANCE': return '#f59e0b30';
      default: return theme.colors.border;
    }
  }};
`;

const DutyTypeIcon = styled.div<{ dutyType: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => {
    switch (props.dutyType) {
      case 'TRIP': return `${theme.colors.primary}20`;
      case 'WASHING': return '#8b5cf620';
      case 'MAINTENANCE': return '#f59e0b20';
      default: return `${theme.colors.textMuted}20`;
    }
  }};
  color: ${props => {
    switch (props.dutyType) {
      case 'TRIP': return theme.colors.primary;
      case 'WASHING': return '#8b5cf6';
      case 'MAINTENANCE': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  }};
`;

interface AddTemplateFormProps {
  onClose: () => void;
  onSave: (template: Omit<DutyTemplate, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>) => void;
  existingTemplates?: DutyTemplate[];
  embedded?: boolean; // If true, render without modal wrapper
}

const AddTemplateForm: React.FC<AddTemplateFormProps> = ({
  onClose,
  onSave,
  existingTemplates = [],
  embedded = false
}) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(`2000-01-01T${formData.endTime}`);
      
      if (startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time';
      }

      // Check for overlaps with existing templates
      const newStart = new Date(`2000-01-01T${formData.startTime}`);
      const newEnd = new Date(`2000-01-01T${formData.endTime}`);
      
      const hasOverlap = existingTemplates.some(template => {
        const existingStart = new Date(template.startTime);
        const existingEnd = new Date(template.endTime);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (hasOverlap) {
        newErrors.startTime = 'This time overlaps with an existing template';
        newErrors.endTime = 'This time overlaps with an existing template';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const templateData = {
      startTime: `2000-01-01T${formData.startTime}`,
      endTime: `2000-01-01T${formData.endTime}`,
      dutyType: 'TRIP' as const
    };

    onSave(templateData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formContent = (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <TimeInputGroup>
          <div>
            <Label htmlFor="startTime">Start Time: </Label>
            <Input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              hasError={!!errors.startTime}
            />
            {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
          </div>
          <div>
            <Label htmlFor="endTime">End Time: </Label>
            <Input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              hasError={!!errors.endTime}
            />
            {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
          </div>
        </TimeInputGroup>
      </FormGroup>

      <ButtonGroup>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          <FiClock size={16} />
          Add Template
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
          <ModalTitle>Add Duty Template</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        {formContent}
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddTemplateForm;
