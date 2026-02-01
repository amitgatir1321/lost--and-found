import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Alert,
  Divider,
  InputAdornment,
  FormControl,
  FormHelperText,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UIButton from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ReportFound = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    location: '',
    description: '',
    whatsappNumber: '',
    contactEmail: currentUser?.email || ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Documents',
    'Jewelry',
    'Clothing',
    'Bags & Wallets',
    'Keys & Access Cards',
    'Pets & Animals',
    'Books & Stationery',
    'Toys & Games',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Found location is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await addDoc(collection(db, 'found_items'), {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        contactVerified: false
      });

      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        itemName: '',
        category: '',
        location: '',
        description: '',
        whatsappNumber: '',
        contactEmail: currentUser.email
      });

      setTimeout(() => {
        setSuccess(false);
        navigate('/found-items');
      }, 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to submit report. Please try again.' });
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#F8FAFC', 
      minHeight: '100vh',
      py: { xs: 4, md: 8 },
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Information Card */}
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Found Something?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                  Help return lost items to their rightful owners by providing accurate details.
                </Typography>

                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Quick Response
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Owners can contact you immediately via WhatsApp
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Secure Communication
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        WhatsApp ensures direct and private communication
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Verified Reports
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        All submissions are reviewed for authenticity
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <strong>Note:</strong> Please ensure the WhatsApp number provided is active and you're available to respond to inquiries about the found item.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                Report Found Item
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Fill in the details below to help reunite the item with its owner
              </Typography>

              {errors.submit && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors({...errors, submit: ''})}>
                  {errors.submit}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  icon={<CheckCircleIcon fontSize="inherit" />}
                >
                  Found item reported successfully! Redirecting...
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      error={!!errors.itemName}
                      helperText={errors.itemName}
                      required
                      placeholder="e.g., iPhone 13, Black Wallet, Keys"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.category}>
                      <TextField
                        select
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="">
                          <em>Select Category</em>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                      {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Found Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={!!errors.location}
                      helperText={errors.location}
                      required
                      placeholder="e.g., Main Library, Building A"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      label="Detailed Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={!!errors.description}
                      helperText={errors.description || "Include color, brand, condition, unique features"}
                      required
                      placeholder="Describe the item's condition, color, brand, and any unique identifying marks..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number for Contact"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      error={!!errors.whatsappNumber}
                      helperText={errors.whatsappNumber || "Enter your WhatsApp-enabled mobile number"}
                      required
                      placeholder="10-digit number (e.g., 9876543210)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contact Email (Optional)"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      type="email"
                      placeholder="For additional contact"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 5,
                  pt: 3,
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <UIButton
                    variant="outlined"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    Cancel
                  </UIButton>
                  
                  <UIButton
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Found Item'}
                  </UIButton>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                By submitting, you agree to respond to inquiries about this found item
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportFound;