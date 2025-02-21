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
         // const response = await fetch("http://localhost:3000/event");
         const response = await fetch(`${import.meta.env.VITE_API_URL}/event`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
         );

       

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
    return events.filter((event) => event.status === filter);
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

  return (
    <Box padding={1}>
      <Box sx={{ display: "flex", flexDirection: "row", px: 1, pt: 0, mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 2, fontWeight: "medium" }}>
          Event
        </Typography>
        <Chip
          label="ALL"
          size="small"
          sx={{ px: 2, m: 0.5, color: "white", backgroundColor: "blue" }}
          onClick={() => setFilter("ALL")}
        />
        <Chip
          label="PROBLEM"
          size="small"
          sx={{ m: 0.5, color: "white", backgroundColor: "red" }}
          onClick={() => setFilter("PROBLEM")}
        />
        <Chip
          label="RESOLVED"
          size="small"
          sx={{ m: 0.5, backgroundColor: "#2E7D32", color: "white" }}
          onClick={() => setFilter("RESOLVED")}
        />
      </Box>
      <Box sx={{ overflow: "auto", maxHeight: "200px" }}>
        {getFilteredEvents().length === 0 ? (
          <Typography align="center" sx={{ mt: 2 }}>
            No events found
          </Typography>
        ) : (
          getFilteredEvents().map((event) => (
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
