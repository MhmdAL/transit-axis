import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.textPrimary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: 1.2;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    transition: all ${theme.transitions.fast};
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};

    &:hover {
      background: ${theme.colors.borderLight};
    }
  }

  /* Leaflet overrides */
  .leaflet-container {
    font-family: ${theme.typography.fontFamily.primary};
  }

  .leaflet-popup-content-wrapper {
    background: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
    border-radius: ${theme.borderRadius.md};
  }

  .leaflet-popup-tip {
    background: ${theme.colors.surface};
  }
`;

