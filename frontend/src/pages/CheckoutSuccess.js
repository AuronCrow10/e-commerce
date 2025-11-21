import React from 'react';
import { Container, Typography } from '@mui/material';
import UserNavbar from '../components/UserNavbar';

const CheckoutSuccess = () => {
  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Thank you for your purchase!</Typography>
        <Typography>Your order has been placed successfully. A confirmation email has been sent to you.</Typography>
      </Container>
    </div>
  );
};

export default CheckoutSuccess;
