import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Container,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import { IEvent } from "../interface/InterfaceCollection";

interface ApiResponse {
  status: string;
  message: string;
  data: IEvent[];
}

const EventComponent = () => {
  const [devices, setDevices] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch("http://localhost:3000/event");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw Response:', result);

        if (result.events && result.events.length > 0) {
          setDevices(result.events);
        } else {
          throw new Error("No events found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch devices";
        setError(errorMessage);
        console.error("Error fetching devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "success";
      case "PROBLEM":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "Resolved";
      case "PROBLEM":
        return "Problem";
      default:
        return "Unknown";
    }
  };

  // Function to format time to Thai timezone (UTC+7) with custom format DD/MM/YYYY
  const formatTimeInThaiTimezone = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0"); // Ensures two digits
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed, so add 1
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Format as DD/MM/YYYY HH:mm:ss
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error" variant="h6">
            {`Error fetching devices: ${error}`}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (devices.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="textSecondary" variant="h6">
            No devices found
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          mt: 2,
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              padding: "25px",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            "& .MuiTableRow-root": {
              "&[data-status='PROBLEM']:hover": {
                backgroundColor: "#fff5f8", 
              },
            },
          }}
        >
          <TableHead
            sx={{
              backgroundColor: "#242D5D",
              "& .MuiTableCell-root": {
                color: "white",
              },
            }}
          >
            <TableRow>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Time
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Description
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Status
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {devices.map((device) => {
            const displayTime = device.status === "PROBLEM" ? device.createdAt : device.updatedAt;

            return (
              <TableRow
                key={device._id}
                data-status={device.status} // เพิ่ม data-status
                hover
                sx={{
                  backgroundColor: device.status === "PROBLEM" ? "#fff5f8" : "inherit",
                }}
              >
                <TableCell align="center">
                  <Typography variant="body2">{formatTimeInThaiTimezone(displayTime)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{device.trigger_id?.host_id?.hostname}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{device.message}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(device.status)}
                    color={getStatusColor(device.status)}
                    size="small"
                    sx={{ minWidth: "80px" }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EventComponent;
