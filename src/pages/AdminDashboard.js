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
  Tab
} from '@mui/material';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminDashboard = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
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
        lostQuery = query(collection(db, 'lostItems'));
        foundQuery = query(collection(db, 'foundItems'));
      } else {
        lostQuery = query(collection(db, 'lostItems'), where('location', '==', selectedArea));
        foundQuery = query(collection(db, 'foundItems'), where('location', '==', selectedArea));
      }

      const lostSnapshot = await getDocs(lostQuery);
      const foundSnapshot = await getDocs(foundQuery);

      setLostItems(lostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFoundItems(foundSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleMarkResolved = async (id, type) => {
    try {
      const collectionName = type === 'lost' ? 'lostItems' : 'foundItems';
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
      const collectionName = type === 'lost' ? 'lostItems' : 'foundItems';
      await deleteDoc(doc(db, collectionName, id));
      setOpenDialog(false);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
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
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>
                {new Date(item.dateLost || item.dateFound).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  color={item.status === 'active' ? 'primary' : 'success'}
                  size="small"
                />
              </TableCell>
              <TableCell>{item.userEmail}</TableCell>
              <TableCell>
                {item.status === 'active' && (
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
