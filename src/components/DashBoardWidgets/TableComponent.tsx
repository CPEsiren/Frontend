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
import { IDevice, IEvent, ITrigger } from "../../interface/InterfaceCollection";

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
    .split(/(enabled|disabled|problem|resolved)/gi)
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
      return part;
    });
};

const TableComponent = () => {
  const [counts, setCounts] = useState({
    hostCount: 0,
    itemCount: 0,
    triggerCount: 0,
    enabledTriggers: 0,
    disabledTriggers: 0,
    eventCount: 0,
    resolvedevent: 0,
    problemevent: 0,
    templateCount: 0,
    userCount: 0,
    enabledHosts: 0,
    disabledHosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const endpoints = {
        host: "http://localhost:3000/host",
        item: "http://localhost:3000/item",
        trigger: "http://localhost:3000/trigger",
        template: "http://localhost:3000/template",
        user: "http://localhost:3000/user",
        event: "http://localhost:3000/event",
      };

      try {
        const results = await Promise.allSettled(
          Object.entries(endpoints).map(async ([key, url]) => {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`Failed to fetch ${key}`);
              }
              const result = await response.json();

              // More flexible data validation
              let data;
              if (Array.isArray(result)) {
                // If the response is directly an array
                data = result;
              } else if (result?.data && Array.isArray(result.data)) {
                // If the response has a data property that's an array
                data = result.data;
              } else if (result?.items && Array.isArray(result.items)) {
                // Some APIs might use 'items' instead of 'data'
                data = result.items;
              } else if (typeof result === "object" && result !== null) {
                // If it's an object but doesn't match expected format, try to extract array
                const possibleArrays = Object.values(result).find((val) =>
                  Array.isArray(val)
                );
                if (possibleArrays) {
                  data = possibleArrays;
                } else {
                  // If no arrays found, wrap the object in an array
                  data = [result];
                }
              } else {
                throw new Error(`Invalid ${key} data format`);
              }

              return { key, data };
            } catch (err: unknown) {
              // Convert error to a more informative message
              const error = err instanceof Error ? err : new Error(String(err));
              console.error(`Error processing ${key}:`, error);
              throw new Error(`Error processing ${key}: ${error.message}`);
            }
          })
        );

        const newCounts = {
          hostCount: 0,
          itemCount: 0,
          triggerCount: 0,
          enabledTriggers: 0,
          disabledTriggers: 0,
          templateCount: 0,
          userCount: 0,
          eventCount: 0,
          resolvedevent: 0,
          problemevent: 0,
          enabledHosts: 0,
          disabledHosts: 0,
        };

        let errors: string[] = [];
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const { key, data } = result.value;
            // Validate data before using it
            if (!Array.isArray(data)) {
              console.warn(`${key}: Expected array but got:`, data);
              return;
            }
            switch (key) {
              case "host":
                newCounts.hostCount = data.length;
                newCounts.enabledHosts = data.filter(
                  (host: IDevice) => host.status === 1
                ).length;
                newCounts.disabledHosts = data.filter(
                  (host: IDevice) => host.status === 0
                ).length;
                break;
              case "item":
                newCounts.itemCount = data.length;
                break;
              case "trigger":
                newCounts.triggerCount = data.length;
                newCounts.enabledTriggers = data.filter(
                  (trigger: ITrigger) => trigger.enabled === true
                ).length;
                newCounts.disabledTriggers = data.filter(
                  (trigger: ITrigger) => trigger.enabled === false
                ).length;
                break;
              case "template":
                newCounts.templateCount = data.length;
                break;
              case "user":
                newCounts.userCount = data.length;
                break;
              case "event":
                newCounts.eventCount = data.length;
                newCounts.resolvedevent = data.filter(
                  (event: IEvent) => event.status === "RESOLVED"
                ).length;
                newCounts.problemevent = data.filter(
                  (event: IEvent) => event.status === "PROBLEM"
                ).length;
                break;
            }
          } else {
            const errorMessage = result.reason?.message || "Unknown error";
            errors.push(`${errorMessage}`);
            console.error(`Failed to fetch: ${errorMessage}`);
          }
        });

        if (errors.length > 0) {
          // Set error state but don't prevent setting the counts we did get
          setError(`Some data failed to load: ${errors.join(", ")}`);
        }

        setCounts(newCounts);
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

  const tableData: TableData[] = [
    {
      id: 1,
      name: "Number of users (enabled/disabled/templates)",
      value: counts.userCount,
      enabled: "15",
      disabled: "16",
      template: counts.templateCount,
    },
    {
      id: 2,
      name: "Number of hosts (enabled/disabled)",
      value: counts.hostCount,
      enabled: counts.enabledHosts.toString(),
      disabled: counts.disabledHosts.toString(),
    },
    {
      id: 3,
      name: "Number of items (enabled/disabled)",
      value: counts.itemCount,
      enabled: "15",
      disabled: "16",
    },
    {
      id: 4,
      name: "Number of triggers (enabled/disabled)",
      value: counts.triggerCount,
      enabled: counts.enabledTriggers.toString(),
      disabled: counts.disabledTriggers.toString(),
    },
    {
      id: 5,
      name: "Number of events (resolved/problem)",
      value: counts.eventCount,
      problem: counts.problemevent.toString(),
      resolved: counts.resolvedevent.toString(),
      enabled: "",
      disabled: ""
    },
  ];

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
            {tableData.map((row) => (
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
                  {row.name.includes('event') ? (
                    <>
                      <Typography component="span" sx={{ color: 'green', fontSize: '0.8rem' }}>
                        {row.resolved}
                      </Typography>
                      /
                      <Typography component="span" sx={{ color: 'red', fontSize: '0.8rem' }}>
                        {row.problem}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography component="span" sx={{ color: 'green', fontSize: '0.8rem' }}>
                        {row.enabled}
                      </Typography>
                      /
                      <Typography component="span" sx={{ color: 'red', fontSize: '0.8rem' }}>
                        {row.disabled}
                      </Typography>
                    </>
                  )}
                  {row.template && (
                    <Typography component="span" sx={{ fontSize: '0.8rem' }}>
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
