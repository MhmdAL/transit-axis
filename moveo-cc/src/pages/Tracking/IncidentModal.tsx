import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/apiService';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const IncidentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const IncidentCard = styled.div<{ severity?: string; status?: string }>`
  background: ${theme.colors.surface};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return theme.colors.primary;
    }
  }};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
`;

const IncidentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const SeverityBadge = styled.span<{ severity?: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch(props.severity) {
      case 'HIGH': return 'rgba(239, 68, 68, 0.2)';
      case 'MEDIUM': return 'rgba(245, 158, 11, 0.2)';
      case 'LOW': return 'rgba(16, 185, 129, 0.2)';
      default: return 'rgba(20, 184, 166, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.severity) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return theme.colors.primary;
    }
  }};
`;

const StatusBadge = styled.span<{ status?: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch(props.status) {
      case 'RESOLVED': return 'rgba(16, 185, 129, 0.2)';
      case 'IN_PROGRESS': return 'rgba(59, 130, 246, 0.2)';
      case 'OPEN': return 'rgba(38, 71, 180, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'RESOLVED': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'OPEN': return '#3871b4';
      default: return '#6b7280';
    }
  }};
`;

const IncidentDescription = styled.p`
  margin: ${theme.spacing.sm} 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
`;

const IncidentMeta2 = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${props => {
    switch(props.variant) {
      case 'secondary': return theme.colors.surface;
      case 'danger': return '#ef4444';
      default: return theme.colors.primary;
    }
  }};
  color: ${props => props.variant === 'secondary' ? theme.colors.textPrimary : 'white'};
  border: ${props => props.variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none'};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;


const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
`;

interface IncidentModalProps {
  isOpen: boolean;
  tripId: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  currentUserId: string;
  onClose: () => void;
}

const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  tripId,
  routeId,
  vehicleId,
  driverId,
  currentUserId,
  onClose
}) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    type: 'OTHER',
    severity: 'LOW'
  });

  const [resolveData, setResolveData] = useState({
    notes: ''
  });

  useEffect(() => {
    if (isOpen && tripId) {
      fetchIncidents();
    }
  }, [isOpen, tripId]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await apiService.getIncidentsByTrip(tripId);
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setCreating(true);
    try {
      const newIncident = await apiService.createIncident(
        tripId,
        routeId,
        vehicleId,
        driverId,
        currentUserId,
        formData.description,
        formData.type,
        formData.severity
      );
      
      setIncidents([newIncident, ...incidents]);
      setFormData({ description: '', type: 'OTHER', severity: 'LOW' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Failed to create incident');
    } finally {
      setCreating(false);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    if (!resolveData.notes.trim()) {
      alert('Please enter resolution notes');
      return;
    }

    setResolvingId(incidentId);
    try {
      const updated = await apiService.resolveIncident(
        incidentId,
        currentUserId,
        resolveData.notes
      );
      
      setIncidents(incidents.map(i => i.id === incidentId ? updated : i));
      setResolveData({ notes: '' });
      setResolvingId(null);
    } catch (error) {
      console.error('Error resolving incident:', error);
      alert('Failed to resolve incident');
    }
  };

  return (
    <ModalOverlay isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Incidents</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        {loading ? (
          <LoadingMessage>Loading incidents...</LoadingMessage>
        ) : (
          <>
            {/* Incidents List */}
            <Section>
              <SectionTitle>
                Reported Incidents ({incidents.length})
              </SectionTitle>
              
              {incidents.length === 0 ? (
                <EmptyState>No incidents reported for this trip</EmptyState>
              ) : (
                <IncidentList>
                  {incidents.map(incident => (
                    <IncidentCard key={incident.id} severity={incident.severity} status={incident.status}>
                      <IncidentMeta>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <SeverityBadge severity={incident.severity}>
                            {incident.severity}
                          </SeverityBadge>
                          <StatusBadge status={incident.status}>
                            {incident.status.replace('_', ' ')}
                          </StatusBadge>
                        </div>
                      </IncidentMeta>
                      
                      <IncidentDescription>{incident.description}</IncidentDescription>
                      
                      <IncidentMeta2>
                        <div>Type: {incident.type}</div>
                        <br></br>
                        <div>Reported At: {new Date(incident.reportedAt).toLocaleString()}</div>
                        <div>Reported By: {incident.reportedByUser}</div>
                        {incident.status === 'RESOLVED' && (
                          <>
                            <div style={{ marginTop: '8px' }}>Resolved At: {new Date(incident.resolvedAt).toLocaleString()}</div>
                            <div>Resolved by: {incident.resolvedByUser}</div>
                            <div>Resolution Notes: {incident.resolvedNotes}</div>
                          </>
                        )}
                      </IncidentMeta2>

                      {incident.status !== 'RESOLVED' && resolvingId !== incident.id && (
                        <ButtonGroup>
                          <Button
                            variant="primary"
                            onClick={() => setResolvingId(incident.id)}
                          >
                            ✓ Resolve
                          </Button>
                        </ButtonGroup>
                      )}

                      {resolvingId === incident.id && (
                        <FormGroup style={{ marginTop: `${theme.spacing.md}` }}>
                          <Label>Resolution Notes</Label>
                          <TextArea
                            placeholder="Enter resolution notes..."
                            value={resolveData.notes}
                            onChange={(e) => setResolveData({ notes: e.target.value })}
                          />
                          <ButtonGroup>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setResolvingId(null);
                                setResolveData({ notes: '' });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => handleResolveIncident(incident.id)}
                              disabled={!resolveData.notes.trim()}
                            >
                              Submit Resolution
                            </Button>
                          </ButtonGroup>
                        </FormGroup>
                      )}
                    </IncidentCard>
                  ))}
                </IncidentList>
              )}
            </Section>

            {/* Create Incident Form */}
            {showCreateForm && (
              <Section>
                <SectionTitle>Report New Incident</SectionTitle>
                <FormGroup>
                  <Label>Incident Type</Label>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="ACCIDENT">Accident</option>
                    <option value="BREAKDOWN">Breakdown</option>
                    <option value="DELAY">Delay</option>
                    <option value="FUEL">Fuel</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="TRAFFIC">Traffic</option>
                    <option value="SAFETY">Safety</option>
                    <option value="OTHER">Other</option>
                  </Select>

                  <Label style={{ marginTop: `${theme.spacing.md}` }}>Severity</Label>
                  <Select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>

                  <Label style={{ marginTop: `${theme.spacing.md}` }}>Description</Label>
                  <TextArea
                    placeholder="Describe the incident..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <ButtonGroup>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({ description: '', type: 'OTHER', severity: 'LOW' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateIncident}
                      disabled={creating || !formData.description.trim()}
                    >
                      {creating ? 'Creating...' : 'Report Incident'}
                    </Button>
                  </ButtonGroup>
                </FormGroup>
              </Section>
            )}

            {/* Report New Incident Button */}
            {!showCreateForm && (
              <Section>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                  style={{ width: '100%' }}
                >
                  ➕ Report New Incident
                </Button>
              </Section>
            )}
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default IncidentModal;

