import { useState, useEffect } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { useLocation } from "react-router-dom";
import { IDevice } from "../interface/InterfaceCollection";
import { getDeviceData } from "../api/DeviceDetailApi";
import DeviceDetailComponent from "../components/devicesComponents/deviceDetail/DeviceDetailComponent"; // Updated import
import DeviceInterfaceComponent from "../components/devicesComponents/deviceDetail/DeviceInterfaceComponent";
import useWindowSize from "../hooks/useWindowSize";

const DeviceDetailPage = () => {
  const windowSize = useWindowSize();
  const location = useLocation();
  const [deviceData, setDeviceData] = useState<IDevice | null>(
    location.state?.device || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceData) {
      setLoading(true);
      const fetchDeviceData = async () => {
        try {
          const allDevices = await getDeviceData();
          setDeviceData(
            allDevices.find(
              (d) => d.hostname === location.state?.device?.DName
            ) || null
          );
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("An unknown error occurred");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchDeviceData();
    }
  }, [deviceData, location.state?.device?.DName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!deviceData) {
    return <div>No device data available.</div>;
  }

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 5,
            marginBottom: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            DEVICE'S DETAIL
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          width: 1,
          marginTop: 2,
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFB",
            flex: 1,
            display: "flex",
            borderRadius: 8,
            flexDirection: "column",
            alignItems: "center",
            minHeight: "fit-content",
            marginBottom: 5,
            height: 1,
            py: 3,
          }}
        >
          <DeviceDetailComponent deviceData={deviceData} />
        </Box>

        <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            INTERFACE
          </Typography>
          <Button
            type="submit"
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "5.5rem",
              height: "2.5rem",
              "&:focus": {
                outline: "none",
                color: "#FFFFFB",
              },
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            Graph
          </Button>
        </Box>

        <Box
          sx={{
            backgroundColor: "#FFFFFB",
            flex: 1,
            display: "flex",
            borderRadius: 8,
            flexDirection: "column",
            justifyContent: windowSize.width >= 1100 ? "center" : "start",
            alignItems: "center",
            minHeight: "fit-content",
            marginBottom: 5,
            py: 3,
          }}
        >
          {windowSize.width < 1100 && (
            <Typography
              align="center"
              sx={{
                mt: "6rem",
                mb: "2rem",
              }}
            >
              {/* You can add any placeholder text here if necessary */}
            </Typography>
          )}
          {deviceData && <DeviceInterfaceComponent items={deviceData.items} />}
        </Box>
      </Box>
    </>
  );
};

export default DeviceDetailPage;
