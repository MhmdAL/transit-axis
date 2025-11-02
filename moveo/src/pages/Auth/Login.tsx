import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiKey, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer,
  FormCard,
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../../components/Common/CommonStyles';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for success message from activation
  const successMessage = location.state?.successMessage;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push('Username is required');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await dataService.loginWithPassword(formData.username, formData.password);
      
      // Use AuthContext to handle login
      login(response.user, response.token);
      
      navigate('/vehicles');
    } catch (error: any) {
      console.error('Error logging in:', error);
      setErrors([error.message || 'Failed to login. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 50%, ${theme.colors.card} 100%)`,
      position: 'relative'
    }}>
      {/* Subtle accent overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: theme.colors.textPrimary, 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Welcome to Moveo
          </h1>
          <p style={{ color: theme.colors.textSecondary, fontSize: '1rem' }}>
            Fleet Management System
          </p>
        </div>

        <FormCard style={{
          boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)`,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.card
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '1rem',
                color: theme.colors.textPrimary,
                fontSize: '1.5rem'
              }}>
                Login
              </h2>
              <p style={{ 
                textAlign: 'center', 
                color: theme.colors.textMuted,
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                Enter your username and password to access your account
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <FormGroup>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: theme.borderRadius.lg,
                  padding: '12px',
                  color: theme.colors.success,
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  {successMessage}
                </div>
              </FormGroup>
            )}

            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  hasError={errors.length > 0}
                  style={{ paddingLeft: '40px' }}
                />
                <FiUser 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: theme.colors.textMuted
                  }} 
                />
              </div>
            </FormGroup>

            <br></br>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  hasError={errors.length > 0}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <FiKey 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: theme.colors.textMuted
                  }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.textMuted
                  }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </FormGroup>

            <br></br>

            {errors.length > 0 && (
              <FormGroup>
                {errors.map((error, index) => (
                  <ErrorMessage key={index}>{error}</ErrorMessage>
                ))}
              </FormGroup>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? (
                  'Logging in...'
                ) : (
                  <>
                    <FiArrowRight size={18} />
                    Login
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormCard>
      </div>
    </PageContainer>
  );
};

export default Login;
