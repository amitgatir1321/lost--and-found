import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { submitClaim, checkExistingClaim } from '../services/claimsService';
import { useAuth } from '../contexts/AuthContext';

const ClaimForm = ({
  open,
  onClose,
  item,
  itemType,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [claimMessage, setClaimMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!claimMessage.trim()) {
      setError('Please provide details about your claim');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms');
      return;
    }

    if (claimMessage.length < 20) {
      setError('Claim details must be at least 20 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user already has a pending/approved claim
      const existingClaim = await checkExistingClaim(
        currentUser.uid,
        item.id,
        itemType
      );

      if (existingClaim) {
        setError('You already have a pending or approved claim for this item');
        setLoading(false);
        return;
      }

      // Submit the claim
      const result = await submitClaim({
        claimantId: currentUser.uid,
        claimantName: currentUser.displayName || currentUser.email,
        claimantEmail: currentUser.email,
        itemId: item.id,
        itemType: itemType,
        itemOwnerId: item.userId,
        claimMessage: claimMessage.trim(),
        itemName: item.itemName,
        category: item.category
      });

      if (result.success) {
        setSuccess(true);
        setClaimMessage('');
        setAgreeTerms(false);
        
        // Notify parent component
        if (onSuccess) {
          onSuccess(result.claimId);
        }

        // Auto-close after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit claim');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the claim');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClaimMessage('');
    setError('');
    setSuccess(false);
    setAgreeTerms(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: '#fafafa'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1976d2',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}
      >
        Claim This Item
        <Button
          onClick={handleClose}
          size="small"
          sx={{ color: 'white', minWidth: 'auto' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, fontWeight: 'bold' }}>
              ✅ Claim Submitted Successfully!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your claim has been submitted and is pending review. You will receive an email and WhatsApp notification once the owner responds.
            </Typography>
          </Box>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Claim Submission Guidelines:</strong>
              <ul style={{ margin: '10px 0 0 0' }}>
                <li>Provide as much detail as possible about the item</li>
                <li>Include proof or unique identifying features</li>
                <li>Be honest about how and where you lost/found it</li>
              </ul>
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Item Details:
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {item.itemName}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {item.category}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {item.location}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={5}
              label="Claim Details & Proof"
              placeholder="Describe your connection to this item, provide unique identifying information, explain how you lost or found it, etc..."
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ mb: 2 }}
              helperText={`${claimMessage.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
            />

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              Once submitted, the item owner will review your claim and approve or reject it within 7 days.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Typography variant="body2">
                  I confirm that the information I've provided is accurate and truthful
                </Typography>
              }
              sx={{ mb: 2 }}
            />
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!agreeTerms || loading || !claimMessage.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ClaimForm;
