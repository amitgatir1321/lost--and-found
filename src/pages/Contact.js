import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  alpha
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChatIcon from '@mui/icons-material/Chat';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Contact = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        status: 'unread',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #414A37 0%, #99744A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Have questions? We're here to help you reunite with your lost items
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: alpha('#414A37', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PhoneIcon sx={{ fontSize: 28, color: '#414A37' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Phone Support
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available 24/7
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="primary">
                          (555) 123-4567
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: alpha('#99744A', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <EmailIcon sx={{ fontSize: 28, color: '#99744A' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Email Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Response within 24 hours
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          support@lostandfound.com
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: alpha('#2196F3', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ChatIcon sx={{ fontSize: 28, color: '#2196F3' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Live Chat
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mon-Fri: 9AM - 6PM
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          Start a chat
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Office Hours
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Monday - Friday</Typography>
                      <Typography fontWeight={600}>9:00 AM - 6:00 PM</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Saturday</Typography>
                      <Typography fontWeight={600}>10:00 AM - 4:00 PM</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Sunday</Typography>
                      <Typography fontWeight={600}>Emergency Only</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Send us a message
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and we'll get back to you as soon as possible
              </Typography>

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  onClose={() => setSuccess(false)}
                >
                  Your message has been sent successfully! We'll contact you shortly.
                </Alert>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={5}
                      required
                      placeholder="Please provide as much detail as possible..."
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{
                        py: 1.8,
                        borderRadius: 2,
                        bgcolor: '#414A37',
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#2c3327',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(65, 74, 55, 0.3)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SupportAgentIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Average response time: <strong>2-4 hours</strong> during business hours
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Office location: <strong>123 Main Street, Suite 100</strong>
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* FAQ Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Frequently Asked Questions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      How quickly can I report a lost item?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You can report lost items immediately 24/7 through our platform. For urgent matters, use our emergency contact number.
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Is there a fee for using the service?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our basic lost and found service is completely free. Premium features may be available for businesses.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;