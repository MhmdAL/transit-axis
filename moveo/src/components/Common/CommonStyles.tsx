import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Card, Button, Badge } from '../../styles/GlobalStyles';

// Page Layout Components
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

export const BackButton = styled(Button)`
  padding: ${theme.spacing.sm};
`;

// Form Components
export const FormCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.xs};
`;

// Enhanced Input and Select components with error state support
export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${({ hasError }) => hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease-in-out;
  
  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ hasError }) => hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ hasError }) => 
      hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
  }
`;

export const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${({ hasError }) => hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ hasError }) => hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ hasError }) => 
      hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
  }
  
  option {
    background: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
`;

export const RequiredIndicator = styled.span`
  color: ${theme.colors.error};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: center;
  min-width: 80px;
`;

// Vehicle Model Display Components
export const VehicleModelDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const VehicleModelName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const VehicleModelDetails = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const VehicleModelBadge = styled.span`
  background: ${theme.colors.surface};
  color: ${theme.colors.textSecondary};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

// Alternative compact display
export const VehicleModelCompact = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const VehicleModelText = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const VehicleModelSeparator = styled.span`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.xs};
`;

// Search and Filter Components
export const FiltersCard = styled(Card)`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  padding: ${theme.spacing.lg};
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

export const SearchInput = styled(Input)`
  padding-left: 40px;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textMuted};
`;

// Table Components
export const TableCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const TableHeaderCell = styled.th<{ width?: string }>`
  padding: ${theme.spacing.lg};
  text-align: left;
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  border-bottom: 1px solid ${theme.colors.border};
  width: ${props => props.width || 'auto'};
`;

export const TableCell = styled.td<{ width?: string }>`
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  width: ${props => props.width || 'auto'};
`;

export const TableBody = styled.tbody`
  /* Table body styles */
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};
  transition: background 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;


export const ActionButton = styled.button`
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  transition: all 0.2s ease-in-out;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

// Status Badges
export const StatusBadge = styled(Badge)<{ status: string }>`
  ${({ status }) => {
    switch (status) {
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      case 'maintenance':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      case 'suspended':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error};
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'inactive':
        return `
          background: rgba(107, 114, 128, 0.1);
          color: ${theme.colors.secondary};
          border: 1px solid rgba(107, 114, 128, 0.2);
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: ${theme.colors.secondary};
          border: 1px solid rgba(107, 114, 128, 0.2);
        `;
    }
  }}
`;

// Empty State
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']};
  text-align: center;
  color: ${theme.colors.textMuted};
`;

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.lg};
  opacity: 0.5;
`;

// Create/Edit Page Container
export const CreatePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;
