import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Card } from '../../styles/GlobalStyles';

const StatCardContainer = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.xl};
  background: ${({ color }) => `${color}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color};
  font-size: 24px;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;

const StatChange = styled.div<{ positive: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${({ positive }) => positive ? theme.colors.success : theme.colors.error};
  margin-top: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: {
    value: string;
    positive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  change,
  color = theme.colors.primary
}) => {
  return (
    <StatCardContainer>
      <IconContainer color={color}>
        {icon}
      </IconContainer>
      <StatContent>
        <StatValue>{value}</StatValue>
        <StatLabel>{label}</StatLabel>
        {change && (
          <StatChange positive={change.positive}>
            {change.positive ? '+' : ''}{change.value}
          </StatChange>
        )}
      </StatContent>
    </StatCardContainer>
  );
};

export default StatCard;


