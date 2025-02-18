import { useState, useEffect } from "react";
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

const EventComponent = () => {
  const [events, setevents] = useState<IEvent[]>([]);
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

        if (result.events && result.events.length > 0) {
          setevents(result.events);
        } else {
          console.log("No events found");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch events";
        setError(errorMessage);
        console.error("Error fetching events:", err);
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography color="error" variant="h6">
            {`Error fetching events: ${error}`}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (events.length === 0) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography align="center" sx={{ mt: 2 }}>
            No events found
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
          backgroundColor: "white",
          borderRadius: 3,
          // mt: 2,    
           mx: -3,
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
            // sx={{
            //   backgroundColor: "#242D5D",
            //   "& .MuiTableCell-root": {
            //     color: "white",
            //   },
            // }}
          >
            <TableRow>
              <TableCell align="center"
                sx={{
                  width: "100px",
                  flexBasis: "100px",
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Time
                </Typography>
              </TableCell>
              <TableCell align="center"
                sx={{
                  width: "180px",
                  flexBasis: "180px",
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Device's name
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Severity
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
            {events.map((event) => {
              const displayTime =
                event.status === "PROBLEM" ? event.createdAt : event.updatedAt;

              return (
                <TableRow
                  key={event._id}
                  data-status={event.status}
                  hover
                  sx={{
                    backgroundColor:
                      event.status === "PROBLEM" ? "#fff5f8" : "inherit",
                  }}
                >
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatTimeInThaiTimezone(displayTime)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{event.hostname}</Typography>
                  </TableCell>

                  {/* Severity */}
                  <TableCell
                  align="center"
                    sx={{
                      color: (() => {
                        switch (event.severity.toLowerCase()) {
                          case "not classified":
                            return "#808080";
                          case "information":
                            return "#0000FF";
                          case "warning":
                            return "#FFA500";
                          case "average":
                            return "#FF4500";
                          case "high":
                            return "#FF0000";
                          case "disaster":
                            return "#8B0000";
                          default:
                            return "inherit";
                        }
                      })(),
                      fontWeight: "bold",
                    }}
                  >
                    {event.severity}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{event.message}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(event.status)}
                      color={getStatusColor(event.status)}
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
