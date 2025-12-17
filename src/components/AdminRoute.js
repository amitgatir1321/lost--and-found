import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  const { id } = useParams();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  // Restrict access to admin route only if the route param matches the logged in admin's UID
  if (id && currentUser.uid !== id) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
