import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Button } from '@mui/material';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import { useParams, Link } from 'react-router-dom';

const BrandsPage = () => {
  const { subId } = useParams();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/brands`)
      .then(res => {
        // Filter brands that include the selected subcategory
        const filtered = res.data.filter(brand => 
          brand.Subcategories && brand.Subcategories.some(sub => sub.id.toString() === subId)
        );
        setBrands(filtered);
      })
      .catch(err => console.error(err));
  }, [subId]);

  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
  <Typography variant="h4" gutterBottom>Brands</Typography>
  <Grid
    container
    spacing={2}
    alignItems="stretch"            // 1) make items stretch
  >
    {brands.map((brand) => (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        key={brand.id}
        sx={{ display: 'flex' }}     // 1b) allow the Paper to stretch
      >
        <Paper
          sx={{
            p: 2,
            textAlign: 'center',
            height: '100%',           // 2) full height
            display: 'flex',          // 2b) flex column
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6">{brand.name}</Typography>

          {brand.image && (
            <Box
              sx={{
                mt: 2,
                flexGrow: 1,           // 3) fill remaining space
                display: 'flex',
                alignItems: 'center',  // center the img vertically
                justifyContent: 'center',
              }}
            >
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${brand.image}`}
                alt={brand.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',    // don’t overflow
                  objectFit: 'contain', // preserve aspect ratio
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            sx={{ mt: 2 }}            // add top margin to push away from image
            component={Link}
            to={`/models/${brand.id}/${subId}`}
          >
            View Models
          </Button>
        </Paper>
      </Grid>
    ))}
  </Grid>
</Container>
    </div>
  );
};

export default BrandsPage;
