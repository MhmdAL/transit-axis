import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiTrash2, FiClock, FiTruck, FiDroplet, FiX, FiEdit2, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { DutyTemplate } from '../../types';
import { apiService } from '../../services/apiService';
import AddTemplateForm from './AddTemplateForm';
import BulkTemplateForm from './BulkTemplateForm';

const TemplateManagerContainer = styled.div`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h3`
  color: ${theme.colors.textPrimary};
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const AddButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border};
  margin-bottom: ${theme.spacing.lg};
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.textSecondary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.primary};
    background: ${theme.colors.surfaceHover};
  }
`;

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

const TimelineContainer = styled.div`
  position: relative;
  min-height: 200px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const TimelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 1px;
  height: 120px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`;

const HourLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.surface};
`;

const TemplateBlock = styled.div<{ 
  startHour: number; 
  duration: number; 
  dutyType: string;
  isOverlapping?: boolean;
}>`
  position: absolute;
  top: 40px;
  left: ${props => (props.startHour / 24) * 100}%;
  width: ${props => (props.duration / 24) * 100}%;
  height: 40px;
  background: ${props => {
    if (props.isOverlapping) return theme.colors.error;
    switch (props.dutyType) {
      case 'TRIP': return theme.colors.primary;
      case 'WASHING': return '#8b5cf6';
      case 'MAINTENANCE': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  }};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${theme.spacing.sm};
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const TemplateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex: 1;
  min-width: 0;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${TemplateBlock}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 2px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TemplatesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${theme.spacing.xs};
`;

const TemplateItem = styled.div<{ dutyType: string }>`
  position: relative;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${props => {
    switch (props.dutyType) {
      case 'TRIP': return theme.colors.primary;
      case 'WASHING': return '#8b5cf6';
      case 'MAINTENANCE': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  }};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${props => {
      switch (props.dutyType) {
        case 'TRIP': return theme.colors.primary;
        case 'WASHING': return '#8b5cf6';
        case 'MAINTENANCE': return '#f59e0b';
        default: return theme.colors.textMuted;
      }
    }};
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const TemplateTime = styled.div`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  font-family: monospace;
  line-height: 1.4;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  background: ${theme.colors.error};
  color: white;
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
  font-size: 10px;
  padding: 0;

  &:hover {
    background: ${theme.colors.error};
    opacity: 1 !important;
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.textMuted};
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error}20;
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${props => props.active ? theme.colors.primary : theme.colors.border};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.border};
`;

const SectionTitle = styled.h4`
  color: ${theme.colors.textPrimary};
  margin: 0;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;
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

const TableBody = styled.tbody`
  & > tr:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const TableRow = styled.tr<{ expanded?: boolean }>`
  background: ${props => props.expanded ? theme.colors.surfaceHover : theme.colors.card};
  transition: background 0.2s ease;

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
  transition: all 0.2s ease;
  
  ${props => props.$bgColor && `
    &:hover {
      background: color-mix(in srgb, ${props.$bgColor} 25%, transparent);
    }
  `}
`;

const CodeGroupRow = styled(TableRow)`
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${theme.colors.surface};
`;

const ExpandIcon = styled.div`
  display: inline-flex;
  align-items: center;
  margin-right: ${theme.spacing.xs};
`;

const CodeCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const EditableCode = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex: 1;
`;

const CodeInput = styled.input`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-family: monospace;
  color: ${theme.colors.textPrimary};
  min-width: 100px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const CodeDisplay = styled.span`
  font-family: monospace;
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EditButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${CodeCell}:hover & {
    opacity: 1;
  }

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.primary};
  }
`;

const SaveButton = styled.button`
  background: ${theme.colors.primary};
  border: none;
  color: white;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const TemplateRow = styled(TableRow)`
  background: ${theme.colors.card};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const NestedTemplateCell = styled(TableCell)`
  padding-left: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Select = styled.select`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ActionCell = styled(TableCell)`
  text-align: right;
  width: 80px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.error};
  }
`;

const Badge = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 2px ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}40;
`;

const EmptyCodeGroup = styled.div`
  padding: ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const CodeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

const CodeItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-family: monospace;
  font-size: ${theme.typography.fontSize.sm};
`;

const CodeInputSmall = styled.input`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-family: monospace;
  width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const SmallButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const SmallIconButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.error};
  }
`;

export interface CodeColor {
  code: string;
  color: string;
}

interface TripTemplateManagerProps {
  scheduleId?: string;
  templates: DutyTemplate[];
  onTemplatesChange: (templates: DutyTemplate[]) => void;
  onError?: (error: string) => void;
  vehicleBlockCodes: CodeColor[];
  driverRunCodes: CodeColor[];
  onBlockCodesChange?: (codes: CodeColor[]) => void;
  onRunCodesChange?: (codes: CodeColor[]) => void;
  readOnly?: boolean;
}

const TripTemplateManager: React.FC<TripTemplateManagerProps> = ({
  scheduleId,
  templates,
  onTemplatesChange,
  onError,
  vehicleBlockCodes,
  driverRunCodes,
  onBlockCodesChange,
  onRunCodesChange,
  readOnly = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formMode, setFormMode] = useState<'single' | 'bulk'>('single');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Get code strings for dropdowns
  const allBlockCodes = useMemo(() => {
    return vehicleBlockCodes.map(c => c.code).sort();
  }, [vehicleBlockCodes]);

  const allRunCodes = useMemo(() => {
    return driverRunCodes.map(c => c.code).sort();
  }, [driverRunCodes]);

  const getDutyTypeIcon = (dutyType: string) => {
    switch (dutyType) {
      case 'TRIP': return <FiTruck size={14} />;
      case 'WASHING': return <FiDroplet size={14} />;
      case 'MAINTENANCE': return <FiTruck size={14} />;
      default: return <FiClock size={14} />;
    }
  };

  const getDutyTypeLabel = (dutyType: string) => {
    switch (dutyType) {
      case 'TRIP': return 'Trip';
      case 'WASHING': return 'Washing';
      case 'MAINTENANCE': return 'Maintenance';
      default: return dutyType;
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

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    } catch {
      return 0;
    }
  };

  const calculateStartHour = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.getHours() + (date.getMinutes() / 60);
    } catch {
      return 0;
    }
  };

  const checkForOverlaps = (templates: DutyTemplate[]) => {
    const sortedTemplates = [...templates].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    for (let i = 0; i < sortedTemplates.length - 1; i++) {
      const current = sortedTemplates[i];
      const next = sortedTemplates[i + 1];
      
      const currentEnd = new Date(current.endTime).getTime();
      const nextStart = new Date(next.startTime).getTime();
      
      if (currentEnd > nextStart) {
        return true;
      }
    }
    return false;
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!scheduleId) {
      // For new schedules, just remove from local state
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      onTemplatesChange(updatedTemplates);
      return;
    }

    try {
      await apiService.deleteDutyTemplate(scheduleId, templateId);
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      onTemplatesChange(updatedTemplates);
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
      onError?.('Failed to delete template');
    }
  };

  const handleAddTemplate = async (templateData: Omit<DutyTemplate, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>) => {
    if (!scheduleId) {
      // For new schedules, add to local state with temporary ID
      const newTemplate: DutyTemplate = {
        ...templateData,
        id: `temp-${Date.now()}`,
        scheduleId: 'temp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onTemplatesChange([...templates, newTemplate]);
      return;
    }

    try {
      const newTemplate = await apiService.createDutyTemplate(scheduleId, {
        ...templateData,
        scheduleId
      });
      onTemplatesChange([...templates, newTemplate]);
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
      onError?.('Failed to create template');
    }
  };

  const handleBulkAddTemplates = async (templatesData: Omit<DutyTemplate, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>[]) => {
    if (!scheduleId) {
      // For new schedules, add to local state with temporary IDs
      const newTemplates: DutyTemplate[] = templatesData.map((templateData, index) => ({
        ...templateData,
        id: `temp-${Date.now()}-${index}`,
        scheduleId: 'temp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      onTemplatesChange([...templates, ...newTemplates]);
      return;
    }

    try {
      // Create templates one by one for existing schedules
      const newTemplates: DutyTemplate[] = [];
      for (const templateData of templatesData) {
        const newTemplate = await apiService.createDutyTemplate(scheduleId, {
          ...templateData,
          scheduleId
        });
        newTemplates.push(newTemplate);
      }
      onTemplatesChange([...templates, ...newTemplates]);
    } catch (error) {
      console.error('Error creating bulk templates:', error);
      setError('Failed to create some templates');
      onError?.('Failed to create some templates');
    }
  };

  const hasOverlaps = checkForOverlaps(templates);

  // Get color for a code
  const getBlockCodeColor = (code: string) => {
    const codeColor = vehicleBlockCodes.find(c => c.code === code);
    return codeColor?.color || theme.colors.primary;
  };

  const getRunCodeColor = (code: string) => {
    const codeColor = driverRunCodes.find(c => c.code === code);
    return codeColor?.color || '#8b5cf6';
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<DutyTemplate>) => {
    const updatedTemplates = templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    );

    if (!scheduleId) {
      onTemplatesChange(updatedTemplates);
      return;
    }

    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        await apiService.updateDutyTemplate(scheduleId, templateId, {
          ...updates,
          id: templateId,
          startTime: template.startTime,
          endTime: template.endTime,
          dutyType: template.dutyType,
          scheduleId: template.scheduleId
        });
      }
      onTemplatesChange(updatedTemplates);
    } catch (error) {
      console.error('Error updating template:', error);
      setError('Failed to update template');
      onError?.('Failed to update template');
    }
  };

  const handleAssignBlockCode = (templateId: string, code: string) => {
    handleUpdateTemplate(templateId, { vehicleBlockCode: code === '' ? undefined : code });
  };

  const handleAssignRunCode = (templateId: string, code: string) => {
    handleUpdateTemplate(templateId, { driverRunCode: code === '' ? undefined : code });
  };

  return (
    <TemplateManagerContainer>
      <Header>
        <Title>Duties</Title>
        {!readOnly && (
          <AddButton onClick={() => {
            setShowAddForm(true);
            setFormMode('single');
          }}>
            <FiPlus size={16} />
            Add
          </AddButton>
        )}
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <ViewToggle>
        <ToggleButton active={viewMode === 'table'} onClick={() => setViewMode('table')}>
          Table View
        </ToggleButton>
        <ToggleButton active={viewMode === 'timeline'} onClick={() => setViewMode('timeline')}>
          Timeline View
        </ToggleButton>
      </ViewToggle>

      {viewMode === 'timeline' && templates.length > 0 && (
        <TimelineContainer>
          <TimelineHeader>
            <span>Timeline View</span>
            <span>24 Hour Schedule</span>
          </TimelineHeader>
          
          <TimelineGrid>
            {Array.from({ length: 24 }, (_, i) => (
              <HourLabel key={i}>
                {i % 2 === 0 ? `${i}:00` : ''}
              </HourLabel>
            ))}
          </TimelineGrid>

          {templates.map((template) => (
            <TemplateBlock
              key={template.id}
              startHour={calculateStartHour(template.startTime)}
              duration={calculateDuration(template.startTime, template.endTime)}
              dutyType={template.dutyType}
              isOverlapping={hasOverlaps}
            >
              <TemplateInfo>
                {getDutyTypeIcon(template.dutyType)}
                <span>{formatTime(template.startTime)} - {formatTime(template.endTime)}</span>
              </TemplateInfo>
              {!readOnly && (
                <TemplateActions>
                  <ActionButton onClick={() => handleDeleteTemplate(template.id)}>
                    <FiTrash2 size={10} />
                  </ActionButton>
                </TemplateActions>
              )}
            </TemplateBlock>
          ))}
        </TimelineContainer>
      )}

      {viewMode === 'table' && (
        <>
          {/* Duties Table */}
          <Section>
            {templates.length === 0 ? (
              <EmptyState>
                <FiClock size={48} color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }} />
                <h4 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                  No Duty Templates
                </h4>
                <p>Add duty templates to define when trips, washing, or maintenance should occur.</p>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Time</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Vehicle Block</TableHeaderCell>
                    <TableHeaderCell>Driver Run</TableHeaderCell>
                    {!readOnly && <TableHeaderCell style={{ textAlign: 'right' }}>Actions</TableHeaderCell>}
                  </tr>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TemplateRow key={template.id}>
                      <TableCell>
                        {formatTime(template.startTime)} - {formatTime(template.endTime)}
                      </TableCell>
                      <TableCell>
                        <Badge color={
                          template.dutyType === 'TRIP' ? theme.colors.primary :
                          template.dutyType === 'WASHING' ? '#8b5cf6' : '#f59e0b'
                        }>
                          {getDutyTypeIcon(template.dutyType)}
                          {getDutyTypeLabel(template.dutyType)}
                        </Badge>
                      </TableCell>
                      <TableCell $bgColor={template.vehicleBlockCode ? getBlockCodeColor(template.vehicleBlockCode) : undefined}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, width: '100%' }}>
                          <Select
                            value={template.vehicleBlockCode || ''}
                            onChange={(e) => handleAssignBlockCode(template.id, e.target.value)}
                            disabled={readOnly}
                          >
                            <option value="">Unassigned</option>
                            {allBlockCodes.map(blockCode => (
                              <option key={blockCode} value={blockCode}>{blockCode}</option>
                            ))}
                            {template.vehicleBlockCode && !allBlockCodes.includes(template.vehicleBlockCode) && (
                              <option value={template.vehicleBlockCode}>{template.vehicleBlockCode}</option>
                            )}
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell $bgColor={template.driverRunCode ? getRunCodeColor(template.driverRunCode) : undefined}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, width: '100%' }}>
                          <Select
                            value={template.driverRunCode || ''}
                            onChange={(e) => handleAssignRunCode(template.id, e.target.value)}
                            disabled={readOnly}
                          >
                            <option value="">Unassigned</option>
                            {allRunCodes.map(runCode => (
                              <option key={runCode} value={runCode}>{runCode}</option>
                            ))}
                            {template.driverRunCode && !allRunCodes.includes(template.driverRunCode) && (
                              <option value={template.driverRunCode}>{template.driverRunCode}</option>
                            )}
                          </Select>
                        </div>
                      </TableCell>
                      {!readOnly && (
                        <ActionCell>
                          <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                            <FiTrash2 size={16} />
                          </IconButton>
                        </ActionCell>
                      )}
                    </TemplateRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </>
      )}

      {/* Add Form Modal with Tabs */}
      {showAddForm && (
        <ModalOverlay onClick={() => setShowAddForm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add Duty</ModalTitle>
              <CloseButton onClick={() => setShowAddForm(false)}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>

            <TabContainer>
              <Tab active={formMode === 'single'} onClick={() => setFormMode('single')}>
                Single
              </Tab>
              <Tab active={formMode === 'bulk'} onClick={() => setFormMode('bulk')}>
                Bulk
              </Tab>
            </TabContainer>

            {formMode === 'single' ? (
              <AddTemplateForm
                embedded={true}
                onClose={() => setShowAddForm(false)}
                onSave={(template) => {
                  handleAddTemplate(template);
                  setShowAddForm(false);
                }}
                existingTemplates={templates}
              />
            ) : (
              <BulkTemplateForm
                embedded={true}
                onClose={() => setShowAddForm(false)}
                onSave={(templates) => {
                  handleBulkAddTemplates(templates);
                  setShowAddForm(false);
                }}
                existingTemplates={templates}
              />
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </TemplateManagerContainer>
  );
};

export default TripTemplateManager;
