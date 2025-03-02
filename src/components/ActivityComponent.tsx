import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Alert,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { format } from "date-fns";

// Define the log interface to match your MongoDB schema and actual API response
interface LogUser {
  _id: string;
  username: string;
  role: string;
  activity: string;
  createAt?: string; // Note: API returns "createAt" not "createdAt"
  createdAt?: string | Date; // Keep for compatibility
}

// Define response interface to match your actual API response
interface ApiResponse {
  status: string;
  message: string;
  logs: LogUser[]; // API returns "logs" not "data"
}

const ActivityComponent: React.FC = () => {
  const [logs, setLogs] = useState<LogUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Fetch logs from API
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/loguser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        // throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status !== "success" || !result.logs.length) {
        setLogs([]);
        return;
      }

      // Process logs to handle the "createAt" field (instead of "createdAt")
      const processedLogs = result.logs.map((log) => {
        // Clean up the ISODate string if needed
        let dateStr = log.createAt || log.createdAt;
        if (typeof dateStr === "string" && dateStr.startsWith("ISODate(")) {
          dateStr = dateStr
            .replace("ISODate(", "")
            .replace(")", "")
            .replace(/"/g, "");
        }

        return {
          ...log,
          createdAt: dateStr, // Ensure we have a createdAt field for consistency
        };
      });

      setLogs(processedLogs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch logs";
      setError(errorMessage);
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Pagination handlers
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

  // Function to format date - updated to handle both formats
  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return "N/A";

    try {
      // If it's a string in the ISODate format, clean it up
      if (typeof dateInput === "string" && dateInput.startsWith("ISODate(")) {
        dateInput = dateInput
          .replace("ISODate(", "")
          .replace(")", "")
          .replace(/"/g, "");
      }

      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return format(date, "MMM d, yyyy HH:mm:ss");
    } catch (err) {
      console.error("Date formatting error:", err);
      return String(dateInput) || "N/A";
    }
  };

  // Get role color
  const getRoleColor = (roleType: string): string => {
    switch (roleType.toLowerCase()) {
      case "admin":
        return "#f44336"; // red
      case "superadmin":
        return "#ff9800"; // orange
      case "viewer":
        return "#2196f3"; // blue
      default:
        return "#757575"; // grey
    }
  };

  return (
    <Container maxWidth={false}>
      {/* <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Activity Logs
        </Typography>
        <Button variant="contained" onClick={fetchLogs} disabled={loading}>
          Refresh
        </Button>
      </Box> */}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {logs.length === 0 ? (
            // <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              No activity found
            </Typography>
          ) : (
            // </Paper>
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  backgroundColor: "transparent",
                }}
              >
                <Table
                  sx={{
                    width: 1,
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
                      padding: "16px",
                    },
                    "& .MuiTableRow-body:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },

                  }}
                >
                  <TableHead sx={{ backgroundColor: "#ffffff" }}>
                    <TableRow>
                      <TableCell sx={{ color: "black" }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Timestamp
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "black" }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          User
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "black" }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Role
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "black" }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Activity
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? logs.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : logs
                    ).map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(log.createdAt || log.createAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.username}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.role}
                            size="small"
                            sx={{
                              backgroundColor: getRoleColor(log.role),
                              color: "white",
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.activity}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                component="div"
                count={logs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={error !== null}
        autoHideDuration={3000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ActivityComponent;
