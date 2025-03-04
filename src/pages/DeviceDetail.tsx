import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
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
  const [isModalOpen, setModalOpen] = useState(false);

  // Add snackbar state
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    refreshCallback: null as (() => void) | null,
  });

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const refreshDeviceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/host/${deviceData?._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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

  // Handle snackbar close
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  };

  // Handle success callback from AddItemOnly
  const handleAddItemSuccess = (
    message: string,
  ) => {
    // Check if message contains "REFRESH" keyword
    const hasRefreshKeyword = message.includes("REFRESH");
    const baseMessage = hasRefreshKeyword
      ? message.split(" REFRESH")[0]
      : message;

    // Set the snackbar state
    setSnackbarState({
      open: true,
      message: baseMessage,
      severity: "success",
      refreshCallback: null,
    });

    // Close the modal
    setModalOpen(false);

    // Refresh the data
    refreshDeviceData();
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

  // Custom snackbar content with refresh link
  const snackbarContent = (
    <span>
      {snackbarState.message}{" "}
      {/* {snackbarState.refreshCallback && (
        <Link
          component="button"
          onClick={() => {
            if (snackbarState.refreshCallback) snackbarState.refreshCallback();
          }}
          sx={{ 
            color: 'inherit', 
            textDecoration: 'underline', 
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'none'
            }
          }}
        >
          REFRESH
        </Link>
      )} */}
    </span>
  );

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
        </Box>

        <Box
          sx={{
            backgroundColor: "#FFFFFB",
            flex: 1,
            display: "flex",
            borderRadius: 8,
            flexDirection: "column",
            justifyContent: windowSize.width >= 1100 ? "center" : "start",
            alignItems: "left",
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
              backgroundColor: "#F25A28",
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
            + Item
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
            alignItems: "left",
            minHeight: "fit-content",
            marginBottom: 5,
            padding: 3,
            py: 3,
          }}
        >
          {deviceData && <DeviceItemComponent deviceData={deviceData} />}
        </Box>
      </Box>

      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            borderBottom: 0,
            borderColor: "#a9a9a9",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "medium", pt: 2, pl: 1 }}>
            New Item
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddItemOnly
            onClose={handleModalClose}
            deviceId={deviceData._id}
            onSuccess={handleAddItemSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for showing success/error messages */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          variant="filled"
          sx={{
            width: "100%",
            "& .MuiAlert-icon": {
              fontSize: 20,
              mt: 0.5,
            },
          }}
        >
          {snackbarContent}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeviceDetailPage;
