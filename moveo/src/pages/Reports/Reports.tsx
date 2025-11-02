import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Card } from '../../styles/GlobalStyles';

const ReportsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ReportCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.xl};
`;

const Reports: React.FC = () => {
  return (
    <ReportsContainer className="fade-in">
      <PageTitle>Reports & Analytics</PageTitle>
      <ReportsGrid>
        <ReportCard>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
          <h3>Fleet Performance</h3>
          <p style={{ color: theme.colors.textSecondary }}>Vehicle utilization and efficiency metrics</p>
        </ReportCard>
        <ReportCard>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⛽</div>
          <h3>Fuel Analytics</h3>
          <p style={{ color: theme.colors.textSecondary }}>Fuel consumption and cost analysis</p>
        </ReportCard>
        <ReportCard>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔧</div>
          <h3>Maintenance Reports</h3>
          <p style={{ color: theme.colors.textSecondary }}>Maintenance schedules and costs</p>
        </ReportCard>
      </ReportsGrid>
    </ReportsContainer>
  );
};

export default Reports;


