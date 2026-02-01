import React, { useState, useRef } from 'react';
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
  CircularProgress
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UIButton from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ReportLost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    lastSeenLocation: '',
    dateLost: '',
    description: '',
    whatsappNumber: '',
    contactEmail: currentUser?.email || '',
    reward: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Please upload JPEG, JPG, PNG or WebP image' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size should be less than 5MB' });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: '' });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    if (!formData.lastSeenLocation.trim()) {
      newErrors.lastSeenLocation = 'Last seen location is required';
    }

    if (!formData.dateLost) {
      newErrors.dateLost = 'Date lost is required';
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

    // Image validation
    if (!imageFile) {
      newErrors.image = 'Please upload an image of the lost item';
    }

    return newErrors;
  };

  const uploadImageToStorage = async (file) => {
    if (!file) return null;

    const timestamp = Date.now();
    const fileName = `lost_items/${currentUser.uid}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Create upload task
    const uploadTask = uploadBytes(storageRef, file);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const snapshot = await uploadTask;
      clearInterval(interval);
      setUploadProgress(100);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      clearInterval(interval);
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
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
      setUploadProgress(0);

      // Upload image first
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile);
        if (!imageUrl) {
          throw new Error('Image upload failed');
        }
      }

      // Submit form data to Firestore
      await addDoc(collection(db, 'lost_items'), {
        ...formData,
        imageUrl,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'lost',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        contactVerified: false,
        reportType: 'lost',
        reward: formData.reward || 'No reward mentioned'
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        itemName: '',
        category: '',
        lastSeenLocation: '',
        dateLost: '',
        description: '',
        whatsappNumber: '',
        contactEmail: currentUser.email,
        reward: ''
      });
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setSuccess(false);
        navigate('/lost-items');
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
      backgroundColor: '#F8FAFC', 
      minHeight: '100vh',
      py: { xs: 4, md: 8 },
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Information Card */}
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Lost Something?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                  Report your lost item and increase your chances of recovery.
                </Typography>

                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Image Required
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Upload a clear photo to help identify your item
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Quick Alerts
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Get notified when similar items are found
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Community Help
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Our community helps track down lost items
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Direct Contact
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Finders can contact you directly via WhatsApp
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <strong>Tips for Better Recovery:</strong>
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  • Upload the clearest photo you have<br />
                  • Provide exact location details<br />
                  • Include unique identifying marks<br />
                  • Mention any reward amount<br />
                  • Keep your WhatsApp active for responses
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
                Report Lost Item
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Fill in the details below to help our community find your lost item
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
                  Lost item reported successfully! Redirecting...
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
                      placeholder="e.g., iPhone 13, Black Wallet, Car Keys"
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
                      label="Date Lost"
                      name="dateLost"
                      type="date"
                      value={formData.dateLost}
                      onChange={handleChange}
                      error={!!errors.dateLost}
                      helperText={errors.dateLost}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Last Seen Location"
                      name="lastSeenLocation"
                      value={formData.lastSeenLocation}
                      onChange={handleChange}
                      error={!!errors.lastSeenLocation}
                      helperText={errors.lastSeenLocation}
                      required
                      placeholder="e.g., Main Library, Parking Lot, Restaurant Name"
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
                      helperText={errors.description || "Include color, brand, serial number, unique features"}
                      required
                      placeholder="Describe your item in detail. Include: Color, brand, model, serial number (if any), any scratches or unique marks, contents (if applicable)..."
                    />
                  </Grid>

                  {/* Image Upload Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderStyle: 'dashed', borderColor: errors.image ? 'error.main' : 'grey.300' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          required
                        />
                        
                        {!imagePreview ? (
                          <Box sx={{ cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" color="primary" gutterBottom>
                              Upload Item Image *
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Click to upload a photo of your lost item
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              JPG, PNG or WebP (Max 5MB)
                            </Typography>
                            {errors.image && (
                              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                {errors.image}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                  width: '200px',
                                  height: '200px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0'
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={handleRemoveImage}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  '&:hover': { backgroundColor: 'white' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                              {imageFile?.name}
                            </Typography>
                            {uploadProgress > 0 && (
                              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress variant="determinate" value={uploadProgress} size={24} sx={{ mr: 1 }} />
                                <Typography variant="caption">
                                  {uploadProgress === 100 ? 'Upload Complete' : `Uploading... ${uploadProgress}%`}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number for Contact *"
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reward (Optional)"
                      name="reward"
                      value={formData.reward}
                      onChange={handleChange}
                      placeholder="e.g., ₹500, No reward"
                      helperText="Optional: Mention if you're offering a reward"
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
                    disabled={loading || uploadProgress > 0}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d982e8 0%, #e34c5c 100%)',
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Submitting...' : 'Report Lost Item'}
                  </UIButton>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                Your report will be visible to our community to help find your item
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportLost;