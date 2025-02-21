import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

interface DashboardData {
  hosts: {
    total: number;
    disabled: number;
    enabled: number;
  };
  items: {
    total: number;
    disabled: number;
    enabled: number;
  };
  users: {
    total: number;
    online: number;
    offline: number;
  };
  triggers: {
    total: number;
    disabled: number;
    enabled: number;
  };
  events: {
    total: number;
    problem: number;
    resolved: number;
  };
  templates: {
    total: number;
  };
}

interface TableData {
  id: number;
  name: string;
  value: number;
  enabled: string;
  disabled: string;
  template?: number;
  problem?: string;
  resolved?: string;
}

const highlightText = (text: string) => {
  return text
    .split(/(enabled|disabled|problem|resolved|online|offline|templates)/gi)
    .map((part, index) => {
      if (/enabled/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "green", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      if (/disabled/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "red", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      if (/problem/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "red", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      if (/resolved/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "green", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      if (/online/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "green", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      if (/offline/i.test(part)) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{ color: "red", fontSize: "0.8rem" }}
          >
            {part}
          </Typography>
        );
      }
      return part;
    });
};

const TableComponent = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // const response = await fetch("http://localhost:3000/dashboard/count");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/count`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTableData = (): TableData[] => {
    if (!dashboardData) return [];

    return [
      {
        id: 1,
        name: "Number of users (online/offline/templates)",
        value: dashboardData.users.total,
        enabled: dashboardData.users.online.toString(),
        disabled: dashboardData.users.offline.toString(),
        template: dashboardData.templates.total,
      },
      {
        id: 2,
        name: "Number of hosts (enabled/disabled)",
        value: dashboardData.hosts.total,
        enabled: dashboardData.hosts.enabled.toString(),
        disabled: dashboardData.hosts.disabled.toString(),
      },
      {
        id: 3,
        name: "Number of items (enabled/disabled)",
        value: dashboardData.items.total,
        enabled: dashboardData.items.enabled.toString(),
        disabled: dashboardData.items.disabled.toString(),
      },
      {
        id: 4,
        name: "Number of triggers (enabled/disabled)",
        value: dashboardData.triggers.total,
        enabled: dashboardData.triggers.enabled.toString(),
        disabled: dashboardData.triggers.disabled.toString(),
      },
      {
        id: 5,
        name: "Number of events (resolved/problem)",
        value: dashboardData.events.total,
        problem: dashboardData.events.problem.toString(),
        resolved: dashboardData.events.resolved.toString(),
        enabled: "",
        disabled: "",
      },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 300,
          "& .MuiTableCell-root": {
            padding: "10px 8px",
            fontSize: "0.8rem",
            lineHeight: 1.53,
          },
          "& .MuiTableCell-head": {
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            fontSize: "0.8rem",
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            "& .MuiTableRow-root": {
              "&:nth-of-type(odd)": {
                backgroundColor: "#fafafa",
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Parameter</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTableData().map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    maxWidth: "200px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {highlightText(row.name)}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      borderRadius: "4px",
                      padding: "2px 6px",
                      display: "inline-block",
                      minWidth: "30px",
                      textAlign: "center",
                    }}
                  >
                    {row.value}
                  </Box>
                </TableCell>
                <TableCell>
                  {row.name.includes("event") ? (
                    <>
                      <Typography
                        component="span"
                        sx={{ color: "green", fontSize: "0.8rem" }}
                      >
                        {row.resolved}
                      </Typography>
                      /
                      <Typography
                        component="span"
                        sx={{ color: "red", fontSize: "0.8rem" }}
                      >
                        {row.problem}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography
                        component="span"
                        sx={{ color: "green", fontSize: "0.8rem" }}
                      >
                        {row.enabled}
                      </Typography>
                      /
                      <Typography
                        component="span"
                        sx={{ color: "red", fontSize: "0.8rem" }}
                      >
                        {row.disabled}
                      </Typography>
                    </>
                  )}
                  {row.template && (
                    <Typography component="span" sx={{ fontSize: "0.8rem" }}>
                      /{row.template}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableComponent;
