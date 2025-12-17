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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Home = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
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

  useEffect(() => {
    findMatches();
  }, [lostItems, foundItems]);

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

  const filteredLostItems = lostItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const locationMatch = filterLocation === 'all' || item.location === filterLocation;
    return categoryMatch && locationMatch;
  });

  const filteredFoundItems = foundItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const locationMatch = filterLocation === 'all' || item.location === filterLocation;
    return categoryMatch && locationMatch;
  });

  const locations = Array.from(new Set([...lostItems, ...foundItems].map(item => item.location)));

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
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #414A37 0%, #556147 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Lost Something?
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.95 }}>
                We're here to help you find it. Report lost items or browse found items in your area.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/report-lost')}
                  sx={{
                    backgroundColor: '#DBC2A6',
                    color: '#414A37',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#99744A', color: '#FFFFFF' }
                  }}
                >
                  Report Lost Item
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/report-found')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': { borderColor: '#DBC2A6', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Report Found Item
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h3" color="#414A37" fontWeight="bold">
                      {lostItems.length}
                    </Typography>
                    <Typography color="text.secondary">Lost Items</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h3" color="#2E7D32" fontWeight="bold">
                      {foundItems.length}
                    </Typography>
                    <Typography color="text.secondary">Found Items</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h3" color="#1976d2" fontWeight="bold">
                      {matches.length}
                    </Typography>
                    <Typography color="text.secondary">Matches</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h3" color="#ED6C02" fontWeight="bold">
                      24/7
                    </Typography>
                    <Typography color="text.secondary">Support</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>        {claimSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Claim submitted successfully! The item owner will be notified.
          </Alert>
        )}
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Three simple steps to reunite with your belongings
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <ReportIcon sx={{ fontSize: 60, color: '#414A37', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                1. Report
              </Typography>
              <Typography color="text.secondary">
                Submit details about your lost or found item with photos and location
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <SearchIcon sx={{ fontSize: 60, color: '#99744A', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                2. Search
              </Typography>
              <Typography color="text.secondary">
                Browse through items and use filters to find potential matches
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#2E7D32', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                3. Reunite
              </Typography>
              <Typography color="text.secondary">
                Get matched with your item and coordinate the return
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 4 }}>

        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Browse Items
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Filter by category and location to find what you're looking for
        </Typography>

        {matches.length > 0 && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            <strong>Great news!</strong> We found {matches.length} potential match(es) based on category and location!
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Filter by Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Filter by Location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom color="secondary">
            Lost Items ({filteredLostItems.length})
          </Typography>
          <Grid container spacing={2}>
            {filteredLostItems.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card>
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl}
                      alt={item.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<CategoryIcon />} 
                        label={item.category} 
                        size="small" 
                        color="primary"
                      />
                      <Chip 
                        icon={<LocationOnIcon />} 
                        label={item.location} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Date Lost: {new Date(item.dateLost).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  {currentUser && currentUser.uid !== item.userId && (
                    <CardActions>
                      <Button 
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: '#99744A', '&:hover': { bgcolor: '#414A37' } }}
                        onClick={() => handleClaimItem(item, 'lost')}
                      >
                        I Found This Item
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32' }}>
            Found Items ({filteredFoundItems.length})
          </Typography>
          <Grid container spacing={2}>
            {filteredFoundItems.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card>
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl}
                      alt={item.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<CategoryIcon />} 
                        label={item.category} 
                        size="small" 
                        color="primary"
                      />
                      <Chip 
                        icon={<LocationOnIcon />} 
                        label={item.location} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Date Found: {new Date(item.dateFound).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  {currentUser && currentUser.uid !== item.userId && (
                    <CardActions>
                      <Button 
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                        onClick={() => handleClaimItem(item, 'found')}
                      >
                        This is My Item
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

        {filteredLostItems.length === 0 && filteredFoundItems.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
            <FindInPageIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No items found. Try adjusting your filters.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Claim Item Dialog */}
      <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem?.itemType === 'lost' ? 'Claim Found Item' : 'Claim This is Your Item'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Explain why this is your item or provide details to verify ownership.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message to Owner"
            placeholder="Describe the item details, where you lost/found it, or any identifying features..."
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={submitClaim}
            sx={{ bgcolor: '#414A37', '&:hover': { bgcolor: '#99744A' } }}
          >
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
