import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        minHeight: '150px',
        height:"100%"
      }}
    >
      <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
        {`${formatNumber(time.getHours())}:${formatNumber(time.getMinutes())}:${formatNumber(
          time.getSeconds()
        )}`}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary',textAlign:"center" }}>
        {time.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>
    </Box>
  );
};

export default DigitalClock;