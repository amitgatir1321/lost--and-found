import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid, Avatar, Button } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
      setLoading(false);
    };
    loadProfile();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Please log in to view your profile.</Typography>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: '#414A37', width: 72, height: 72 }}>
              {profile?.name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profile?.name || 'Unnamed User'}
            </Typography>
            <Typography color="text.secondary">{currentUser.email}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Area</Typography>
                <Typography>{profile?.area || '—'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                <Typography>{profile?.role || 'user'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                <Typography>{profile?.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : '—'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button variant="contained" sx={{ bgcolor: '#414A37', '&:hover': { bgcolor: '#99744A' } }}>
            Edit Profile (Coming Soon)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
