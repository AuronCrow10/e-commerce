import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';

// Chart.js registration
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByCategory, setRevenueByCategory] = useState({});
  const [salesTrends, setSalesTrends] = useState({ labels: [], data: [] });
  const [trendingProducts, setTrendingProducts] = useState([]); // { name, quantity }
  const [salesByCountry, setSalesByCountry] = useState({});

  // Fetch orders from backend
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      // Total Sales: number of orders
      setTotalSales(orders.length);

      // Compute Total Revenue and aggregate product data
      let revenue = 0;
      const categoryRevenue = {}; // e.g., { 'Skins & Wraps': 8000, ... }
      const productFrequency = {}; // for trending products: { productName: totalQuantity }
      const ordersByMonth = {}; // for sales trends

      orders.forEach(order => {
        // Aggregate orders by month based on creation date
        const orderDate = new Date(order.createdAt);
        // Format as "MMM YYYY" (e.g., "Mar 2025")
        const month = orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;

        // Process each product in the order
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            const pPrice = Number(product.price) || 0;
            const pQuantity = Number(product.quantity) || 0;
            revenue += pPrice * pQuantity;

            // Trending products count
            const name = product.name;
            productFrequency[name] = (productFrequency[name] || 0) + pQuantity;

            // Revenue by category:
            // If product name is in format "Category - ProductName", extract the category part.
            const parts = product.name.split(' - ');
            const category = parts[0] ? parts[0] : 'Other';
            categoryRevenue[category] = (categoryRevenue[category] || 0) + pPrice * pQuantity;
          });
        }
      });

      setTotalRevenue(revenue);

      // Sales Trends: sort months (assuming they are in a consistent format)
      const trendLabels = Object.keys(ordersByMonth).sort((a, b) => new Date(a) - new Date(b));
      const trendData = trendLabels.map(label => ordersByMonth[label]);
      setSalesTrends({ labels: trendLabels, data: trendData });

      // Revenue by Category:
      setRevenueByCategory(categoryRevenue);

      // Trending Products: sort by quantity and take top 5
      const trending = Object.entries(productFrequency)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTrendingProducts(trending);

      // country sales
      const countrySales = {};
      orders.forEach(order => {
        if (order.shippingInfo && order.shippingInfo.address) {
          const country = order.shippingInfo.address.country;
          if (country && order.products && Array.isArray(order.products)) {
            order.products.forEach(product => {
              const revenue = Number(product.price) * Number(product.quantity);
              countrySales[country] = (countrySales[country] || 0) + revenue;
            });
          }
        }
      });

      setSalesByCountry(countrySales);
    }
  }, [orders]);

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={2}>
        {/* Sales Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Sales: {totalSales}</Typography>
            <Typography variant="h6">Total Revenue: ${totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        {/* Revenue by Category Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue by Category</Typography>
            <Bar data={{
              labels: Object.keys(revenueByCategory),
              datasets: [{
                label: 'Revenue',
                data: Object.values(revenueByCategory),
                backgroundColor: 'rgba(75,192,192,0.6)'
              }]
            }} />
          </Paper>
        </Grid>
        {/* Sales Trends Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sales Trends (Orders per Month)</Typography>
            <Line data={{
              labels: salesTrends.labels,
              datasets: [{
                label: 'Orders',
                data: salesTrends.data,
                fill: false,
                borderColor: '#742774'
              }]
            }} />
          </Paper>
        </Grid>
        {/* Trending Products Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Trending Products (Top 5)</Typography>
            <Bar data={{
              labels: trendingProducts.map(p => p.name),
              datasets: [{
                label: 'Quantity Sold',
                data: trendingProducts.map(p => p.quantity),
                backgroundColor: 'rgba(153,102,255,0.6)'
              }]
            }} />
          </Paper>
        </Grid>
        {/* Sales by Country Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sales by Country</Typography>
            <Bar data={{
              labels: Object.keys(salesByCountry),
              datasets: [{
                label: 'Revenue',
                data: Object.values(salesByCountry),
                backgroundColor: 'rgba(54,162,235,0.6)'
              }]
            }} />
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}

export default AdminDashboard;
