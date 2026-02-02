import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  Chip,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';

const ItemDetail = () => {
  const { itemId, itemType } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, itemType]);

  const fetchItemDetails = async () => {
    try {
      const collectionName = itemType === 'lost' ? 'lost_items' : 'found_items';
      const itemDoc = await getDoc(doc(db, collectionName, itemId));

      if (itemDoc.exists()) {
        const data = itemDoc.data();
        setItem({
          id: itemDoc.id,
          ...data,
          // normalize fields used by UI
          itemName: data.itemName || data.title || '',
          imageUrl: data.imageUrl || '',
          date: data.date || null,
          location: data.location || ''
        });
      } else {
        setError('Item not found');
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimItem = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setClaimDialogOpen(true);
  };

  const submitClaim = async () => {
    if (!claimMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      // create claim record (status starts as 'pending')
      await addDoc(collection(db, 'claims'), {
        itemId: item.id,
        itemTitle: item.itemName || '',
        itemType: itemType,
        itemOwnerId: item.userId,
        itemOwnerEmail: item.userEmail || '',
        claimantUserId: currentUser.uid,
        claimantEmail: currentUser.email || '',
        claimantName: currentUser.displayName || currentUser.email || '',
        message: claimMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setClaimDialogOpen(false);
      setClaimMessage('');
      setClaimSuccess(true);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Item not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const isLost = itemType === 'lost';
  const dateField = item.date || null;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: isLost 
            ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.9) 0%, rgba(183, 28, 28, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(46, 125, 50, 0.9) 0%, rgba(27, 94, 32, 0.85) 100%)',
          color: 'white',
          py: 4,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ color: 'white', mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            {isLost ? 'Lost Item Details' : 'Found Item Details'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        {claimSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            Claim submitted successfully! The item owner will be notified via email.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                position: 'sticky',
                top: 100
              }}
            >
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  image={item.imageUrl}
                  alt={item.itemName}
                  sx={{ 
                    width: '100%',
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              )}
            </Card>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={isLost ? 'Lost Item' : 'Found Item'}
                  color={isLost ? 'error' : 'success'}
                  sx={{ fontWeight: 600, mb: 2 }}
                />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {item.itemName}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {item.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.category}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOnIcon sx={{ color: 'error.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarTodayIcon sx={{ color: 'info.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Date {isLost ? 'Lost' : 'Found'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(dateField).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Posted By
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.userEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {currentUser && currentUser.uid !== item.userId && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<EmailIcon />}
                  onClick={handleClaimItem}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    backgroundColor: isLost ? '#d32f2f' : '#2e7d32',
                    '&:hover': {
                      backgroundColor: isLost ? '#b71c1c' : '#1b5e20',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {isLost ? 'I Found This Item' : 'This is My Item'}
                </Button>
              )}

              {item.whatsappNumber && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  href={`https://wa.me/91${item.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                >
                  Contact on WhatsApp
                </Button>
              )}

              {currentUser && currentUser.uid === item.userId && (
                <Alert severity="info">
                  This is your {isLost ? 'lost' : 'found'} item report
                </Alert>
              )}

              {!currentUser && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.5 }}
                >
                  Login to Claim
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Claim Dialog */}
      <Dialog 
        open={claimDialogOpen} 
        onClose={() => setClaimDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isLost ? 'Claim Found Item' : 'Claim Your Item'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a message to the item owner with details about how you can verify ownership or return the item.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Message"
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            placeholder={isLost 
              ? "I found your item at... I can return it to..." 
              : "This is my item. I can verify ownership by..."
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setClaimDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={submitClaim}
            disabled={submitting || !claimMessage.trim()}
            sx={{
              backgroundColor: isLost ? '#d32f2f' : '#2e7d32',
              '&:hover': {
                backgroundColor: isLost ? '#b71c1c' : '#1b5e20'
              }
            }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemDetail;
