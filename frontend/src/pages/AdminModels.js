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
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AdminModels() {
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    brandId: '', 
    subcategoryId: '', 
    isNew: false, 
    highlighted: false 
  });
  const [modelImage, setModelImage] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  // For editing
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ 
    name: '', 
    brandId: '', 
    subcategoryId: '', 
    isNew: false, 
    highlighted: false 
  });
  const [editModelImage, setEditModelImage] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/brands`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setAvailableBrands(res.data);
        setFilteredBrands(res.data);
      })
      .catch(err => console.error(err));

    axios.get(`${process.env.REACT_APP_API_URL}/admin/subcategories`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setAvailableSubcategories(res.data);
        setFilteredSubcategories(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const fetchModels = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/models`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Dynamic filtering: when a brand is selected, filter subcategories to only those associated with that brand.
  useEffect(() => {
    if (formData.brandId) {
      const selectedBrand = availableBrands.find(b => b.id === formData.brandId);
      if (selectedBrand && selectedBrand.Subcategories) {
        setFilteredSubcategories(selectedBrand.Subcategories);
      } else {
        setFilteredSubcategories(availableSubcategories);
      }
    } else {
      setFilteredSubcategories(availableSubcategories);
    }
  }, [formData.brandId, availableBrands, availableSubcategories]);

  // Dynamic filtering: when a subcategory is selected, filter brands to only those associated with that subcategory.
  useEffect(() => {
    if (formData.subcategoryId) {
      const filtered = availableBrands.filter(b =>
        b.Subcategories && b.Subcategories.some(s => s.id === formData.subcategoryId)
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(availableBrands);
    }
  }, [formData.subcategoryId, availableBrands]);

  const handleCreate = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('brandId', formData.brandId);
    data.append('subcategoryId', formData.subcategoryId);
    data.append('isNew', formData.isNew);
    data.append('highlighted', formData.highlighted);
    if (modelImage) data.append('image', modelImage);

    axios.post(`${process.env.REACT_APP_API_URL}/admin/models`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setFormData({ 
          name: '', 
          brandId: '', 
          subcategoryId: '', 
          isNew: false, 
          highlighted: false 
        });
        setModelImage(null);
        fetchModels();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/admin/models/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => fetchModels())
      .catch(err => console.error(err));
  };

  const handleEdit = (model) => {
    setEditId(model.id);
    setEditData({
      name: model.name,
      brandId: model.brandId,
      subcategoryId: model.subcategoryId,
      isNew: model.isNew,
      highlighted: model.highlighted
    });
  };

  const handleUpdate = (id) => {
    const data = new FormData();
    data.append('name', editData.name);
    data.append('brandId', editData.brandId);
    data.append('subcategoryId', editData.subcategoryId);
    data.append('isNew', editData.isNew);
    data.append('highlighted', editData.highlighted);
    if (editModelImage) data.append('image', editModelImage);

    axios.put(`${process.env.REACT_APP_API_URL}/admin/models/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setEditId(null);
        setEditData({ 
          name: '', 
          brandId: '', 
          subcategoryId: '', 
          isNew: false, 
          highlighted: false 
        });
        setEditModelImage(null);
        fetchModels();
      })
      .catch(err => console.error(err));
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Manage Models</Typography>
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Model Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="brand-label">Select Brand</InputLabel>
          <Select
            labelId="brand-label"
            value={formData.brandId}
            onChange={e => setFormData({ ...formData, brandId: e.target.value })}
            label="Select Brand"
          >
            {filteredBrands.map(brand => (
              <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="subcategory-label">Select Subcategory</InputLabel>
          <Select
            labelId="subcategory-label"
            value={formData.subcategoryId}
            onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
            label="Select Subcategory"
          >
            {filteredSubcategories.map(sub => (
              <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Checkboxes for isNew and highlighted */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isNew}
              onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
            />
          }
          label="Is New"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.highlighted}
              onChange={e => setFormData({ ...formData, highlighted: e.target.checked })}
            />
          }
          label="Highlighted"
        />
        <Button variant="contained" component="label">
          Upload Model Image
          <input
            type="file"
            hidden
            onChange={e => {
              if (e.target.files.length > 0) {
                setModelImage(e.target.files[0]);
              }
            }}
          />
        </Button>
        {modelImage && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {modelImage.name}
          </Typography>
        )}
        <Button type="submit" variant="contained">Create Model</Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        {models.map(model => (
          <Box
            key={model.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderBottom: '1px solid #ccc'
            }}
          >
            {editId === model.id ? (
              <>
                <TextField
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                />
                <FormControl sx={{ ml: 2, minWidth: 200 }}>
                  <InputLabel id="edit-brand-label">Select Brand</InputLabel>
                  <Select
                    labelId="edit-brand-label"
                    value={editData.brandId}
                    onChange={e => setEditData({ ...editData, brandId: e.target.value })}
                    label="Select Brand"
                  >
                    {filteredBrands.map(brand => (
                      <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ ml: 2, minWidth: 200 }}>
                  <InputLabel id="edit-subcategory-label">Select Subcategory</InputLabel>
                  <Select
                    labelId="edit-subcategory-label"
                    value={editData.subcategoryId}
                    onChange={e => setEditData({ ...editData, subcategoryId: e.target.value })}
                    label="Select Subcategory"
                  >
                    {filteredSubcategories.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Checkboxes for isNew and highlighted in edit mode */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editData.isNew}
                      onChange={e => setEditData({ ...editData, isNew: e.target.checked })}
                    />
                  }
                  label="Is New"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editData.highlighted}
                      onChange={e => setEditData({ ...editData, highlighted: e.target.checked })}
                    />
                  }
                  label="Highlighted"
                />
                <Button variant="contained" component="label" sx={{ ml: 2 }}>
                  Upload New Image
                  <input
                    type="file"
                    hidden
                    onChange={e => {
                      if (e.target.files.length > 0) {
                        setEditModelImage(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                {editModelImage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {editModelImage.name}
                  </Typography>
                )}
                <Button onClick={() => handleUpdate(model.id)} variant="contained" sx={{ ml: 2 }}>
                  Update
                </Button>
                <Button onClick={() => setEditId(null)} sx={{ ml: 1 }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{model.name}</Typography>
                  {model.image && (
                    <Box
                      component="img"
                      src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${model.image}`}
                      sx={{ width: 50, height: 50, ml: 2 }}
                    />
                  )}
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={() => handleEdit(model)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(model.id)}>
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

export default AdminModels;
