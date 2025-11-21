import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserNavbar = () => {
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setCurrentCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCategory(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          E-Commerce
        </Typography>
        {categories.map(cat => (
          <Box key={cat.id}>
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, cat)}>
              {cat.name}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && currentCategory && currentCategory.id === cat.id}
              onClose={handleMenuClose}
            >
              {cat.Subcategories && cat.Subcategories.map(sub => (
                <MenuItem
                  key={sub.id}
                  component={Link}
                  to={`/brands/${sub.id}`}  // NEW: Navigate to Brands page instead of Models page
                  onClick={handleMenuClose}
                >
                  {sub.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default UserNavbar;
