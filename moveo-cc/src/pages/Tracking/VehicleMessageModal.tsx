import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/apiService';
import TemplateSelectionModal from './TemplateSelectionModal';
import { useGlobalVehicleTracking } from '../../context/VehicleTrackingContext';

const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: ${theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
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

const ModalBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessageHistory = styled.div`
  flex: 0 0 auto;
  max-height: 300px;
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;

    &:hover {
      background: #9ca3af;
    }
  }
`;

const MessageHistoryTitle = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0;
  margin-bottom: ${theme.spacing.md};
`;

const MessageItem = styled.div<{ severity?: string; isIncoming?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  background: ${props => props.isIncoming ? 'rgba(59, 130, 246, 0.05)' : theme.colors.surface};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'NORMAL': return '#10b981';
      default: return '#3b82f6';
    }
  }};
  border-right: ${props => props.isIncoming ? '4px solid #3b82f6' : 'none'};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  transition: all ${theme.transitions.fast};
  margin-left: ${props => props.isIncoming ? '0' : '0'};

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MessageTime = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: 500;
`;

const MessageText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const SeverityBadge = styled.span<{ severity?: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: 600;
  width: fit-content;
  background: ${props => {
    switch(props.severity) {
      case 'CRITICAL': return 'rgba(239, 68, 68, 0.1)';
      case 'WARNING': return 'rgba(245, 158, 11, 0.1)';
      case 'NORMAL': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.severity) {
      case 'CRITICAL': return '#dc2626';
      case 'WARNING': return '#d97706';
      case 'NORMAL': return '#059669';
      default: return '#1e40af';
    }
  }};
`;

const SenderBadge = styled.span<{ isIncoming?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: 600;
  width: fit-content;
  background: ${props => props.isIncoming ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
  color: ${props => props.isIncoming ? '#1e40af' : '#059669'};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;


const CustomMessageSection = styled.div`
  flex-shrink: 0;
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 70px;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-family: inherit;
  font-size: ${theme.typography.fontSize.sm};
  resize: none;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const SeveritySelector = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const SeverityOption = styled.button<{ selected?: boolean; type?: string }>`
  flex: 1;
  padding: ${theme.spacing.sm};
  border: 2px solid ${props => {
    if (!props.selected) return `${theme.colors.border}`;
    switch(props.type) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'NORMAL': return '#10b981';
      default: return '#3b82f6';
    }
  }};
  background: ${props => {
    if (!props.selected) return 'transparent';
    switch(props.type) {
      case 'CRITICAL': return 'rgba(239, 68, 68, 0.1)';
      case 'WARNING': return 'rgba(245, 158, 11, 0.1)';
      case 'NORMAL': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  color: ${props => {
    if (!props.selected) return `${theme.colors.textMuted}`;
    switch(props.type) {
      case 'CRITICAL': return '#dc2626';
      case 'WARNING': return '#d97706';
      case 'NORMAL': return '#059669';
      default: return '#1e40af';
    }
  }};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: ${theme.typography.fontSize.xs};
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: currentColor;
  }
`;

const SendButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const SendButton = styled.button`
  flex: 1;
  padding: ${theme.spacing.md};
  background: #10b981;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${theme.colors.surface};
    color: ${theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  padding: ${theme.spacing.md};
  background: transparent;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.surface};
    border-color: ${theme.colors.textMuted};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

interface VehicleMessage {
  id: string;
  message: string;
  sentAt: string;
  severity: string;
  sentByUser?: string;
  sentByUserType?: number;
  tripId?: string;
}

interface VehicleMessageModalProps {
  isOpen: boolean;
  vehicleId: string;
  sentByUserId: string;
  onClose: () => void;
  onMessageSent?: () => void;
}

const VehicleMessageModal: React.FC<VehicleMessageModalProps> = ({
  isOpen,
  vehicleId,
  sentByUserId,
  onClose,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<VehicleMessage[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'NORMAL' | 'WARNING' | 'CRITICAL'>('NORMAL');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { onVehicleMessage, offVehicleMessage } = useGlobalVehicleTracking();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, vehicleId]);

  // Listen for incoming vehicle messages when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleVehicleMessage = (message: any) => {
      // Check if this message is for the current vehicle
      if (message.vehicleId === vehicleId) {
        const newMessage: VehicleMessage = {
          id: message.id,
          message: message.message,
          sentAt: message.sentAt,
          severity: message.severity,
          sentByUser: message.sentByUser,
          sentByUserType: message.sentByUserType,
          tripId: message.tripId
        };
        // Add to top of messages list
        setMessages(prev => [newMessage, ...prev]);
      }
    };

    onVehicleMessage(handleVehicleMessage);

    return () => {
      offVehicleMessage(handleVehicleMessage);
    };
  }, [isOpen, vehicleId, onVehicleMessage, offVehicleMessage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const messages = await apiService.getVehicleMessages(vehicleId, 50);
      setMessages(messages || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelected = (template: any) => {
    setCustomMessage(template.text);
    setSelectedSeverity(template.severity);
  };

  const handleSendMessage = async () => {
    if (!customMessage.trim()) {
      return;
    }
    await sendMessage(customMessage, selectedSeverity);
  };

  const sendMessage = async (messageText: string, severity: string) => {
    setSending(true);
    try {
      await apiService.sendVehicleMessage(vehicleId, messageText, sentByUserId, severity);

      // Add to local state
      const newMessage: VehicleMessage = {
        id: Date.now().toString(),
        message: messageText,
        sentAt: new Date().toISOString(),
        severity,
        sentByUser: 'You'
      };
      setMessages([newMessage, ...messages]);
      setCustomMessage('');
      setSelectedSeverity('NORMAL');

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      {createPortal(
        <ModalBackdrop isOpen={isOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>💬 Vehicle Messages</ModalTitle>
              <CloseButton onClick={onClose}>✕</CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Message History */}
              <MessageHistory>
                <MessageHistoryTitle>Message History</MessageHistoryTitle>
                {loading ? (
                  <LoadingContainer>Loading messages...</LoadingContainer>
                ) : messages.length === 0 ? (
                  <EmptyMessage>No messages yet</EmptyMessage>
                ) : (
                  <>
                    {messages.map((msg) => {
                      // userType 1 = driver, so incoming messages are from drivers
                      const isIncoming = msg.sentByUserType === 1;
                      return (
                        <MessageItem key={msg.id} severity={msg.severity} isIncoming={isIncoming}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                            <SenderBadge isIncoming={isIncoming}>
                              {isIncoming ? `📨 From: ${msg.sentByUser || 'Driver'}` : '📤 You (Sent)'}
                            </SenderBadge>
                            <SeverityBadge severity={msg.severity}>
                              {msg.severity}
                            </SeverityBadge>
                          </div>
                          <MessageText>{msg.message}</MessageText>
                          <MessageTime>{formatDate(msg.sentAt)} at {formatTime(msg.sentAt)}</MessageTime>
                        </MessageItem>
                      );
                    })}
                  </>
                )}
              </MessageHistory>
            </ModalBody>

            {/* Message Input Section */}
            <CustomMessageSection>
              <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <SendButton
                  onClick={() => setShowTemplateModal(true)}
                  disabled={sending}
                  style={{ background: '#8b5cf6' }}
                >
                  📋 Use Template
                </SendButton>
                <ClearButton
                  onClick={() => {
                    setCustomMessage('');
                    setSelectedSeverity('NORMAL');
                  }}
                  disabled={sending || !customMessage}
                >
                  Clear
                </ClearButton>
              </div>

              <SectionLabel>Message</SectionLabel>
              <TextArea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message here or select a template..."
                disabled={sending}
              />

              <SectionLabel>Severity Level</SectionLabel>
              <SeveritySelector>
                <SeverityOption
                  type="NORMAL"
                  selected={selectedSeverity === 'NORMAL'}
                  onClick={() => setSelectedSeverity('NORMAL')}
                  disabled={sending}
                >
                  Normal
                </SeverityOption>
                <SeverityOption
                  type="WARNING"
                  selected={selectedSeverity === 'WARNING'}
                  onClick={() => setSelectedSeverity('WARNING')}
                  disabled={sending}
                >
                  Warning
                </SeverityOption>
                <SeverityOption
                  type="CRITICAL"
                  selected={selectedSeverity === 'CRITICAL'}
                  onClick={() => setSelectedSeverity('CRITICAL')}
                  disabled={sending}
                >
                  Critical
                </SeverityOption>
              </SeveritySelector>

              <SendButtonContainer>
                <SendButton
                  onClick={handleSendMessage}
                  disabled={!customMessage.trim() || sending}
                >
                  {sending ? 'Sending...' : '📤 Send Message'}
                </SendButton>
              </SendButtonContainer>
            </CustomMessageSection>
          </ModalContent>
        </ModalBackdrop>,
        document.body
      )}

      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleTemplateSelected}
      />
    </>
  );
};

export default VehicleMessageModal;

