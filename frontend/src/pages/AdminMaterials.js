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
  Checkbox,
  FormControlLabel,
  IconButton,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  // Material-level form data (no price here anymore)
  const [formData, setFormData] = useState({ name: '', description: '', isNew: false, highlighted: false });
  const [iconImage, setIconImage] = useState(null);

  // For linking models in creation mode, each link now includes a price field.
  const [modelLinks, setModelLinks] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);

  // For editing mode – remove material-level price and include price per link.
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    isNew: false,
    highlighted: false,
    iconImageUrl: ''
  });
  const [editIconImage, setEditIconImage] = useState(null);
  const [editModelLinks, setEditModelLinks] = useState([]);

  // Fetch available models for linking
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/models`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setAvailableModels(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchMaterials = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/materials`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ===== Creation Handlers =====
  const handleAddModelLink = () => {
    setModelLinks([...modelLinks, { modelId: '', price: '', modelImage: null }]);
  };

  const handleModelLinkChange = (index, field, value) => {
    const newLinks = [...modelLinks];
    newLinks[index][field] = value;
    setModelLinks(newLinks);
  };

  const handleRemoveModelLink = (index) => {
    const newLinks = [...modelLinks];
    newLinks.splice(index, 1);
    setModelLinks(newLinks);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('isNew', formData.isNew);
    data.append('highlighted', formData.highlighted);
    if (iconImage) data.append('iconImage', iconImage);
    data.append('modelLinks', JSON.stringify(
      modelLinks.map(link => ({
        modelId: link.modelId,
        price: link.price
      }))
    ));
    modelLinks.forEach(link => {
      if (link.modelImage) {
        data.append('modelLinkImages', link.modelImage);
      }
    });

    axios.post(`${process.env.REACT_APP_API_URL}/admin/materials`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setFormData({ name: '', description: '', isNew: false, highlighted: false });
        setIconImage(null);
        setModelLinks([]);
        fetchMaterials();
      })
      .catch(err => console.error(err));
  };

  // ===== Editing Handlers =====
  const handleEdit = (mat) => {
    setEditId(mat.id);
    setEditData({
      name: mat.name,
      description: mat.description || '',
      isNew: mat.isNew,
      highlighted: mat.highlighted,
      iconImageUrl: mat.iconImage
    });
    const links = (mat.ModelItems || []).map(item => ({
      modelId: item.id,
      price: item.ModelMaterial ? item.ModelMaterial.price : '',
      modelImage: item.ModelMaterial ? item.ModelMaterial.image : ''
    }));
    setEditModelLinks(links);
    setEditIconImage(null);
  };

  const handleRemoveEditModelLink = (index) => {
    const newLinks = [...editModelLinks];
    newLinks.splice(index, 1);
    setEditModelLinks(newLinks);
  };

  const handleAddEditModelLink = () => {
    setEditModelLinks([...editModelLinks, { modelId: '', price: '', modelImage: null }]);
  };

  const handleUpdate = (id) => {
    const data = new FormData();
    data.append('name', editData.name);
    data.append('description', editData.description);
    data.append('isNew', editData.isNew);
    data.append('highlighted', editData.highlighted);
    if (editIconImage) data.append('iconImage', editIconImage);

    // INCLUDE EXISTING FILENAME WHEN NO NEW UPLOAD
    data.append('modelLinks', JSON.stringify(
      editModelLinks.map(link => ({
        modelId: link.modelId,
        price: link.price,
        image: typeof link.modelImage === 'string' ? link.modelImage : null
      }))
    ));
    editModelLinks.forEach(link => {
      if (link.modelImage && typeof link.modelImage !== 'string') {
        data.append('modelLinkImages', link.modelImage);
      }
    });

    axios.put(`${process.env.REACT_APP_API_URL}/admin/materials/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        setEditId(null);
        setEditData({ name: '', description: '', isNew: false, highlighted: false, iconImageUrl: '' });
        setEditIconImage(null);
        setEditModelLinks([]);
        fetchMaterials();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/admin/materials/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => fetchMaterials())
      .catch(err => console.error(err));
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Manage Materials</Typography>

      {/* Create Material Form */}
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
        <TextField
          label="Material Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isNew}
              onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
            />
          }
          label="Is New"
          sx={{ ml: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.highlighted}
              onChange={e => setFormData({ ...formData, highlighted: e.target.checked })}
            />
          }
          label="Highlighted"
          sx={{ ml: 2 }}
        />
        <Button variant="contained" component="label" sx={{ ml: 2 }}>
          Upload Icon Image
          <input
            type="file"
            hidden
            onChange={e => {
              if (e.target.files.length > 0) {
                setIconImage(e.target.files[0]);
              }
            }}
          />
        </Button>
        {iconImage && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {iconImage.name}
          </Typography>
        )}
        <Typography variant="h6" sx={{ mt: 2 }}>Link Models</Typography>
        {modelLinks.map((link, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id={`model-link-label-${index}`}>Select Model</InputLabel>
              <Select
                labelId={`model-link-label-${index}`}
                value={link.modelId}
                onChange={e => handleModelLinkChange(index, 'modelId', e.target.value)}
                label="Select Model"
                required
              >
                {availableModels.map(model => (
                  <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Price"
              type="number"
              value={link.price}
              onChange={e => handleModelLinkChange(index, 'price', e.target.value)}
              required
              sx={{ ml: 2 }}
            />
            <Button variant="contained" component="label" sx={{ ml: 2 }}>
              {link.modelImage ? "Change" : "Upload"} Model Image
              <input
                type="file"
                hidden
                onChange={e => {
                  if (e.target.files.length > 0) {
                    handleModelLinkChange(index, 'modelImage', e.target.files[0]);
                  }
                }}
              />
            </Button>
            {link.modelImage && typeof link.modelImage !== 'string' && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                Selected file: {link.modelImage.name}
              </Typography>
            )}
            <Button variant="outlined" color="error" onClick={() => handleRemoveModelLink(index)} sx={{ ml: 2 }}>
              Remove
            </Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={handleAddModelLink} sx={{ mt: 2 }}>
          Add Model Link
        </Button>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained">Create Material</Button>
        </Box>
      </Box>

      {/* Edit Material Form */}
      {editId && (
        <Box component="form" sx={{ mb: 2, border: '1px solid #ccc', p: 2 }}>
          <Typography variant="h5" gutterBottom>Edit Material</Typography>
          <TextField
            label="Material Name"
            value={editData.name}
            onChange={e => setEditData({ ...editData, name: e.target.value })}
          />
          <TextField
            label="Description"
            value={editData.description}
            onChange={e => setEditData({ ...editData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Current Icon Image:</Typography>
            {editData.iconImageUrl ? (
              <Box
                component="img"
                src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${editData.iconImageUrl}`}
                sx={{ width: 100, height: 100, mt: 1 }}
              />
            ) : (
              <Typography variant="body2">No image</Typography>
            )}
          </Box>
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Upload New Icon Image
            <input
              type="file"
              hidden
              onChange={e => {
                if (e.target.files.length > 0) {
                  setEditIconImage(e.target.files[0]);
                }
              }}
            />
          </Button>
          {editIconImage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {editIconImage.name}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={editData.isNew}
                onChange={e => setEditData({ ...editData, isNew: e.target.checked })}
              />
            }
            label="Is New"
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editData.highlighted}
                onChange={e => setEditData({ ...editData, highlighted: e.target.checked })}
              />
            }
            label="Highlighted"
            sx={{ mt: 2, ml: 2 }}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Edit Model Links</Typography>
          {editModelLinks.map((link, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id={`edit-model-link-label-${index}`}>Select Model</InputLabel>
                <Select
                  labelId={`edit-model-link-label-${index}`}
                  value={link.modelId}
                  onChange={e => {
                    const newLinks = [...editModelLinks];
                    newLinks[index].modelId = e.target.value;
                    setEditModelLinks(newLinks);
                  }}
                  label="Select Model"
                  required
                >
                  {availableModels.map(model => (
                    <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Price"
                type="number"
                value={link.price}
                onChange={e => {
                  const newLinks = [...editModelLinks];
                  newLinks[index].price = e.target.value;
                  setEditModelLinks(newLinks);
                }}
                required
                sx={{ ml: 2 }}
              />
              <Button variant="contained" component="label" sx={{ ml: 2 }}>
                {link.modelImage && typeof link.modelImage !== 'string' ? "Change" : "Upload"} Model Image
                <input
                  type="file"
                  hidden
                  onChange={e => {
                    if (e.target.files.length > 0) {
                      const newLinks = [...editModelLinks];
                      newLinks[index].modelImage = e.target.files[0];
                      setEditModelLinks(newLinks);
                    }
                  }}
                />
              </Button>
              {link.modelImage && typeof link.modelImage === 'string' && (
                <Box
                  component="img"
                  src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${link.modelImage}`}
                  sx={{ width: 50, height: 50, ml: 2 }}
                />
              )}
              {link.modelImage && typeof link.modelImage !== 'string' && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Selected file: {link.modelImage.name}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  const newLinks = [...editModelLinks];
                  newLinks.splice(index, 1);
                  setEditModelLinks(newLinks);
                }}
                sx={{ ml: 2 }}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddEditModelLink} sx={{ mt: 2 }}>
            Add Model Link
          </Button>
          <Box sx={{ mt: 2 }}>
            <Button onClick={() => handleUpdate(editId)} variant="contained">Update</Button>
            <Button onClick={() => setEditId(null)} sx={{ ml: 2 }}>Cancel</Button>
          </Box>
        </Box>
      )}

      {/* List Materials */}
      <Paper sx={{ p: 2 }}>
        {materials.map(mat => (
          <Box
            key={mat.id}
            sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #ccc' }}
          >
            {editId === mat.id ? null : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{mat.name}</Typography>
                  {mat.iconImage && (
                    <Avatar
                      alt={mat.name}
                      src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${mat.iconImage}`}
                      sx={{ width: 60, height: 60, ml: 2 }}
                    />
                  )}
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={() => handleEdit(mat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(mat.id)}>
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

export default AdminMaterials;
