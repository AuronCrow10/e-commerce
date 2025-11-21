import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import BrandsPage from './pages/BrandsPage'; // NEW: Brands page
import ModelsPage from './pages/ModelsPage';   // Models page now shows models for a given brand
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import CartPage from './pages/CartPage';

import FloatingCartIcon from './components/FloatingCartIcon';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminSubcategories from './pages/AdminSubcategories';
import AdminBrands from './pages/AdminBrands';
import AdminModels from './pages/AdminModels';
import AdminMaterials from './pages/AdminMaterials';
import AdminOrders from './pages/AdminOrders';

function App() {
  return (
    <><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/brands/:subId" element={<BrandsPage />} />
      <Route path="/models/:brandId/:subId" element={<ModelsPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route path="/checkout-cancel" element={<CheckoutCancel />} />
      <Route path="/cart" element={<CartPage />} />

      {/* Admin Routes */}
      <Route path={"/admin"} element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/subcategories" element={<AdminSubcategories />} />
      <Route path="/admin/brands" element={<AdminBrands />} />
      <Route path="/admin/models" element={<AdminModels />} />
      <Route path="/admin/materials" element={<AdminMaterials />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
    </Routes>
    <FloatingCartIcon />
    </>
  );
}

export default App;
