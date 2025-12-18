import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportLost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLost: '',
    coordinates: null
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Electronics',
    'Documents',
    'Jewelry',
    'Clothing',
    'Bags',
    'Keys',
    'Pets',
    'Other'
  ];

  const locations = [
    'Downtown',
    'Uptown',
    'East Side',
    'West Side',
    'North District',
    'South District',
    'Central',
    'Suburbs',
    'Park',
    'Mall',
    'Train Station',
    'Bus Stop',
    'Restaurant',
    'School',
    'Office Building'
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim (Free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'LostAndFoundApp/1.0'
              }
            }
          );
          const data = await response.json();
          
          let locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          if (data && data.display_name) {
            locationName = data.display_name;
          }
          
          setFormData({
            ...formData,
            location: locationName,
            coordinates: { latitude, longitude }
          });
          setGettingLocation(false);
        } catch (error) {
          console.error('Error getting address:', error);
          // Fallback to coordinates
          setFormData({
            ...formData,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { latitude, longitude }
          });
          setGettingLocation(false);
        }
      },
      (error) => {
        setError('Unable to get your location. Please enter manually.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      setImage(file);
      setError('');
      
      // Create preview and compress image
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Compress image
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800; // Max width/height
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploadProgress('');
    
    // Validate image upload
    if (!image || !imagePreview) {
      setError('Please upload an image of the lost item');
      return;
    }
    
    setLoading(true);
    console.log('Starting submission process...');

    try {
      setUploadProgress('Processing image...');
      console.log('Saving document to Firestore...');
      
      // Add document to Firestore with base64 image
      const docRef = await addDoc(collection(db, 'lostItems'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        dateLost: formData.dateLost,
        coordinates: formData.coordinates || null,
        imageUrl: imagePreview, // Store base64 image directly
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'active',
        createdAt: new Date()
      });
      
      console.log('Document created with ID:', docRef.id);
      setSuccess('Lost item reported successfully! Redirecting...');
      setUploadProgress('');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        dateLost: '',
        coordinates: null
      });
      setImage(null);
      setImagePreview(null);
      setLoading(false);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error message:', error.message);
      
      setError('Failed to report item: ' + error.message);
      setUploadProgress('');
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: 6,
          mb: 6,
          minHeight: '250px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1494368308039-ed3393a402a4?auto=format&fit=crop&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.85) 0%, rgba(183, 28, 28, 0.75) 100%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ReportIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Report Lost Item
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: '600px', mx: 'auto' }}>
              Help us help you find your lost item. Provide as many details as possible to increase your chances of recovery.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Form Section */}
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {uploadProgress && <Alert severity="info" sx={{ mb: 3 }}>{uploadProgress}</Alert>}

          <Paper 
            elevation={4} 
            sx={{ 
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Blue iPhone 13 with cracked screen"
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#d32f2f' },
                      '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  placeholder="Provide detailed description including color, brand, distinctive features, etc."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#d32f2f' },
                      '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <CategoryIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#d32f2f' },
                      '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter location or use current location"
                    InputProps={{
                      startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />,
                      endAdornment: (
                        <Tooltip title="Use my current location">
                          <IconButton 
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            sx={{ color: '#d32f2f' }}
                          >
                            {gettingLocation ? (
                              <CircularProgress size={24} />
                            ) : (
                              <MyLocationIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#d32f2f' },
                        '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                      }
                    }}
                  />
                  {formData.coordinates && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      📍 Coordinates: {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date Lost"
                  name="dateLost"
                  type="date"
                  value={formData.dateLost}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  InputProps={{
                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#d32f2f' },
                      '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderStyle: image ? 'solid' : 'dashed',
                    borderWidth: 2,
                    borderColor: image ? '#2e7d32' : '#d32f2f',
                    backgroundColor: image ? 'rgba(46, 125, 50, 0.05)' : 'rgba(211, 47, 47, 0.02)',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom color={image ? '#2e7d32' : '#d32f2f'} fontWeight={600}>
                        <ImageIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Upload Item Photo *
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        A clear photo helps others identify your lost item (Max 2MB, JPG/PNG)
                      </Typography>
                      
                      {imagePreview && (
                        <Box 
                          sx={{ 
                            mb: 2, 
                            position: 'relative',
                            maxWidth: 400,
                            mx: 'auto',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                              width: '100%', 
                              height: 'auto',
                              maxHeight: '300px',
                              objectFit: 'contain',
                              display: 'block'
                            }} 
                          />
                          <Button
                            size="small"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              minWidth: 'auto',
                              px: 2,
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.8)'
                              }
                            }}
                          >
                            Change
                          </Button>
                        </Box>
                      )}
                      
                      <Button
                        variant={image ? "outlined" : "contained"}
                        component="label"
                        fullWidth
                        size="large"
                        startIcon={<ImageIcon />}
                        sx={{
                          py: 2,
                          backgroundColor: image ? 'transparent' : '#d32f2f',
                          borderColor: '#d32f2f',
                          color: image ? '#d32f2f' : 'white',
                          fontWeight: 600,
                          fontSize: '1rem',
                          '&:hover': {
                            borderColor: '#b71c1c',
                            backgroundColor: image ? 'rgba(211, 47, 47, 0.04)' : '#b71c1c'
                          }
                        }}
                      >
                        {image ? 'Change Photo' : 'Choose Photo'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                      {image && (
                        <Typography variant="body2" sx={{ mt: 2, color: '#2e7d32', fontWeight: 600 }}>
                          ✓ {image.name}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'rgba(211, 47, 47, 0.05)', 
                    borderRadius: 2,
                    borderLeft: '4px solid #d32f2f'
                  }}
                >
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    📋 Tips for a Successful Report:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    • Provide a clear, recent photo of the item
                    <br />
                    • Include specific details (color, brand, model, etc.)
                    <br />
                    • Mention any unique features or marks
                    <br />
                    • Be as accurate as possible with date and location
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#d32f2f',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                    '&:hover': {
                      backgroundColor: '#b71c1c',
                      boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Report Lost Item'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
    </Box>
  );
};

export default ReportLost;
