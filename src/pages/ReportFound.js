import React, { useState, useRef, useEffect } from 'react';
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
  Stack,
  IconButton,
  CircularProgress,
  alpha,
  Chip
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SecurityIcon from '@mui/icons-material/Security';
import UIButton from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Professional color scheme
const colors = {
  primary: '#1A365D', // Navy Blue
  secondary: '#2D3748', // Charcoal
  accent: '#3182CE', // Royal Blue
  success: '#38A169', // Forest Green
  warning: '#DD6B20', // Burnt Orange
  error: '#E53E3E', // Crimson Red
  neutral: '#718096', // Slate Gray
  background: '#F7FAFC', // Light Gray
  card: '#FFFFFF', // White
  highlight: '#2B6CB0' // Deep Blue
};

const ReportFound = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Load saved form data from localStorage on component mount
  const loadFormData = () => {
    const savedData = localStorage.getItem('reportFoundFormData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      itemName: '',
      category: '',
      location: '',
      description: '',
      whatsappNumber: '',
      contactEmail: currentUser?.email || '',
      date: new Date().toISOString().split('T')[0]
    };
  };

  const [formData, setFormData] = useState(loadFormData());

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Documents',
    'Jewelry',
    'Watches',
    'Clothing',
    'Bags & Wallets',
    'Keys & Access Cards',
    'Eyewear',
    'Books & Stationery',
    'Sports Equipment',
    'Toys & Games',
    'Other Valuables'
  ];

  // Category suggestions based on item name
  const categorySuggestions = {
    'phone': 'Electronics',
    'iphone': 'Electronics',
    'samsung': 'Electronics',
    'laptop': 'Electronics',
    'tablet': 'Electronics',
    'ipad': 'Electronics',
    'airpods': 'Electronics',
    'headphones': 'Electronics',
    'wallet': 'Bags & Wallets',
    'purse': 'Bags & Wallets',
    'bag': 'Bags & Wallets',
    'backpack': 'Bags & Wallets',
    'keys': 'Keys & Access Cards',
    'keychain': 'Keys & Access Cards',
    'card': 'Keys & Access Cards',
    'passport': 'Documents',
    'license': 'Documents',
    'certificate': 'Documents',
    'id': 'Documents',
    'aadhar': 'Documents',
    'pan': 'Documents',
    'ring': 'Jewelry',
    'necklace': 'Jewelry',
    'bracelet': 'Jewelry',
    'watch': 'Watches',
    'earring': 'Jewelry',
    'jacket': 'Clothing',
    'shirt': 'Clothing',
    'sweater': 'Clothing',
    'coat': 'Clothing',
    'shoe': 'Clothing',
    'glasses': 'Eyewear',
    'sunglasses': 'Eyewear',
    'book': 'Books & Stationery',
    'notebook': 'Books & Stationery',
    'pen': 'Books & Stationery',
    'toy': 'Toys & Games',
    'game': 'Toys & Games'
  };

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('reportFoundFormData', JSON.stringify(formData));
  }, [formData]);

  // Load saved image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('reportFoundImage');
    if (savedImage) {
      setImagePreview(savedImage);
      setImageBase64(savedImage);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-suggest category based on item name
    if (name === 'itemName' && value && !formData.category) {
      const lowerValue = value.toLowerCase();
      for (const [keyword, category] of Object.entries(categorySuggestions)) {
        if (lowerValue.includes(keyword)) {
          setFormData({ ...formData, category, [name]: value });
          break;
        }
      }
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Compress and resize image to keep under Firestore 1MB limit
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize to max 1024px on longest side
          const maxSize = 1024;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to reduce size
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Only JPEG, JPG, PNG or WebP images are allowed' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Maximum file size is 5MB' });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: '' });

    try {
      // Compress image before storing
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);
      setImageBase64(compressedBase64);
      // Save to localStorage so it persists across page changes
      localStorage.setItem('reportFoundImage', compressedBase64);
    } catch (error) {
      console.error('Image compression error:', error);
      setErrors({ ...errors, image: 'Failed to process image. Please try another.' });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    localStorage.removeItem('reportFoundImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    } else if (formData.itemName.trim().length < 3) {
      newErrors.itemName = 'Item name must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Found location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Please provide a valid location';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description should not exceed 500 characters';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.date) {
      newErrors.date = 'Found date is required';
    }

    // Image validation
    if (!imageBase64 && !imagePreview) {
      newErrors.image = 'Please upload an image of the found item';
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
      setUploadProgress(20);

      // Submit form data to Firestore with base64 image
      const itemData = {
        itemName: formData.itemName,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        whatsappNumber: formData.whatsappNumber,
        contactEmail: formData.contactEmail,
        imageUrl: imageBase64, // Store base64 image directly in Firestore
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || '',
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        contactVerified: false,
        reportType: 'found',
        verificationStatus: 'pending',
        isActive: true,
        lastContacted: null
      };

      setUploadProgress(60);
      console.log('Submitting found item:', itemData);
      const docRef = await addDoc(collection(db, 'found_items'), itemData);
      console.log('Found item submitted successfully with ID:', docRef.id);

      setUploadProgress(100);
      setSuccess(true);
      
      // Clear form data and localStorage
      localStorage.removeItem('reportFoundFormData');
      localStorage.removeItem('reportFoundImage');
      
      setFormData({
        itemName: '',
        category: '',
        location: '',
        description: '',
        whatsappNumber: '',
        contactEmail: currentUser.email,
        date: new Date().toISOString().split('T')[0]
      });
      setImageFile(null);
      setImagePreview(null);
      setImageBase64(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setSuccess(false);
        navigate('/my-items');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ 
        submit: error.message || 'Failed to submit report. Please try again.' 
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: { xs: 4, md: 8 },
      background: `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.accent, 0.05)} 100%)`
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Information Card */}
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              height: '100%',
              borderRadius: '16px',
              border: `1px solid ${alpha(colors.neutral, 0.1)}`,
              bgcolor: colors.card,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    bgcolor: alpha(colors.accent, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SecurityIcon sx={{ fontSize: 28, color: colors.accent }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: colors.primary }}>
                      Report Found Item
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.neutral }}>
                      Help reunite lost property with its owner
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={3} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: colors.success, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.primary, mb: 0.5 }}>
                        Required Documentation
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.neutral }}>
                        Clear photographs are mandatory for verification
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: colors.success, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.primary, mb: 0.5 }}>
                        Secure Communication
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.neutral }}>
                        WhatsApp provides encrypted communication with owners
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: colors.success, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.primary, mb: 0.5 }}>
                        Verification Process
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.neutral }}>
                        All reports undergo authenticity verification
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: colors.success, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.primary, mb: 0.5 }}>
                        Privacy Protection
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.neutral }}>
                        Contact details are only shared with verified owners
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 4, borderColor: alpha(colors.neutral, 0.1) }} />

                <Box sx={{ p: 3, borderRadius: '8px', bgcolor: alpha(colors.accent, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.primary, mb: 2 }}>
                    📸 Image Requirements
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.neutral }}>
                    • High-resolution, well-lit photographs<br />
                    • Multiple angles showing unique features<br />
                    • Include any serial numbers or markings<br />
                    • Maximum file size: 5MB<br />
                    • Accepted formats: JPG, PNG, WebP
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: '16px',
              border: `1px solid ${alpha(colors.neutral, 0.1)}`,
              bgcolor: colors.card,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  bgcolor: alpha(colors.accent, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon sx={{ color: colors.accent }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: colors.primary }}>
                    Item Details
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.neutral }}>
                    Complete all required fields to submit your report
                  </Typography>
                </Box>
              </Box>

              {errors.submit && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${colors.error}`,
                    bgcolor: alpha(colors.error, 0.05)
                  }}
                  onClose={() => setErrors({...errors, submit: ''})}
                >
                  <Typography fontWeight={600}>
                    {errors.submit}
                  </Typography>
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${colors.success}`,
                    bgcolor: alpha(colors.success, 0.05)
                  }}
                  icon={<CheckCircleIcon />}
                >
                  <Typography fontWeight={600}>
                    Report submitted successfully! Redirecting to found items...
                  </Typography>
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Item Name *"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      error={!!errors.itemName}
                      helperText={errors.itemName || "Provide a descriptive name for the item"}
                      required
                      placeholder="e.g., Apple iPhone 13 Pro, Black Leather Wallet, Car Keys"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon sx={{ color: alpha(colors.neutral, 0.7) }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.category}>
                      <TextField
                        select
                        label="Category *"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon sx={{ color: alpha(colors.neutral, 0.7) }} />
                            </InputAdornment>
                          ),
                          sx: { 
                            borderRadius: '8px',
                            '&:hover fieldset': { borderColor: colors.accent },
                            '&.Mui-focused fieldset': { borderColor: colors.accent }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Select Item Category</em>
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
                      label="Found Date *"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      error={!!errors.date}
                      helperText={errors.date}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon sx={{ color: alpha(colors.neutral, 0.7) }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Found Location *"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={!!errors.location}
                      helperText={errors.location || "Be specific about where you found the item"}
                      required
                      placeholder="e.g., Main Library - Second Floor, Building A Lobby, Parking Lot Section B"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon sx={{ color: alpha(colors.neutral, 0.7) }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      label="Detailed Description *"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={!!errors.description}
                      helperText={errors.description || "Include condition, color, brand, serial numbers, and unique features"}
                      required
                      placeholder="Provide a comprehensive description. Include: Condition (new/used/damaged), color, brand/model, serial number if visible, any scratches or marks, and contents (if applicable like wallet contents)..."
                      InputProps={{
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>

                  {/* Enhanced Image Upload Section */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: '12px',
                        border: `2px dashed ${errors.image ? colors.error : alpha(colors.accent, 0.3)}`,
                        bgcolor: errors.image ? alpha(colors.error, 0.02) : alpha(colors.accent, 0.02),
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: errors.image ? colors.error : colors.accent,
                          bgcolor: errors.image ? alpha(colors.error, 0.05) : alpha(colors.accent, 0.05)
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          required
                        />
                        
                        {!imagePreview ? (
                          <Box 
                            sx={{ 
                              cursor: 'pointer', 
                              textAlign: 'center',
                              py: 4
                            }} 
                            onClick={() => fileInputRef.current.click()}
                          >
                            <CloudUploadIcon sx={{ fontSize: 64, color: colors.accent, mb: 3, opacity: 0.8 }} />
                            <Typography variant="h6" fontWeight={700} sx={{ color: colors.primary, mb: 1 }}>
                              Upload Item Photographs *
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.neutral, mb: 2, maxWidth: 400, mx: 'auto' }}>
                              Click to select images or drag and drop here
                            </Typography>
                            <Chip 
                              label="MAX 5MB • JPG, PNG, WebP"
                              size="small"
                              sx={{ 
                                bgcolor: alpha(colors.accent, 0.1), 
                                color: colors.accent,
                                fontWeight: 500 
                              }}
                            />
                            {errors.image && (
                              <Alert 
                                severity="error" 
                                sx={{ 
                                  mt: 3,
                                  borderRadius: '6px',
                                  maxWidth: 400,
                                  mx: 'auto'
                                }}
                              >
                                {errors.image}
                              </Alert>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.primary }}>
                                  Image Preview
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.neutral }}>
                                  {imageFile?.name} • {(imageFile?.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <IconButton
                                onClick={handleRemoveImage}
                                sx={{
                                  bgcolor: alpha(colors.error, 0.1),
                                  '&:hover': { bgcolor: alpha(colors.error, 0.2) }
                                }}
                              >
                                <DeleteIcon sx={{ color: colors.error }} />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ position: 'relative', mb: 3 }}>
                              <Box
                                component="img"
                                src={imagePreview}
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  maxHeight: 400,
                                  objectFit: 'contain',
                                  borderRadius: '8px',
                                  border: `1px solid ${alpha(colors.neutral, 0.1)}`
                                }}
                              />
                              {uploadProgress > 0 && (
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 0, 
                                  left: 0, 
                                  right: 0, 
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: alpha('#000', 0.5),
                                  borderRadius: '8px'
                                }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <CircularProgress 
                                      variant="determinate" 
                                      value={uploadProgress} 
                                      size={60}
                                      sx={{ color: colors.accent, mb: 2 }}
                                    />
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                      {uploadProgress === 100 ? 'Processing...' : `Uploading ${uploadProgress}%`}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <InfoIcon fontSize="small" sx={{ color: colors.neutral }} />
                              <Typography variant="caption" sx={{ color: colors.neutral }}>
                                Click the trash icon to remove and upload a different image
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp Contact *"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      error={!!errors.whatsappNumber}
                      helperText={errors.whatsappNumber || "Used for secure communication with item owner"}
                      required
                      placeholder="10-digit mobile number (e.g., 9876543210)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: alpha(colors.neutral, 0.7) }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      type="email"
                      placeholder="For official communication"
                      helperText="Optional secondary contact method"
                      InputProps={{
                        sx: { 
                          borderRadius: '8px',
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent }
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 6,
                  pt: 4,
                  borderTop: `1px solid ${alpha(colors.neutral, 0.1)}`
                }}>
                  <UIButton
                    variant="outlined"
                    onClick={() => navigate('/')}
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: '8px',
                      borderColor: alpha(colors.neutral, 0.3),
                      color: colors.neutral,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: colors.accent,
                        color: colors.accent
                      }
                    }}
                  >
                    Cancel
                  </UIButton>
                  
                  <UIButton
                    type="submit"
                    variant="contained"
                    disabled={loading || uploadProgress > 0}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: '8px',
                      bgcolor: colors.accent,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: colors.highlight,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(colors.accent, 0.3)}`
                      },
                      '&:disabled': {
                        bgcolor: alpha(colors.neutral, 0.3)
                      },
                      transition: 'all 0.2s'
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Processing Submission...' : 'Submit Found Item Report'}
                  </UIButton>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ 
                mt: 4, 
                display: 'block', 
                textAlign: 'center',
                color: colors.neutral
              }}>
                By submitting, you agree to maintain communication with the item owner and follow our verification process
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportFound;