import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
  Autocomplete,
  Stack,
  alpha,
  Avatar,
  AvatarGroup
} from '@mui/material';
import UIButton from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';

// Professional color scheme
const colors = {
  primary: '#1A365D', // Navy Blue
  secondary: '#2D3748', // Charcoal
  accent: '#3182CE', // Royal Blue
  success: '#38A169', // Forest Green
  warning: '#DD6B20', // Burnt Orange
  error: '#E53E3E', // Crimson Red
  neutral: '#718096', // Slate Gray
  background: '#F7FAFC', // Light Gray
  card: '#FFFFFF', // White
  highlight: '#2B6CB0' // Deep Blue
};

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: '6px',
  '&.MuiChip-outlined': {
    borderWidth: '2px'
  }
}));

const Home = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Common locations for autocomplete
  const commonLocations = [
    'Campus Library',
    'Student Union Building',
    'Main Cafeteria',
    'Parking Garage A',
    'Parking Garage B',
    'Sports Stadium',
    'Science Complex',
    'Engineering Building',
    'Business School',
    'Medical Center',
    'Administration Building',
    'Technology Hub',
    'Residential Halls',
    'Gymnasium',
    'Auditorium',
    'Bookstore',
    'Food Court',
    'Central Park',
    'Downtown Mall',
    'Public Library',
    'Bus Terminal',
    'Train Station',
    'Coffee Shop',
    'Conference Center'
  ];

  const categories = [
    'all',
    'Electronics',
    'Documents',
    'Jewelry',
    'Watches',
    'Clothing',
    'Bags & Wallets',
    'Keys & Access Cards',
    'Eyewear',
    'Books & Stationery',
    'Sports Equipment',
    'Toys & Games',
    'Other Valuables'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    findMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lostItems, foundItems]);

  const fetchItems = async () => {
    try {
      const lostQuery = query(collection(db, 'lost_items'));
      const foundQuery = query(collection(db, 'found_items'));

      const lostSnapshot = await getDocs(lostQuery);
      const foundSnapshot = await getDocs(foundQuery);

      const normalize = (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          itemName: data.itemName || data.title || '',
          imageUrl: data.imageUrl || '',
          date: data.date || null,
          location: data.location || '',
          createdAt: data.createdAt || serverTimestamp()
        };
      };

      setLostItems(lostSnapshot.docs.map(normalize));
      setFoundItems(foundSnapshot.docs.map(normalize));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const findMatches = () => {
    const potentialMatches = [];
    
    lostItems.forEach(lost => {
      foundItems.forEach(found => {
        if (lost.category === found.category && 
            lost.location === found.location) {
          potentialMatches.push({
            lost,
            found,
            matchScore: 100
          });
        }
      });
    });
    
    setMatches(potentialMatches);
  };

  // Filter items based on search, category, and location
  const filteredLostItems = lostItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const locationMatch = !filterLocation || 
      item.location?.toLowerCase().includes(filterLocation.toLowerCase());
    const searchMatch = !searchQuery || 
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && locationMatch && searchMatch;
  });

  const filteredFoundItems = foundItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const locationMatch = !filterLocation || 
      item.location?.toLowerCase().includes(filterLocation.toLowerCase());
    const searchMatch = !searchQuery || 
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && locationMatch && searchMatch;
  });

  const submitClaim = async () => {
    if (!claimMessage.trim()) return;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    await addDoc(collection(db, 'claims'), {
      itemId: selectedItem.id,
      itemTitle: selectedItem.itemName || selectedItem.title || '',
      itemType: selectedItem.itemType,
      itemOwnerId: selectedItem.userId,
      itemOwnerEmail: selectedItem.userEmail || '',
      claimantUserId: currentUser.uid,
      claimantEmail: currentUser.email || '',
      claimantName: currentUser.displayName || currentUser.email || '',
      message: claimMessage,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    setOpenClaimDialog(false);
    setClaimMessage('');
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 5000);
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 8, md: 12 },
          backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.highlight} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                fontWeight={800}
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 3,
                  lineHeight: 1.2,
                  fontFamily: '"Inter", "Roboto", sans-serif',
                  letterSpacing: '-0.02em'
                }}
              >
                Lost Property
                <br />
                <Box component="span" sx={{ color: colors.accent }}>
                  Recovery Platform
                </Box>
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Professional asset recovery system connecting lost items with their owners through secure, verified processes.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <UIButton
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/report-lost')}
                  sx={{
                    px: 4,
                    py: 1.8,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    bgcolor: colors.accent,
                    '&:hover': {
                      bgcolor: colors.highlight,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(colors.accent, 0.3)}`
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  Report Lost Item
                </UIButton>
                <UIButton
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/report-found')}
                  sx={{
                    px: 4,
                    py: 1.8,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  Report Found Item
                </UIButton>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: alpha('#FFFFFF', 0.95),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: colors.primary }}>
                  Platform Statistics
                </Typography>
                <Grid container spacing={3}>
                  {[
                    { 
                      value: lostItems.length, 
                      label: 'Lost Items', 
                      color: colors.error,
                      icon: '📉'
                    },
                    { 
                      value: foundItems.length, 
                      label: 'Found Items', 
                      color: colors.success,
                      icon: '📈'
                    },
                    { 
                      value: matches.length, 
                      label: 'Active Matches', 
                      color: colors.accent,
                      icon: '🎯'
                    },
                    { 
                      value: '24/7', 
                      label: 'Secure Monitoring', 
                      color: colors.warning,
                      icon: '🔒'
                    }
                  ].map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h3" 
                          fontWeight={900}
                          sx={{ 
                            color: stat.color,
                            mb: 1,
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ color: colors.secondary }}
                        >
                          {stat.icon} {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color={colors.neutral} gutterBottom>
                      Active Community
                    </Typography>
                    <AvatarGroup max={4}>
                      <Avatar alt="User 1" src="/static/images/avatar/1.jpg" />
                      <Avatar alt="User 2" src="/static/images/avatar/2.jpg" />
                      <Avatar alt="User 3" src="/static/images/avatar/3.jpg" />
                      <Avatar>+{Math.max(0, lostItems.length + foundItems.length - 3)}</Avatar>
                    </AvatarGroup>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color={colors.neutral}>
                      Success Rate
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.success }}>
                      {foundItems.length > 0 ? Math.round((matches.length / foundItems.length) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {claimSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              borderRadius: '8px',
              backgroundColor: alpha(colors.success, 0.1),
              borderLeft: `4px solid ${colors.success}`,
              '& .MuiAlert-icon': { color: colors.success }
            }}
            onClose={() => setClaimSuccess(false)}
          >
            <Typography fontWeight={600}>
              Claim submitted successfully! The item owner will be notified.
            </Typography>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 6,
            borderRadius: '12px',
            bgcolor: colors.card,
            border: `1px solid ${alpha(colors.neutral, 0.1)}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '10px',
              bgcolor: alpha(colors.accent, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SearchIcon sx={{ color: colors.accent }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>
                Search Inventory
              </Typography>
              <Typography variant="body2" color={colors.neutral}>
                Filter and search through lost & found items
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search Items"
                placeholder="Enter item name, description, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: '8px',
                    '&:hover fieldset': { borderColor: colors.accent },
                    '&.Mui-focused fieldset': { borderColor: colors.accent }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                InputProps={{ 
                  sx: { 
                    borderRadius: '8px',
                    '&:hover fieldset': { borderColor: colors.accent },
                    '&.Mui-focused fieldset': { borderColor: colors.accent }
                  }
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={commonLocations}
                inputValue={filterLocation}
                onInputChange={(event, newValue) => {
                  setFilterLocation(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    placeholder="Enter or select location"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent }
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {matches.length > 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: '8px',
                backgroundColor: alpha(colors.accent, 0.1),
                borderLeft: `4px solid ${colors.accent}`,
                '& .MuiAlert-icon': { color: colors.accent }
              }}
              icon={<TrendingUpIcon />}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography fontWeight={600} sx={{ color: colors.primary }}>
                    Active Matches Found
                  </Typography>
                  <Typography variant="body2" color={colors.neutral}>
                    {matches.length} potential match{matches.length > 1 ? 'es' : ''} identified
                  </Typography>
                </Box>
                <UIButton 
                  size="small" 
                  variant="contained"
                  sx={{ 
                    bgcolor: colors.accent,
                    '&:hover': { bgcolor: colors.highlight }
                  }}
                  onClick={() => navigate('/browse-items')}
                >
                  View Matches
                </UIButton>
              </Box>
            </Alert>
          )}
        </Paper>

        {/* Browse Items Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: colors.primary, mb: 1 }}>
                Browse Inventory
              </Typography>
              <Typography variant="body1" color={colors.neutral}>
                Total items: {filteredLostItems.length + filteredFoundItems.length}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <StyledChip 
                label={`${filteredLostItems.length} Lost`}
                sx={{ 
                  bgcolor: alpha(colors.error, 0.1), 
                  color: colors.error,
                  borderColor: colors.error
                }}
                variant="outlined"
              />
              <StyledChip 
                label={`${filteredFoundItems.length} Found`}
                sx={{ 
                  bgcolor: alpha(colors.success, 0.1), 
                  color: colors.success,
                  borderColor: colors.success
                }}
                variant="outlined"
              />
            </Stack>
          </Box>

          <Grid container spacing={4}>
            {/* Lost Items Column */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${alpha(colors.error, 0.1)}`,
                  bgcolor: colors.card,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha(colors.error, 0.1)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: alpha(colors.error, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" sx={{ color: colors.error }}>
                        📉
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.error }}>
                        Lost Items
                      </Typography>
                      <Typography variant="body2" color={colors.neutral}>
                        {filteredLostItems.length} items reported missing
                      </Typography>
                    </Box>
                  </Box>
                  
                  {filteredLostItems.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{ 
                        textAlign: 'center', 
                        p: 6,
                        bgcolor: alpha(colors.background, 0.5),
                        borderRadius: '8px',
                        border: `1px dashed ${alpha(colors.neutral, 0.2)}`
                      }}
                    >
                      <FindInPageIcon sx={{ fontSize: 60, color: alpha(colors.neutral, 0.3), mb: 2 }} />
                      <Typography variant="body1" color={colors.neutral} fontWeight={500}>
                        No lost items found
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredLostItems.slice(0, 4).map((item) => (
                        <Card
                          key={item.id}
                          elevation={0}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: `1px solid ${alpha(colors.neutral, 0.1)}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: colors.error,
                              boxShadow: `0 4px 16px ${alpha(colors.error, 0.1)}`
                            }
                          }}
                          onClick={() => navigate(`/item/lost/${item.id}`)}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                              {item.imageUrl ? (
                                <Box sx={{ 
                                  width: 72, 
                                  height: 72, 
                                  borderRadius: '8px', 
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}>
                                  <img
                                    src={item.imageUrl}
                                    alt={item.itemName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              ) : (
                                <Box 
                                  sx={{ 
                                    width: 72, 
                                    height: 72, 
                                    borderRadius: '8px',
                                    bgcolor: alpha(colors.error, 0.05),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  <InventoryIcon sx={{ color: alpha(colors.error, 0.3), fontSize: 32 }} />
                                </Box>
                              )}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight={600} 
                                  sx={{ 
                                    color: colors.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {item.itemName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                  <LocationOnIcon fontSize="small" sx={{ color: colors.neutral }} />
                                  <Typography variant="caption" color={colors.neutral}>
                                    {item.location}
                                  </Typography>
                                </Box>
                                <StyledChip 
                                  label={item.category}
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(colors.error, 0.1), 
                                    color: colors.error
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filteredLostItems.length > 4 && (
                        <UIButton
                          fullWidth
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate('/browse-items')}
                          sx={{ 
                            mt: 2,
                            borderColor: alpha(colors.neutral, 0.2),
                            color: colors.primary,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: colors.accent,
                              bgcolor: alpha(colors.accent, 0.05)
                            }
                          }}
                        >
                          View All Lost Items ({filteredLostItems.length})
                        </UIButton>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Found Items Column */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${alpha(colors.success, 0.1)}`,
                  bgcolor: colors.card,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha(colors.success, 0.1)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: alpha(colors.success, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" sx={{ color: colors.success }}>
                        📈
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.success }}>
                        Found Items
                      </Typography>
                      <Typography variant="body2" color={colors.neutral}>
                        {filteredFoundItems.length} items waiting for recovery
                      </Typography>
                    </Box>
                  </Box>
                  
                  {filteredFoundItems.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{ 
                        textAlign: 'center', 
                        p: 6,
                        bgcolor: alpha(colors.background, 0.5),
                        borderRadius: '8px',
                        border: `1px dashed ${alpha(colors.neutral, 0.2)}`
                      }}
                    >
                      <FindInPageIcon sx={{ fontSize: 60, color: alpha(colors.neutral, 0.3), mb: 2 }} />
                      <Typography variant="body1" color={colors.neutral} fontWeight={500}>
                        No found items found
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredFoundItems.slice(0, 4).map((item) => (
                        <Card
                          key={item.id}
                          elevation={0}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: `1px solid ${alpha(colors.neutral, 0.1)}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: colors.success,
                              boxShadow: `0 4px 16px ${alpha(colors.success, 0.1)}`
                            }
                          }}
                          onClick={() => navigate(`/item/found/${item.id}`)}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                              {item.imageUrl ? (
                                <Box sx={{ 
                                  width: 72, 
                                  height: 72, 
                                  borderRadius: '8px', 
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}>
                                  <img
                                    src={item.imageUrl}
                                    alt={item.itemName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              ) : (
                                <Box 
                                  sx={{ 
                                    width: 72, 
                                    height: 72, 
                                    borderRadius: '8px',
                                    bgcolor: alpha(colors.success, 0.05),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  <InventoryIcon sx={{ color: alpha(colors.success, 0.3), fontSize: 32 }} />
                                </Box>
                              )}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight={600} 
                                  sx={{ 
                                    color: colors.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {item.itemName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                  <LocationOnIcon fontSize="small" sx={{ color: colors.neutral }} />
                                  <Typography variant="caption" color={colors.neutral}>
                                    {item.location}
                                  </Typography>
                                </Box>
                                <StyledChip 
                                  label={item.category}
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(colors.success, 0.1), 
                                    color: colors.success
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filteredFoundItems.length > 4 && (
                        <UIButton
                          fullWidth
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate('/browse-items')}
                          sx={{ 
                            mt: 2,
                            borderColor: alpha(colors.neutral, 0.2),
                            color: colors.primary,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: colors.accent,
                              bgcolor: alpha(colors.accent, 0.05)
                            }
                          }}
                        >
                          View All Found Items ({filteredFoundItems.length})
                        </UIButton>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Platform Features */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: '12px',
            bgcolor: colors.primary,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${alpha('#FFFFFF', 0.05)} 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: 'translate(30%, -30%)'
            }
          }}
        >
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ position: 'relative' }}>
            Why Choose Our Platform?
          </Typography>
          <Typography variant="body1" sx={{ mb: 6, opacity: 0.9, position: 'relative' }}>
            Professional-grade asset recovery with enterprise-level security
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                title: 'Secure Verification',
                description: 'Multi-step verification process ensures only legitimate claims are processed'
              },
              {
                icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
                title: 'Verified Users',
                description: 'All users undergo identity verification for enhanced security'
              },
              {
                icon: <GroupsIcon sx={{ fontSize: 40 }} />,
                title: 'Community Trust',
                description: 'Built on reputation system with verified returns and feedback'
              },
              {
                icon: <TimerIcon sx={{ fontSize: 40 }} />,
                title: '24/7 Monitoring',
                description: 'Round-the-clock system monitoring and instant notifications'
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3,
                  p: 3,
                  borderRadius: '8px',
                  bgcolor: alpha('#FFFFFF', 0.05),
                  border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: alpha('#FFFFFF', 0.1),
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <Box sx={{ flexShrink: 0 }}>
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Claim Item Dialog */}
      <Dialog 
        open={openClaimDialog} 
        onClose={() => setOpenClaimDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: '12px',
            border: `1px solid ${alpha(colors.neutral, 0.1)}`
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, bgcolor: colors.background }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: colors.primary }}>
            Submit Claim
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Typography variant="body2" color={colors.neutral} paragraph sx={{ mb: 3 }}>
            Provide verification details to support your claim. This information will be reviewed by our team.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Verification Details"
            placeholder="Describe specific details, serial numbers, or unique identifying marks..."
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover fieldset': { borderColor: colors.accent },
                '&.Mui-focused fieldset': { borderColor: colors.accent }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, bgcolor: colors.background }}>
          <UIButton 
            onClick={() => setOpenClaimDialog(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              borderColor: alpha(colors.neutral, 0.3),
              color: colors.neutral
            }}
          >
            Cancel
          </UIButton>
          <UIButton 
            variant="contained" 
            onClick={submitClaim}
            disabled={!claimMessage.trim()}
            sx={{ 
              borderRadius: '8px',
              bgcolor: colors.accent,
              fontWeight: 600,
              '&:hover': { bgcolor: colors.highlight }
            }}
          >
            Submit for Review
          </UIButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;