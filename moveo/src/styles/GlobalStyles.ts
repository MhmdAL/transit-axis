import styled, { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: ${theme.typography.fontFamily.sans.join(', ')};
    background-color: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.secondary};
    border-radius: ${theme.borderRadius.full};
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.textMuted};
  }
  
  /* Focus styles */
  *:focus {
    outline: 2px solid ${theme.colors.borderFocus};
    outline-offset: 2px;
  }
  
  /* Button reset */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }
  
  /* Input reset */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  /* Link reset */
  a {
    color: inherit;
    text-decoration: none;
  }
  
  /* List reset */
  ul, ol {
    list-style: none;
  }
  
  /* Table reset */
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  
  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

// Common styled components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing.lg};
  }
`;

export const Card = styled.div`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.cardHover};
    box-shadow: ${theme.shadows.md};
  }
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
        `;
      default:
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
        `;
    }
  }}
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'secondary':
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.textPrimary};
          border: 1px solid ${theme.colors.border};
          
          &:hover {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.borderLight};
          }
        `;
      case 'success':
        return `
          background: ${theme.colors.success};
          color: white;
          
          &:hover {
            background: #059669;
          }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning};
          color: white;
          
          &:hover {
            background: #d97706;
          }
        `;
      case 'error':
        return `
          background: ${theme.colors.error};
          color: white;
          
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: ${theme.colors.primary};
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease-in-out;
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
  
  &:focus {
    border-color: ${theme.colors.borderFocus};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:focus {
    border-color: ${theme.colors.borderFocus};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  option {
    background: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
`;

export const Badge = styled.span<{
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.full};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error};
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'info':
        return `
          background: rgba(6, 182, 212, 0.1);
          color: ${theme.colors.info};
          border: 1px solid rgba(6, 182, 212, 0.2);
        `;
      default:
        return `
          background: rgba(59, 130, 246, 0.1);
          color: ${theme.colors.primary};
          border: 1px solid rgba(59, 130, 246, 0.2);
        `;
    }
  }}
`;


