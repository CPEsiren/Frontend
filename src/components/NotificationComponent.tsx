import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Container,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { IUser } from "../interface/InterfaceCollection";

interface ApiResponse {
  message: string;
  user: IUser;
}

const NotificationComponenet = () => {
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          mb: 2,
          width: "100%",
        }}
      >
        Notiiiiiiiiiii
      </Box>
    </>
  );
};

export default NotificationComponenet;
