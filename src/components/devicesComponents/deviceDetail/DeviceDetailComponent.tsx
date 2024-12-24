import { Grid, Typography } from "@mui/material";
import { IDevice } from "../../../interface/InterfaceCollection"; // Update the path accordingly

const DeviceDetailComponent = ({ deviceData }: { deviceData: IDevice }) => {
  const deviceDetails = deviceData.details; // Extracting the DeviceDetails from the deviceData object

  return (
    <Grid container spacing={3}>
      {/* Basic Information Section */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Basic Information
        </Typography>
        <Typography>Hostname: {deviceData.hostname}</Typography>
        <Typography>IP Address: {deviceData.ip_address}</Typography>
        <Typography>Host Group: {deviceData.hostgroup}</Typography>
        <Typography>SNMP Version: {deviceData.snmp_version}</Typography>
        <Typography>SNMP Port: {deviceData.snmp_port}</Typography>
      </Grid>

      {/* Device Details Section */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Device Details
        </Typography>
        {Object.entries(deviceDetails).map(
          ([key, value]) =>
            value !== "" && (
              <Typography key={key}>
                {key}: {value}
              </Typography>
            )
        )}
      </Grid>
    </Grid>
  );
};

export default DeviceDetailComponent;