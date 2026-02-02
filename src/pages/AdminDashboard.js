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
  Tooltip
} from '@mui/material';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

const AdminDashboard = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');

  const areas = [
    'all',
    'Downtown',
    'Uptown',
    'East Side',
    'West Side',
    'North District',
    'South District',
    'Central',
    'Suburbs'
  ];

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
      setClaims(claimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
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
      const collectionName = type === 'lost' ? 'lost_items' : 'found_items';
      await deleteDoc(doc(db, collectionName, id));
      setOpenDialog(false);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId));
      fetchItems();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openDeleteDialog = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDialog(true);
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
            <TableRow key={item.id}>
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
              <TableCell>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Lost Items (${lostItems.length})`} />
          <Tab label={`Found Items (${foundItems.length})`} />
          <Tab label={`All Claims (${claims.length})`} />
          <Tab label={`Messages (${messages.filter(m => m.status === 'unread').length})`} />
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
                    <TableRow key={claim.id}>
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
                        {claim.message}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={claim.status}
                          size="small"
                          color={
                            claim.status === 'approved' ? 'success' :
                            claim.status === 'rejected' ? 'error' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {claim.createdAt && claim.createdAt.seconds ? new Date(claim.createdAt.seconds * 1000).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {claim.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={async () => {
                                  try {
                                    await runTransaction(db, async (transaction) => {
                                      const claimRef = doc(db, 'claims', claim.id);
                                      const claimSnap = await transaction.get(claimRef);
                                      if (!claimSnap.exists()) throw new Error('Claim not found');
                                      transaction.update(claimRef, { status: 'approved', approvedAt: serverTimestamp() });

                                      const itemCollection = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
                                      const itemRef = doc(db, itemCollection, claim.itemId);
                                      const itemSnap = await transaction.get(itemRef);
                                      if (itemSnap.exists()) {
                                        transaction.update(itemRef, { status: 'resolved', resolvedAt: serverTimestamp() });
                                      }
                                    });
                                  } catch (err) {
                                    console.error('Error approving claim:', err);
                                  }
                                  fetchItems();
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="warning"
                                onClick={async () => {
                                  try {
                                    await runTransaction(db, async (transaction) => {
                                      const claimRef = doc(db, 'claims', claim.id);
                                      const claimSnap = await transaction.get(claimRef);
                                      if (!claimSnap.exists()) throw new Error('Claim not found');
                                      transaction.update(claimRef, { status: 'rejected', rejectedAt: serverTimestamp() });
                                    });
                                  } catch (err) {
                                    console.error('Error rejecting claim:', err);
                                  }
                                  fetchItems();
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={async () => {
                              await deleteDoc(doc(db, 'claims', claim.id));
                              fetchItems();
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleDelete(selectedItem?.id, itemType)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
