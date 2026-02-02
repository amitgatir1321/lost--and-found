import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Divider,
  Badge,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';

const MyClaims = () => {
  const { currentUser } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [newClaimsCount, setNewClaimsCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    // Fetch my lost items
    const lostQuery = query(collection(db, 'lost_items'), where('userId', '==', currentUser.uid));
    const foundQuery = query(collection(db, 'found_items'), where('userId', '==', currentUser.uid));
    
    const lostSnap = await getDocs(lostQuery);
    const foundSnap = await getDocs(foundQuery);
    
    const items = [
      ...lostSnap.docs.map(doc => ({ id: doc.id, type: 'lost', ...doc.data() })),
      ...foundSnap.docs.map(doc => ({ id: doc.id, type: 'found', ...doc.data() }))
    ];
    setMyItems(items);

    // Fetch claims on my items
    const claimsQuery = query(collection(db, 'claims'), where('itemOwnerId', '==', currentUser.uid));
    const claimsSnap = await getDocs(claimsQuery);
    const received = claimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReceivedClaims(received);
    
    // Count pending claims
    const pendingCount = received.filter(claim => claim.status === 'pending').length;
    setNewClaimsCount(pendingCount);

    // Fetch claims I made
    const myClaimsQuery = query(collection(db, 'claims'), where('claimantUserId', '==', currentUser.uid));
    const myClaimsSnap = await getDocs(myClaimsQuery);
    setMyClaims(myClaimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleApproveClaim = async (claimId) => {
    await updateDoc(doc(db, 'claims', claimId), {
      status: 'approved',
      approvedAt: new Date()
    });
    fetchData();
  };

  const handleRejectClaim = async (claimId) => {
    await updateDoc(doc(db, 'claims', claimId), {
      status: 'rejected',
      rejectedAt: new Date()
    });
    fetchData();
  };

  const handleShareContact = async (claim) => {
    setSelectedClaim(claim);
    setOpenDialog(true);
  };

  const submitContact = async () => {
    if (!contactInfo.trim()) return;
    
    await updateDoc(doc(db, 'claims', selectedClaim.id), {
      ownerContactInfo: contactInfo,
      contactSharedAt: new Date()
    });
    
    setOpenDialog(false);
    setContactInfo('');
    fetchData();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Claims & Requests
        </Typography>
        {newClaimsCount > 0 && (
          <Alert 
            severity="info" 
            icon={<NotificationsActiveIcon />}
            sx={{ 
              mt: 2,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.8 }
              }
            }}
          >
            <Typography fontWeight={600}>
              You have {newClaimsCount} pending claim request{newClaimsCount > 1 ? 's' : ''} waiting for your response!
            </Typography>
          </Alert>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            icon={
              <Badge badgeContent={newClaimsCount} color="error">
                <InboxIcon />
              </Badge>
            }
            label="Received Requests" 
            iconPosition="start"
          />
          <Tab 
            icon={<SendIcon />} 
            label="My Sent Claims" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Claims on My Items */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ color: '#414A37', mb: 3 }}>
            <InboxIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Requests on My Items ({receivedClaims.length})
          </Typography>
        <Grid container spacing={2}>
          {receivedClaims.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No claims received yet</Typography>
              </Paper>
            </Grid>
          ) : (
            receivedClaims.map((claim) => (
              <Grid item xs={12} key={claim.id}>
                <Card 
                  elevation={claim.status === 'pending' ? 4 : 2}
                  sx={{
                    border: claim.status === 'pending' ? '2px solid #ff9800' : 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={1}>
                        <Avatar 
                          sx={{ 
                                bgcolor: claim.status === 'pending' ? '#ff9800' : 
                                  claim.status === 'approved' ? '#2e7d32' : '#d32f2f',
                            width: 56,
                            height: 56
                          }}
                        >
                          {claim.status === 'pending' ? <PendingIcon /> : 
                           claim.status === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          {claim.itemTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {claim.message}
                        </Typography>
                        <Typography variant="caption" display="block">
                          From: {claim.claimantEmail}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Date: {new Date(claim.createdAt.seconds * 1000).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Chip 
                          label={claim.status} 
                          color={claim.status === 'approved' ? 'success' : claim.status === 'pending' ? 'warning' : 'error'}
                          sx={{ mb: 1 }}
                        />
                        {claim.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveClaim(claim.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectClaim(claim.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {claim.status === 'approved' && !claim.ownerContactInfo && (
                          <Button
                            variant="contained"
                            sx={{ bgcolor: '#414A37', mt: 2 }}
                            onClick={() => handleShareContact(claim)}
                          >
                            Share Contact Info
                          </Button>
                        )}
                        {claim.ownerContactInfo && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            Contact info shared!
                          </Alert>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      )}

      {/* Tab Panel 1: My Claims */}
      {tabValue === 1 && (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ color: '#99744A', mb: 3 }}>
          <SendIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          My Sent Claims ({myClaims.length})
        </Typography>
        <Grid container spacing={2}>
          {myClaims.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">You haven't made any claims yet</Typography>
              </Paper>
            </Grid>
          ) : (
            myClaims.map((claim) => (
              <Grid item xs={12} key={claim.id}>
                <Card 
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: claim.status === 'pending' ? '#ff9800' : 
                                  claim.status === 'approved' ? '#2e7d32' : '#d32f2f',
                          width: 48,
                          height: 48,
                          mt: 1
                        }}
                      >
                        {claim.status === 'pending' ? <PendingIcon /> : 
                         claim.status === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {claim.itemTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Your message: {claim.message}
                    </Typography>
                    <Chip 
                      label={claim.status} 
                      color={claim.status === 'approved' ? 'success' : claim.status === 'pending' ? 'warning' : 'error'}
                      icon={claim.status === 'approved' ? <CheckCircleIcon /> : <PendingIcon />}
                    />
                    {claim.status === 'approved' && claim.ownerContactInfo && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Owner Contact Info:</Typography>
                        <Typography variant="body2">{claim.ownerContactInfo}</Typography>
                      </Alert>
                    )}
                    {claim.status === 'approved' && !claim.ownerContactInfo && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Waiting for owner to share contact information...
                      </Alert>
                    )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Contact Information</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Share your contact details so the claimant can reach you to arrange item return.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Contact Information"
            placeholder="Email: your@email.com&#10;Phone: +1 234 567 8900&#10;Preferred time: Weekdays 9AM-5PM"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={submitContact}
            sx={{ bgcolor: '#414A37' }}
          >
            Share Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyClaims;
