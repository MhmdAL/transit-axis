import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiX, FiCopy, FiEye } from 'react-icons/fi';
import styled from 'styled-components';
import { Button } from '../../styles/GlobalStyles';
import { theme } from '../../styles/theme';
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
  ErrorMessage
} from '../../components/Common/CommonStyles';
import { apiService } from '../../services/apiService';
import TripTemplateManager, { CodeColor } from '../../components/Forms/TripTemplateManager';
import MultiSelectSearchDropdown from '../../components/UI/DropDowns/MultiSelectSearchDropdown';
import { DutyTemplate, ServiceSchedule } from '../../types';

interface ServiceScheduleFormData {
  name: string;
}

const CodesContainer = styled.div`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const CodesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CodeColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const CodeColumnHeader = styled.h3`
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const CodeAddForm = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CodeInput = styled.input`
  flex: 1;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-family: monospace;
  color: ${theme.colors.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const AddButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CodeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.primary};
  }
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const CodeText = styled.span`
  flex: 1;
  font-family: monospace;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    color: ${theme.colors.error};
    background: ${theme.colors.error}10;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-style: italic;
  font-size: ${theme.typography.fontSize.sm};
`;

const CloneSection = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const CloneLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;
  min-width: 180px;
`;

const CloneDropdownWrapper = styled.div`
  flex: 1;
`;

// Generate a random vibrant color
const generateRandomColor = (): string => {
  // Generate HSL color with high saturation and medium lightness for vibrant colors
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 20); // 65-85%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const CreateServiceSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isViewMode = window.location.pathname.includes('/view/');
  
  const [formData, setFormData] = useState<ServiceScheduleFormData>({
    name: ''
  });
  const [errors, setErrors] = useState<Partial<ServiceScheduleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dutyTemplates, setDutyTemplates] = useState<DutyTemplate[]>([]);
  const [templateError, setTemplateError] = useState<string | null>(null);
  
  const [vehicleBlockCodes, setVehicleBlockCodes] = useState<CodeColor[]>([]);
  const [driverRunCodes, setDriverRunCodes] = useState<CodeColor[]>([]);
  const [newBlockCode, setNewBlockCode] = useState<string>('');
  const [newRunCode, setNewRunCode] = useState<string>('');
  
  // Clone functionality (only in create mode)
  const [selectedCloneSchedule, setSelectedCloneSchedule] = useState<ServiceSchedule[]>([]);

  // Load schedule data in view mode
  useEffect(() => {
    if (isViewMode && id) {
      loadScheduleForViewing(id);
    }
  }, [isViewMode, id]);

  const searchSchedules = async (searchTerm: string): Promise<ServiceSchedule[]> => {
    try {
      if (!searchTerm.trim()) {
        // Load all schedules when dropdown is opened
        return await apiService.getServiceSchedules();
      }
      const allSchedules = await apiService.getServiceSchedules();
      return allSchedules.filter(schedule =>
        schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching schedules:', error);
      return [];
    }
  };

  const handleCloneScheduleChange = (schedules: ServiceSchedule[]) => {
    // Only allow single selection
    if (schedules.length > 0) {
      const selectedSchedule = schedules[schedules.length - 1];
      setSelectedCloneSchedule([selectedSchedule]);
      handleCloneSelect(selectedSchedule.id);
    } else {
      setSelectedCloneSchedule([]);
      handleCloneSelect('');
    }
  };

  const loadScheduleForViewing = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      const schedule = await apiService.getServiceScheduleById(scheduleId);
      
      // Set form data without modification for viewing
      setFormData({
        name: schedule.name
      });

      // Load vehicle block templates and create a map of id -> code
      const vehicleBlockTemplates = (schedule as any).vehicleBlockTemplates || [];
      const vehicleBlocks = vehicleBlockTemplates.map((block: any) => ({
        code: block.code,
        color: block.color
      }));
      setVehicleBlockCodes(vehicleBlocks);
      
      const blockIdToCodeMap = new Map<string, string>();
      vehicleBlockTemplates.forEach((block: any) => {
        blockIdToCodeMap.set(block.id, block.code);
      });

      // Load driver run templates and create a map of id -> code
      const driverRunTemplates = (schedule as any).driverRunTemplates || [];
      const driverRuns = driverRunTemplates.map((run: any) => ({
        code: run.code,
        color: run.color
      }));
      setDriverRunCodes(driverRuns);
      
      const runIdToCodeMap = new Map<string, string>();
      driverRunTemplates.forEach((run: any) => {
        runIdToCodeMap.set(run.id, run.code);
      });

      // Load duty templates and map their block/run IDs to codes
      if (schedule.dutyTemplates) {
        const mappedTemplates = schedule.dutyTemplates.map((template: any) => ({
          ...template,
          vehicleBlockCode: template.vehicleBlockTemplateId 
            ? blockIdToCodeMap.get(template.vehicleBlockTemplateId) 
            : undefined,
          driverRunCode: template.driverRunTemplateId 
            ? runIdToCodeMap.get(template.driverRunTemplateId) 
            : undefined
        }));
        setDutyTemplates(mappedTemplates);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Failed to load schedule. Please try again.');
      navigate('/service-schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneSelect = async (scheduleId: string) => {
    if (!scheduleId) {
      // Clear form if deselected
      setFormData({ name: '' });
      setVehicleBlockCodes([]);
      setDriverRunCodes([]);
      setDutyTemplates([]);
      return;
    }

    try {
      const schedule = await apiService.getServiceScheduleById(scheduleId);
      
      // Set form data with a modified name for cloning
      setFormData({
        name: `${schedule.name} (Copy)`
      });

      // Load vehicle block templates and create a map of id -> code
      const vehicleBlockTemplates = (schedule as any).vehicleBlockTemplates || [];
      const vehicleBlocks = vehicleBlockTemplates.map((block: any) => ({
        code: block.code,
        color: block.color
      }));
      setVehicleBlockCodes(vehicleBlocks);
      
      const blockIdToCodeMap = new Map<string, string>();
      vehicleBlockTemplates.forEach((block: any) => {
        blockIdToCodeMap.set(block.id, block.code);
      });

      // Load driver run templates and create a map of id -> code
      const driverRunTemplates = (schedule as any).driverRunTemplates || [];
      const driverRuns = driverRunTemplates.map((run: any) => ({
        code: run.code,
        color: run.color
      }));
      setDriverRunCodes(driverRuns);
      
      const runIdToCodeMap = new Map<string, string>();
      driverRunTemplates.forEach((run: any) => {
        runIdToCodeMap.set(run.id, run.code);
      });

      // Load duty templates and map their block/run IDs to codes
      if (schedule.dutyTemplates) {
        const mappedTemplates = schedule.dutyTemplates.map((template: any) => ({
          ...template,
          vehicleBlockCode: template.vehicleBlockTemplateId 
            ? blockIdToCodeMap.get(template.vehicleBlockTemplateId) 
            : undefined,
          driverRunCode: template.driverRunTemplateId 
            ? runIdToCodeMap.get(template.driverRunTemplateId) 
            : undefined
        }));
        setDutyTemplates(mappedTemplates);
      }
    } catch (error) {
      console.error('Error loading schedule for cloning:', error);
      alert('Failed to load schedule for cloning. Please try again.');
    }
  };

  // Sync codes from templates
  useMemo(() => {
    const blockCodes = new Set<string>();
    const runCodes = new Set<string>();
    
    dutyTemplates.forEach(t => {
      if (t.vehicleBlockCode) blockCodes.add(t.vehicleBlockCode);
      if (t.driverRunCode) runCodes.add(t.driverRunCode);
    });

    // Add codes from templates that aren't in state yet
    const currentBlockCodes = new Set(vehicleBlockCodes.map(c => c.code));
    const currentRunCodes = new Set(driverRunCodes.map(c => c.code));
    
    const newBlockCodes = Array.from(blockCodes).filter(c => !currentBlockCodes.has(c));
    const newRunCodes = Array.from(runCodes).filter(c => !currentRunCodes.has(c));

    if (newBlockCodes.length > 0) {
      setVehicleBlockCodes(prev => [
        ...prev,
        ...newBlockCodes.map((code) => ({
          code,
          color: generateRandomColor()
        }))
      ]);
    }

    if (newRunCodes.length > 0) {
      setDriverRunCodes(prev => [
        ...prev,
        ...newRunCodes.map((code) => ({
          code,
          color: generateRandomColor()
        }))
      ]);
    }
  }, [dutyTemplates]);

  const handleAddBlockCode = () => {
    const code = newBlockCode.trim();
    if (code && !vehicleBlockCodes.find(c => c.code === code)) {
      const color = generateRandomColor();
      setVehicleBlockCodes([...vehicleBlockCodes, { code, color }]);
      setNewBlockCode('');
    }
  };

  const handleRemoveBlockCode = (code: string) => {
    setVehicleBlockCodes(vehicleBlockCodes.filter(c => c.code !== code));
    // Remove code from templates
    setDutyTemplates(templates => templates.map(t => 
      t.vehicleBlockCode === code ? { ...t, vehicleBlockCode: undefined } : t
    ));
  };

  const handleAddRunCode = () => {
    const code = newRunCode.trim();
    if (code && !driverRunCodes.find(c => c.code === code)) {
      const color = generateRandomColor();
      setDriverRunCodes([...driverRunCodes, { code, color }]);
      setNewRunCode('');
    }
  };

  const handleRemoveRunCode = (code: string) => {
    setDriverRunCodes(driverRunCodes.filter(c => c.code !== code));
    // Remove code from templates
    setDutyTemplates(templates => templates.map(t => 
      t.driverRunCode === code ? { ...t, driverRunCode: undefined } : t
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ServiceScheduleFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceScheduleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required';
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
      const scheduleData = {
        name: formData.name,
        vehicleBlockCodes: vehicleBlockCodes.map(block => ({
          code: block.code,
          color: block.color
        })),
        driverRunCodes: driverRunCodes.map(run => ({
          code: run.code,
          color: run.color
        })),
        dutyTemplates: dutyTemplates.map(template => ({
          // Only send the fields needed for creation - NO IDs
          startTime: template.startTime.split('T')[1].substring(0, 5), // Extract HH:MM
          endTime: template.endTime.split('T')[1].substring(0, 5), // Extract HH:MM
          dutyType: template.dutyType,
          // Only send codes, let backend create new associations
          vehicleBlockCode: template.vehicleBlockCode,
          driverRunCode: template.driverRunCode
          // Explicitly NOT sending: id, vehicleBlockTemplateId, driverRunTemplateId, scheduleId
        }))
      };
      
      await apiService.createServiceSchedule(scheduleData);
      navigate('/service-schedules');
    } catch (error) {
      console.error('Error creating service schedule:', error);
      alert('Failed to create service schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/service-schedules');
  };

  if (isLoading) {
    return (
      <PageContainer className="fade-in">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading schedule...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>
          {isViewMode ? (
            <>
              <FiEye style={{ marginRight: '8px' }} />
              View Service Schedule
            </>
          ) : (
            'Create Service Schedule'
          )}
        </PageTitle>
        <HeaderActions>
          <Button variant="secondary" onClick={handleCancel}>
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back to List
          </Button>
          {!isViewMode && (
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Schedule'}
            </Button>
          )}
        </HeaderActions>
      </PageHeader>

      {!isViewMode && <CloneSection>
        <CloneLabel>
          <FiCopy size={18} />
          Clone from existing:
        </CloneLabel>
        <CloneDropdownWrapper>
          <MultiSelectSearchDropdown
            values={selectedCloneSchedule}
            onChange={handleCloneScheduleChange}
            onSearch={searchSchedules}
            displayValue={(schedule) => schedule.name}
            renderItem={(schedule) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {schedule.name}
                </div>
                {schedule.dutyTemplateCount !== undefined && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {schedule.dutyTemplateCount} templates • {schedule.vehicleBlockCount || 0} blocks • {schedule.driverRunCount || 0} runs
                  </div>
                )}
              </div>
            )}
            placeholder="Search or select a schedule to clone..."
            minSearchLength={0}
            searchPromptMessage="Start typing to search or see all schedules"
          />
        </CloneDropdownWrapper>
      </CloneSection>}

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="name">Schedule Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter schedule name"
                hasError={!!errors.name}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

          </FormGrid>
        </form>
      </FormCard>

      {/* Code Management Section */}
      <CodesContainer>
        <CodesGrid>
          {/* Vehicle Block Codes Column */}
          <CodeColumn>
            <CodeColumnHeader>Vehicle Blocks</CodeColumnHeader>
            {!isViewMode && (
              <CodeAddForm>
                <CodeInput
                  value={newBlockCode}
                  onChange={(e) => setNewBlockCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBlockCode()}
                  placeholder="Enter block code"
                />
                <AddButton 
                  onClick={handleAddBlockCode}
                  disabled={!newBlockCode.trim()}
                >
                  Add
                </AddButton>
              </CodeAddForm>
            )}
            <CodeList>
              {vehicleBlockCodes.length === 0 ? (
                <EmptyState>No block codes added yet</EmptyState>
              ) : (
                vehicleBlockCodes.map(codeColor => (
                  <CodeRow key={codeColor.code}>
                    <ColorIndicator color={codeColor.color} />
                    <CodeText>{codeColor.code}</CodeText>
                    {!isViewMode && (
                      <DeleteButton 
                        onClick={() => handleRemoveBlockCode(codeColor.code)} 
                        title="Remove"
                      >
                        <FiX size={16} />
                      </DeleteButton>
                    )}
                  </CodeRow>
                ))
              )}
            </CodeList>
          </CodeColumn>

          {/* Driver Run Codes Column */}
          <CodeColumn>
            <CodeColumnHeader>Driver Runs</CodeColumnHeader>
            {!isViewMode && (
              <CodeAddForm>
                <CodeInput
                  value={newRunCode}
                  onChange={(e) => setNewRunCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRunCode()}
                  placeholder="Enter run code"
                />
                <AddButton 
                  onClick={handleAddRunCode}
                  disabled={!newRunCode.trim()}
                >
                  Add
                </AddButton>
              </CodeAddForm>
            )}
            <CodeList>
              {driverRunCodes.length === 0 ? (
                <EmptyState>No run codes added yet</EmptyState>
              ) : (
                driverRunCodes.map(codeColor => (
                  <CodeRow key={codeColor.code}>
                    <ColorIndicator color={codeColor.color} />
                    <CodeText>{codeColor.code}</CodeText>
                    {!isViewMode && (
                      <DeleteButton 
                        onClick={() => handleRemoveRunCode(codeColor.code)} 
                        title="Remove"
                      >
                        <FiX size={16} />
                      </DeleteButton>
                    )}
                  </CodeRow>
                ))
              )}
            </CodeList>
          </CodeColumn>
        </CodesGrid>
      </CodesContainer>

      <TripTemplateManager
        templates={dutyTemplates}
        onTemplatesChange={setDutyTemplates}
        onError={setTemplateError}
        vehicleBlockCodes={vehicleBlockCodes}
        driverRunCodes={driverRunCodes}
        readOnly={isViewMode}
      />
    </PageContainer>
  );
};

export default CreateServiceSchedule;
