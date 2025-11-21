import React from 'react';
import AdminNavbar from './AdminNavbar';
import { Container } from '@mui/material';

const AdminLayout = ({ children }) => {
  return (
    <>
      <AdminNavbar />
      <Container sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default AdminLayout;
