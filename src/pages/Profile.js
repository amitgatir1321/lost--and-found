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
  CircularProgress
} from '@mui/material';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    totalClaims: 0,
    resolvedItems: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        // Load user profile
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          setProfile(userSnap.data());
        }

        // Load user statistics
        const lostQuery = query(collection(db, 'lostItems'), where('userId', '==', currentUser.uid));
        const foundQuery = query(collection(db, 'foundItems'), where('userId', '==', currentUser.uid));
        const claimsQuery = query(collection(db, 'claims'), where('claimantId', '==', currentUser.uid));

        const [lostSnap, foundSnap, claimsSnap] = await Promise.all([
          getDocs(lostQuery),
          getDocs(foundQuery),
          getDocs(claimsQuery)
        ]);

        const lostItems = lostSnap.docs.map(doc => doc.data());
        const foundItems = foundSnap.docs.map(doc => doc.data());
        
        const resolvedCount = [...lostItems, ...foundItems].filter(
          item => item.status === 'resolved'
        ).length;

        setStats({
          lostItems: lostItems.length,
          foundItems: foundItems.length,
          totalClaims: claimsSnap.size,
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
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Authentication Required
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }}>
            Please log in to view your profile.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} sx={{ color: '#414A37' }} />
      </Box>
    );
  }

  const memberDays = profile?.createdAt 
    ? Math.floor((Date.now() - new Date(profile.createdAt.seconds * 1000)) / (1000 * 60 * 60 * 24))
    : 0;

  const activityScore = stats.lostItems + stats.foundItems + stats.totalClaims + stats.resolvedItems * 2;
  const maxScore = 50;
  const activityPercentage = Math.min((activityScore / maxScore) * 100, 100);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Paper 
        elevation={4}
        sx={{ 
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #414A37 0%, #5a6449 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  bgcolor: '#DBC2A6',
                  color: '#414A37',
                  width: 100, 
                  height: 100,
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {profile?.name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {profile?.name || 'Unnamed User'}
                </Typography>
                {userRole === 'admin' && (
                  <Chip 
                    icon={<VerifiedUserIcon />} 
                    label="Admin" 
                    size="small"
                    sx={{ 
                      bgcolor: '#DBC2A6', 
                      color: '#414A37',
                      fontWeight: 'bold'
                    }} 
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ fontSize: 18 }} />
                <Typography variant="body1">{currentUser.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  Member for {memberDays} days
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Tooltip title="Edit Profile">
                <IconButton 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
        
        {/* Decorative background shapes */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            opacity: 0.5
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -30, 
            width: 150, 
            height: 150,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            opacity: 0.5
          }} 
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Stats Cards */}
        <Grid item xs={12} md={8}>
          {/* Activity Stats */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ mr: 1, color: '#414A37' }} />
              <Typography variant="h6" fontWeight="bold">
                Activity Overview
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#FFF8F0', boxShadow: 'none' }}>
                  <CardContent>
                    <SearchOffIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="#d32f2f">
                      {stats.lostItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lost Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#F0FFF4', boxShadow: 'none' }}>
                  <CardContent>
                    <FindInPageIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                      {stats.foundItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#F3F0FF', boxShadow: 'none' }}>
                  <CardContent>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#7c4dff', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="#7c4dff">
                      {stats.totalClaims}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Claims
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#FFF8E1', boxShadow: 'none' }}>
                  <CardContent>
                    <VerifiedUserIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="#f57c00">
                      {stats.resolvedItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolved
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Activity Score */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Community Engagement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your contribution to the Lost & Found community
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={activityPercentage} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #414A37 0%, #99744A 100%)',
                      borderRadius: 6
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                {Math.round(activityPercentage)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Activity Score: {activityScore} / {maxScore}
            </Typography>
          </Paper>
        </Grid>

        {/* Right Column - Profile Details */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Profile Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1.5, color: '#414A37' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {profile?.name || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1.5, color: '#414A37' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Area
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {profile?.area || 'Not specified'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VerifiedUserIcon sx={{ mr: 1.5, color: '#414A37' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {userRole === 'admin' ? 'Administrator' : 'Standard User'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1.5, color: '#414A37' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {profile?.createdAt 
                      ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />
            
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                mb: 1,
                borderColor: '#414A37', 
                color: '#414A37',
                '&:hover': { 
                  borderColor: '#99744A',
                  bgcolor: 'rgba(65, 74, 55, 0.04)'
                } 
              }}
              onClick={() => navigate('/my-claims')}
            >
              View My Claims
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ 
                bgcolor: '#414A37', 
                '&:hover': { bgcolor: '#99744A' } 
              }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
