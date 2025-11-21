import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none' }}>
        <li><Link to="/">Home</Link></li>
        {categories.map(cat => (
          <li key={cat.id} style={{ margin: '0 10px', position: 'relative' }}>
            {cat.name}
            {/* Dropdown for subcategories can be added here */}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
