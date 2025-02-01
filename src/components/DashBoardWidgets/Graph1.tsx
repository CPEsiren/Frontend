import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

const data = [
  { name: '00:00', value: 0 },
  { name: '03:00', value: 300 },
  { name: '06:00', value: 600 },
  { name: '09:00', value: 800 },
  { name: '12:00', value: 500 },
  { name: '15:00', value: 700 },
  { name: '18:00', value: 400 },
  { name: '21:00', value: 200 },
  { name: '24:00', value: 100 },
];

const Graph1 = () => {
  const theme = useTheme();

  return (
    <Typography variant='h6'>Graph 1</Typography>
  );
};

export default Graph1;