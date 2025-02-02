import React from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

const GraphInDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{p:2}}>
      <Typography variant="h6">Graph name</Typography>
    </Box>
  );
};

export default GraphInDashboard;
