import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { TextField, Button, Typography, List, ListItem, ListItemText, IconButton, Paper, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/admin/categories`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setCategories(res.data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/admin/categories`, { name },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(() => { setName(''); fetchCategories(); })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => fetchCategories())
    .catch(err => console.error(err));
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = (id) => {
    axios.put(`${process.env.REACT_APP_API_URL}/admin/categories/${id}`, { name: editName },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(() => { setEditId(null); setEditName(''); fetchCategories(); })
      .catch(err => console.error(err));
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>Manage Categories</Typography>
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
        <TextField label="Category Name" value={name} onChange={e => setName(e.target.value)} required />
        <Button type="submit" variant="contained" sx={{ ml: 2 }}>Create Category</Button>
      </Box>
      <Paper>
        <List>
          {categories.map(cat => (
            <ListItem key={cat.id} secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleEdit(cat)}><EditIcon /></IconButton>
                <IconButton edge="end" onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
              </>
            }>
              {editId === cat.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <TextField value={editName} onChange={e => setEditName(e.target.value)} fullWidth />
                  <Button onClick={() => handleUpdate(cat.id)} variant="contained" sx={{ ml: 2 }}>Update</Button>
                  <Button onClick={() => setEditId(null)} sx={{ ml: 1 }}>Cancel</Button>
                </Box>
              ) : (
                <ListItemText primary={cat.name} />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </AdminLayout>
  );
}

export default AdminCategories;
