import React, { useState } from 'react';
import { Container, Box, Typography, Button, Paper, Alert } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const SetupAdmin = () => {
  const { currentUser, userRole } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const makeCurrentUserAdmin = async () => {
    if (!currentUser) {
      setError('No user is logged in');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        role: 'admin'
      });
      setMessage(`✅ Success! ${currentUser.email} is now an admin. Please refresh the page.`);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setMessage('');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Admin Setup
        </Typography>

        {currentUser ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Current User:</strong> {currentUser.email}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Current Role:</strong> {userRole || 'Not set'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>User ID:</strong> {currentUser.uid}
            </Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {userRole !== 'admin' ? (
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={makeCurrentUserAdmin}
              >
                Make Me Admin
              </Button>
            ) : (
              <Alert severity="info">
                You are already an admin! Refresh the page if you don't see the Admin button.
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Please login first to set up admin access.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SetupAdmin;
