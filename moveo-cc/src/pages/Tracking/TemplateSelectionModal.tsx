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
  z-index: 300;
  padding: ${theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
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
  gap: ${theme.spacing.lg};

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

const TemplateCategory = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const CategoryTitle = styled.h4`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${props => props.style?.color || '#3b82f6'};

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.style?.color || '#3b82f6'};
  }
`;

const TemplateButton = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  text-align: left;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.card};
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TemplateTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${theme.colors.textPrimary};
`;

const TemplateText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  line-height: 1.4;
`;

const SeverityBadge = styled.span<{ severity?: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: 600;
  margin-top: ${theme.spacing.sm};
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

interface MessageTemplate {
  id: string;
  title: string;
  text: string;
  severity: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  color: string;
  messages: MessageTemplate[];
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MessageTemplate) => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMessageTemplates();
      setTemplates(response?.categories || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return createPortal(
    <ModalBackdrop isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>📋 Select Message Template</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <LoadingContainer>Loading templates...</LoadingContainer>
          ) : (
            templates.map((category) => (
              <TemplateCategory key={category.id}>
                <CategoryTitle style={{ color: category.color }}>
                  {category.name}
                </CategoryTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  {category.messages.map((template) => (
                    <TemplateButton
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      title={template.text}
                    >
                      <TemplateTitle>{template.title}</TemplateTitle>
                      <TemplateText>{template.text}</TemplateText>
                      <SeverityBadge severity={template.severity}>
                        {template.severity}
                      </SeverityBadge>
                    </TemplateButton>
                  ))}
                </div>
              </TemplateCategory>
            ))
          )}
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>,
    document.body
  );
};

export default TemplateSelectionModal;

