import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ReportIcon from '@mui/icons-material/Report';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ClaimIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Navbar = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchPendingClaims();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingClaims, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchPendingClaims = async () => {
    if (!currentUser) return;
    try {
      const claimsQuery = query(
        collection(db, 'claims'),
        where('itemOwnerId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      const claimsSnap = await getDocs(claimsQuery);
      setPendingClaimsCount(claimsSnap.size);
    } catch (error) {
      console.error('Error fetching pending claims:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    setConfirmLogout(false);
    handleMenuClose();
    setMobileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    if (!confirmLogout) {
      return;
    }

    try {
      await logout();
      setLogoutDialogOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
    setConfirmLogout(false);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'How It Works', path: '/how-it-works', icon: <InfoIcon /> },
    { label: 'Report Lost', path: '/report-lost', icon: <ReportIcon /> },
    { label: 'Report Found', path: '/report-found', icon: <FindInPageIcon /> },
    { label: 'Contact', path: '/contact', icon: <ContactMailIcon /> },
  ];

  const userMenuItems = currentUser ? [
    { label: 'My Claims', path: '/my-claims', icon: <ClaimIcon /> },
    { label: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
  ] : [];

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #DBC2A6 0%, #C9B299 100%)',
          color: '#414A37',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderBottom: '2px solid #99744A',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo Section */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => handleNavigate('/')}
            >
              <SearchIcon 
                sx={{ 
                  mr: 1, 
                  color: '#414A37', 
                  fontSize: { xs: 28, md: 32 },
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 800,
                  color: '#414A37',
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px'
                }}
              >
                Lost & Found
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.path}
                    startIcon={item.icon}
                    sx={{ 
                      color: '#414A37', 
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      position: 'relative',
                      backgroundColor: isActive(item.path) ? 'rgba(65, 74, 55, 0.1)' : 'transparent',
                      '&:hover': { 
                        backgroundColor: '#99744A', 
                        color: '#FFFFFF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.3s ease',
                      '&::after': isActive(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '70%',
                        height: '3px',
                        backgroundColor: '#414A37',
                        borderRadius: '3px 3px 0 0',
                      } : {}
                    }}
                    onClick={() => handleNavigate(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}

                {currentUser && userRole === 'admin' && (
                  <Button 
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{ 
                      color: '#414A37', 
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: isActive('/admin') ? 'rgba(65, 74, 55, 0.1)' : 'transparent',
                      '&:hover': { 
                        backgroundColor: '#99744A', 
                        color: '#FFFFFF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => handleNavigate('/admin')}
                  >
                    Admin
                  </Button>
                )}

                {currentUser ? (
                  <>
                    <Tooltip title="Account">
                      <IconButton
                        onClick={handleMenuOpen}
                        sx={{
                          ml: 1,
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                          transition: 'transform 0.2s'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: '#414A37',
                            width: 36,
                            height: 36,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          {getInitials(currentUser.email)}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 200,
                          borderRadius: 2,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary">
                          Signed in as
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {currentUser.email}
                        </Typography>
                      </Box>
                      {userMenuItems.map((item) => (
                        <MenuItem 
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          sx={{
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'rgba(65, 74, 55, 0.08)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: '#414A37' }}>
                            {item.path === '/my-claims' && pendingClaimsCount > 0 ? (
                              <Badge badgeContent={pendingClaimsCount} color="error">
                                {item.icon}
                              </Badge>
                            ) : (
                              item.icon
                            )}
                          </ListItemIcon>
                          <ListItemText>{item.label}</ListItemText>
                        </MenuItem>
                      ))}
                      <Divider />
                      <MenuItem 
                        onClick={handleLogoutClick}
                        sx={{
                          py: 1.5,
                          color: '#d32f2f',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: '#d32f2f' }}>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button 
                    startIcon={<LoginIcon />}
                    variant="contained"
                    sx={{ 
                      ml: 1,
                      bgcolor: '#414A37',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(65, 74, 55, 0.3)',
                      '&:hover': { 
                        bgcolor: '#2d3326',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(65, 74, 55, 0.4)'
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => handleNavigate('/login')}
                  >
                    Login
                  </Button>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ 
                  color: '#414A37',
                  '&:hover': {
                    backgroundColor: 'rgba(65, 74, 55, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(180deg, #DBC2A6 0%, #F5F5F5 100%)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} color="#414A37">
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {currentUser && (
          <>
            <Box sx={{ px: 2, py: 2, backgroundColor: 'rgba(65, 74, 55, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#414A37', width: 40, height: 40 }}>
                  {getInitials(currentUser.email)}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                    {currentUser.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                onClick={() => handleNavigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(65, 74, 55, 0.15)',
                    borderLeft: '4px solid #414A37',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#414A37', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 700 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {currentUser && userRole === 'admin' && (
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => handleNavigate('/admin')}
                selected={isActive('/admin')}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(65, 74, 55, 0.15)',
                    borderLeft: '4px solid #414A37',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#414A37', minWidth: 40 }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Admin" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/admin') ? 700 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {currentUser && (
            <>
              <Divider sx={{ my: 1 }} />
              {userMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton 
                    onClick={() => handleNavigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(65, 74, 55, 0.15)',
                        borderLeft: '4px solid #414A37',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#414A37', minWidth: 40 }}>
                      {item.path === '/my-claims' && pendingClaimsCount > 0 ? (
                        <Badge badgeContent={pendingClaimsCount} color="error">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{
                        fontWeight: isActive(item.path) ? 700 : 500
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={handleLogoutClick}
                  sx={{
                    py: 1.5,
                    color: '#d32f2f',
                  }}
                >
                  <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {!currentUser && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigate('/login')}
                  sx={{
                    py: 1.5,
                    backgroundColor: '#414A37',
                    color: '#FFFFFF',
                    margin: 2,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#2d3326',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 40 }}>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Login"
                    primaryTypographyProps={{
                      fontWeight: 600
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to logout from your account?
          </DialogContentText>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You will need to login again to access your profile, claims, and other features.
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmLogout}
                onChange={(e) => setConfirmLogout(e.target.checked)}
                sx={{ 
                  color: '#414A37', 
                  '&.Mui-checked': { color: '#414A37' } 
                }}
              />
            }
            label="Yes, I want to logout"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleLogoutCancel}
            sx={{ 
              color: '#414A37',
              '&:hover': { bgcolor: 'rgba(65, 74, 55, 0.04)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            disabled={!confirmLogout}
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' },
              '&:disabled': { bgcolor: '#e0e0e0' }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
