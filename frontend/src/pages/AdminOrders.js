import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox, Select, MenuItem
} from '@mui/material';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedOrderForConfirm, setSelectedOrderForConfirm] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

  const fetchOrders = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/orders`, {
      headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Compute total items count and total amount from the products array
  const computeItemsCount = (order) => {
    if (!order.products || !Array.isArray(order.products)) return 0;
    return order.products.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const computeTotalAmount = (order) => {
    if (!order.products || !Array.isArray(order.products)) return 0;
    return order.products.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 0)), 0);
  };

  const markProcessed = (orderId) => {
    axios.put(`${process.env.REACT_APP_API_URL}/admin/orders/${orderId}`, {orderStatus: 'Processed'}, {
      headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
    })
      .then(() => {
        fetchOrders();
        setOpenConfirm(false);
        setSelectedOrderForConfirm(null);
      })
      .catch(err => console.error(err));
  };

  // Open details modal for the selected order
  const handleViewDetails = (order) => {
    setSelectedOrderForDetails(order);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedOrderForDetails(null);
  };

  // Open confirmation modal before marking order as processed
  const handleOpenConfirm = (order) => {
    setSelectedOrderForConfirm(order);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedOrderForConfirm(null);
  };

  const handleCheckboxChange = (orderId) => {
    setSelectedOrderIds((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter(id => id !== orderId)
        : [...prevSelected, orderId]
    );
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedOrderIds(orders.map(order => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleFilterChange = (event) => {
    setFilterPaymentStatus(event.target.value);
  };

  console.log(orders)

  const exportToCSV = () => {
    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));

    const flattenOrder = (order) => {
      const address = order.shippingInfo?.address || {};
      const shippingInfo = order.shippingInfo || {};

      return {
        id: order.id,
        orderIdentifier: order.orderIdentifier,
        products: order.products.map(p => `${p.name} (x${p.quantity} @ $${p.price})`).join(' | '),
        paymentStatus: order.paymentStatus,
        paymentIntent: order.paymentIntent,
        orderStatus: order.orderStatus,
        shippingName: shippingInfo.name,
        shippingPhone: shippingInfo.phone,
        shippingCarrier: shippingInfo.carrier,
        shippingTracking: shippingInfo.tracking_number,
        shippingCity: address.city,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingState: address.state,
        shippingCountry: address.country,
        shippingPostalCode: address.postal_code,
        billingInfo: JSON.stringify(order.billingInfo), // se è null o oggetto, lo serializza
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    };

    const flatOrders = selectedOrders.map(flattenOrder);

    const headers = Object.keys(flatOrders[0]);
    const csvContent = [
      headers.join(','),
      ...flatOrders.map(order => headers.map(h => `"${(order[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'selected_orders.csv';
    link.click();
  };

  const refundTransactions = () => {
    if (selectedOrderIds.length === 0) return;

    axios.post(`${process.env.REACT_APP_API_URL}/stripe/refund`, { transactionIds: selectedOrderIds }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        alert('Refund processed successfully!');
        fetchOrders();
        setSelectedOrderIds([]);
      })
      .catch(err => console.error('Error processing refund:', err));
  };

  const filteredOrders = filterPaymentStatus
    ? orders.filter(order => order.paymentStatus === filterPaymentStatus)
    : orders;

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Manage Orders</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Filter by Payment Status</Typography>
        <Select
          value={filterPaymentStatus}
          onChange={handleFilterChange}
          displayEmpty
          sx={{ minWidth: '200px', mt: 1 }}
          variant={"outlined"}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </Select>
      </Box>
      <Paper sx={{p: 2, mb: 2}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedOrderIds.length === orders.length && orders.length > 0}
                  indeterminate={selectedOrderIds.length > 0 && selectedOrderIds.length < orders.length}
                  onChange={handleSelectAllChange}
                />
              </TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Items Count</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={() => handleCheckboxChange(order.id)}
                  />
                </TableCell>
                <TableCell>{order.orderIdentifier}</TableCell>
                <TableCell>{computeItemsCount(order)}</TableCell>
                <TableCell>${computeTotalAmount(order).toFixed(2)}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleViewDetails(order)}
                    sx={{mr: 1}}
                  >
                    View Details
                  </Button>
                  {order.orderStatus !== 'Processed' && (
                    <Button
                      variant="contained"
                      onClick={() => handleOpenConfirm(order)}
                    >
                      Mark as Processed
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{mt: 2}}>
          <Button
            variant="contained"
            onClick={exportToCSV}
            disabled={selectedOrderIds.length === 0}
          >
            Export Selected to CSV
          </Button>

          <Button
            sx={{ml: 2}}
            variant="contained"
            color="secondary"
            onClick={refundTransactions}
            disabled={selectedOrderIds.length === 0}
          >
            Refund Transactions
          </Button>
        </Box>
      </Paper>

      {/* Order Details Modal */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForDetails && (
            <Box>
              <Typography variant="subtitle1">
                <strong>Order ID:</strong> {selectedOrderForDetails.orderIdentifier}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Payment Status:</strong> {selectedOrderForDetails.paymentStatus}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Order Status:</strong> {selectedOrderForDetails.orderStatus}
              </Typography>
              <Box sx={{mt: 2}}>
                <Typography variant="h6">Products</Typography>
                <List>
                  {selectedOrderForDetails.products && selectedOrderForDetails.products.map((product, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={product.name}
                        secondary={`Price: $${product.price} x Quantity: ${product.quantity}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              {selectedOrderForDetails.shippingInfo && (
                <Box sx={{mt: 2}}>
                  <Typography variant="h6">Shipping Information</Typography>
                  <Typography variant="body2">
                    {selectedOrderForDetails.shippingInfo.name} <br/>
                    {selectedOrderForDetails.shippingInfo.address.line1}, {selectedOrderForDetails.shippingInfo.address.city}, {selectedOrderForDetails.shippingInfo.address.postal_code}, {selectedOrderForDetails.shippingInfo.address.country}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal for Mark as Processed */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Processing</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to mark this order as Processed? This confirms that the products have been
            shipped/delivered.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => markProcessed(selectedOrderForConfirm.id)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminOrders;
