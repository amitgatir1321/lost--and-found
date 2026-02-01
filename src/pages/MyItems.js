import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const MyItems = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Load lost items
        const lostQuery = query(
          collection(db, 'lost_items'),
          where('userId', '==', currentUser.uid)
        );
        const lostSnap = await getDocs(lostQuery);
        setLostItems(lostSnap.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        })));

        // Load found items
        const foundQuery = query(
          collection(db, 'found_items'),
          where('userId', '==', currentUser.uid)
        );
        const foundSnap = await getDocs(foundQuery);
        setFoundItems(foundSnap.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        })));
      } catch (error) {
        console.error('Error loading items:', error);
        setMessage({ type: 'error', text: 'Failed to load items' });
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [currentUser, navigate]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, itemToDelete.type === 'lost' ? 'lost_items' : 'found_items', itemToDelete.docId));
      
      if (itemToDelete.type === 'lost') {
        setLostItems(lostItems.filter(item => item.docId !== itemToDelete.docId));
      } else {
        setFoundItems(foundItems.filter(item => item.docId !== itemToDelete.docId));
      }
      
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdateClick = (item, type) => {
    setItemToUpdate({ ...item, type });
    setNewStatus(item.status);
    setStatusUpdateDialog(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!newStatus || newStatus === itemToUpdate.status) {
      setMessage({ type: 'error', text: 'Please select a different status' });
      return;
    }

    setActionLoading(true);
    try {
      const collectionName = itemToUpdate.type === 'lost' ? 'lost_items' : 'found_items';
      await updateDoc(doc(db, collectionName, itemToUpdate.docId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      if (itemToUpdate.type === 'lost') {
        setLostItems(lostItems.map(item =>
          item.docId === itemToUpdate.docId ? { ...item, status: newStatus } : item
        ));
      } else {
        setFoundItems(foundItems.map(item =>
          item.docId === itemToUpdate.docId ? { ...item, status: newStatus } : item
        ));
      }

      setMessage({ type: 'success', text: 'Status updated successfully' });
      setStatusUpdateDialog(false);
      setItemToUpdate(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Failed to update status' });
    } finally {
      setActionLoading(false);
    }
  };

  const ItemCard = ({ item, type }) => {
    const statusColors = {
      pending: { bg: '#FFF3E0', color: '#F57C00', icon: PendingIcon },
      matched: { bg: '#E3F2FD', color: '#1976D2', icon: CheckCircleIcon },
      resolved: { bg: '#E8F5E9', color: '#388E3C', icon: TaskAltIcon }
    };

    const CurrentIcon = statusColors[item.status]?.icon || PendingIcon;

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
        {item.imageURL && (
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundImage: `url(${item.imageURL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <Chip
              icon={<CurrentIcon />}
              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: statusColors[item.status]?.bg,
                color: statusColors[item.status]?.color,
                fontWeight: 'bold'
              }}
            />
          </Box>
        )}

        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
              {item.itemName}
            </Typography>
            {!item.imageURL && (
              <Chip
                icon={<CurrentIcon />}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                sx={{
                  bgcolor: statusColors[item.status]?.bg,
                  color: statusColors[item.status]?.color,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CategoryIcon sx={{ fontSize: 18, color: '#666' }} />
            <Chip label={item.category} size="small" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 18, color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {item.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <DateRangeIcon sx={{ fontSize: 18, color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(item.date).toLocaleDateString()}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            <strong>Description:</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.5 }}>
            {item.description.substring(0, 100)}
            {item.description.length > 100 ? '...' : ''}
          </Typography>
        </CardContent>

        <Divider />

        <CardActions sx={{ gap: 1 }}>
          <Tooltip title="Update Status">
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleStatusUpdateClick(item, type)}
              sx={{ color: '#414A37' }}
              disabled={item.status === 'resolved'}
            >
              Status
            </Button>
          </Tooltip>
          <Tooltip title="Delete Item">
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick({ ...item, type })}
              color="error"
              disabled={item.status === 'resolved'}
            >
              Delete
            </Button>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} sx={{ color: '#414A37' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: '#414A37', color: 'white', borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📦 My Items
        </Typography>
        <Typography variant="body1">
          Manage your reported lost and found items
        </Typography>
      </Paper>

      {/* Message Alert */}
      {message && (
        <Alert severity={message.type} onClose={() => setMessage('')} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<SearchOffIcon />}
            iconPosition="start"
            label={`Lost Items (${lostItems.length})`}
          />
          <Tab
            icon={<FindInPageIcon />}
            iconPosition="start"
            label={`Found Items (${foundItems.length})`}
          />
        </Tabs>
      </Paper>

      {/* Lost Items Tab */}
      <TabPanel value={tabValue} index={0}>
        {lostItems.length === 0 ? (
          <Alert severity="info">
            📋 You haven't reported any lost items yet.{' '}
            <Button onClick={() => navigate('/report-lost')} color="inherit" sx={{ fontWeight: 'bold' }}>
              Report a lost item
            </Button>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {lostItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.docId}>
                <ItemCard item={item} type="lost" />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Found Items Tab */}
      <TabPanel value={tabValue} index={1}>
        {foundItems.length === 0 ? (
          <Alert severity="info">
            📋 You haven't reported any found items yet.{' '}
            <Button onClick={() => navigate('/report-found')} color="inherit" sx={{ fontWeight: 'bold' }}>
              Report a found item
            </Button>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {foundItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.docId}>
                <ItemCard item={item} type="found" />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Item?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.itemName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Update Status
            <IconButton onClick={() => setStatusUpdateDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Item:</strong> {itemToUpdate?.itemName}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Current Status:</strong>{' '}
            <Chip
              label={itemToUpdate?.status.charAt(0).toUpperCase() + itemToUpdate?.status.slice(1)}
              size="small"
            />
          </Typography>

          <Box sx={{ mb: 3, p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update status to:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['pending', 'matched', 'resolved'].map(status => (
                <Button
                  key={status}
                  variant={newStatus === status ? 'contained' : 'outlined'}
                  onClick={() => setNewStatus(status)}
                  fullWidth
                  sx={{ textTransform: 'capitalize' }}
                >
                  {status}
                </Button>
              ))}
            </Box>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Resolved:</strong> Item has been successfully returned or claimed. No further changes allowed.
            </Typography>
          </Alert>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusUpdateDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            variant="contained"
            sx={{ bgcolor: '#414A37' }}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyItems;
