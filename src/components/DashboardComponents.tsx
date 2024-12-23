import { Box } from "@mui/material";

const DevicesComponents = () => {
  return (
    <Box sx={{ maxWidth: 800, width: 1 }}>
      <Box
        component="img"
        sx={{
          height: 510,
          display: "block",
          maxWidth: 800,
          width: 1,
          overflow: "hidden",
          marginX: "auto",
          objectFit: "contain",
        }}
      />
    </Box>
  );
};
export default DevicesComponents;
