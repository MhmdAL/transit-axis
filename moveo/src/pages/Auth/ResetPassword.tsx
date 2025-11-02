import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiKey, FiArrowRight, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
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

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetCode = searchParams.get('code');
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    if (!resetCode) {
      navigate('/login');
    }
  }, [resetCode, navigate]);

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

    if (!formData.newPassword) {
      newErrors.push('Password is required');
    } else if (formData.newPassword.length < 6) {
      newErrors.push('Password must be at least 6 characters long');
    }

    if (!formData.confirmPassword) {
      newErrors.push('Please confirm your password');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !resetCode) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dataService.resetPassword({
        resetCode,
        newPassword: formData.newPassword
      });
      
      setIsReset(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setErrors([error.message || 'Failed to reset password. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReset) {
    return (
      <PageContainer className="fade-in" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
          <FormCard>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FiCheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
              <h2 style={{ 
                color: '#2c3e50',
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Password Reset Successfully!
              </h2>
              <p style={{ 
                color: '#7f8c8d',
                marginBottom: '2rem',
                fontSize: '1rem'
              }}>
                Your password has been reset. You can now login with your new password.
              </p>
              <p style={{ 
                color: '#7f8c8d',
                fontSize: '0.9rem'
              }}>
                Redirecting to login page...
              </p>
            </div>
          </FormCard>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Reset Your Password
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
            Enter your new password below
          </p>
        </div>

        <FormCard>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '1rem',
                color: '#2c3e50',
                fontSize: '1.5rem'
              }}>
                New Password
              </h2>
              <p style={{ 
                textAlign: 'center', 
                color: '#7f8c8d',
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                Create a strong password for your account
              </p>
            </div>

            <FormGroup>
              <Label htmlFor="newPassword">New Password *</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
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
                    color: '#7f8c8d'
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
                    color: '#7f8c8d'
                  }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
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
                    color: '#7f8c8d'
                  }} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#7f8c8d'
                  }}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </FormGroup>

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
                  'Resetting Password...'
                ) : (
                  <>
                    <FiArrowRight size={18} />
                    Reset Password
                  </>
                )}
              </Button>

              <Button 
                variant="secondary" 
                type="button"
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </FormCard>
      </div>
    </PageContainer>
  );
};

export default ResetPassword;



