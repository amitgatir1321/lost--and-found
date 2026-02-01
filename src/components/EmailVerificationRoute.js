import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CircularProgress, 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Container
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

const EmailVerificationRoute = ({ children }) => {
  const { currentUser, emailVerified, resendVerificationEmail } = useAuth();
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!emailVerified) {
    const handleResendVerification = async () => {
      try {
        setResendLoading(true);
        setResendMessage('');
        await resendVerificationEmail();
        setResendMessage('Verification email sent! Please check your inbox.');
      } catch (error) {
        setResendMessage('Failed to send verification email. Please try again.');
      }
      setResendLoading(false);
    };

    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            <EmailIcon sx={{ fontSize: 80, mb: 2, color: 'warning.main' }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Email Verification Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a verification email to <strong>{currentUser.email}</strong>.
              Please check your inbox and click the verification link to continue.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong><br />
                • Check your spam/junk folder<br />
                • Make sure the email address is correct<br />
                • The email may take a few minutes to arrive
              </Typography>
            </Alert>

            {resendMessage && (
              <Alert 
                severity={resendMessage.includes('Failed') ? 'error' : 'success'} 
                sx={{ mb: 3 }}
              >
                {resendMessage}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleResendVerification}
              disabled={resendLoading}
              sx={{ 
                mb: 2,
                minWidth: 200,
                height: 48
              }}
            >
              {resendLoading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Already verified? <Button 
                variant="text" 
                size="small"
                onClick={() => window.location.reload()}
                sx={{ textTransform: 'none' }}
              >
                Refresh Page
              </Button>
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return children;
};

export default EmailVerificationRoute;
