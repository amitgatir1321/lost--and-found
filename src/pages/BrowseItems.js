import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  MenuItem,
  Button,
  Alert,
  CardActions,
  Tab,
  Tabs,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Skeleton,
  Avatar,
  Divider,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';

const BrowseItems = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'all',
    'Electronics',
    'Documents',
    'Jewelry',
    'Clothing',
    'Bags',
    'Keys',
    'Pets',
    'Other'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const lostQuery = query(collection(db, 'lostItems'));
      const foundQuery = query(collection(db, 'foundItems'));

      const lostSnapshot = await getDocs(lostQuery);
      const foundSnapshot = await getDocs(foundQuery);

      setLostItems(lostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFoundItems(foundSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClaimItem = (item, itemType) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSelectedItem({ ...item, itemType });
    setOpenClaimDialog(true);
  };

  const submitClaim = async () => {
    if (!claimMessage.trim()) return;

    try {
      const ownerDoc = await getDoc(doc(db, 'users', selectedItem.userId));
      const ownerData = ownerDoc.data();

      await addDoc(collection(db, 'claims'), {
        itemId: selectedItem.id,
        itemTitle: selectedItem.title,
        itemType: selectedItem.itemType,
        itemOwnerId: selectedItem.userId,
        itemOwnerEmail: selectedItem.userEmail,
        claimantId: currentUser.uid,
        claimantEmail: currentUser.email,
        claimantName: ownerData?.name || currentUser.email,
        message: claimMessage,
        status: 'pending',
        createdAt: new Date()
      });

      setOpenClaimDialog(false);
      setClaimMessage('');
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const filterItems = (items) => {
    return items.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      const locationMatch = filterLocation === 'all' || item.location === filterLocation;
      const searchMatch = searchQuery === '' || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && locationMatch && searchMatch;
    });
  };

  const filteredLostItems = filterItems(lostItems);
  const filteredFoundItems = filterItems(foundItems);

  const locations = Array.from(new Set([...lostItems, ...foundItems].map(item => item.location).filter(Boolean)));

  const renderItemCard = (item, itemType) => (
    <Grid item xs={12} sm={6} md={4} key={item.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* Status Badge */}
        <Chip
          label={itemType === 'lost' ? 'LOST' : 'FOUND'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            fontWeight: 'bold',
            backgroundColor: itemType === 'lost' ? '#ff6b6b' : '#51cf66',
            color: 'white',
            boxShadow: 2
          }}
        />
        
        {item.imageUrl ? (
          <CardMedia
            component="img"
            height="220"
            image={item.imageUrl}
            alt={item.title}
            sx={{ 
              objectFit: 'cover',
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : (
          <Box
            sx={{
              height: 220,
              backgroundColor: '#e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #99744A 0%, #414A37 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }
            }}
          >
            <InventoryIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {item.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '40px'
            }}
          >
            {item.description}
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon fontSize="small" sx={{ color: '#DBC2A6' }} />
              <Chip
                label={item.category}
                size="small"
                sx={{ 
                  backgroundColor: '#DBC2A6', 
                  color: '#414A37',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ color: '#8B8B8B' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {item.location}
              </Typography>
            </Box>
            
            {item.date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ color: '#8B8B8B' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handleClaimItem(item, itemType)}
            sx={{
              backgroundColor: '#414A37',
              py: 1.2,
              fontWeight: 'bold',
              fontSize: '0.95rem',
              '&:hover': { 
                backgroundColor: '#556147',
                transform: 'scale(1.02)'
              },
              transition: 'all 0.2s'
            }}
          >
            {itemType === 'lost' ? '✓ I Found This' : '✓ This is Mine'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderSkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: '100%' }}>
        <Skeleton variant="rectangular" height={220} />
        <CardContent>
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} width="60%" />
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ backgroundColor: '#F0F5F6', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 4,
          minHeight: { xs: '400px', md: '450px' },
          backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(65, 74, 55, 0.88) 0%, rgba(85, 97, 71, 0.82) 100%)',
            backdropFilter: 'blur(2px)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Browse Lost & Found Items
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.95,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Search through lost and found items in your area
            </Typography>
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <ReportIcon sx={{ fontSize: 40, color: '#414A37', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="#414A37">
                    {lostItems.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Lost Items
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#2E7D32', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="#2E7D32">
                    {foundItems.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Found Items
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#99744A', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="#99744A">
                    {lostItems.length + foundItems.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Items
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {claimSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
          >
            <Typography fontWeight="bold">Claim submitted successfully!</Typography>
            <Typography variant="body2">The owner will be notified about your claim.</Typography>
          </Alert>
        )}

        {/* Filters Section */}
        <Paper 
          elevation={1}
          sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <SearchIcon sx={{ mr: 1, color: '#414A37' }} />
            <Typography variant="h6" fontWeight="bold" color="#414A37">
              Filter & Search
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search items"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#414A37',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#414A37',
                    },
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#414A37',
                    },
                  },
                }}
              >
                <MenuItem value="all">All Locations</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs Section */}
        <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 2,
                transition: 'all 0.3s',
              },
              '& .Mui-selected': {
                color: '#414A37',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#414A37',
                height: 3,
              }
            }}
          >
            <Tab 
              icon={<ReportIcon />} 
              iconPosition="start"
              label={`Lost Items (${filteredLostItems.length})`} 
            />
            <Tab 
              icon={<CheckCircleIcon />} 
              iconPosition="start"
              label={`Found Items (${filteredFoundItems.length})`} 
            />
          </Tabs>
        </Paper>

        {/* Items Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <React.Fragment key={i}>{renderSkeletonCard()}</React.Fragment>
            ))}
          </Grid>
        ) : (
          <>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {filteredLostItems.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        textAlign: 'center', 
                        py: 10,
                        backgroundColor: 'white',
                        borderRadius: 3,
                        border: '2px dashed #e0e0e0'
                      }}
                    >
                      <FindInPageIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom>
                        No Lost Items Found
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Try adjusting your filters or search query
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                          setFilterLocation('all');
                        }}
                        sx={{
                          borderColor: '#414A37',
                          color: '#414A37',
                          '&:hover': {
                            borderColor: '#99744A',
                            backgroundColor: 'rgba(65, 74, 55, 0.04)'
                          }
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Paper>
                  </Grid>
                ) : (
                  filteredLostItems.map((item) => renderItemCard(item, 'lost'))
                )}
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                {filteredFoundItems.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        textAlign: 'center', 
                        py: 10,
                        backgroundColor: 'white',
                        borderRadius: 3,
                        border: '2px dashed #e0e0e0'
                      }}
                    >
                      <FindInPageIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom>
                        No Found Items
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Try adjusting your filters or search query
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                          setFilterLocation('all');
                        }}
                        sx={{
                          borderColor: '#414A37',
                          color: '#414A37',
                          '&:hover': {
                            borderColor: '#99744A',
                            backgroundColor: 'rgba(65, 74, 55, 0.04)'
                          }
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Paper>
                  </Grid>
                ) : (
                  filteredFoundItems.map((item) => renderItemCard(item, 'found'))
                )}
              </Grid>
            )}
          </>
        )}

        {/* Claim Dialog */}
        <Dialog 
          open={openClaimDialog} 
          onClose={() => setOpenClaimDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#414A37' }} />
              <Typography variant="h6" fontWeight="bold">
                Claim Item
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedItem?.title}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please provide detailed information to help verify your claim.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Your Message"
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              placeholder="Describe the item, where you found it, or provide proof of ownership..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#414A37',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#414A37',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setOpenClaimDialog(false)}
              sx={{ 
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitClaim} 
              variant="contained"
              disabled={!claimMessage.trim()}
              sx={{
                backgroundColor: '#414A37',
                px: 4,
                py: 1,
                fontWeight: 'bold',
                '&:hover': { 
                  backgroundColor: '#556147',
                  transform: 'scale(1.02)'
                },
                '&:disabled': {
                  backgroundColor: '#ccc'
                },
                transition: 'all 0.2s'
              }}
            >
              Submit Claim
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BrowseItems;
