import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent:'center', alignItems:'center', height: '100vh' }}>
      <Paper sx={{ p: 4, width: '300px' }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField 
            label="Username" 
            fullWidth 
            margin="normal" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <TextField 
            label="Password" 
            type="password" 
            fullWidth 
            margin="normal" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AdminLogin;
