import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

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
      <Box sx={{ m: 0,p:2 }}>
        <Box
          sx={{
            width: "150px", // Increased from 120px, original was 200px
            height: "150px", // Increased from 120px, original was 200px
            borderRadius: "50%",
            position: "relative",
            margin: "auto",
            border: "3px solid rgb(192, 191, 191)", // Increased from 1px
            backgroundColor: "#fffff",
            boxShadow:
              "0 4px 8px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)", // Added shadow
            "&::before": {
              // Inner shadow effect
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50%",
              boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.15)", // Inner shadow
              pointerEvents: "none",
            },
          }}
        >
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i * 1;
            const isMainHour =
              hour === 3 || hour === 6 || hour === 9 || hour === 12;

            if (isMainHour) {
              let positionStyle = {};

              // Position the numbers correctly
              switch (hour) {
                case 12:
                  positionStyle = {
                    top: "3%",
                    left: "50%",
                    transform: "translateX(-50%)",
                  };
                  break;
                case 3:
                  positionStyle = {
                    top: "50%",
                    right: "5%",
                    transform: "translateY(-50%)",
                  };
                  break;
                case 6:
                  positionStyle = {
                    bottom: "3%",
                    left: "50%",
                    transform: "translateX(-50%)",
                  };
                  break;
                case 9:
                  positionStyle = {
                    top: "50%",
                    left: "5%",
                    transform: "translateY(-50%)",
                  };
                  break;
              }

              return (
                <Typography
                  key={i}
                  sx={{
                    position: "absolute",
                    color: "#8A8A8A",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    ...positionStyle,
                  }}
                >
                  {hour}
                </Typography>
              );
            }

            return (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: "1.5px",
                  height: "10px",
                  backgroundColor: "#8A8A8A",
                  left: "49%",
                  transformOrigin: "50% 75px",
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            );
          })}

          {/* Hour hand */}
          <Box
            sx={{
              position: "absolute",
              width: "3px", // Increased from 2px
              height: "45px", // Increased from 35px
              backgroundColor: "#8A8A8A",
              left: "49%",
              top: "30px", // Increased from 25px
              transformOrigin: "bottom",
              transform: `rotate(${hourDegrees}deg)`,
            }}
          />

          {/* Minute hand */}
          <Box
            sx={{
              position: "absolute",
              width: "2px",
              height: "55px", // Increased from 45px
              backgroundColor: "#8A8A8A",
              left: "49%",
              top: "20px", // Increased from 15px
              transformOrigin: "bottom",
              transform: `rotate(${minuteDegrees}deg)`,
            }}
          />

          {/* Second hand */}
          <Box
            sx={{
              position: "absolute",
              width: "1px",
              height: "65px", // Increased from 50px
              backgroundColor: "red",
              left: "50%",
              top: "10px",
              transformOrigin: "bottom",
              transform: `rotate(${secondDegrees}deg)`,
            }}
          />

          {/* Center dot */}
          <Box
            sx={{
              position: "absolute",
              width: "8px", // Increased from 6px
              height: "8px", // Increased from 6px
              backgroundColor: "#8A8A8A",
              borderRadius: "50%",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
        <Box sx={{ width: 1, textAlign: "center", mb: 0 }}>
          <Typography
            variant="body2" // Changed from caption
            sx={{
              mt: 2,
              color: "#00000",
              fontSize: "1.2rem", // Increased from 0.7rem
              fontWeight: "medium",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)", // Added subtle text shadow
            }}
          >
            {time.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default AnalogClock;
