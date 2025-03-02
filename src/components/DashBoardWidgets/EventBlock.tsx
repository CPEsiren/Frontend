import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Container,
} from "@mui/material";
import { IEvent } from "../../interface/InterfaceCollection";

const EventBlock = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchLatestEvents = async () => {
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
        setEvents(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEvents();
  }, []);

  const getFilteredEvents = () => {
    if (filter === "ALL") return events.slice(0, 5);
    return events.filter((event) => event.status === filter).slice(0, 5);
  };

  const formatTimeInThaiTimezone = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        width="100%"
      >
        <CircularProgress />
      </Box>
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
      {/* Header with filter chips */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          px: 1,
          pt: 1,
          pb: 1,
          flexShrink: 0, // Prevent header from shrinking
          pl: 2,
        }}
      >
        <Typography variant="h6" sx={{ mr: 2, fontWeight: "medium" }}>
          Event
        </Typography>
        <Chip
          label="ALL"
          size="small"
          sx={{
            px: 2,
            m: 0.5,
            color: "white",
            backgroundColor: filter === "ALL" ? "blue" : "gray",
          }}
          onClick={() => setFilter("ALL")}
        />
        <Chip
          label="PROBLEM"
          size="small"
          sx={{
            m: 0.5,
            color: "white",
            backgroundColor: filter === "PROBLEM" ? "red" : "gray",
          }}
          onClick={() => setFilter("PROBLEM")}
        />
        <Chip
          label="RESOLVED"
          size="small"
          sx={{
            m: 0.5,
            color: "white",
            backgroundColor: filter === "RESOLVED" ? "#2E7D32" : "gray",
          }}
          onClick={() => setFilter("RESOLVED")}
        />
        <Chip
          label="EVENT"
          size="small"
          sx={{
            m: 0.5,
            px: 1,
            color: "white",
            backgroundColor: filter === "EVENT" ? "#0288D1" : "gray",
          }}
          onClick={() => setFilter("EVENT")}
        />
      </Box>

      {/* Event cards container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 1,
          pb: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {getFilteredEvents().length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography align="center" sx={{ color: "text.secondary" }}>
              No {filter === "ALL" ? "Events" : filter} found
            </Typography>
          </Box>
        ) : (
          getFilteredEvents().map((event, index) => (
            <Card
              key={event._id}
              sx={{
                mb: index < getFilteredEvents().length - 1 ? 1 : 0,
                flexShrink: 0, // Prevent card from shrinking
              }}
            >
              <CardContent
                sx={{
                  backgroundColor:
                    event.status === "EVENT"
                      ? "#0288D1"
                      : event.status === "RESOLVED"
                      ? "#2E7D32"
                      : event.status === "PROBLEM"
                      ? "red"
                      : "inherit", // default fallback color
                  padding: "8px 16px", // Slightly reduced padding
                  "&:last-child": {
                    paddingBottom: "8px", // Override MUI's default padding
                  },
                }}
              >
                <Typography variant="body2" sx={{ color: "white" }}>
                  {formatTimeInThaiTimezone(event.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {event.message}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default EventBlock;
