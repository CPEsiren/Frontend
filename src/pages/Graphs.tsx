import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  Paper,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import MetricGraph, {
  Items,
} from "../components/graphComponent/MetricGraph";

interface HostId {
  _id: string;
  hostname: string;
}

interface Host {
  _id: HostId;
  items: Items[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: Host[];
}

const Graphs = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/data");
        const result: ApiResponse = await response.json();

        if (result.status === "success") {
          const sortedData = result.data.map((host: Host) => ({
            ...host,
            items: [...host.items].sort((a: Items, b: Items) =>
              a.item_id.item_name.localeCompare(b.item_id.item_name)
            ),
          }));

          setHosts(sortedData);
          if (sortedData.length > 0) {
            setSelectedHost(sortedData[0]._id._id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleHostChange = (event: SelectChangeEvent<string>) => {
    setSelectedHost(event.target.value);
  };

  const selectedHostData = hosts.find((host) => host._id._id === selectedHost);

  const sortedItems = React.useMemo(() => {
    if (!selectedHostData?.items) return [];
    return [...selectedHostData.items].sort((a: Items, b: Items) =>
      a.item_id.item_name.localeCompare(b.item_id.item_name)
    );
  }, [selectedHostData]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", mb: 4 }}>
          <FormControl size="small">
            <Select
              value={selectedHost}
              onChange={handleHostChange}
              sx={{
                minWidth: 200,
                backgroundColor: "white",
                "& .MuiSelect-select": {
                  fontSize: 14,
                },
              }}
            >
              {hosts.map((host: Host) => (
                <MenuItem key={host._id._id} value={host._id._id}>
                  {host._id.hostname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {sortedItems.map((item: Items) => (
            <Grid item xs={12} key={item.item_id.item_name}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MetricGraph item={item} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Graphs;
