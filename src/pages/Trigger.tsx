import TriggerComponent from "../components/TriggerComponent";
import useWindowSize from "../hooks/useWindowSize";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import React, { useState } from "react";
import AddTrigger from "../components/Modals/AddTrigger";
import { ITrigger } from "../interface/InterfaceCollection";

const Triggers = () => {
  const windowSize = useWindowSize();
  const [isModalOpen, setModalOpen] = useState(false);
  const [triggerData, setTriggerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggerKey, setTriggerKey] = useState(0); // Add key to force re-render

  // Enhanced snackbar state to handle refresh callback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
    refreshCallback: null as (() => void) | null,
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  // Function to fetch trigger data
  const fetchTriggerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/trigger`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        setTriggerData([]);
        setTriggerKey(0);
        throw new Error("Failed to fetch triggers");
      }
      const result = await response.json();
      setTriggerData(result.data);
      // Increment key to force re-render of TriggerComponent
      setTriggerKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error fetching triggers:", error);

      // setSnackbar({
      //   open: true,
      //   message: "Failed to fetch triggers",
      //   severity: "error",
      //   refreshCallback: null,
      // });
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchTriggerData();
  // }, []);

  const handleTriggerAddSuccess = (message: string) => {
    // Always fetch trigger data after successful operation
    fetchTriggerData();

    setSnackbar({
      open: true,
      message: message,
      severity: "success",
      refreshCallback: null,
    });

    // Close the modal
    handleClose();
  };

  const [triggerDuplicate, setTriggerDuplicate] = useState<ITrigger | null>(
    null
  );

  const handleDuplicateTrigger = (trigger: ITrigger) => {
    setTriggerDuplicate(trigger);
    toggleModal();
  };

  // Custom message with clickable refresh link if refresh callback exists
  const snackbarContent = (
    <span>
      {snackbar.message}{" "}
      {snackbar.refreshCallback && (
        <Link
          component="button"
          onClick={() => {
            if (snackbar.refreshCallback) snackbar.refreshCallback();
          }}
          sx={{
            color: "inherit",
            textDecoration: "underline",
            fontWeight: "bold",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "none",
            },
            mb: 0.5,
          }}
        >
          REFRESH
        </Link>
      )}
    </span>
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
            color={"#242D5D"}
          >
            TRIGGER
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
            + Trigger
          </Button>
        </Box>
      )}
      <Box
        sx={{
          width: 1,
          marginTop: 2,
          height: "auto",
          display: "flex",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFB",
            flex: 1,
            display: "flex",
            borderRadius: 3,
            flexDirection: "column",
            justifyContent: windowSize.width >= 1100 ? "center" : "start",
            alignItems: "center",
            minHeight: "fit-content",
            py: 3,
            px: 3,
            mb: 8,
          }}
        >
          {windowSize.width < 1100 && (
            <Typography
              align="center"
              sx={{
                color: "#242D5D",
                fontWeight: 400,
                fontSize: 25,
              }}
            />
          )}
          <TriggerComponent
            key={triggerKey}
            refreshTriggers={fetchTriggerData}
            onDuplicateTrigger={handleDuplicateTrigger}
          />
        </Box>
      </Box>

      <Dialog open={isModalOpen} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle
          sx={{
            borderBottom: 0,
            borderColor: "#a9a9a9",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "medium", pt: 2, pl: 1 }}>
            New Trigger
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddTrigger
            onClose={handleClose}
            onSuccess={handleTriggerAddSuccess}
            Trigger={triggerDuplicate}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
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

export default Triggers;
