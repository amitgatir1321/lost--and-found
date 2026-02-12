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
  Avatar,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { buildWhatsAppUrl, formatIndianWhatsAppNumber, buildEmailUrl } from '../utils/whatsapp';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const MyClaims = () => {
  const { currentUser } = useAuth();
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [contactType, setContactType] = useState('whatsapp');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [newClaimsCount, setNewClaimsCount] = useState(0);
  const [contactError, setContactError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    const pendingStatuses = ['pending', 'pending_admin_review'];

    // Claims on my items
    const receivedQuery = query(
      collection(db, 'claims'),
      where('itemOwnerId', '==', currentUser.uid)
    );
    const receivedSnap = await getDocs(receivedQuery);
    const received = receivedSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setReceivedClaims(received);

    const pendingCount = received.filter(c => pendingStatuses.includes(c.status)).length;
    setNewClaimsCount(pendingCount);

    // Claims I sent
    const myQuery = query(
      collection(db, 'claims'),
      where('claimantId', '==', currentUser.uid)
    );
    const mySnap = await getDocs(myQuery);
    setMyClaims(mySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  };

  const handleApprove = async (id) => {
    try {
      setUpdateLoading(true);
      setUpdateError('');
      await updateDoc(doc(db, 'claims', id), {
        status: 'approved',
        approvedAt: new Date()
      });
      setUpdateLoading(false);
      fetchData();
    } catch (error) {
      console.error('Error approving claim:', error);
      setUpdateError(`❌ Error approving claim: ${error.message}`);
      setUpdateLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setUpdateLoading(true);
      setUpdateError('');
      await updateDoc(doc(db, 'claims', id), {
        status: 'rejected',
        rejectedAt: new Date()
      });
      setUpdateLoading(false);
      fetchData();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      setUpdateError(`❌ Error rejecting claim: ${error.message}`);
      setUpdateLoading(false);
    }
  };

  const openContactDialog = (claim) => {
    setSelectedClaim(claim);
    setContactType(claim?.ownerContactType || 'whatsapp');
    setContactInfo(claim?.ownerContactInfo || '');
    setOpenDialog(true);
  };

  const submitContact = async () => {
    if (!contactInfo.trim()) return;

    let storeValue = null;

    if (contactType === 'whatsapp') {
      const normalizedNumber = formatIndianWhatsAppNumber(contactInfo);
      if (!normalizedNumber) {
        setContactError('Enter a valid 10-digit Indian WhatsApp number.');
        return;
      }
      storeValue = normalizedNumber;
    } else if (contactType === 'email') {
      const email = contactInfo.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setContactError('Enter a valid email address.');
        return;
      }
      storeValue = email;
    }

    await updateDoc(doc(db, 'claims', selectedClaim.id), {
      ownerContactInfo: storeValue,
      ownerContactType: contactType,
      contactSharedAt: serverTimestamp()
    });

    setContactInfo('');
    setContactError('');
    setOpenDialog(false);
    fetchData();
  };

  const openContact = (info, type, title) => {
    if (!info) {
      alert('Contact info is not available. Please ask the owner to share their contact.');
      return;
    }

    if (type === 'whatsapp') {
      const message = `Hello, I am contacting you regarding the item: ${title || 'an item'}`;
      const url = buildWhatsAppUrl(info, message);

      if (!url) {
        alert('Invalid WhatsApp number. The stored number format appears to be incorrect.');
        return;
      }

      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        alert('Unable to open WhatsApp. Please check your internet connection and try again.');
      }
    } else if (type === 'email') {
      const subject = `Regarding your item: ${title || 'an item'}`;
      const body = `Hello, I am contacting you regarding the item: ${title || 'an item'}`;
      const mailto = buildEmailUrl(info, subject, body);
      if (!mailto) {
        alert('Invalid email address stored.');
        return;
      }
      try {
        window.open(mailto, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening mail client:', error);
        window.location.href = mailto;
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Claims & Requests
      </Typography>

      {newClaimsCount > 0 && (
        <Alert severity="info" icon={<NotificationsActiveIcon />} sx={{ mb: 3 }}>
          You have {newClaimsCount} pending claim request(s).
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
          <Tab icon={<Badge badgeContent={newClaimsCount} color="error"><InboxIcon /></Badge>} label="Received Requests" />
          <Tab icon={<SendIcon />} label="My Sent Claims" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={2}>
          {receivedClaims.map(claim => (
            <Grid item xs={12} key={claim.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{claim.itemTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {claim.message || claim.proofText || ''}
                  </Typography>

                  <Chip
                    label={claim.status}
                    color={
                      claim.status === 'approved'
                        ? 'success'
                        : ['pending', 'pending_admin_review'].includes(claim.status)
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ mt: 2 }}
                  />

                  {['pending', 'pending_admin_review'].includes(claim.status) && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" onClick={() => handleApprove(claim.id)}>
                        Approve
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleReject(claim.id)}>
                        Reject
                      </Button>
                    </Box>
                  )}

                  {claim.status === 'approved' && !claim.ownerContactInfo && (
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => openContactDialog(claim)}
                    >
                      Share Contact Info
                    </Button>
                  )}

                  {claim.ownerContactInfo && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Contact info shared successfully.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          {myClaims.map(claim => (
            <Grid item xs={12} key={claim.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{claim.itemTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {claim.message || claim.proofText || ''}
                  </Typography>

                  <Chip
                    label={claim.status}
                    color={
                      claim.status === 'approved'
                        ? 'success'
                        : ['pending', 'pending_admin_review'].includes(claim.status)
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ mt: 2 }}
                  />

                  {claim.status === 'approved' && claim.ownerContactInfo && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Claim Approved! Contact owner.
                      </Alert>

                      {claim.ownerContactType === 'email' ? (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<MailOutlineIcon />}
                          onClick={() => openContact(claim.ownerContactInfo, 'email', claim.itemTitle)}
                        >
                          Contact via Email
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<WhatsAppIcon />}
                          onClick={() => openContact(claim.ownerContactInfo, 'whatsapp', claim.itemTitle)}
                        >
                          Connect on WhatsApp
                        </Button>
                      )}
                    </Box>
                  )}

                  {claim.status === 'approved' && !claim.ownerContactInfo && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Waiting for owner to share contact info...
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Share Contact Info</DialogTitle>
        <DialogContent>
          {contactError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {contactError}
            </Alert>
          )}

          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Contact Type</FormLabel>
            <RadioGroup
              row
              value={contactType}
              onChange={(e) => {
                setContactType(e.target.value);
                setContactError('');
              }}
            >
              <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
              <FormControlLabel value="email" control={<Radio />} label="Email" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            label={contactType === 'whatsapp' ? 'WhatsApp Number' : 'Email Address'}
            placeholder={contactType === 'whatsapp' ? 'Enter 10-digit WhatsApp number' : 'Enter email address'}
            value={contactInfo}
            onChange={(e) => {
              setContactInfo(e.target.value);
              if (contactError) setContactError('');
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitContact}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyClaims;
