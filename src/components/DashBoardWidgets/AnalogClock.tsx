import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = (hours % 12) * 30 + minutes / 2;
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;

  return (
    <>
    <Box
      sx={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        position: 'relative',
        margin: 'auto',
        border: '2px solid #333',
        backgroundColor: '#fff',
      }}
    >
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '2px',
            height: '15px',
            backgroundColor: '#333',
            left: '49%',
            transformOrigin: '50% 100px',
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}

      {/* Hour hand */}
      <Box
        sx={{
          position: 'absolute',
          width: '4px',
          height: '60px',
          backgroundColor: '#333',
          left: '49%',
          top: '40px',
          transformOrigin: 'bottom',
          transform: `rotate(${hourDegrees}deg)`,
        }}
      />

      {/* Minute hand */}
      <Box
        sx={{
          position: 'absolute',
          width: '3px',
          height: '80px',
          backgroundColor: '#666',
          left: '49%',
          top: '20px',
          transformOrigin: 'bottom',
          transform: `rotate(${minuteDegrees}deg)`,
        }}
      />

      {/* Second hand */}
      <Box
        sx={{
          position: 'absolute',
          width: '1px',
          height: '90px',
          backgroundColor: 'red',
          left: '50%',
          top: '10px',
          transformOrigin: 'bottom',
          transform: `rotate(${secondDegrees}deg)`,
        }}
      />

      {/* Center dot */}
      <Box
        sx={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          backgroundColor: '#333',
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </Box>
    <Box sx={{width:1,textAlign: 'center',mb:-4}}>
     <Typography variant="subtitle1" sx={{ mt: 2, color: 'text.secondary' }}>
            {time.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          </Box>
    </>
  );
};

export default AnalogClock;