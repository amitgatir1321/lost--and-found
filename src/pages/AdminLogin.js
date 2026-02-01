import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
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
import SecurityIcon from '@mui/icons-material/Security';

const AdminLogin = () => {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('rememberedAdminEmail') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberAdminEmail') === 'true';
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(email);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { login, resetPassword, isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();

  // ✅ REDIRECT IF ALREADY LOGGED IN AS ADMIN
  useEffect(() => {
    if (currentUser && isAdmin) {
      navigate('/admin');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (checked && email) {
      localStorage.setItem('rememberedAdminEmail', email);
      localStorage.setItem('rememberAdminEmail', 'true');
    } else {
      localStorage.removeItem('rememberedAdminEmail');
      localStorage.removeItem('rememberAdminEmail');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (rememberMe) {
      localStorage.setItem('rememberedAdminEmail', e.target.value);
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

      const userCredential = await login(email, password);

      // 🔑 Check if admin
      if (userCredential.email.toLowerCase() !== process.env.REACT_APP_ADMIN_EMAIL?.toLowerCase()) {
        setError('Only administrators can access this login.');
        setLoading(false);
        return;
      }

      // Save email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedAdminEmail', email);
        localStorage.setItem('rememberAdminEmail', 'true');
      } else {
        localStorage.removeItem('rememberedAdminEmail');
        localStorage.removeItem('rememberAdminEmail');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      if (error.message.includes('verify')) {
        setError(error.message);
      } else if (error.message.includes('auth/user-not-found')) {
        setError('No account found with this email.');
      } else if (error.message.includes('auth/wrong-password')) {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Failed to log in. Please check your email and password.');
      }
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
          <Fade in={success}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5">Welcome, Admin!</Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to dashboard...
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Paper sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <SecurityIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography variant="h4">Admin Login</Typography>
            </Box>

            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Administrators only. Access the management dashboard.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  )
                }}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                sx={{ mb: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ mb: 3, textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  component="button"
                  type="button"
                  onClick={() => setOpenForgotPassword(true)}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>

              <UIButton
                type="submit"
                fullWidth
                loading={loading}
                variant="contained"
                sx={{ mb: 2 }}
              >
                Login as Admin
              </UIButton>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Regular users?{' '}
                  <Typography
                    component="a"
                    href="/login"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    User Login
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Input
              label="Email Address"
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              fullWidth
              disabled={forgotPasswordLoading}
            />
            {forgotPasswordMessage && (
              <Alert severity={forgotPasswordMessage.includes('sent') ? 'success' : 'error'} sx={{ mt: 2 }}>
                {forgotPasswordMessage}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <UIButton onClick={() => setOpenForgotPassword(false)} variant="text">
            Cancel
          </UIButton>
          <UIButton
            onClick={handleForgotPassword}
            loading={forgotPasswordLoading}
            variant="contained"
          >
            Send Reset Email
          </UIButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminLogin;
