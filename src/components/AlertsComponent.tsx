import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAlertData } from "../api/AlertApi";

interface Alert {
  problem: string;
  pDetail: string;
  hostId: string;
  area: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  pStatus: number;
}

const formatDate = (date: string | Date) => {
  const englishMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = englishMonths[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${day} ${month} ${year}`;
};

const formatTime = (timeString: string) => {
  const timeMatch = timeString.match(/\d{2}:\d{2}:\d{2}/);
  return timeMatch ? timeMatch[0] : timeString;
};

const AlertsComponent = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("http://localhost:3000/alert");
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const result = await response.json();
        setAlerts(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleSearchClick = () => {
    setSearching(true);
    setSnackbarOpen(true);

    setTimeout(() => {
      setSearching(false);
      setSnackbarOpen(false);
    }, 2000);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "none",
        "& .MuiPaper-root": { boxShadow: "none" },
        backgroundColor: "transparent",
      }}
    >
      <Table
        sx={{
          minWidth: 650,
          "& .MuiTable-root": { borderCollapse: "separate", borderSpacing: 0 },
          "& .MuiTableCell-root": { borderBottom: "none" },
          "& .MuiTableBody-root .MuiTableRow-root": {
            "&:nth-of-type(even)": { backgroundColor: "white" },
            "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
            "&:hover": {
              backgroundColor: "#FFF3E0",
              transition: "background-color 0.3s ease",
              cursor: "pointer",
            },
          },
        }}
        aria-label="alerts table"
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "1.2rem", fontWeight: "medium" }}>
              Start DateTime
            </TableCell>
            <TableCell sx={{ fontSize: "1.2rem", fontWeight: "medium" }}>
              End DateTime
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1.2rem", fontWeight: "medium" }}
            >
              Problem
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1.2rem", fontWeight: "medium" }}
            >
              Area
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1.2rem", fontWeight: "medium" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((alert, index) => (
            <TableRow key={index}>
              <TableCell>
                {formatDate(alert.startDate)} {alert.startTime}
              </TableCell>
              <TableCell>
                {formatDate(alert.endDate)} {alert.endTime}
              </TableCell>
              <TableCell align="center">{alert.problem}</TableCell>
              <TableCell align="center">{alert.area}</TableCell>
              <TableCell align="center">
                <IconButton
                  aria-label="find"
                  onClick={handleSearchClick}
                  disabled={!alert.pStatus}
                  sx={{
                    color: "white",
                    backgroundColor: alert.pStatus == 0 ? "#FF0000" : "red",
                    borderRadius: "100%",
                    "&:focus": {
                      outline: "none",
                    },
                    "&:hover": {
                      backgroundColor: alert.pStatus == 0 ? "#BF0000" : "gray",
                    },
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Searching..."
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </TableContainer>
  );
};

export default AlertsComponent;
