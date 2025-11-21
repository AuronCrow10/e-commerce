import React from 'react';
import { Container, Typography } from '@mui/material';
import UserNavbar from '../components/UserNavbar';

const CheckoutCancel = () => {
  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Payment Cancelled</Typography>
        <Typography>Your payment was cancelled. Please try again.</Typography>
      </Container>
    </div>
  );
};

export default CheckoutCancel;
