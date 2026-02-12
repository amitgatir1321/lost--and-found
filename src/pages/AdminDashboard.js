import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { 
  sendApprovalNotification, 
  sendRejectionNotification,
  sendRecoveryNotification,
  ADMIN_INFO
} from '../utils/whatsappNotifications';

const AdminDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const pendingClaimStatuses = ['pending', 'pending_admin_review'];
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  const [deleteMode, setDeleteMode] = useState('confirm'); // 'confirm', 'delete', or 'request_proof'
  const [proofMessage, setProofMessage] = useState('');
  
  // 📋 Item Detail View
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailedItem, setDetailedItem] = useState(null);
  const [detailedItemType, setDetailedItemType] = useState('');

  // 📱 WhatsApp Notification States
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationError, setNotificationError] = useState('');

  // 🔍 Need More Proof Dialog for Claims
  const [openNeedProofDialog, setOpenNeedProofDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [needProofMessage, setNeedProofMessage] = useState('');
  
  // 🗑️ Delete Claim Dialog
  const [openDeleteClaimDialog, setOpenDeleteClaimDialog] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);

  const areas = [
    'all',
    'thane',
    'domibvili',
    'kalyan',
    'mumbai',
    'pune',
    'nashik',
  ];

  useEffect(() => {
    // Debug: Check admin status in Firestore
    if (currentUser) {
      const checkAdminStatus = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          console.log('👤 User Document Exists:', userDoc.exists());
          console.log('📋 User Data:', userDoc.data());
          console.log('👨‍💼 Role from Firestore:', userDoc.data()?.role);
          console.log('👨‍💼 Role from AuthContext:', userRole);
          
          if (!userDoc.exists()) {
            console.warn('⚠️ User document does not exist in Firestore!');
            setNotificationError('⚠️ User document missing in Firestore. Go to SetupAdmin to fix this.');
          } else if (userDoc.data()?.role !== 'admin') {
            console.warn('⚠️ User is not admin in Firestore!');
            setNotificationError(`⚠️ Your role in Firestore is: "${userDoc.data()?.role}". Go to SetupAdmin to become admin.`);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      };
      checkAdminStatus();
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    fetchItems();
  }, [selectedArea]);

  const fetchItems = async () => {
    try {
      let lostQuery, foundQuery;

      if (selectedArea === 'all') {
        lostQuery = query(collection(db, 'lost_items'));
        foundQuery = query(collection(db, 'found_items'));
      } else {
        lostQuery = query(collection(db, 'lost_items'), where('location', '==', selectedArea));
        foundQuery = query(collection(db, 'found_items'), where('location', '==', selectedArea));
      }

      const lostSnapshot = await getDocs(lostQuery);
      const foundSnapshot = await getDocs(foundQuery);
      const claimsSnapshot = await getDocs(collection(db, 'claims'));
      const messagesSnapshot = await getDocs(collection(db, 'contactMessages'));

      setLostItems(lostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFoundItems(foundSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const claimsData = claimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort newest claims first (by createdAt timestamp if available)
      claimsData.sort((a, b) => {
        const aTime = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds * 1000 : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        const bTime = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds * 1000 : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
        return bTime - aTime;
      });
      setClaims(claimsData);
      
      const messagesData = messagesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      }));
      setMessages(messagesData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleMarkResolved = async (id, type) => {
    try {
      const collectionName = type === 'lost' ? 'lost_items' : 'found_items';
      await updateDoc(doc(db, collectionName, id), {
        status: 'resolved',
        resolvedAt: new Date()
      });
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      setNotificationLoading(true);
      const collectionName = type === 'lost' ? 'lost_items' : 'found_items';
      
      // If requesting proof, send WhatsApp message before deleting
      if (deleteMode === 'request_proof') {
        // Get user's WhatsApp number
        const itemDoc = await getDoc(doc(db, collectionName, id));
        const itemData = itemDoc.data();
        const userDoc = await getDoc(doc(db, 'users', itemData.userId));
        const userData = userDoc.data();
        
        if (userData?.whatsappNumber) {
          const message = `📋 Hi ${userData.name || 'User'},\n\nYour report "${selectedItem?.title}" needs more proof/clarification.\n\n💬 Admin says: ${proofMessage}\n\nPlease reply with:\n• Better photos\n• More detailed description\n• Any additional evidence\n\n📞 Admin: ${ADMIN_INFO.phone}\n📧 Admin: ${ADMIN_INFO.email}`;
          const whatsappUrl = buildWhatsAppUrl(userData.whatsappNumber, message);
          window.open(whatsappUrl, '_blank');
          setNotificationMessage(`✅ Proof request message sent to ${userData.whatsappNumber}`);
        } else {
          setNotificationError('⚠️ No WhatsApp number found. Update will be made but message not sent.');
        }
      }
      
      await deleteDoc(doc(db, collectionName, id));
      setOpenDialog(false);
      setDeleteMode('confirm');
      setProofMessage('');
      setNotificationLoading(false);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setNotificationError(`❌ Error: ${error.message}`);
      setNotificationLoading(false);
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'read'
      });
      fetchItems();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle: Make Current User Admin
  const makeCurrentUserAdmin = async () => {
    if (!currentUser) {
      setNotificationError('No user logged in');
      return;
    }

    try {
      setNotificationLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        role: 'admin'
      });
      setNotificationMessage(`✅ Success! ${currentUser.email} is now an admin. Please refresh the page.`);
      setNotificationLoading(false);
    } catch (error) {
      console.error('Error making user admin:', error);
      setNotificationError(`Error: ${error.message}`);
      setNotificationLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId));
      fetchItems();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Handle "Need More Proof" for Claims
  const handleNeedMoreProof = async () => {
    if (!selectedClaim || !needProofMessage.trim()) {
      setNotificationError('Please enter a message');
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError('');
      setNotificationMessage('');

      // Get claimant's WhatsApp number
      const claimantDoc = await getDoc(doc(db, 'users', selectedClaim.claimantId));
      const claimantData = claimantDoc.data();

      if (claimantData?.whatsappNumber) {
        const message = `📋 Hi ${claimantData.name || 'User'},\n\nYour claim for "${selectedClaim.itemTitle}" needs more proof/details.\n\n💬 Admin Message:\n${needProofMessage}\n\nPlease reply with:\n• Better photos of the proof\n• More detailed description\n• Any additional evidence\n\n📞 Admin: ${ADMIN_INFO.phone}\n📧 Admin: ${ADMIN_INFO.email}\n\nThanks!`;
        const whatsappUrl = buildWhatsAppUrl(claimantData.whatsappNumber, message);
        window.open(whatsappUrl, '_blank');
        setNotificationMessage(`✅ "Need More Proof" message sent to ${claimantData.whatsappNumber}`);
      } else {
        setNotificationError('⚠️ No WhatsApp number found for claimant');
      }

      setOpenNeedProofDialog(false);
      setSelectedClaim(null);
      setNeedProofMessage('');
    } catch (error) {
      console.error('Error sending need more proof message:', error);
      setNotificationError(`❌ Error: ${error.message}`);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle Delete Claim
  const handleDeleteClaim = async () => {
    if (!claimToDelete) return;

    try {
      setNotificationLoading(true);
      setNotificationError('');

      // Check authentication
      if (!currentUser) {
        throw new Error('You are not authenticated. Please log in.');
      }

      console.log('🔍 Deleting claim:', claimToDelete.id);
      console.log('👤 Current user:', currentUser.uid);
      console.log('👨‍💼 User role:', userRole);

      // Verify user is admin
      if (userRole !== 'admin') {
        throw new Error(`Only admins can delete claims. Your role: ${userRole || 'not set'}. Please contact the administrator.`);
      }

      // Attempt deletion
      await deleteDoc(doc(db, 'claims', claimToDelete.id));
      
      setOpenDeleteClaimDialog(false);
      setClaimToDelete(null);
      setNotificationMessage('✅ Claim deleted successfully');
      setTimeout(() => fetchItems(), 500);
    } catch (error) {
      console.error('❌ Error deleting claim:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let userMessage = error.message;
      if (error.message.includes('Missing or insufficient permissions')) {
        userMessage = `⚠️ Permission denied. Make sure:\n• You are logged in as admin\n• Your user has admin role in Firestore\n\n🔧 Technical: ${error.message}`;
      }
      
      setNotificationError(userMessage);
    } finally {
      setNotificationLoading(false);
    }
  };

  const openDeleteDialog = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setDeleteMode('confirm');
    setProofMessage('');
    setOpenDialog(true);
  };

  const openDetailView = (item, type) => {
    setDetailedItem(item);
    setDetailedItemType(type);
    setOpenDetailDialog(true);
  };

  const renderItemsTable = (items, type) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>User</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow 
              key={item.id}
              onClick={() => openDetailView(item, type)}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
            >
              <TableCell>{item.itemName || item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>
                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  color={item.status === 'resolved' ? 'success' : 'primary'}
                  size="small"
                />
              </TableCell>
              <TableCell>{item.userEmail}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {item.status !== 'resolved' && (
                  <Button
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleMarkResolved(item.id, type)}
                    sx={{ mr: 1 }}
                  >
                    Resolve
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => openDeleteDialog(item, type)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Admin Dashboard
      </Typography>

      {/* ⚠️ Admin Setup Alert */}
      {userRole !== 'admin' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ⚠️ You are NOT an admin yet! You won't be able to approve/delete claims or reports.
              </Typography>
              <Typography variant="caption">
                Current Role: {userRole || 'Not set'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              onClick={makeCurrentUserAdmin}
              disabled={notificationLoading}
              sx={{ ml: 2, whiteSpace: 'nowrap' }}
            >
              {notificationLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : '🔧'}
              Make Me Admin
            </Button>
          </Box>
        </Alert>
      )}

      {/* 📢 Notification Alerts */}
      {notificationError && (
        <Alert severity="error" onClose={() => setNotificationError('')} sx={{ mb: 2 }}>
          {notificationError}
        </Alert>
      )}
      {notificationMessage && (
        <Alert severity="success" onClose={() => setNotificationMessage('')} sx={{ mb: 2 }}>
          {notificationMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Area"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {areas.map((area) => (
            <MenuItem key={area} value={area}>
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* 📱 WhatsApp Notification Alerts */}
      {notificationMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setNotificationMessage('')}
        >
          {notificationMessage}
        </Alert>
      )}
      {notificationError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setNotificationError('')}
        >
          {notificationError}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Lost Items (${lostItems.length})`} />
          <Tab label={`Found Items (${foundItems.length})`} />
          <Tab label={`All Claims (${claims.length})`} />
          <Tab label={`Messages (${messages.filter(m => m.status === 'unread').length})`} />
          <Tab label="Report Generation" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom color="secondary">
            Lost Items
          </Typography>
          {lostItems.length > 0 ? (
            renderItemsTable(lostItems, 'lost')
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No lost items found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
            Found Items
          </Typography>
          {foundItems.length > 0 ? (
            renderItemsTable(foundItems, 'found')
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No found items found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#414A37' }}>
            All Claims
          </Typography>
          {claims.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Item</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Claimant</strong></TableCell>
                    <TableCell><strong>Owner</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow 
                      key={claim.id}
                      onClick={() => {
                        setDetailedItem(claim);
                        setDetailedItemType('claim');
                        setOpenDetailDialog(true);
                      }}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell>{claim.itemTitle}</TableCell>
                      <TableCell>
                        <Chip 
                          label={claim.itemType} 
                          size="small"
                          color={claim.itemType === 'lost' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{claim.claimantEmail}</TableCell>
                      <TableCell>{claim.itemOwnerEmail}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.message || claim.proofText || ''}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={claim.status}
                          size="small"
                          color={
                            claim.status === 'approved' ? 'success' :
                            claim.status === 'rejected' ? 'error' :
                            pendingClaimStatuses.includes(claim.status) ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {claim.createdAt && claim.createdAt.seconds ? new Date(claim.createdAt.seconds * 1000).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {pendingClaimStatuses.includes(claim.status) && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={async () => {
                                  try {
                                    setNotificationLoading(true);
                                    setNotificationError('');
                                    setNotificationMessage('');

                                    // Fetch full item details BEFORE transaction (all reads first)
                                    const itemCollection = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
                                    const itemRef = doc(db, itemCollection, claim.itemId);
                                    const itemSnap = await getDoc(itemRef);
                                    const itemDetails = itemSnap.data();

                                    // NOW execute transaction (all writes ONLY - reads are already done)
                                    await runTransaction(db, async (transaction) => {
                                      const claimRef = doc(db, 'claims', claim.id);
                                      const claimSnap = await transaction.get(claimRef);
                                      if (!claimSnap.exists()) throw new Error('Claim not found');
                                      transaction.update(claimRef, { status: 'approved', approvedAt: serverTimestamp() });

                                      // Update item directly - already verified it exists via getDoc outside transaction
                                      const itemRefInTx = doc(db, itemCollection, claim.itemId);
                                      if (itemDetails) {
                                        transaction.update(itemRefInTx, { status: 'resolved', resolvedAt: serverTimestamp() });
                                      }
                                    });

                                    // Send WhatsApp notification to claimant
                                    if (itemDetails?.whatsappNumber) {
                                      const success = sendApprovalNotification(
                                        itemDetails.whatsappNumber,
                                        claim,
                                        itemDetails
                                      );
                                      
                                      if (success) {
                                        setNotificationMessage(`✅ Approval notification sent to ${itemDetails.whatsappNumber}`);
                                      } else {
                                        setNotificationError('Could not open WhatsApp, but claim was approved');
                                      }
                                    } else {
                                      setNotificationError('⚠️ No WhatsApp number found for claimant. Approve claim but send message manually.');
                                    }
                                  } catch (err) {
                                    console.error('Error approving claim:', err);
                                    setNotificationError('Error approving claim: ' + err.message);
                                  } finally {
                                    setNotificationLoading(false);
                                    setTimeout(() => fetchItems(), 1000);
                                  }
                                }}
                                disabled={notificationLoading}
                              >
                                {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
                                Approve & Send WhatsApp
                              </Button>
                              <Button
                                size="small"
                                color="warning"
                                onClick={async () => {
                                  try {
                                    setNotificationLoading(true);
                                    setNotificationError('');
                                    setNotificationMessage('');

                                    // Fetch full item details BEFORE transaction (all reads first)
                                    const itemCollection = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
                                    const itemRef = doc(db, itemCollection, claim.itemId);
                                    const itemSnap = await getDoc(itemRef);
                                    const itemDetails = itemSnap.data();

                                    // NOW execute transaction (all writes)
                                    await runTransaction(db, async (transaction) => {
                                      const claimRef = doc(db, 'claims', claim.id);
                                      const claimSnap = await transaction.get(claimRef);
                                      if (!claimSnap.exists()) throw new Error('Claim not found');
                                      transaction.update(claimRef, { status: 'rejected', rejectedAt: serverTimestamp() });
                                    });

                                    // Send WhatsApp rejection notification to claimant
                                    if (itemDetails?.whatsappNumber) {
                                      const success = sendRejectionNotification(
                                        itemDetails.whatsappNumber,
                                        claim,
                                        itemDetails,
                                        'Claim did not meet verification criteria. Please resubmit with better proof.'
                                      );
                                      
                                      if (success) {
                                        setNotificationMessage(`✅ Rejection notification sent to ${itemDetails.whatsappNumber}`);
                                      } else {
                                        setNotificationError('Could not open WhatsApp, but claim was rejected');
                                      }
                                    } else {
                                      setNotificationError('⚠️ No WhatsApp number found for claimant. Claim rejected but message not sent.');
                                    }
                                  } catch (err) {
                                    console.error('Error rejecting claim:', err);
                                    setNotificationError('Error rejecting claim: ' + err.message);
                                  } finally {
                                    setNotificationLoading(false);
                                    setTimeout(() => fetchItems(), 1000);
                                  }
                                }}
                                disabled={notificationLoading}
                              >
                                {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
                                Reject & Send WhatsApp
                              </Button>
                              <Button
                                size="small"
                                color="info"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setOpenNeedProofDialog(true);
                                }}
                              >
                                📋 Need More Proof
                              </Button>
                            </>
                          )}

                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              setClaimToDelete(claim);
                              setOpenDeleteClaimDialog(true);
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No claims found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#414A37' }}>
            Contact Messages
          </Typography>
          {messages.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow 
                      key={message.id}
                      sx={{ backgroundColor: message.status === 'unread' ? '#fff3e0' : 'inherit' }}
                    >
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {message.message}
                      </TableCell>
                      <TableCell>
                        {message.createdAt?.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={message.status}
                          color={message.status === 'read' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {message.status === 'unread' && (
                            <Tooltip title="Mark as Read">
                              <IconButton
                                size="small"
                                onClick={() => handleMarkMessageRead(message.id)}
                                color="primary"
                              >
                                <MarkEmailReadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMessage(message.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No messages found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#0066cc' }}>
            Report Generation & WhatsApp Delivery
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1565c0' }}>
                    ✅ Automated WhatsApp Approval System
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0d47a1', mb: 2 }}>
                    <strong>What happens when you approve a claim:</strong>
                  </Typography>
                  <Box component="ol" sx={{ pl: 2, color: '#0d47a1' }}>
                    <li><Typography variant="body2" component="span">Admin clicks "Approve & Send WhatsApp"</Typography></li>
                    <li><Typography variant="body2" component="span">Item is marked as resolved</Typography></li>
                    <li><Typography variant="body2" component="span">Detailed approval report is automatically generated</Typography></li>
                    <li><Typography variant="body2" component="span">Report is sent to claimant via WhatsApp immediately</Typography></li>
                    <li><Typography variant="body2" component="span">Admin phone: {ADMIN_INFO.phone}</Typography></li>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#f3e5f5', borderLeft: '4px solid #7b1fa2' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#6a1b9a' }}>
                    🎉 Recovery Confirmation Messages
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4a148c', mb: 2 }}>
                    <strong>When item is recovered:</strong>
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, color: '#4a148c' }}>
                    <li><Typography variant="body2" component="span">Use "Recovery Confirmation" button in approved claims</Typography></li>
                    <li><Typography variant="body2" component="span">Final celebration report sent to claimant</Typography></li>
                    <li><Typography variant="body2" component="span">Confirms item was successfully recovered</Typography></li>
                    <li><Typography variant="body2" component="span">WhatsApp numbers are {ADMIN_INFO.email}</Typography></li>
                    <li><Typography variant="body2" component="span">All confidential & secure</Typography></li>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>✅ Fully Automated System:</strong> Claims now automatically send WhatsApp reports when approved. Admin email: {ADMIN_INFO.email}
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 Approved Claims Requiring Report Delivery
            </Typography>
            {claims.filter(c => c.status === 'approved').length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Item</strong></TableCell>
                      <TableCell><strong>Claimant</strong></TableCell>
                      <TableCell><strong>WhatsApp</strong></TableCell>
                      <TableCell><strong>Approved Date</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claims.filter(c => c.status === 'approved').map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>{claim.itemTitle}</TableCell>
                        <TableCell>{claim.claimantEmail}</TableCell>
                        <TableCell>{claim.claimantPhone || 'Not available'}</TableCell>
                        <TableCell>
                          {claim.approvedAt && claim.approvedAt.seconds 
                            ? new Date(claim.approvedAt.seconds * 1000).toLocaleDateString() 
                            : ''}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Resend Approval Report">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={async () => {
                                  if (claim.claimantPhone) {
                                    try {
                                      // Fetch full item details
                                      const itemCollection = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
                                      const itemRef = doc(db, itemCollection, claim.itemId);
                                      const itemSnap = await getDoc(itemRef);
                                      const itemDetails = itemSnap.data();
                                      
                                      sendApprovalNotification(claim.claimantPhone, claim, itemDetails);
                                      setNotificationMessage(`✅ Approval report resent to ${claim.claimantPhone}`);
                                      setTimeout(() => setNotificationMessage(''), 3000);
                                    } catch (error) {
                                      setNotificationError('Error sending message: ' + error.message);
                                    }
                                  }
                                }}
                              >
                                <WhatsAppIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Send Recovery Confirmation">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={async () => {
                                  if (claim.claimantPhone) {
                                    try {
                                      // Fetch full item details
                                      const itemCollection = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
                                      const itemRef = doc(db, itemCollection, claim.itemId);
                                      const itemSnap = await getDoc(itemRef);
                                      const itemDetails = itemSnap.data();
                                      
                                      sendRecoveryNotification(claim.claimantPhone, claim, itemDetails);
                                      setNotificationMessage(`🎉 Recovery confirmation sent to ${claim.claimantPhone}`);
                                      setTimeout(() => setNotificationMessage(''), 3000);
                                    } catch (error) {
                                      setNotificationError('Error sending message: ' + error.message);
                                    }
                                  }
                                }}
                              >
                                🎉
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No approved claims pending report delivery</Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* 📋 ITEM DETAIL VIEW MODAL */}
      <Dialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem', backgroundColor: '#f5f5f5' }}>
          📋 {detailedItemType === 'claim' ? '🔎 Claim Details' : (detailedItemType === 'lost' ? '🔍 Lost Item' : '✅ Found Item')}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailedItem && detailedItemType === 'claim' ? (
            // Claim details view
            <Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    📦 Claim Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Item Title
                      </Typography>
                      <Typography variant="body2">{detailedItem.itemTitle}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Item Type
                      </Typography>
                      <Chip 
                        label={detailedItem.itemType} 
                        color={detailedItem.itemType === 'lost' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Claimant Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {detailedItem.claimantEmail}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Item Owner Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {detailedItem.itemOwnerEmail}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Status
                      </Typography>
                      <Chip
                        label={detailedItem.status}
                        color={
                          detailedItem.status === 'approved' ? 'success' :
                          detailedItem.status === 'rejected' ? 'error' :
                          pendingClaimStatuses.includes(detailedItem.status) ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Submitted Date
                      </Typography>
                      <Typography variant="body2">
                        {detailedItem.createdAt && detailedItem.createdAt.seconds 
                          ? new Date(detailedItem.createdAt.seconds * 1000).toLocaleDateString() 
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📝 Claim Message / Proof
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Left: Image (if provided by claimant) */}
                    <Grid item xs={12} md={5}>
                      { (detailedItem.proofImageUrl || detailedItem.proofImage || detailedItem.imageUrl) ? (
                        <Box
                          component="img"
                          src={detailedItem.proofImageUrl || detailedItem.proofImage || detailedItem.imageUrl}
                          alt={detailedItem.itemTitle || 'Proof Image'}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 420,
                            objectFit: 'contain',
                            borderRadius: 2,
                            border: '1px solid #ddd',
                            backgroundColor: '#fafafa'
                          }}
                        />
                      ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', minHeight: 220, backgroundColor: '#f9f9f9' }}>
                          <Typography color="text.secondary">No proof image provided</Typography>
                        </Paper>
                      )}
                    </Grid>

                    {/* Right: Message/Proof text and metadata */}
                    <Grid item xs={12} md={7}>
                      <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', height: '100%' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {detailedItem.message || detailedItem.proofText || 'No additional information provided'}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Claimant Info
                          </Typography>
                          <Typography variant="body2">{detailedItem.claimantEmail || detailedItem.claimantId || 'N/A'}</Typography>
                          {detailedItem.claimantPhone && (
                            <Typography variant="body2">{detailedItem.claimantPhone}</Typography>
                          )}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Owner Info
                          </Typography>
                          <Typography variant="body2">{detailedItem.itemOwnerEmail || detailedItem.itemOwnerId || 'N/A'}</Typography>
                          {detailedItem.ownerContactInfo && (
                            <Typography variant="body2">{detailedItem.ownerContactInfo}</Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>

                {detailedItem.approval && (
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                )}

                {detailedItem.approval && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      ✅ Approval Details
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {detailedItem.approvedAt && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Approved Date
                          </Typography>
                          <Typography variant="body2">
                            {new Date(detailedItem.approvedAt.seconds * 1000).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {detailedItem.approval.notes && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            Admin Notes
                          </Typography>
                          <Typography variant="body2">
                            {detailedItem.approval.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}

                {detailedItem.rejectedAt && (
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                )}

                {detailedItem.rejectedAt && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="body2">
                        <strong>❌ Rejected</strong> - User can submit a new claim with better proof and description
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : detailedItem ? (
            // Item details view (existing code)
            <Box>
              {/* Image and Details in Grid */}
              <Grid container spacing={3}>
                {/* Image Section */}
                <Grid item xs={12} md={5}>
                  {detailedItem.imageUrl ? (
                    <Box
                      component="img"
                      src={detailedItem.imageUrl}
                      alt={detailedItem.itemName || detailedItem.title}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 400,
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f9f9f9'
                      }}
                    />
                  ) : (
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300,
                        borderRadius: '8px'
                      }}
                    >
                      <Typography color="text.secondary">No image available</Typography>
                    </Paper>
                  )}
                </Grid>

                {/* Details Section */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Item Name */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Item Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {detailedItem.itemName || detailedItem.title}
                      </Typography>
                    </Box>

                    {/* Category */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Category
                      </Typography>
                      <Chip label={detailedItem.category} variant="outlined" size="small" />
                    </Box>

                    {/* Status */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Status
                      </Typography>
                      <Chip
                        label={detailedItem.status}
                        color={
                          detailedItem.status === 'resolved' ? 'success' :
                          detailedItem.status === 'pending' ? 'warning' :
                          detailedItem.status === 'pending_finder_confirmation' ? 'warning' :
                          'default'
                        }
                        variant="filled"
                        size="small"
                      />
                    </Box>

                    {/* Location */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {detailedItem.location}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        {detailedItemType === 'lost' ? 'Date Lost' : 'Date Found'}
                      </Typography>
                      <Typography variant="body2">
                        {detailedItem.date ? new Date(detailedItem.date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>

                    {/* User Email */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        Reporter Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {detailedItem.userEmail}
                      </Typography>
                    </Box>

                    {/* WhatsApp Number */}
                    {detailedItem.whatsappNumber && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                          WhatsApp Number
                        </Typography>
                        <Typography variant="body2">
                          {detailedItem.whatsappNumber}
                        </Typography>
                      </Box>
                    )}

                    {/* Contact Email */}
                    {detailedItem.contactEmail && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                          Contact Email
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {detailedItem.contactEmail}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Description Section (Full Width) */}
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {detailedItem.description}
                  </Typography>
                </Paper>
              </Box>

              {/* Reward (if mentioned) */}
              {detailedItem.reward && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ mb: 1 }}>
                    Reward
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100' }}>
                      {detailedItem.reward}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Metadata */}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {detailedItem.createdAt?.toDate ? new Date(detailedItem.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Updated At
                  </Typography>
                  <Typography variant="body2">
                    {detailedItem.updatedAt?.toDate ? new Date(detailedItem.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No item selected</Typography>
              </Box>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button onClick={() => setOpenDetailDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {deleteMode === 'confirm' ? '⚠️ Item Action' : deleteMode === 'delete' ? '🗑️ Confirm Delete' : '📋 Request More Proof'}
        </DialogTitle>
        <DialogContent>
          {deleteMode === 'confirm' && (
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom>
                What would you like to do with "{selectedItem?.title}"?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  fullWidth
                  onClick={() => setDeleteMode('request_proof')}
                  sx={{ py: 1.5 }}
                >
                  📨 Request More Proof/Details
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => setDeleteMode('delete')}
                  sx={{ py: 1.5 }}
                >
                  🗑️ Delete Item
                </Button>
              </Box>
            </Box>
          )}

          {deleteMode === 'delete' && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                This action cannot be undone!
              </Alert>
              <Typography>
                Are you sure you want to permanently delete "{selectedItem?.title}"?
              </Typography>
            </Box>
          )}

          {deleteMode === 'request_proof' && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography color="text.secondary">
                Send a message to the user requesting more proof or details:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g., Please provide clearer photos of the item or more detailed location information..."
                value={proofMessage}
                onChange={(e) => setProofMessage(e.target.value)}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                💬 This message will be sent via WhatsApp to the user
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenDialog(false); setDeleteMode('confirm'); }} variant="outlined">
            Cancel
          </Button>
          {deleteMode === 'confirm' && null}
          {deleteMode === 'delete' && (
            <Button
              onClick={() => handleDelete(selectedItem?.id, itemType)}
              color="error"
              variant="contained"
              disabled={notificationLoading}
            >
              {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
              Delete Permanently
            </Button>
          )}
          {deleteMode === 'request_proof' && (
            <Button
              onClick={() => handleDelete(selectedItem?.id, itemType)}
              color="warning"
              variant="contained"
              disabled={!proofMessage.trim() || notificationLoading}
            >
              {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
              Send & Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 🔍 Need More Proof Dialog for Claims */}
      <Dialog open={openNeedProofDialog} onClose={() => setOpenNeedProofDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          📋 Request More Proof
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            Send a message to the claimant requesting more proof or details:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., Please provide clearer photos of your proof or more detailed information about your claim..."
            value={needProofMessage}
            onChange={(e) => setNeedProofMessage(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💬 This message will be sent via WhatsApp to the claimant
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNeedProofDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleNeedMoreProof}
            color="info"
            variant="contained"
            disabled={!needProofMessage.trim() || notificationLoading}
          >
            {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🗑️ Delete Claim Confirmation Dialog */}
      <Dialog open={openDeleteClaimDialog} onClose={() => setOpenDeleteClaimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
          🗑️ Delete Claim
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to permanently delete the claim for "{claimToDelete?.itemTitle}"?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Claimant: {claimToDelete?.claimantEmail}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteClaimDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteClaim}
            color="error"
            variant="contained"
            disabled={notificationLoading}
          >
            {notificationLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : ''}
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
