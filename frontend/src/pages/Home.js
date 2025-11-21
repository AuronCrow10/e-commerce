import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import { Link } from 'react-router-dom';

const Home = () => {
  const [models, setModels] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/models`)
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome to Our E-Commerce Platform
        </Typography>
        <Grid container spacing={2}>
          {models.map(model => (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{model.name}</Typography>
                <Box sx={{ mt: 2 }}>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${model.image}`}
                    alt={model.name}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <Link to={`/product/${model.id}`} style={{ textDecoration: 'none' }}>
                    View Product
                  </Link>
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default Home;
