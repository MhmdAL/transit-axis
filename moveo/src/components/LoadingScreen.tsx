import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        textAlign: 'center',
        minWidth: '200px'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem'
        }}></div>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: '500', 
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Loading...
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280' 
        }}>
          Please wait while we load the application
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
