import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CardContent,
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
  Button
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import UIButton from '../components/UI/Button';
import UICard from '../components/UI/Card';
import { db, storage } from '../firebase/config';
import {
  collection,
  getDocs,
  where,
  query
} from 'firebase/firestore';
import { submitClaim } from '../services/claimsService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const BrowseItems = () => {
  const { currentUser } = useAuth();

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [claimMessage, setClaimMessage] = useState('');
  const [proofImage, setProofImage] = useState(null);

  const [claimSuccess, setClaimSuccess] = useState(false);

  const categories = ['all', 'electronics', 'clothing', 'documents', 'keys', 'jewelry', 'bags', 'other'];

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      const buildQuery = (name) => {
        const constraints = [];
        if (filterCategory !== 'all') {
          constraints.push(where('category', '==', filterCategory));
        }
        return constraints.length
          ? query(collection(db, name), ...constraints)
          : collection(db, name);
      };

      const [lostSnap, foundSnap] = await Promise.all([
        getDocs(buildQuery('lost_items')),
        getDocs(buildQuery('found_items'))
      ]);

      setLostItems(lostSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFoundItems(foundSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchItems();
  }, [filterCategory]);

  const openClaim = (item) => {
    if (!currentUser) {
      alert('Please login to claim an item');
      return;
    }
    setSelectedItem(item);
    setOpenClaimDialog(true);
  };

  const handleSubmitClaim = async () => {
    if (!currentUser || !claimMessage.trim() || !selectedItem) return;

    if (claimMessage.trim().length < 20) {
      alert('Please provide at least 20 characters of claim details');
      return;
    }

    try {
      const tabType = tabValue === 0 ? 'lost' : 'found';
      
      const claimData = {
        claimantId: currentUser.uid,
        claimantName: currentUser.displayName || currentUser.email,
        claimantEmail: currentUser.email,
        itemOwnerId: selectedItem.userId,
        claimMessage: claimMessage.trim(),
        itemName: selectedItem.itemName || selectedItem.title || 'Item',
        category: selectedItem.category || 'miscellaneous'
      };

      if (tabType === 'lost') {
        claimData.lostItemId = selectedItem.id;
      } else {
        claimData.foundItemId = selectedItem.id;
      }

      const result = await submitClaim(claimData);

      if (result.success) {
        setOpenClaimDialog(false);
        setSelectedItem(null);
        setClaimMessage('');
        setProofImage(null);
        setClaimSuccess(true);
        setTimeout(() => setClaimSuccess(false), 4000);
      } else {
        alert('Failed to submit claim: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to submit claim:', error);
      alert('Failed to submit claim: ' + error.message);
    }
  };

  const visibleItems = (tabValue === 0 ? lostItems : foundItems).filter(item =>
    !searchQuery ||
    item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {claimSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Claim submitted successfully. Admin verification in progress.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={`Lost (${lostItems.length})`} />
        <Tab label={`Found (${foundItems.length})`} />
      </Tabs>

      {loading ? (
        <Grid container spacing={3}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton height={300} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {visibleItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <UICard>
                <CardContent>
                  <Typography variant="h6">
                    {item.itemName || item.title}
                  </Typography>
                  <Typography variant="body2">
                    {item.description}
                  </Typography>
                </CardContent>
                <Box p={2}>
                  <UIButton
                    fullWidth
                    onClick={() =>
                      openClaim({ ...item, itemType: tabValue === 0 ? 'lost' : 'found' })
                    }
                  >
                    {tabValue === 0 ? '✓ I Found This' : '✓ This is Mine'}
                  </UIButton>
                </Box>
              </UICard>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Claim Item – {selectedItem?.itemName || selectedItem?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe your proof"
            value={claimMessage}
            onChange={e => setClaimMessage(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" component="label" fullWidth>
            Upload Proof Image (optional)
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={e => setProofImage(e.target.files[0])}
            />
          </Button>

          {proofImage && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Selected: {proofImage.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitClaim}
            disabled={claimMessage.trim().length < 20}
          >
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseItems;
