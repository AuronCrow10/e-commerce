// FloatingCartIcon.js
import React, { useEffect, useState } from 'react';
import { Fab, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const FloatingCartIcon = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      // Sum up quantities if available, or count each item as one.
      const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(count);
    };

    updateCartCount();
    // Poll for cart updates every second.
    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  if (cartCount === 0) return null;

  return (
    <Fab
      color="primary"
      onClick={() => navigate('/cart')}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Badge badgeContent={cartCount} color="error" overlap="circular">
        <ShoppingCartIcon />
      </Badge>
    </Fab>
  );
};

export default FloatingCartIcon;
