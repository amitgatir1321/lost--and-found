import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import {
  getAllClaims,
  getClaimWithItemDetails,
  approveClaim,
  rejectClaim,
  resolveClaim
} from '../services/claimsService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    case 'resolved':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon fontSize="small" />;
    case 'rejected':
      return <CancelIcon fontSize="small" />;
    case 'pending':
      return <PendingIcon fontSize="small" />;
    case 'resolved':
      return <TaskAltIcon fontSize="small" />;
    default:
      return null;
  }
};

const AdminClaimsPage = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const [allClaims, setAllClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedClaimDetails, setSelectedClaimDetails] = useState(null);

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadClaims();
  }, [currentUser, userRole, navigate]);

  useEffect(() => {
    filterClaims();
  }, [allClaims, statusFilter, searchTerm]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const claims = await getAllClaims();
      setAllClaims(claims);
    } catch (error) {
      console.error('Error loading claims:', error);
      setMessage('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = allClaims;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    // Search by item name or claimant name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.itemName?.toLowerCase().includes(term) ||
        claim.claimantName?.toLowerCase().includes(term) ||
        claim.claimantEmail?.toLowerCase().includes(term)
      );
    }

    setFilteredClaims(filtered);
  };

  const handleViewDetails = async (claim) => {
    setSelectedClaim(claim);
    const details = await getClaimWithItemDetails(claim.id);
    setSelectedClaimDetails(details);
    setDetailsDialogOpen(true);
  };

  const handleApproveClaim = async () => {
    setActionLoading(true);
    try {
      const result = await approveClaim(selectedClaim.id);
      if (result.success) {
        setMessage('Claim approved successfully');
        setDetailsDialogOpen(false);
        loadClaims();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error approving claim: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClaim = async () => {
    setActionLoading(true);
    try {
      const result = await rejectClaim(selectedClaim.id);
      if (result.success) {
        setMessage('Claim rejected successfully');
        setDetailsDialogOpen(false);
        loadClaims();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error rejecting claim: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveClaim = async () => {
    setActionLoading(true);
    try {
      const result = await resolveClaim(selectedClaim.id, resolutionNotes);
      if (result.success) {
        setMessage('Claim resolved successfully');
        setResolveDialogOpen(false);
        setDetailsDialogOpen(false);
        loadClaims();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error resolving claim: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Claims Dashboard
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3cd' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              {allClaims.filter(c => c.status === 'pending').length}
            </Typography>
            <Typography variant="body2">Pending</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#d4edda' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              {allClaims.filter(c => c.status === 'approved').length}
            </Typography>
            <Typography variant="body2">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8d7da' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc3545' }}>
              {allClaims.filter(c => c.status === 'rejected').length}
            </Typography>
            <Typography variant="body2">Rejected</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#d1ecf1' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0c5460' }}>
              {allClaims.filter(c => c.status === 'resolved').length}
            </Typography>
            <Typography variant="body2">Resolved</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by item name, claimant name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SearchOffIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            No claims found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Claimant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClaims.map(claim => (
                <TableRow key={claim.id} hover>
                  <TableCell>{claim.itemName}</TableCell>
                  <TableCell>{claim.claimantName}</TableCell>
                  <TableCell>{claim.category}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(claim.status)}
                      label={claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      color={getStatusColor(claim.status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(claim.createdAt?.toDate?.() || claim.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(claim)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
          Claim Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedClaimDetails && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Item Information
              </Typography>
              <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Item Name:</strong> {selectedClaimDetails.item.itemName}
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {selectedClaimDetails.item.category}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {selectedClaimDetails.item.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(selectedClaimDetails.item.date).toLocaleDateString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Claimant Information
              </Typography>
              <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedClaimDetails.claimantName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedClaimDetails.claimantEmail}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Claim Details
              </Typography>
              <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Status:</strong> <Chip label={selectedClaimDetails.status} color={getStatusColor(selectedClaimDetails.status)} size="small" />
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Message:</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                  {selectedClaimDetails.claimMessage}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Submitted:</strong> {new Date(selectedClaimDetails.createdAt?.toDate?.() || selectedClaimDetails.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedClaim?.status === 'pending' && (
            <>
              <Button
                onClick={handleApproveClaim}
                color="success"
                variant="contained"
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                onClick={handleRejectClaim}
                color="error"
                variant="contained"
                disabled={actionLoading}
              >
                Reject
              </Button>
            </>
          )}
          {selectedClaim?.status === 'approved' && (
            <Button
              onClick={() => setResolveDialogOpen(true)}
              color="primary"
              variant="contained"
              disabled={actionLoading}
            >
              Mark Resolved
            </Button>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Claim</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Resolution Notes (optional)"
            placeholder="Add any notes about how this claim was resolved..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResolveClaim}
            color="primary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Resolving...' : 'Confirm Resolution'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminClaimsPage;
