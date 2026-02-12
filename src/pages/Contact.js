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
  CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Contact = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: currentUser?.uid || null,
        status: 'unread',
        createdAt: new Date()
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, rgba(65, 74, 55, 0.9), rgba(153, 116, 74, 0.9)), url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center">
            💬 Get In Touch
          </Typography>
          <Typography variant="h6" align="center" sx={{ opacity: 0.95, maxWidth: 700, mx: 'auto' }}>
            Have questions or need assistance? We're here to help you reunite with your lost items!
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: 'rgba(65, 74, 55, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <EmailIcon sx={{ fontSize: 40, color: '#414A37' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📧 Email Us
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                amitgatir1308@gmail.com
              </Typography>
              <Typography color="text.secondary" variant="body2">
                amitgatir1308@gmail.com
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: 'rgba(153, 116, 74, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <PhoneIcon sx={{ fontSize: 40, color: '#99744A' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📞 Call Us
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                +91 8999271196
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Mon-Fri: 9AM - 6PM
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: 'rgba(219, 194, 166, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 40, color: '#99744A' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⏰ 24/7 chat Support
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                Online chat available(whatsapp +91 8999271196)
              </Typography>
              <Typography color="text.secondary">
                Always here to help
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Contact Form */}
        <Box sx={{ mt: 6 }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
              borderRadius: 3
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 1,
                background: 'linear-gradient(135deg, #414A37, #99744A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ✉️ Send Us a Message
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="text.secondary" 
              sx={{ mb: 4 }}
            >
              Fill out the form below and we'll respond within 24 hours
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                ✅ Thank you for contacting us! We'll get back to you soon.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
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
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      backgroundColor: '#414A37',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': { backgroundColor: '#99744A' },
                      '&:disabled': { opacity: 0.7 }
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        {/* Additional Information */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <LocationOnIcon sx={{ fontSize: 40, color: '#414A37', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Office Location
                </Typography>
                <Typography color="text.secondary" paragraph>
                Lost & Found Office, Wagle Industrial Estate,
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Thane West – 400604,
                </Typography>
                <Typography color="text.secondary">
                 Maharashtra,India.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Frequently Asked Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>How quickly can I report a lost item?</strong><br />
                  You can report items immediately 24/7 through our platform.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Is there a fee for using the service?</strong><br />
                  Our basic lost and found service is completely free to use.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
