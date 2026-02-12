import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { submitClaim, checkExistingClaim } from '../services/claimsService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  const [submitting, setSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [existingClaim, setExistingClaim] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [itemId, itemType]);

  useEffect(() => {
    if (currentUser && item) {
      checkExistingClaim(currentUser.uid, item.id, itemType).then(exists => 
        setExistingClaim(exists)
      );
    }
  }, [currentUser, item, itemType]);

  const fetchItem = async () => {
    try {
      const col = itemType === 'lost' ? 'lost_items' : 'found_items';
      const snap = await getDoc(doc(db, col, itemId));

      if (!snap.exists()) {
        setError('Item not found');
        return;
      }

      setItem({ id: snap.id, ...snap.data() });
    } catch (err) {
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = () => {
    if (!currentUser) {
      alert('Please login to claim this item');
      return;
    }
    if (existingClaim) {
      alert('You already have a pending or approved claim for this item');
      return;
    }
    setClaimDialogOpen(true);
  };

  const handleSubmitClaim = async () => {
    if (!claimMessage.trim() || claimMessage.length < 20) {
      setError('Please provide at least 20 characters of claim details');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const claimData = {
        claimantId: currentUser.uid,
        claimantName: currentUser.displayName || currentUser.email,
        claimantEmail: currentUser.email,
        itemOwnerId: item.userId,
        claimMessage: claimMessage.trim(),
        itemName: item.itemName || item.title || 'Item',
        category: item.category || 'miscellaneous'
      };

      if (itemType === 'lost') {
        claimData.lostItemId = item.id;
      } else {
        claimData.foundItemId = item.id;
      }

      const result = await submitClaim(claimData);

      if (result.success) {
        setClaimDialogOpen(false);
        setClaimMessage('');
        setClaimSuccess(true);
        setTimeout(() => {
          setClaimSuccess(false);
          setExistingClaim(true);
        }, 3000);
      } else {
        setError(result.error || 'Failed to submit claim');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
      console.error('Claim submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !item) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        {item?.imageUrl && (
          <CardMedia component="img" height="260" image={item.imageUrl} />
        )}
        <Box p={3}>
          <Typography variant="h5" fontWeight="bold">
            {item?.itemName || item?.title}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography><strong>Category:</strong> {item?.category}</Typography>
              <Typography><strong>Location:</strong> {item?.location}</Typography>
              <Typography><strong>Date:</strong> {item?.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><strong>Description:</strong></Typography>
              <Typography>{item?.description}</Typography>
            </Grid>
          </Grid>

          {currentUser && currentUser.uid !== item?.userId && !existingClaim && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<EmailIcon />}
              sx={{ mt: 3 }}
              onClick={handleClaim}
            >
              {itemType === 'lost' ? 'I Found This Item' : 'This is My Item'}
            </Button>
          )}

          {existingClaim && currentUser && currentUser.uid !== item?.userId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You already have a claim on this item pending review.
            </Alert>
          )}

          {claimSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Claim submitted successfully! The item owner will review your claim.
            </Alert>
          )}

          {currentUser?.uid === item?.userId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This is your item. Check "My Claims" tab to see claims from others.
            </Alert>
          )}
        </Box>
      </Card>

      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Claim Item - Provide Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Describe your proof of ownership or connection to this item. Be specific and honest.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Proof / Ownership Details"
              placeholder="Describe how you lost this item, unique characteristics you remember, receipt information, etc..."
              value={claimMessage}
              onChange={e => setClaimMessage(e.target.value)}
              disabled={submitting}
              helperText={`${claimMessage.length}/500 characters (minimum 20)`}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitClaim}
            disabled={submitting || claimMessage.trim().length < 20}
          >
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetail;
