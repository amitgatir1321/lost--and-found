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
  Alert
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #414A37 0%, #556147 100%)',
          color: 'white',
          py: 6,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center">
            Get In Touch
          </Typography>
          <Typography variant="h6" align="center" sx={{ opacity: 0.95 }}>
            We're here to help you reunite with your lost items
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <EmailIcon sx={{ fontSize: 50, color: '#414A37', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Email Us
              </Typography>
              <Typography color="text.secondary">
                support@lostandfound.com
              </Typography>
              <Typography color="text.secondary">
                info@lostandfound.com
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <PhoneIcon sx={{ fontSize: 50, color: '#99744A', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Call Us
              </Typography>
              <Typography color="text.secondary">
                (555) 123-4567
              </Typography>
              <Typography color="text.secondary">
                Mon-Fri: 9AM - 6PM
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <AccessTimeIcon sx={{ fontSize: 50, color: '#DBC2A6', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                24/7 Support
              </Typography>
              <Typography color="text.secondary">
                Online chat available
              </Typography>
              <Typography color="text.secondary">
                Always here to help
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Contact Form */}
        <Box sx={{ mt: 6 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom align="center" sx={{ mb: 3 }}>
              Send Us a Message
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Thank you for contacting us! We'll get back to you soon.
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
                    sx={{
                      backgroundColor: '#414A37',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': { backgroundColor: '#99744A' }
                    }}
                  >
                    Send Message
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
                  123 Main Street, Suite 100
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Downtown District
                </Typography>
                <Typography color="text.secondary">
                  City, State 12345
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
