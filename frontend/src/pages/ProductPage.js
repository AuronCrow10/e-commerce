import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, Avatar, TextField } from '@mui/material';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const {id} = useParams();
  const [model, setModel] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Fetch the model details
    axios.get(`${process.env.REACT_APP_API_URL}/models/${id}`)
      .then(res => setModel(res.data))
      .catch(err => console.error(err));
    // Fetch all materials (which include associated ModelItems with join data)
    axios.get(`${process.env.REACT_APP_API_URL}/materials`)
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, [id]);

  console.log(materials);

  // Filter materials to only those that are linked to this model.
  const availableMaterials = model
    ? materials.filter(mat => mat.ModelItems && mat.ModelItems.some(m => m.id === model.id))
    : [];

  // When a material is selected, update the state.
  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
  };

  const handleAddToCart = () => {
    if (!selectedMaterial) {
      alert('Please select a material first.');
      return;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({modelId: model.id, materialId: selectedMaterial.id, quantity: quantity});
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  // Get the price for the selected material based on the join table data.
  let price = null;
  let mainImage = model ? model.image : 'default-model.png';
  if (selectedMaterial && model) {
    const relation = selectedMaterial.ModelItems.find(m => m.id === model.id);
    if (relation && relation.ModelMaterial) {
      price = relation.ModelMaterial.price;
      // If the relation has its own image, use that for the main image.
      if (relation.ModelMaterial.image) {
        mainImage = relation.ModelMaterial.image;
      }
    }
  }

  return (
    <div>
      <UserNavbar/>
      <Container sx={{mt: 4}}>
        {model ? (
          <Grid container spacing={2}>
            {/* Left side: Model image (or relation image if selected) and name */}
            <Grid item xs={12} md={6}>
              <Paper sx={{p: 2}}>
                <Typography variant="h5" gutterBottom>{model.name}</Typography>
                <Box sx={{mt: 2}}>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${mainImage}`}
                    alt={model.name}
                    style={{width: '100%', height: 'auto'}}
                  />
                </Box>
              </Paper>
            </Grid>
            {/* Right side: Materials list, dynamic price and buttons */}
            <Grid item xs={12} md={6}>
              <Paper sx={{p: 2}}>
                <Typography variant="h6">Available Materials</Typography>
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2}}>
                  {availableMaterials.map(material => (
                    <Box
                      key={material.id}
                      onClick={() => handleMaterialSelect(material)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedMaterial?.id === material.id ? '2px solid blue' : 'none',
                        borderRadius: '50%',
                        padding: '2px'
                      }}
                    >
                      <Avatar
                        src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${material.iconImage}`}
                        alt={material.name}
                        sx={{width: 64, height: 64}}
                      />
                    </Box>
                  ))}
                </Box>
                {selectedMaterial && (
                  <Box sx={{mt: 4}}>
                {/* Material description */}
               {selectedMaterial.description && (
               <Typography variant="body1" sx={{ mt: 2 }}>
                 {selectedMaterial.description}
               </Typography>
                )}
                    <Typography variant="h6">
                      Price: {price ? `$${price}` : 'N/A'}
                      <br/>
                      Shipping: {price * quantity >= 100 ? 'Free' : '$5.99'}
                    </Typography>
                    <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                     <Typography>Quantity:</Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 1 }}
                        value={quantity}
                        onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </Box>
                    {/* Total = (unit price × qty) + shipping */}
                    <Box sx={{mt: 1}}>
                      <Typography variant="subtitle1">
                        Total:{' '}
                        {price
                          ? `$${(
                              price * quantity +
                              (price * quantity >= 100 ? 0 : 5.99)
                            ).toFixed(2)}`
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{display: 'flex', gap: 2, mt: 2}}>
                      <Button variant="contained" onClick={handleAddToCart}>
                        Add to Cart
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Container>
    </div>
  );
};

export default ProductPage;
