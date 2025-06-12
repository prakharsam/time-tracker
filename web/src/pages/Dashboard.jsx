// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import {
  Container, Typography, Box, Button, TextField, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, email: null });
  const navigate = useNavigate();

  const fetchEmployees = () => {
    setLoading(true);
    setError('');
    apiFetch("/employees")
      .then(data => setEmployees(data))
      .catch(err => {
        setError(err.detail || 'Failed to load employees');
        if (err.detail && err.detail.toLowerCase().includes('unauthorized')) {
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [navigate]);

  const handleInvite = async () => {
    if (!email.trim() || !name.trim()) {
      setSnackbar({ open: true, message: 'Please enter both name and email.', severity: 'error' });
      return;
    }
    try {
      await apiFetch("/invite", {
        method: "POST",
        body: { email, name },
      });
      setSnackbar({ open: true, message: 'Invite sent successfully!', severity: 'success' });
      setEmail('');
      setName('');
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: (typeof err === 'object' ? err.detail || JSON.stringify(err) : err), severity: 'error' });
    }
  };

  const handleDelete = async (email) => {
    setDeleteDialog({ open: true, email });
  };

  const handleReactivate = async (email) => {
    try {
      await apiFetch(`/employee/${email}/activate`, { method: 'POST' });
      setSnackbar({ open: true, message: 'Employee reactivated.', severity: 'success' });
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: (typeof err === 'object' ? err.detail || JSON.stringify(err) : err), severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/employee/${deleteDialog.email}`, { method: 'DELETE' });
      setSnackbar({ open: true, message: 'Employee deactivated.', severity: 'success' });
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: (typeof err === 'object' ? err.detail || JSON.stringify(err) : err), severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, email: null });
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Employee Dashboard</Typography>
      </Box>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Invite New Employee</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            label="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Employee Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleInvite}
            startIcon={<PersonAddIcon />}
            sx={{
              borderRadius: 2,
              minWidth: '120px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Send Invite
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">All Employees</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : employees.length === 0 ? (
          <Typography>No employees found.</Typography>
        ) : (
          <List>
            {employees.map(emp => (
              <ListItem key={emp.email} sx={{ border: '1px solid #eee', borderRadius: 2, mb: 1 }}>
                <ListItemText
                  primary={<>
                    <strong>{emp.name}</strong> ({emp.email})
                  </>}
                  secondary={`Status: ${emp.is_active ? '✅ Active' : '❌ Inactive'}`}
                />
                <ListItemSecondaryAction>
                  {emp.is_active ? (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(emp.email)}>
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <IconButton edge="end" aria-label="reactivate" color="success" onClick={() => handleReactivate(emp.email)}>
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, email: null })}>
        <DialogTitle>Deactivate Employee</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate this employee?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, email: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
