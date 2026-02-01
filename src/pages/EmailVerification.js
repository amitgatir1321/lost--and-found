import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Link,
  CircularProgress,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  RefreshRounded as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, resendVerificationEmail } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');

      if (oobCode) {
        // User clicked the email verification link
        try {
          await applyActionCode(auth, oobCode);
          setStatus('success');
          setMessage('Email verified successfully! You can now log in with your account.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (error) {
          setStatus('error');
          setMessage('Verification link is invalid or expired. Please request a new one.');
          if (currentUser?.email) {
            setEmail(currentUser.email);
          }
        }
      } else if (currentUser) {
        // User is logged in but email not verified
        setEmail(currentUser.email);
        if (currentUser.emailVerified) {
          setStatus('success');
          setMessage('Your email is already verified!');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Your email is not yet verified. Check your inbox for the verification link.');
        }
      } else {
        setStatus('error');
        setMessage('No verification in progress. Redirecting to register page...');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }
    };

    verifyEmail();
  }, [searchParams, currentUser, navigate, resendVerificationEmail]);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      if (currentUser) {
        await resendVerificationEmail();
        setMessage('Verification email has been resent! Check your inbox and spam folder.');
        setStatus('info');
      }
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again later.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            width: '100%'
          }}
        >
          {status === 'verifying' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {message}
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to login page...
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorIcon
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'error.main' }}>
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>

              {email && (
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <EmailIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {email}
                </Alert>
              )}

              {currentUser && !currentUser.emailVerified && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleResendEmail}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <Link
                    href="/login"
                    underline="hover"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Return to Login
                  </Link>
                </Typography>
              </Box>
            </>
          )}

          {status === 'info' && (
            <>
              <EmailIcon
                sx={{
                  fontSize: 80,
                  color: 'info.main',
                  mb: 2
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {message}
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification;
