import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, TextField, FormControlLabel, Checkbox, Pagination } from '@mui/material';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';
import { useParams, Link } from 'react-router-dom';

const ModelsPage = () => {
  const { brandId, subId } = useParams();
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [isNewFilter, setIsNewFilter] = useState(false);
  const [highlightedFilter, setHighlightedFilter] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/models`)
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredModels = models.filter(model => {
    // Filter models that belong to the selected brand and subcategory.
    return (
      model.brandId.toString() === brandId &&
      model.subcategoryId.toString() === subId &&
      model.name.toLowerCase().includes(search.toLowerCase()) &&
      (isNewFilter ? model.isNew : true) &&
      (highlightedFilter ? model.highlighted : true)
    );
  });

  const paginatedModels = filteredModels.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div>
      <UserNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Models</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} />
          <FormControlLabel
            control={<Checkbox checked={isNewFilter} onChange={e => setIsNewFilter(e.target.checked)} />}
            label="New"
          />
          <FormControlLabel
            control={<Checkbox checked={highlightedFilter} onChange={e => setHighlightedFilter(e.target.checked)} />}
            label="Highlighted"
          />
        </Box>
        <Grid container spacing={2}>
          {paginatedModels.map(model => (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{model.name}</Typography>
                <Box sx={{ mt: 2 }}>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${model.image || 'placeholder.png'}`}
                    alt={model.name}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <Link to={`/product/${model.id}`} style={{ textDecoration: 'none' }}>
                    View Product
                  </Link>
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(filteredModels.length / pageSize)}
            page={page}
            onChange={handlePageChange}
          />
        </Box>
      </Container>
    </div>
  );
};

export default ModelsPage;
