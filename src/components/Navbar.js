import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

const Navbar = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Navbar - currentUser:', currentUser);
  console.log('Navbar - userRole:', userRole);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#DBC2A6',
        color: '#414A37',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderBottom: '2px solid #99744A'
      }}
    >
      <Toolbar>
        <SearchIcon sx={{ mr: 2, color: '#414A37', fontSize: 28 }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
            color: '#414A37'
          }}
          onClick={() => navigate('/')}
        >
          Lost & Found
        </Typography>
        
        <Box>
          <Button 
            sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button 
            sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
            onClick={() => navigate('/report-lost')}
          >
            Report Lost
          </Button>
          <Button 
            sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
            onClick={() => navigate('/report-found')}
          >
            Report Found
          </Button>
          {currentUser && userRole === 'admin' && (
            <Button 
              sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
              onClick={() => navigate(`/admin/${currentUser.uid}`)}
            >
              Admin
            </Button>
          )}
          <Button 
            sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
            onClick={() => navigate('/contact')}
          >
            Contact
          </Button>
          {currentUser ? (
            <>
              <Button 
                sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
                onClick={() => navigate('/my-claims')}
              >
                My Claims
              </Button>
              <Button 
                sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' } }}
                onClick={() => navigate('/profile')}
              >
                Profile
              </Button>
              <Button 
                sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#414A37', color: '#FFFFFF' } }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              sx={{ color: '#414A37', fontWeight: 600, '&:hover': { backgroundColor: '#414A37', color: '#FFFFFF' } }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
