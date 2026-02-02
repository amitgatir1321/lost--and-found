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
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ReportLost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Load saved form data from localStorage on component mount
  const loadFormData = () => {
    const savedData = localStorage.getItem('reportLostFormData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      itemName: '',
      category: '',
      location: '',
      date: '',
      description: '',
      whatsappNumber: '',
      contactEmail: currentUser?.email || '',
      reward: ''
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
    'watch': 'Jewelry',
    'earring': 'Jewelry',
    'jacket': 'Clothing',
    'shirt': 'Clothing',
    'sweater': 'Clothing',
    'coat': 'Clothing',
    'shoe': 'Clothing',
    'glasses': 'Clothing',
    'sunglasses': 'Clothing',
    'book': 'Books & Stationery',
    'notebook': 'Books & Stationery',
    'pen': 'Books & Stationery',
    'toy': 'Toys & Games',
    'game': 'Toys & Games',
    'pet': 'Pets & Animals',
    'dog': 'Pets & Animals',
    'cat': 'Pets & Animals'
  };

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('reportLostFormData', JSON.stringify(formData));
  }, [formData]);

  // Load saved image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('reportLostImage');
    if (savedImage) {
      setImagePreview(savedImage);
      setImageBase64(savedImage);
    }
  }, []);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-suggest category based on item name
    if (name === 'itemName' && value && !formData.category) {
      const lowerValue = value.toLowerCase();
      for (const [keyword, category] of Object.entries(categorySuggestions)) {
        if (lowerValue.includes(keyword)) {
          setFormData((prev) => ({ ...prev, category, [name]: value }));
          break;
        }
      }
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please upload JPEG, JPG, PNG or WebP image' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    setImageFile(file);
    setUploadProgress(0);
    setErrors((prev) => ({ ...prev, image: '' }));

    try {
      // Compress image before storing
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);
      setImageBase64(compressedBase64);
      // Save to localStorage so it persists across page changes
      localStorage.setItem('reportLostImage', compressedBase64);
    } catch (error) {
      console.error('Image compression error:', error);
      setErrors((prev) => ({ ...prev, image: 'Failed to process image. Please try another.' }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setUploadProgress(0);
    localStorage.removeItem('reportLostImage');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';

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

    if (!imageBase64 && !imagePreview) {
      newErrors.image = 'Please upload an image of the lost item';
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

      // Use base64 image stored in Firebase DB instead of Firebase Storage
      const itemData = {
        itemName: formData.itemName,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        whatsappNumber: formData.whatsappNumber,
        contactEmail: formData.contactEmail,
        reward: formData.reward?.trim() ? formData.reward.trim() : 'No reward mentioned',
        imageUrl: imageBase64, // Store base64 image directly in Firestore
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'lost',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        contactVerified: false,
        reportType: 'lost'
      };

      setUploadProgress(60);
      const docRef = await addDoc(collection(db, 'lost_items'), itemData);
      console.log('Lost item submitted successfully with ID:', docRef.id);

      setUploadProgress(100);
      setSuccess(true);

      // Clear form data and localStorage
      localStorage.removeItem('reportLostFormData');
      localStorage.removeItem('reportLostImage');

      setFormData({
        itemName: '',
        category: '',
        location: '',
        date: '',
        description: '',
        whatsappNumber: '',
        contactEmail: currentUser.email,
        reward: ''
      });
      setImageFile(null);
      setImagePreview(null);
      setImageBase64(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setSuccess(false);
        navigate('/my-items');
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({
        submit: error?.message || 'Failed to submit report. Please try again.'
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
                  {[
                    { title: 'Image Required', desc: 'Upload a clear photo to help identify your item' },
                    { title: 'Quick Alerts', desc: 'Get notified when similar items are found' },
                    { title: 'Community Help', desc: 'Our community helps track down lost items' },
                    { title: 'Direct Contact', desc: 'Finders can contact you directly via WhatsApp' }
                  ].map((it) => (
                    <Box key={it.title} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{it.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>{it.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
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
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors((p) => ({ ...p, submit: '' }))}>
                  {errors.submit}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon fontSize="inherit" />}>
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
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={!!errors.location}
                      helperText={errors.location}
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
                      placeholder="Describe your item in detail..."
                    />
                  </Grid>

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
                          <Box sx={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
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
                    disabled={loading}
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
