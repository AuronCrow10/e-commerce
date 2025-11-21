import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ model }) {
  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
      <h3>{model.name}</h3>
      <Link to={`/product/${model.id}`}>View Details</Link>
    </div>
  );
}

export default ProductCard;
