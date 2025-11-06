import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useToast } from '../../context/ToastContext';

const Container = styled.div`
  position: fixed;
  bottom: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  pointer-events: none;
`;

const Toast = styled.div<{ type?: 'info' | 'success' | 'error' | 'warning' }>`
  background: ${props => {
    switch(props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 500;
  pointer-events: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const ToastContainerComponent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <Container>
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          type={toast.type}
          onClick={() => {
            if (toast.action) {
              toast.action();
            }
            removeToast(toast.id);
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          {toast.action && <span style={{ fontSize: '12px', opacity: 0.8 }}>Click to view</span>}
        </Toast>
      ))}
    </Container>
  );
};

export default ToastContainerComponent;

