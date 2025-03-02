import { Alert, AlertColor, Button, Snackbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useWindowSize from "../hooks/useWindowSize";
import AccountComponent from "../components/AccountComponent";
import AddNotification, { Channel } from "../components/Modals/AddNotification";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NotificationComponent from "../components/NotificationComponent";

export interface INotifacationDetails {
  _id: string;
  user_id: string;
  type: "email" | "line";
  recipient: {
    name: string;
  };
  problem_title: string;
  problem_body: string;
  recovery_title: string;
  recovery_body: string;
  enabled: boolean;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const Account = () => {
  const windowSize = useWindowSize();
  const role = localStorage.getItem("userRole");

  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openDialog = params.get("openDialog");

    if (openDialog === "true") {
      setDialogOpen(true);
    }
  }, [location]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveChannels = (channel: Channel) => {
    if (channel.type === "line") {
      window.location.href = "/account";
      return;
    }
    fetchNotifications();
  };

  //Notifications
  const [notifications, setNotifications] = useState<INotifacationDetails[]>(
    []
  );

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/media/${localStorage.getItem(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const notifications = res.data.data;
        setNotifications(notifications);
      }
    } catch (error) {
      setNotifications([]);
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteNoti = async (id: string) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/media/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setSnackbar({
          open: true,
          message: "Notification deleted successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      setSnackbar({
        open: true,
        message: "Error deleting notification",
        severity: "error",
      });
    } finally {
      fetchNotifications();
    }
  };

  const editNotification = async (
    id: string,
    problem_title: string,
    problem_body: string,
    recovery_title: string,
    recovery_body: string,
    enabled: boolean
  ) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/media/${id}`,
        {
          problem_title,
          problem_body,
          recovery_title,
          recovery_body,
          enabled,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setSnackbar({
          open: true,
          message: "Notification updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      setSnackbar({
        open: true,
        message: "Error updating notification",
        severity: "error",
      });
    } finally {
      fetchNotifications();
    }
  };

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            USERS
          </Typography>
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
            justifyContent: "flex-start",
            alignItems: "flex-start",
            minHeight: "fit-content",
            marginBottom: 5,
            height: 1,
            py: 3,
            px: 3,
          }}
        >
          <AccountComponent />
        </Box>
      </Box>
      <Box
        sx={{
          width: 1,
          display: "flex",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight={600}
          color={"#242D5D"}
        >
          NOTIFICATION CHANNELS
        </Typography>
        <Button
          onClick={handleOpenDialog}
          sx={{
            color: "#FFFFFB",
            backgroundColor: "#F25A28",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "70px",
            width: "8rem",
            height: "2.5rem",
            "&:hover": {
              backgroundColor: "#F37E58",
            },
          }}
        >
          + CHANNELS
        </Button>
        <AddNotification
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveChannels}
        />
      </Box>
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
            justifyContent: "flex-start",
            alignItems: "flex-start",
            minHeight: "fit-content",
            marginBottom: 5,
            height: 1,
            py: 3,
            px: 3,
          }}
        >
          <NotificationComponent
            notifications={notifications}
            onDelete={handleDeleteNoti}
            onUpdate={editNotification}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Account;
