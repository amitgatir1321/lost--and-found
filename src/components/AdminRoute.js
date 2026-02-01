import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  // ⏳ Still loading auth state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 🚫 Not logged in
  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  // 🔐 Not admin
  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  // ✅ Admin - allow access
  return children;
};

export default AdminRoute;
