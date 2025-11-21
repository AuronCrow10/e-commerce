import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  ListItemText,
  Checkbox,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [brandImage, setBrandImage] = useState(null);

  // For editing
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSelectedSubcategories, setEditSelectedSubcategories] = useState([]);
  const [editBrandImage, setEditBrandImage] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/subcategories`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setAvailableSubcategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchBrands = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/brands`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setBrands(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', name);
    data.append('subcategories', JSON.stringify(selectedSubcategories));
    if (brandImage) data.append('image', brandImage);

    axios.post(`${process.env.REACT_APP_API_URL}/admin/brands`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setName('');
        setSelectedSubcategories([]);
        setBrandImage(null);
        fetchBrands();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/admin/brands/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => fetchBrands())
      .catch(err => console.error(err));
  };

  const handleEdit = (brand) => {
    setEditId(brand.id);
    setEditName(brand.name);
    setEditSelectedSubcategories(brand.subcategories || []);
  };

  const handleUpdate = (id) => {
    const data = new FormData();
    data.append('name', editName);
    data.append('subcategories', JSON.stringify(editSelectedSubcategories));
    if (editBrandImage) data.append('image', editBrandImage);

    axios.put(`${process.env.REACT_APP_API_URL}/admin/brands/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setEditId(null);
        setEditName('');
        setEditSelectedSubcategories([]);
        setEditBrandImage(null);
        fetchBrands();
      })
      .catch(err => console.error(err));
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Manage Brands</Typography>
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Brand Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="subcategories-label">Select Subcategories</InputLabel>
          <Select
            labelId="subcategories-label"
            multiple
            value={selectedSubcategories}
            onChange={e => setSelectedSubcategories(e.target.value)}
            input={<OutlinedInput label="Select Subcategories" />}
            renderValue={(selected) =>
              selected.map(id => {
                const sub = availableSubcategories.find(s => s.id === id);
                return sub ? sub.name : '';
              }).join(', ')
            }
            MenuProps={MenuProps}
          >
            {availableSubcategories.map(sub => (
              <MenuItem key={sub.id} value={sub.id}>
                <Checkbox checked={selectedSubcategories.indexOf(sub.id) > -1} />
                <ListItemText primary={sub.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" component="label">
          Upload Brand Image
          <input
            type="file"
            hidden
            onChange={e => {
              if (e.target.files.length > 0) {
                setBrandImage(e.target.files[0]);
              }
            }}
          />
        </Button>
        {brandImage && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {brandImage.name}
          </Typography>
        )}
        <Button type="submit" variant="contained">Create Brand</Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        {brands.map(brand => (
          <Box
            key={brand.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderBottom: '1px solid #ccc'
            }}
          >
            {editId === brand.id ? (
              <>
                <TextField
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <FormControl sx={{ ml: 2, minWidth: 200 }}>
                  <InputLabel id="edit-subcategories-label">Select Subcategories</InputLabel>
                  <Select
                    labelId="edit-subcategories-label"
                    multiple
                    value={editSelectedSubcategories}
                    onChange={e => setEditSelectedSubcategories(e.target.value)}
                    input={<OutlinedInput label="Select Subcategories" />}
                    renderValue={(selected) =>
                      selected.map(id => {
                        const sub = availableSubcategories.find(s => s.id === id);
                        return sub ? sub.name : '';
                      }).join(', ')
                    }
                    MenuProps={MenuProps}
                  >
                    {availableSubcategories.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>
                        <Checkbox checked={editSelectedSubcategories.indexOf(sub.id) > -1} />
                        <ListItemText primary={sub.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" component="label" sx={{ ml: 2 }}>
                  Upload New Image
                  <input
                    type="file"
                    hidden
                    onChange={e => {
                      if (e.target.files.length > 0) {
                        setEditBrandImage(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                {editBrandImage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {editBrandImage.name}
                  </Typography>
                )}
                <Button onClick={() => handleUpdate(brand.id)} variant="contained" sx={{ ml: 2 }}>
                  Update
                </Button>
                <Button onClick={() => setEditId(null)} sx={{ ml: 1 }}>Cancel</Button>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{brand.name}</Typography>
                  {brand.image && (
                    <Box
                      component="img"
                      src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${brand.image}`}
                      sx={{ width: 50, height: 50, ml: 2 }}
                    />
                  )}
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={() => handleEdit(brand)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(brand.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        ))}
      </Paper>
    </AdminLayout>
  );
}

export default AdminBrands;
