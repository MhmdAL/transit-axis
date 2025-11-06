import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { apiService } from '../../services/apiService';

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
  max-width: 600px;
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
  overflow-y: auto;
  padding: ${theme.spacing.lg};
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

const MessageHistory = styled.div`
  flex: 0 0 auto;
  max-height: 250px;
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
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
  margin: 0 0 ${theme.spacing.md} 0;
  padding-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.border};
`;

const MessageItem = styled.div<{ severity?: string; isIncoming?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  background: ${props => props.isIncoming ? 'rgba(59, 130, 246, 0.05)' : theme.colors.card};
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

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
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

const MessageText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const MessageTime = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: 500;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

const TemplateSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const TemplateButton = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  text-align: center;
  transition: all ${theme.transitions.fast};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: center;

  &:hover {
    background: ${theme.colors.card};
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TemplateEmoji = styled.div`
  font-size: 1.5rem;
`;

const TemplateText = styled.div`
  font-weight: 600;
  line-height: 1.3;
`;

interface DriverMessage {
  id: string;
  message: string;
  routeId: string;
  tripId: string;
  sentAt: string;
  severity: string;
  sentByUser?: string;
  sentByUserType?: number;
}

interface DriverMessageModalProps {
  isOpen: boolean;
  vehicleId: string;
  driverId: string;
  routeId: string;
  tripId: string;
  onClose: () => void;
  onMessageSent?: () => void;
}

const DriverMessageModal: React.FC<DriverMessageModalProps> = ({
  isOpen,
  vehicleId,
  driverId,
  routeId,
  tripId,
  onClose,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<DriverMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const driverTemplates = [
    { id: 'delay', emoji: '⏱️', text: 'Running Late' },
    { id: 'arrived', emoji: '✅', text: 'Arrived' },
    { id: 'break', emoji: '☕', text: 'On Break' },
    { id: 'resumed', emoji: '▶️', text: 'Resumed' },
    { id: 'issue', emoji: '⚠️', text: 'Vehicle Issue' },
    { id: 'breakdown', emoji: '🚗', text: 'Breakdown' },
    { id: 'accident', emoji: '🆘', text: 'Accident' },
    { id: 'ready', emoji: '🚀', text: 'Ready for Next' },
  ];

  const getTemplateMessage = (templateId: string): { text: string; severity: string } => {
    const messages: { [key: string]: { text: string; severity: string } } = {
      delay: { text: 'I am running late on my current route.', severity: 'WARNING' },
      arrived: { text: 'I have arrived at the stop.', severity: 'NORMAL' },
      break: { text: 'Taking a break now.', severity: 'NORMAL' },
      resumed: { text: 'Resumed driving.', severity: 'NORMAL' },
      issue: { text: 'I am experiencing a vehicle issue.', severity: 'WARNING' },
      breakdown: { text: 'Vehicle has broken down.', severity: 'CRITICAL' },
      accident: { text: 'I have been in an accident. Emergency assistance needed.', severity: 'CRITICAL' },
      ready: { text: 'Ready for next stop/assignment.', severity: 'NORMAL' },
    };
    return messages[templateId] || { text: '', severity: 'NORMAL' };
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, vehicleId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const msgs = await apiService.getVehicleMessages(vehicleId, 50);
      setMessages(msgs || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTemplate = async (templateId: string) => {
    const { text, severity } = getTemplateMessage(templateId);
    await sendMessage(text, severity);
  };

  const sendMessage = async (messageText: string, severity: string) => {
    setSending(true);
    try {
      console.log('Sending message:', messageText, severity, routeId);
      await apiService.sendVehicleMessage(vehicleId, messageText, driverId, severity, routeId, tripId);

      const newMessage: DriverMessage = {
        id: Date.now().toString(),
        message: messageText,
        sentAt: new Date().toISOString(),
        severity,
        sentByUser: 'You',
        sentByUserType: 1,
        tripId: tripId,
        routeId: routeId
      };
      setMessages([newMessage, ...messages]);

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

  return createPortal(
    <ModalBackdrop isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>💬 Messages</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Message History */}
          <div>
            <MessageHistoryTitle>Received Messages</MessageHistoryTitle>
            <MessageHistory>
              {loading ? (
                <LoadingContainer>Loading messages...</LoadingContainer>
              ) : messages.length === 0 ? (
                <EmptyMessage>No messages yet</EmptyMessage>
              ) : (
                messages.map((msg) => {
                  // userType 1 = driver, so incoming messages are from dispatchers (not drivers)
                  const isIncoming = msg.sentByUserType !== 1;
                  return (
                    <MessageItem key={msg.id} severity={msg.severity} isIncoming={isIncoming}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                        <SenderBadge isIncoming={isIncoming}>
                          {isIncoming ? '📨 Dispatcher' : '📤 You'}
                        </SenderBadge>
                        <SeverityBadge severity={msg.severity}>
                          {msg.severity}
                        </SeverityBadge>
                      </div>
                      <MessageText>{msg.message}</MessageText>
                      <MessageTime>{formatDate(msg.sentAt)} at {formatTime(msg.sentAt)}</MessageTime>
                    </MessageItem>
                  );
                })
              )}
            </MessageHistory>
          </div>

          {/* Template Selection */}
          <TemplateSection>
            <SectionTitle>Send Message</SectionTitle>
            <TemplateGrid>
              {driverTemplates.map((template) => (
                <TemplateButton
                  key={template.id}
                  onClick={() => handleSendTemplate(template.id)}
                  disabled={sending || loading}
                >
                  <TemplateEmoji>{template.emoji}</TemplateEmoji>
                  <TemplateText>{template.text}</TemplateText>
                </TemplateButton>
              ))}
            </TemplateGrid>
          </TemplateSection>
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>,
    document.body
  );
};

export default DriverMessageModal;

