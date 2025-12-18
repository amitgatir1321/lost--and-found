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
  DialogActions
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
      const lostQuery = query(collection(db, 'lostItems'));
      const foundQuery = query(collection(db, 'foundItems'));

      const lostSnapshot = await getDocs(lostQuery);
      const foundSnapshot = await getDocs(foundQuery);

      setLostItems(lostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFoundItems(foundSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching items:', error);
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
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
      >
        {item.imageUrl && (
          <CardMedia
            component="img"
            height="200"
            image={item.imageUrl}
            alt={item.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {item.description}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon fontSize="small" color="action" />
              <Chip
                label={item.category}
                size="small"
                sx={{ backgroundColor: '#DBC2A6', color: '#414A37' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {item.location}
              </Typography>
            </Box>
            {item.date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.date).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            {item.userEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {item.userEmail}
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
              '&:hover': { backgroundColor: '#556147' }
            }}
          >
            {itemType === 'lost' ? 'I Found This' : 'This is Mine'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="#414A37">
            Browse Items
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Search through lost and found items
          </Typography>
        </Box>

        {claimSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Claim submitted successfully! The owner will be notified.
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ mb: 4, backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
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
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem'
              }
            }}
          >
            <Tab label={`Lost Items (${filteredLostItems.length})`} />
            <Tab label={`Found Items (${filteredFoundItems.length})`} />
          </Tabs>
        </Box>

        {/* Items Grid */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {filteredLostItems.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No lost items found matching your criteria
                  </Typography>
                </Box>
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
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No found items matching your criteria
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredFoundItems.map((item) => renderItemCard(item, 'found'))
            )}
          </Grid>
        )}

        {/* Claim Dialog */}
        <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Claim Item: {selectedItem?.title}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please provide details about why this item belongs to you or how you found it.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Message"
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              placeholder="Describe the item, where you found it, or provide proof of ownership..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenClaimDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitClaim} 
              variant="contained"
              disabled={!claimMessage.trim()}
              sx={{
                backgroundColor: '#414A37',
                '&:hover': { backgroundColor: '#556147' }
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
