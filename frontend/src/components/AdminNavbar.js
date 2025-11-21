import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/admin/dashboard">Dashboard</Button>
          <Button color="inherit" component={Link} to="/admin/categories">Categories</Button>
          <Button color="inherit" component={Link} to="/admin/subcategories">Subcategories</Button>
          <Button color="inherit" component={Link} to="/admin/brands">Brands</Button>
          <Button color="inherit" component={Link} to="/admin/models">Models</Button>
          <Button color="inherit" component={Link} to="/admin/materials">Materials</Button>
          <Button color="inherit" component={Link} to="/admin/orders">Orders</Button>
        </Box>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
