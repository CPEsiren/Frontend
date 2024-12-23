import { Grid, Box, Typography } from "@mui/material";
import { Item } from "../../../interface/InterfaceCollection"; // Update the path accordingly

const DeviceInterfaceComponent = ({ items }: { items: Item[] }) => {
  return (
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box
            sx={{
              padding: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {item.item_name}
            </Typography>
            <Typography>OID: {item.oid}</Typography>
            <Typography>Type: {item.type}</Typography>
            <Typography>Unit: {item.unit}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default DeviceInterfaceComponent;
