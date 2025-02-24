import React from "react";
import { Card, Typography, Box } from "@mui/material";
import DevicesCard from "./DevicesCard";
import { IDevice } from "../../interface/InterfaceCollection";

interface DevicesComponentsProps {
  devices: IDevice[];
}

const DevicesComponents: React.FC<DevicesComponentsProps> = ({ devices }) => {
  const groupedDevices = devices.reduce((acc, device) => {
    const hostgroup = device.hostgroup || "Unknown Host group";
    if (!acc[hostgroup]) {
      acc[hostgroup] = [];
    }
    acc[hostgroup].push(device);
    return acc;
  }, {} as Record<string, IDevice[]>);

  return (
    <>
      {Object.entries(groupedDevices).map(([hostgroup, devices]) => (
        <Card
          key={hostgroup}
          sx={{
            bgcolor: "#FFFFFB",
            borderRadius: 3,
            boxShadow: "none",
            padding: 4.5,
            marginBottom: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            color={"#21248B"}
            sx={{ alignSelf: "flex-start", paddingBottom: 2 }}
          >
            {hostgroup || "Default Host group"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              padding: 1,
              paddingBottom: 3,
              "&::-webkit-scrollbar": { height: "8px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#21248B",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#23269E",
              },
            }}
          >
            {devices.map((device) => (
              <Box key={device._id} sx={{ flex: "0 0 200px" }}>
                <DevicesCard device={device} />
              </Box>
            ))}
          </Box>
        </Card>
      ))}
    </>
  );
};

export default DevicesComponents;
