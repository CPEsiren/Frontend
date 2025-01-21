import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { IDevice } from "../interface/InterfaceCollection";
import { getDeviceData } from "../api/DeviceDetailApi";
import DeviceDetailComponent from "../components/devicesComponents/deviceDetail/DeviceDetailComponent"; // Updated import
import DeviceItemComponent from "../components/devicesComponents/deviceDetail/DeviceItemComponent";
import useWindowSize from "../hooks/useWindowSize";
import DeviceInterfaceComponent from "../components/devicesComponents/deviceDetail/DeviceInterfaceComponent";
import AddItemOnly from "../components/Modals/AddItemOnly";

const DeviceDetailPage = () => {
  const windowSize = useWindowSize();
  const location = useLocation();
  const [deviceData, setDeviceData] = useState<IDevice | null>(
    location.state?.device || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const refreshDeviceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/host/${deviceData?._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch device data");
      }
      const result = await response.json();
      if (result.status === "success") {
        setDeviceData(result.data);
      }
    } catch (error) {
      console.error("Error refreshing device data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    refreshDeviceData(); // Refresh data after modal closes
  };

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
            padding: 3,
            height: 1,
            py: 3,
          }}
        >
          <DeviceDetailComponent deviceData={deviceData} />
        </Box>
        <Divider sx={{ marginTop: 0, marginBottom: 3 }} />
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
            INTERFACES
          </Typography>
          {/* <Button
            type="submit"
            onClick={handleClick}
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
          </Button> */}
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
            padding: 3,
            py: 3,
          }}
        >
          {deviceData && (
            <DeviceInterfaceComponent interfaces={deviceData.interfaces} />
          )}
        </Box>
        <Divider sx={{ marginTop: 0, marginBottom: 3 }} />

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
            ITEMS
          </Typography>
          <Button
            type="submit"
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "blue",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "6rem",
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
            Add Item
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
            padding: 3,
            py: 3,
          }}
        >
          {deviceData && <DeviceItemComponent deviceData={deviceData} />}
        </Box>
      </Box>

      <Dialog open={isModalOpen} onClose={handleModalClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ borderBottom: 1, borderColor: "#a9a9a9" }}>
          <Typography variant="h6">New Item</Typography>
        </DialogTitle>
        <DialogContent>
          <AddItemOnly onClose={handleModalClose} deviceId={deviceData._id} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceDetailPage;
