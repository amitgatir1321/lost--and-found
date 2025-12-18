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
          position: 'relative',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 4,
          minHeight: { xs: '400px', md: '450px' },
          backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000")',
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
            background: 'linear-gradient(135deg, rgba(65, 74, 55, 0.85) 0%, rgba(85, 97, 71, 0.75) 100%)',
            backdropFilter: 'blur(2px)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
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
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/browse-items')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': { borderColor: '#DBC2A6', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Browse All Items
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

      {/* Browse Items Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {claimSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              borderLeft: '4px solid #2e7d32'
            }}
          >
            ✅ Claim submitted successfully! The item owner will be notified.
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#414A37' }}>
            🔍 Browse Items
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Filter by category and location to find what you're looking for
          </Typography>
        </Box>

        {matches.length > 0 && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              borderLeft: '4px solid #2e7d32',
              fontWeight: 500
            }} 
            icon={<CheckCircleIcon />}
          >
            <strong>🎯 Great news!</strong> We found {matches.length} potential match(es) based on category and location!
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: '#f9f9f9' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Filter by Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover fieldset': { borderColor: '#99744A' },
                    '&.Mui-focused fieldset': { borderColor: '#414A37' }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover fieldset': { borderColor: '#99744A' },
                    '&.Mui-focused fieldset': { borderColor: '#414A37' }
                  }
                }}
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
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2, 
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.05)',
                borderLeft: '4px solid #d32f2f'
              }}
            >
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                📉 Lost Items ({filteredLostItems.length})
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {filteredLostItems.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => navigate(`/item/lost/${item.id}`)}
                  >
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl}
                        alt={item.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
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
                          sx={{ 
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                        <Chip 
                          icon={<LocationOnIcon />} 
                          label={item.location} 
                          size="small"
                          sx={{ 
                            backgroundColor: '#DBC2A6',
                            color: '#414A37',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 500 }}>
                        📅 Date Lost: {new Date(item.dateLost).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    {currentUser && currentUser.uid !== item.userId && (
                      <CardActions>
                        <Button 
                          fullWidth
                          variant="contained"
                          sx={{ 
                            bgcolor: '#99744A', 
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#414A37' } 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimItem(item, 'lost');
                          }}
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
            <Box 
              sx={{ 
                p: 2, 
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(46, 125, 50, 0.05)',
                borderLeft: '4px solid #2e7d32'
              }}
            >
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                📈 Found Items ({filteredFoundItems.length})
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {filteredFoundItems.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => navigate(`/item/found/${item.id}`)}
                  >
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl}
                        alt={item.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
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
                          sx={{ 
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                        <Chip 
                          icon={<LocationOnIcon />} 
                          label={item.location} 
                          size="small"
                          sx={{ 
                            backgroundColor: '#DBC2A6',
                            color: '#414A37',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 500 }}>
                        📅 Date Found: {new Date(item.dateFound).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    {currentUser && currentUser.uid !== item.userId && (
                      <CardActions>
                        <Button 
                          fullWidth
                          variant="contained"
                          sx={{ 
                            bgcolor: '#2e7d32', 
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#1B5E20' } 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimItem(item, 'found');
                          }}
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

      {/* Analytics Section */}
      <Box 
        sx={{ 
          position: 'relative',
          py: { xs: 6, md: 8 }, 
          mt: 4,
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(65, 74, 55, 0.92) 0%, rgba(153, 116, 74, 0.88) 100%)',
            backdropFilter: 'blur(3px)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
            📊 Platform Analytics
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 6, color: 'rgba(255,255,255,0.9)' }}>
            Real-time insights into our community's success
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography variant="h2" fontWeight="900" sx={{ mb: 1, color: '#d32f2f' }}>
                  {lostItems.length}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="#d32f2f">
                  📉 Lost Items
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Currently reported
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography variant="h2" fontWeight="900" sx={{ mb: 1, color: '#2e7d32' }}>
                  {foundItems.length}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="#2e7d32">
                  📈 Found Items
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Waiting to be claimed
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography variant="h2" fontWeight="900" sx={{ mb: 1, color: '#1976d2' }}>
                  {matches.length}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="#1976d2">
                  🎯 Potential Matches
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Smart matches found
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography variant="h2" fontWeight="900" sx={{ mb: 1, color: '#ED6C02' }}>
                  {Math.round(foundItems.length > 0 ? (matches.length / foundItems.length) * 100 : 0)}%
                </Typography>
                <Typography variant="h6" fontWeight={600} color="#ED6C02">
                  ✅ Success Rate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Items reunited
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Additional Stats */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#414A37' }} gutterBottom>
                  🔥 {lostItems.filter(item => {
                    const itemDate = new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : item.createdAt);
                    const daysDiff = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 7;
                  }).length}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Items reported this week
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#99744A' }} gutterBottom>
                  🎉 {foundItems.filter(item => {
                    const itemDate = new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : item.createdAt);
                    const daysDiff = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 7;
                  }).length}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Items found this week
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#DBC2A6' }} gutterBottom>
                  ⚡ {categories.filter(cat => cat !== 'all').length}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Categories available
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

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