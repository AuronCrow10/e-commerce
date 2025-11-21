import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Box,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TableFooter
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import CryptoModal from '../components/CryptoModal';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [models, setModels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  // Crypto modal
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.map(item => ({
      ...item,
      quantity: item.quantity ? item.quantity : 1
    }));
    setCartItems(updatedCart);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/models`)
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
    axios.get(`${process.env.REACT_APP_API_URL}/materials`)
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, []);

  const mergedCart = cartItems.map(item => {
    const model = models.find(m => m.id === item.modelId);
    const material = materials.find(mat => mat.id === item.materialId);
    let price = null;
    if (material && material.ModelItems) {
      const join = material.ModelItems.find(m => m.id === item.modelId);
      if (join && join.ModelMaterial) price = join.ModelMaterial.price;
    }
    return { ...item, model, material, price };
  });

  const handleQuantityChange = (index, newQty) => {
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleRemoveItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenCryptoModal = () => setIsCryptoModalOpen(true);
  const handleCloseCryptoModal = () => setIsCryptoModalOpen(false);

  const handleBillingChange = e =>
    setBillingInfo({ ...billingInfo, [e.target.name]: e.target.value });

  const handleConfirmCheckout = async () => {
    const products = mergedCart.map(item => ({
      name: `${item.model?.name || 'Model'} - ${item.material?.name || 'Material'}`,
      price: Number(item.price || 0),
      quantity: item.quantity
    }));
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/stripe/create-checkout-session`,
        { products, billingInfo: billingEnabled ? billingInfo : null }
      );
      window.location.href = res.data.url;
    } catch {
      handleCloseModal();
    }
  };

  const totalPrice = mergedCart
    .reduce((sum, p) => sum + (p.price * p.quantity || 0), 0)
    .toFixed(2);

  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Your Cart</Typography>
        {mergedCart.length === 0 ? (
          <Typography>Your cart is empty.</Typography>
        ) : (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mergedCart.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.model?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {item.material ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${item.material.iconImage}`}
                            alt={item.material.name}
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                          />
                          <Typography>{item.material.name}</Typography>
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{item.price ? `$${item.price}` : 'N/A'}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(i, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.price && item.quantity
                        ? `$${(item.price * item.quantity).toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveItem(i)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        p: 2
                      }}
                    >
                      <Typography variant="subtitle1">Total: ${totalPrice}</Typography>
                      <Typography variant="subtitle2">
                        Shipping: {totalPrice >= 100 ? 'FREE' : '$5.99'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        )}

        {mergedCart.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" onClick={handleOpenModal}>
              Proceed to Checkout
            </Button>
            <Button variant="contained" color="secondary" onClick={handleOpenCryptoModal}>
              Pay with Crypto
            </Button>
          </Box>
        )}
      </Container>

      {/* Stripe Checkout Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Confirm Checkout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure to continue?</Typography>
          <Checkbox
            checked={billingEnabled}
            onChange={e => setBillingEnabled(e.target.checked)}
          />Do you want invoice?
          {billingEnabled && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={billingInfo.name}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Address Line 1"
                name="addressLine1"
                value={billingInfo.addressLine1}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Address Line 2"
                name="addressLine2"
                value={billingInfo.addressLine2}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="City"
                name="city"
                value={billingInfo.city}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="State"
                name="state"
                value={billingInfo.state}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Postal Code"
                name="postalCode"
                value={billingInfo.postalCode}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Country"
                name="country"
                value={billingInfo.country}
                onChange={handleBillingChange}
                fullWidth
                margin="dense"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmCheckout}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* External Crypto Modal */}
      <CryptoModal
        isOpen={isCryptoModalOpen}
        onClose={handleCloseCryptoModal}
        mergedCart={mergedCart}
      />
    </div>
  );
};

export default CartPage;
