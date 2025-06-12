// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ActivateAccount from './pages/ActivateAccount';
import ProjectDashboard from './pages/ProjectDashboard';
import './App.css'; // Adjust the path as necessary
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

function NavBar({ navigate }) {
  const location = useLocation();
  const isLoggedIn = !!sessionStorage.getItem('admin_jwt');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };
  if (!isLoggedIn) return null;
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerOpen} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
          <LogoutIcon />
        </IconButton>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 220 }} role="presentation" onClick={handleDrawerClose}>
          <List>
            <ListItem button selected={location.pathname === '/dashboard'} onClick={() => handleNav('/dashboard')}>
              <ListItemText primary="Employees" />
            </ListItem>
            <ListItem button selected={location.pathname === '/projects'} onClick={() => handleNav('/projects')}>
              <ListItemText primary="Projects" />
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>
    </AppBar>
  );
}

function AppWithNav() {
  const navigate = useNavigate();
  return (
    <>
      <NavBar navigate={navigate} />
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/projects" element={<ProjectDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWithNav />
    </Router>
  );
}
