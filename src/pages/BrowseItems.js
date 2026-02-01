import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  MenuItem,
  Alert,
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
  Badge,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  FindInPage as FindInPageIcon,
  Category as CategoryIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import UIButton from '../components/UI/Button';
import UICard from '../components/UI/Card';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, getDoc, doc, serverTimestamp, where, query } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const BrowseItems = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [indexError, setIndexError] = useState(null);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const { currentUser } = useAuth();

  const categories = ['all', 'electronics', 'clothing', 'documents', 'keys', 'jewelry', 'bags', 'other'];

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setIndexError(null);
      try {
        const buildQuery = (collectionName) => {
          const constraints = [];
          if (filterCategory && filterCategory !== 'all') {
            constraints.push(where('category', '==', filterCategory));
          }
          if (filterLocation && filterLocation !== 'all') {
            constraints.push(where('location', '==', filterLocation));
          }
          if (startDate) {
            constraints.push(where('date', '>=', startDate));
          }
          if (endDate) {
            constraints.push(where('date', '<=', endDate));
          }

          // Default to ordering by date descending when possible
          try {
            return constraints.length > 0 ? query(collection(db, collectionName), ...constraints) : query(collection(db, collectionName));
          } catch (err) {
            // fallback to a plain collection read
            return collection(db, collectionName);
          }
        };

        const lostQ = buildQuery('lost_items');
        const foundQ = buildQuery('found_items');

        const [lostSnapshot, foundSnapshot] = await Promise.all([
          getDocs(lostQ),
          getDocs(foundQ)
        ]);

        const lost = lostSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const found = foundSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        setLostItems(lost);
        setFoundItems(found);
      } catch (error) {
        console.error('Error fetching items:', error);
        // Firestore will return an error if a composite index is required
        if (error.message && error.message.toLowerCase().includes('index')) {
          setIndexError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filterCategory, filterLocation, startDate, endDate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClaimItem = (item, itemType) => {
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
        itemTitle: selectedItem.itemName || selectedItem.title || '',
        itemType: selectedItem.itemType,
        itemOwnerId: selectedItem.userId,
        itemOwnerEmail: selectedItem.userEmail || '',
        claimantUserId: currentUser.uid,
        claimantEmail: currentUser.email || '',
        claimantName: currentUser.displayName || currentUser.email || '',
        message: claimMessage,
        status: 'requested',
        createdAt: serverTimestamp()
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
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && locationMatch && searchMatch;
    });
  };

  const filteredLostItems = filterItems(lostItems);
  const filteredFoundItems = filterItems(foundItems);

  const locations = Array.from(new Set([...lostItems, ...foundItems].map(item => item.location).filter(Boolean)));

  const renderSkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4}>
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
    </Grid>
  );

  const renderItemCard = (item, itemType) => (
    <Grid item xs={12} sm={6} md={4} key={item.id}>
      <UICard
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
        
        {item.imageURL ? (
          <CardMedia
            component="img"
            height="220"
            image={item.imageURL}
            alt={item.itemName || item.title}
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
            {item.itemName || item.title}
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
        
        <Box sx={{ p: 2, pt: 0 }}>
          <UIButton
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
          </UIButton>
        </Box>
      </UICard>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {indexError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Firestore index required for this combination of filters. Create the index as suggested in the Firebase console. ({indexError})
        </Alert>
      )}
      {claimSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Claim submitted successfully! The owner will be notified.
        </Alert>
      )}

      {/* Filter Section */}
      <Paper 
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
              sx={{}}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
          <UIButton 
            onClick={() => setOpenClaimDialog(false)}
            variant="text"
            sx={{ 
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Cancel
          </UIButton>
          <UIButton 
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
          </UIButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseItems;
