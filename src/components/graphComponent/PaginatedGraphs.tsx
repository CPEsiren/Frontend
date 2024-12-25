import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Pagination, 
  PaginationItem,
  Stack,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import MetricGraph, { Items } from './MetricGraph';

interface PaginatedGraphsProps {
  items: Items[];
}

const PaginatedGraphs: React.FC<PaginatedGraphsProps> = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Grid of graphs */}
      <Grid 
        container 
        spacing={3}
        sx={{ mb: 4 }}
      >
        {getCurrentPageItems().map((item) => (
          <Grid 
            item 
            xs={12}
            md={4}
            key={item.item_id.item_name}
            sx={{
              minHeight: isSmallScreen ? '300px' : '500px'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <MetricGraph item={item} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Pagination controls */}
      <Stack 
        spacing={2} 
        alignItems="center"
        sx={{ mt: 4, mb: 4 }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isSmallScreen ? "small" : "medium"}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            />
          )}
        />
      </Stack>
    </Box>
  );
};

export default PaginatedGraphs;