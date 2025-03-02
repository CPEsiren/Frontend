import { Grid, Typography, Box } from "@mui/material";
import { IDevice } from "../../../interface/InterfaceCollection"; // Update the path accordingly
import { DisplaySettings } from "@mui/icons-material";

const DeviceDetailComponent = ({ deviceData }: { deviceData: IDevice }) => {
  const deviceDetails = deviceData.details; // Extracting the DeviceDetails from the deviceData object

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        p: 2,
        gap: 2,
      }}
    >
      {/* Basic Information Section */}
      <Grid item xs={12} md={6} width={"40%"} sx={{ ml: 2 }}>
        {/* <Typography variant="h6" fontWeight={600} gutterBottom>
          Basic Information
        </Typography> */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>Device's name:</Typography>
          <Typography>{deviceData.hostname}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>IP Address:</Typography>
          <Typography>{deviceData.ip_address}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>Host Group:</Typography>
          <Typography>{deviceData.hostgroup}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>SNMP Version:</Typography>
          <Typography>{deviceData.snmp_version}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>SNMP Port:</Typography>
          <Typography>{deviceData.snmp_port}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography fontWeight={600}>SNMP Community:</Typography>
          <Typography>{deviceData.snmp_community}</Typography>
        </Box>
      </Grid>

      {/* Device Details Section */}
      <Grid item xs={12} md={6} width={"45%"}>
        {/* <Typography variant="h6" fontWeight={600} gutterBottom>
          Device Details
        </Typography> */}
        {Object.entries(deviceDetails).map(
          ([key, value]) =>
            value !== "" && (
              <Box
                key={key}
                sx={{ display: "flex", flexDirection: "row", gap: 1 }}
              >
                <Typography fontWeight={600}>{key}:</Typography>
                <Typography>{value}</Typography>
              </Box>
            )
        )}
      </Grid>
    </Box>
  );
};

export default DeviceDetailComponent;
