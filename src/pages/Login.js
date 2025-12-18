import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Fade,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Login = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailStep = () => {
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!confirmEmail) {
      setEmailError('Please confirm your email');
      return;
    }

    if (email !== confirmEmail) {
      setEmailError('Emails do not match');
      return;
    }

    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError('Failed to log in: ' + error.message);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        {success ? (
          <Fade in={success}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                color: 'white'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Login Successful!
              </Typography>
              <Typography variant="body1">
                Redirecting you to the home page...
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Please enter your credentials to continue
            </Typography>

            <Stepper activeStep={step} sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Verify Email</StepLabel>
              </Step>
              <Step>
                <StepLabel>Enter Password</StepLabel>
              </Step>
            </Stepper>

            {step === 0 && (
              <Fade in={step === 0}>
                <Box>
                  {emailError && <Alert severity="error" sx={{ mb: 2 }}>{emailError}</Alert>}
                  
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Confirm Email Address"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => {
                      setConfirmEmail(e.target.value);
                      setEmailError('');
                    }}
                    margin="normal"
                    required
                    error={confirmEmail !== '' && email !== confirmEmail}
                    helperText={confirmEmail !== '' && email !== confirmEmail ? 'Emails do not match' : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleEmailStep}
                    sx={{ 
                      mt: 3,
                      bgcolor: '#414A37',
                      '&:hover': { bgcolor: '#99744A' }
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Fade>
            )}

            {step === 1 && (
              <Fade in={step === 1}>
                <Box component="form" onSubmit={handleSubmit}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Email confirmed: {email}
                  </Alert>

                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    margin="normal"
                    required
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
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: '#414A37', '&.Mui-checked': { color: '#414A37' } }}
                      />
                    }
                    label="Remember me"
                    sx={{ mt: 1 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setStep(0);
                        setPassword('');
                        setError('');
                      }}
                      sx={{ 
                        borderColor: '#414A37',
                        color: '#414A37',
                        '&:hover': { borderColor: '#99744A', bgcolor: 'rgba(65, 74, 55, 0.04)' }
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{ 
                        bgcolor: '#414A37',
                        '&:hover': { bgcolor: '#99744A' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/register" underline="hover" sx={{ color: '#414A37', fontWeight: 600 }}>
                  Register Here
                </Link>
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Login;
