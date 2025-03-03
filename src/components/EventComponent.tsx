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
  TablePagination,
} from "@mui/material";

import { IEvent } from "../interface/InterfaceCollection";

const EventComponent = () => {
  const [events, setevents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/event`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data && result.data.length > 0) {
          setevents(result.data);
        } else {
          // console.log("No events found");
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
      case "EVENT":
        return "info";
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
      case "EVENT":
        return "Event";
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
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <Container maxWidth={false}>
      {events.length === 0 ? (
        // <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          No events found
        </Typography>
      ) : (
        // </Paper>
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              backgroundColor: "white",
              borderRadius: 3,
              // mt: 2,
              display: "block", // Change from -webkit-box to block for better line break support
              wordBreak: "break-word", // Allow words to break if needed
              hyphens: "auto",
            }}
          >
            <Table
              sx={{
                minWidth: 650,
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
                  padding: "25px",
                },
                "& .MuiTableRow-body:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& .MuiTableRow-root": {
                  "&[data-status='PROBLEM']:hover": {
                    backgroundColor: "#fff5f8",
                  },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      flexBasis: "100px",
                      width: "7%",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      ProblemAt
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: "7%",
                      flexBasis: "100px",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      ResolvedAt
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: "10%",
                      flexBasis: "180px",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      Device's name
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: "5%" }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Severity
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: "13%" }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Description
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: "1%" }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Status
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? events.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : events
                ).map((event) => {
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
                          {formatTimeInThaiTimezone(event.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {event.resolvedAt === null
                            ? "-"
                            : formatTimeInThaiTimezone(event.resolvedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {event.hostname}
                        </Typography>
                      </TableCell>

                      {/* Severity */}
                      <TableCell
                        align="center"
                        sx={{
                          color: (() => {
                            switch (event.severity.toLowerCase()) {
                              case "warning":
                                return "#FFA500";
                              case "critical":
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
            component="div"
            count={events.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Container>
  );
};

export default EventComponent;
