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

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/event");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.events && result.events.length > 0) {
          setEvents(result.events.slice(0, 5)); // Get only the latest 5 events
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

    fetchLatestEvents();
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
        minHeight="200px"
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
          <Typography
            color="error"
            variant="h6"
          >{`Error: ${error}`}</Typography>
        </Box>
      </Container>
    );
  }

  if (events.length === 0) {
    return (
      <Container>
        <Typography align="center" sx={{ mt: 2 }}>
          No recent events found
        </Typography>
      </Container>
    );
  }

  return (
    <Box padding={1}>
      <Box sx={{ display: "flex", flexDirection: "row", px: 1, pt: 0, mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 2, fontWeight: "medium" }}>
          Event
        </Typography>
        <Chip
          label="PROBLEM"
          size="small"
          sx={{ m: 0.5, color: "white", backgroundColor: "red" }}
        />
        <Chip
          label="RESOLVED"
          size="small"
          sx={{ m: 0.5, backgroundColor: "#2E7D32", color: "white" }}
        />
      </Box>
      <Box
        sx={{
          overflow: "auto",
          maxHeight: "200px",
        }}
      >
        {events.map((event) => (
          <Card key={event._id} sx={{ mb: 0.5, p: 0 }}>
            <CardContent
              sx={{
                backgroundColor:
                  event.status === "RESOLVED" ? "#2E7D32" : "red",
              }}
            >
              <Typography variant="body2" sx={{ color: "white" }}>
                {formatTimeInThaiTimezone(event.createdAt)}
              </Typography>
              <Typography variant="h6" sx={{ color: "white" }}>
                {event.trigger_id?.host_id?.hostname}
              </Typography>
              <Typography variant="body2" sx={{ color: "white" }}>
                {event.message}
              </Typography>
              {/* <Chip
              label={event.status}
              color={getStatusColor(event.status)}
              size="small"
              sx={{ mt: 1 }}
            /> */}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default EventBlock;
