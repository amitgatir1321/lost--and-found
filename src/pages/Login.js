import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Fade,
  Checkbox,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import UIButton from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [email, setEmail] = useState(() => {
    // Load email from localStorage if "Remember me" was checked
    return localStorage.getItem('rememberedEmail') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(email);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    if (e.target.checked && email) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      await login(email, password);
      
      // Save email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      if (error.message.includes('verify')) {
        setError(error.message);
      } else {
        setError('Failed to log in. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    try {
      setForgotPasswordLoading(true);
      setForgotPasswordMessage('');
      await resetPassword(forgotPasswordEmail);
      setForgotPasswordMessage('Password reset email sent! Check your inbox for the reset link.');
      setTimeout(() => {
        setOpenForgotPassword(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage('');
      }, 2000);
    } catch (error) {
      setForgotPasswordMessage('Failed to send password reset email. Please check the email address and try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {success ? (
          <Fade in={success} unmountOnExit>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
              <CheckCircleIcon sx={{ fontSize: 80, mb: 2, color: 'success.main' }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Login Successful!
              </Typography>
              <Typography variant="body1">
                Redirecting you to the home page...
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              width: '100%'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account to continue
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                autoComplete="current-password"
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      sx={{
                        color: '#414A37',
                        '&.Mui-checked': {
                          color: '#414A37'
                        }
                      }}
                    />
                  }
                  label="Remember me"
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordEmail(email);
                    setOpenForgotPassword(true);
                  }}
                  disabled={loading}
                  sx={{
                    color: '#414A37',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#99744A'
                    }
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <UIButton
                type="submit"
                fullWidth
                color="primary"
                loading={loading}
                sx={{ mt: 3, mb: 3, height: 48 }}
              >
                Login
              </UIButton>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or continue with
                </Typography>
              </Divider>

              <UIButton
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{
                  mb: 3,
                  height: 48,
                  borderColor: '#dadce0',
                  color: '#3c4043',
                  '&:hover': {
                    borderColor: '#dadce0',
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                {loading ? 'Loading...' : 'Sign in with Google'}
              </UIButton>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    underline="hover"
                    sx={{
                      color: '#414A37',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#99744A'
                      }
                    }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openForgotPassword}
        onClose={() => {
          setOpenForgotPassword(false);
          setForgotPasswordMessage('');
          setForgotPasswordEmail('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Reset Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {forgotPasswordMessage && (
            <Alert
              severity={forgotPasswordMessage.includes('sent') ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {forgotPasswordMessage}
            </Alert>
          )}
          {!forgotPasswordMessage.includes('sent') && !forgotPasswordMessage.includes('Success') && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <Input
                label="Email Address"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <UIButton
            onClick={() => {
              setOpenForgotPassword(false);
              setForgotPasswordMessage('');
              setForgotPasswordEmail('');
            }}
            variant="outlined"
          >
            Close
          </UIButton>
          {!forgotPasswordMessage && (
            <UIButton
              onClick={handleForgotPassword}
              color="primary"
              loading={forgotPasswordLoading}
            >
              Send Reset Link
            </UIButton>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;

