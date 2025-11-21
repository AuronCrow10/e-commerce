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

function AdminSubcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // For editing
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSelectedCategories, setEditSelectedCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => setAvailableCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchSubcategories = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/subcategories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => setSubcategories(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/admin/subcategories`,
        { name, categories: selectedCategories },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        setName('');
        setSelectedCategories([]);
        fetchSubcategories();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/admin/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(() => fetchSubcategories())
      .catch((err) => console.error(err));
  };

  const handleEdit = (sub) => {
    setEditId(sub.id);
    setEditName(sub.name);
    setEditSelectedCategories(sub.categories || []);
  };

  const handleUpdate = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/admin/subcategories/${id}`,
        { name: editName, categories: editSelectedCategories },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        setEditId(null);
        setEditName('');
        setEditSelectedCategories([]);
        fetchSubcategories();
      })
      .catch((err) => console.error(err));
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Manage Subcategories
      </Typography>
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
        <TextField
          label="Subcategory Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormControl sx={{ ml: 2, minWidth: 200 }}>
          <InputLabel id="categories-label">Select Categories</InputLabel>
          <Select
            labelId="categories-label"
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value)}
            input={<OutlinedInput label="Select Categories" />}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const cat = availableCategories.find((c) => c.id === id);
                  return cat ? cat.name : '';
                })
                .join(', ')
            }
            MenuProps={MenuProps}
          >
            {availableCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Checkbox checked={selectedCategories.indexOf(cat.id) > -1} />
                <ListItemText primary={cat.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" sx={{ ml: 2 }}>
          Create Subcategory
        </Button>
      </Box>
      <Paper>
        {subcategories.map((sub) => (
          <Box
            key={sub.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderBottom: '1px solid #ccc'
            }}
          >
            {editId === sub.id ? (
              <>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <FormControl sx={{ ml: 2, minWidth: 200 }}>
                  <InputLabel id="edit-categories-label">Select Categories</InputLabel>
                  <Select
                    labelId="edit-categories-label"
                    multiple
                    value={editSelectedCategories}
                    onChange={(e) =>
                      setEditSelectedCategories(e.target.value)
                    }
                    input={<OutlinedInput label="Select Categories" />}
                    renderValue={(selected) =>
                      selected
                        .map((id) => {
                          const cat = availableCategories.find(
                            (c) => c.id === id
                          );
                          return cat ? cat.name : '';
                        })
                        .join(', ')
                    }
                    MenuProps={MenuProps}
                  >
                    {availableCategories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <Checkbox
                          checked={
                            editSelectedCategories.indexOf(cat.id) > -1
                          }
                        />
                        <ListItemText primary={cat.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={() => handleUpdate(sub.id)}
                  variant="contained"
                  sx={{ ml: 2 }}
                >
                  Update
                </Button>
                <Button onClick={() => setEditId(null)} sx={{ ml: 1 }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ flexGrow: 1 }}>{sub.name}</Typography>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={() => handleEdit(sub)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(sub.id)}>
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

export default AdminSubcategories;
