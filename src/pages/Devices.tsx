import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import DevicesComponents from "../components/devicesComponents/DevicesComponents";
import { IDevice } from "../interface/InterfaceCollection";
import AddDevice from "../components/Modals/AddDevice";

const Devices: React.FC = () => {
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostGroups, setHostGroups] = useState<string[]>([]);

  // Enhanced snackbar state to handle refresh callback
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    refreshCallback: null as (() => void) | null,
  });

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

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/host`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      const result = await response.json();
      setDevices(result.data);

      // Extract unique host groups for the Autocomplete
      const uniqueHostGroups = Array.from(
        new Set(
          result.data
            .map((device: IDevice) => device.hostgroup.toLocaleUpperCase())
            .filter((group: string) => group && group.trim() !== "")
        )
      ) as string[];

      setHostGroups(uniqueHostGroups);
    } catch (error) {
      console.error("Error fetching devices:", error);
      setSnackbarState({
        open: true,
        message: "Failed to fetch devices",
        severity: "error",
        refreshCallback: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeviceSuccess = (
    message: string,
    refreshCallback?: () => void
  ) => {
    const hasRefreshKeyword = message.includes("REFRESH");
    const baseMessage = hasRefreshKeyword
      ? message.split(" REFRESH")[0]
      : message;

    const finalRefreshCallback =
      refreshCallback || (() => window.location.reload());

    setSnackbarState({
      open: true,
      message: baseMessage,
      severity: "success",
      refreshCallback: hasRefreshKeyword ? finalRefreshCallback : null,
    });

    setModalOpen(false);
    fetchDevices();
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const snackbarContent = (
    <>
      <span>{snackbarState.message} </span>
      {snackbarState.refreshCallback && (
        <Link
          component="button"
          onClick={() => {
            if (snackbarState.refreshCallback) {
              snackbarState.refreshCallback();
            }
          }}
          sx={{
            color: "white",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          Refresh
        </Link>
      )}
    </>
  );

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color="#242D5D"
          >
            DEVICES
          </Typography>
          <Button
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "7rem",
              height: "2.5rem",
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            + Device
          </Button>
        </Box>
      )}

      <Box sx={{ marginTop: 2, paddingBottom: 3 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : devices.length > 0 ? (
          <DevicesComponents devices={devices} />
        ) : (
          <Typography>No devices available</Typography>
        )}
      </Box>

      <Dialog
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            borderRadius: 10,
          },
        }}
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
            New Device
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddDevice
            onClose={() => setModalOpen(false)}
            onSuccess={handleAddDeviceSuccess}
            hostGroups={hostGroups} // Pass host groups to AddDevice
          />
        </DialogContent>
      </Dialog>

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
            fontSize: 14,
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

export default Devices;
