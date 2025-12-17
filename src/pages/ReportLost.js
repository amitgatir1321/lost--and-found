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
  CircularProgress
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportLost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLost: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let imageUrl = '';

      if (image) {
        const imageRef = ref(storage, `lostItems/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'lostItems'), {
        ...formData,
        imageUrl,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'active',
        createdAt: new Date(),
        dateLost: formData.dateLost
      });

      setSuccess('Lost item reported successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError('Failed to report item: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="secondary">
            Report Lost Item
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Item Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              margin="normal"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              required
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Date Lost"
              name="dateLost"
              type="date"
              value={formData.dateLost}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Image (Optional)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {image.name}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Report Lost Item'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportLost;
