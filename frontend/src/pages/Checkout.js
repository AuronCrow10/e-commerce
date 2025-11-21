import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  const handleCheckout = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/stripe/create-checkout-session`, { products: cart });
      // Redirect using the session URL returned by your backend.
      window.location.href = res.data.url;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Checkout</Typography>
        {cart.length === 0 ? (
          <Typography>Your cart is empty.</Typography>
        ) : (
          <Paper sx={{ p: 2 }}>
            <List>
              {cart.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`Model: ${item.modelId}, Material: ${item.materialId}`} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleCheckout}>
                Proceed to Payment
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </div>
  );
};

export default Checkout;
