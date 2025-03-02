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
    event: number;
  };
  templates: {
    total: number;
  };
}

interface TableData {
  id: number;
  name: string;
  value: number;
  enabled?: string;
  disabled?: string;
  template?: number;
  problem?: string;
  resolved?: string;
  event?: string;
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
        name: "Number of users (number/templates)",
        value: dashboardData.users.total,
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
        name: "Number of events (resolved/problem/event)",
        value: dashboardData.events.total,
        problem: dashboardData.events.problem.toString(),
        resolved: dashboardData.events.resolved.toString(),
        event: dashboardData.events.event.toString(),
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
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            maxHeight: 300,
            "& .MuiTableCell-root": {
              padding: "10px 8px",
              fontSize: "0.8rem",
              lineHeight: 1.73,
            },
            "& .MuiTableCell-head": {
              fontWeight: "bold",
              backgroundColor: "white",
              fontSize: "0.8rem",
              borderBottom: "1px solid #dbdbdb",
            },
            width: 1,
            px: 1,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "60%" }}>Parameter</TableCell>
              <TableCell sx={{ width: "20%" }}>Value</TableCell>
              <TableCell sx={{ width: "20%" }}>Details</TableCell>
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
                  Width: 1,
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    width: "60%",
                  }}
                >
                  {highlightText(row.name)}
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  <Box
                    component="span"
                    sx={{
                      borderRadius: "4px",
                      padding: "2px 6px",
                      display: "inline-block",
                      minWidth: "30px",
                      width: "20%",
                    }}
                  >
                    {row.value}
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  {row.name.includes("users") && (
                    <Typography component="span" sx={{ fontSize: "0.8rem" }}>
                      {row.value}
                    </Typography>
                  )}
                  {row.name.includes("event") && (
                    <Box sx={{ width: "20%", alignSelf: "center" }}>
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
                      /
                      <Typography component="span" sx={{ fontSize: "0.8rem" }}>
                        {row.event}
                      </Typography>
                    </Box>
                  )}
                  {row.name.includes("host") && (
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
                  {row.name.includes("items") && (
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
                  {row.name.includes("triggers") && (
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
