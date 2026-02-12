import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Profile = () => {
  const { currentUser, userRole, updateUserProfile, updateUserPassword, resendVerificationEmail } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    totalClaims: 0,
    resolvedItems: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔐 Edit Profile
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // 🔐 Change Password
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // 📧 Email Verification
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;

      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          setProfile(userSnap.data());
          setEditName(userSnap.data().name || '');
          setEditPhone(userSnap.data().phone || '');
          setEditWhatsApp(userSnap.data().whatsapp || '');
        }

        const lostQuery = query(collection(db, 'lost_items'), where('userId', '==', currentUser.uid));
        const foundQuery = query(collection(db, 'found_items'), where('userId', '==', currentUser.uid));

        const [lostSnap, foundSnap] = await Promise.all([
          getDocs(lostQuery),
          getDocs(foundQuery)
        ]);

        const lostItems = lostSnap.docs.map(doc => doc.data());
        const foundItems = foundSnap.docs.map(doc => doc.data());

        const resolvedCount = [...lostItems, ...foundItems].filter(
          item => item.status === 'resolved'
        ).length;

        setStats({
          lostItems: lostItems.length,
          foundItems: foundItems.length,
          totalClaims: lostItems.length + foundItems.length,
          resolvedItems: resolvedCount
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }

      setLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // ✅ SAVE PROFILE (NAME + PHONE + WHATSAPP)
  const handleEditProfileSubmit = async () => {
    setEditError('');
    setEditSuccess(false);

    if (!editName.trim()) {
      setEditError('Name cannot be empty');
      return;
    }

    setEditLoading(true);
    try {
      // Update name and WhatsApp through auth context
      await updateUserProfile(editName.trim(), editWhatsApp.trim());

      // Also update phone separately since it's not handled by updateUserProfile
      const updateData = {
        phone: editPhone.trim()
      };

      // Only add whatsapp to updateDoc if provided
      if (editWhatsApp.trim()) {
        updateData.whatsapp = editWhatsApp.trim();
      }

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);

      setProfile({ 
        ...profile, 
        name: editName.trim(), 
        phone: editPhone.trim(),
        ...(editWhatsApp.trim() && { whatsapp: editWhatsApp.trim() })
      });
      setEditSuccess(true);

      setTimeout(() => {
        setEditDialogOpen(false);
        setEditSuccess(false);
      }, 1500);
    } catch (error) {
      setEditError(error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* PROFILE HEADER CARD */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'rgba(255,255,255,0.3)',
                border: '4px solid white',
                fontSize: '3rem'
              }}
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: '3rem' }} />}
            </Avatar>
          </Grid>

          <Grid item xs={12} sm>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile?.name || 'User Profile'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<EmailIcon />}
                label={currentUser.email}
                variant="outlined"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}
              />
              {profile?.emailVerified && (
                <Chip
                  icon={<VerifiedUserIcon />}
                  label="Email Verified"
                  color="success"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white ;' }}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ bgcolor: 'white', color: '#667eea', fontWeight: 'bold', '&:hover': { bgcolor: '#f0f0f0' } }}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* STATS SECTION */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <SearchOffIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              {stats.lostItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lost Items Reported
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <FindInPageIcon sx={{ fontSize: 40, color: '#f39c12', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              {stats.foundItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Found Items Reported
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: '#3498db', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              {stats.totalClaims}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Claims
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#27ae60', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              {stats.resolvedItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved Items
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* PROFILE DETAILS SECTION */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Account Information
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Full Name:</Typography>
              <Typography fontWeight="500">{profile?.name || 'Not set'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Email:</Typography>
              <Typography fontWeight="500">{currentUser.email}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Phone/WhatsApp:</Typography>
              <Typography fontWeight="500">{profile?.phone || 'Not set'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Account Created:</Typography>
              <Typography fontWeight="500">
                {profile?.createdAt ? new Date(profile.createdAt.toDate?.() || profile.createdAt).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography color="text.secondary">Email Verified:</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={currentUser?.emailVerified ? <CheckCircleIcon /> : <CloseIcon />}
                  label={currentUser?.emailVerified ? 'Verified' : 'Pending'}
                  color={currentUser?.emailVerified ? 'success' : 'warning'}
                  size="small"
                />
                {!currentUser?.emailVerified && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={async () => {
                      setVerificationLoading(true);
                      setVerificationError('');
                      try {
                        await resendVerificationEmail();
                        setVerificationMessage('Verification email sent! Please check your inbox.');
                        setTimeout(() => setVerificationMessage(''), 4000);
                      } catch (error) {
                        setVerificationError(error.message || 'Failed to send verification email');
                      } finally {
                        setVerificationLoading(false);
                      }
                    }}
                    disabled={verificationLoading}
                  >
                    {verificationLoading ? 'Sending...' : 'Send Verification Link'}
                  </Button>
                )}
              </Box>
            </Box>
            {verificationError && (
              <Alert severity="error" sx={{ mt: 1 }}>{verificationError}</Alert>
            )}
            {verificationMessage && (
              <Alert severity="success" sx={{ mt: 1 }}>{verificationMessage}</Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WhatsAppIcon sx={{ color: '#25D366' }} /> WhatsApp & Contact
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>📱 Your WhatsApp number will only be shared with users whose claims have been approved.</strong>
              </Typography>
            </Alert>

            {(profile?.phone || profile?.whatsapp) ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Primary Contact Number:
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {profile?.phone || 'Not set'}
                  </Typography>
                </Box>

                {profile?.whatsapp && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Alternative WhatsApp Number:
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {profile.whatsapp}
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  fullWidth
                  onClick={() => {
                    const message = 'Hi! I am claiming an item you found.';
                    const phoneNumber = profile?.whatsapp || profile?.phone;
                    const url = buildWhatsAppUrl(phoneNumber, message);
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } else {
                      alert('Invalid WhatsApp number. Please update your profile.');
                    }
                  }}
                  sx={{ mb: 2 }}
                >
                  <WhatsAppIcon sx={{ mr: 1 }} />
                  Start WhatsApp Chat
                </Button>

                <Alert severity="success" sx={{ mt: 2 }}>
                  ✅ WhatsApp contact information is active
                </Alert>
              </>
            ) : (
              <Alert severity="warning">
                ⚠️ No WhatsApp number configured. Please add one in your profile to allow claimants to contact you.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* RECENT ACTIVITY SECTION */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon /> Activity Summary
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography>Lost Items Completion Rate</Typography>
              <Typography fontWeight="bold">
                {stats.lostItems > 0 ? Math.round((stats.resolvedItems / stats.totalClaims) * 100) : 0}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={stats.lostItems > 0 ? (stats.resolvedItems / stats.totalClaims) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Paper>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully</Alert>}

          <TextField
            fullWidth
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Primary Phone Number"
            placeholder="10-digit mobile number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            helperText="Used for primary contact (can be left empty)"
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="WhatsApp Number (Optional)"
            placeholder="10-digit WhatsApp number"
            value={editWhatsApp}
            onChange={(e) => setEditWhatsApp(e.target.value)}
            helperText="Alternative WhatsApp number - will only be shared with approved claimants"
            sx={{ mt: 2 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ℹ️ Your WhatsApp number will only be shared with users whose claims have been approved.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditProfileSubmit}
            disabled={editLoading || editSuccess}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CHANGE PASSWORD DIALOG */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully</Alert>}

          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Password change logic would go here
              alert('Password change feature coming soon');
            }}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
