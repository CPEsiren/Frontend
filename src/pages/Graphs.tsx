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
  Typography,
  Alert,
  IconButton,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import MetricGraph, { Items } from "../components/graphComponent/MetricGraph";

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

interface SelectedItems {
  [key: string]: boolean;
}

const STORAGE_KEY = "graph-filter-state";

const Graphs = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load saved filter state
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const { hostId, selections } = JSON.parse(savedState);
          if (hostId && selections) {
            setSelectedHost(hostId);
            setSelectedItems(selections);
          }
        }
      } catch (error) {
        console.error("Error loading saved filter state:", error);
      }
    };

    loadSavedState();
  }, []);

  // Save filter state whenever it changes
  useEffect(() => {
    if (selectedHost && Object.keys(selectedItems).length > 0) {
      try {
        const stateToSave = {
          hostId: selectedHost,
          selections: selectedItems,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Error saving filter state:", error);
      }
    }
  }, [selectedHost, selectedItems]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const response = await fetch("http://127.0.0.1:3000/data");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.status === "success" && Array.isArray(result.data)) {
          const sortedData = result.data
            .filter((host): host is Host => Boolean(host?._id?._id))
            .map((host: Host) => ({
              ...host,
              items: [...(host.items || [])].sort((a: Items, b: Items) =>
                a.item_id.item_name.localeCompare(b.item_id.item_name)
              ),
            }));

          setHosts(sortedData);

          // Only initialize if no saved state exists
          if (!selectedHost && sortedData.length > 0) {
            const firstHost = sortedData[0]._id._id;
            setSelectedHost(firstHost);

            // Check if we have saved selections for this host
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (!savedState && sortedData[0].items) {
              const initialSelectedItems = sortedData[0].items.reduce(
                (acc, item) => ({
                  ...acc,
                  [item.item_id.item_name]: true,
                }),
                {}
              );
              setSelectedItems(initialSelectedItems);
            }
          }
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedHost]);

  const handleHostChange = (event: SelectChangeEvent<string>) => {
    const newHostId = event.target.value;
    setSelectedHost(newHostId);

    // Load saved selections for the new host if they exist
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { hostId, selections } = JSON.parse(savedState);
        if (hostId === newHostId) {
          setSelectedItems(selections);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading saved selections:", error);
    }

    // If no saved selections, initialize with all selected
    const newHost = hosts.find((host) => host._id._id === newHostId);
    if (newHost?.items) {
      const newSelectedItems = newHost.items.reduce(
        (acc, item) => ({
          ...acc,
          [item.item_id.item_name]: true,
        }),
        {}
      );
      setSelectedItems(newSelectedItems);
    }
  };

  const handleCheckboxChange = (itemName: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleSelectAll = () => {
    const newSelectedItems = { ...selectedItems };
    // Only update items that match the search term
    filteredItemsForSearch.forEach((item) => {
      newSelectedItems[item.item_id.item_name] = true;
    });
    setSelectedItems(newSelectedItems);
  };
  
  const handleDeselectAll = () => {
    const newSelectedItems = { ...selectedItems };
    // Only update items that match the search term
    filteredItemsForSearch.forEach((item) => {
      newSelectedItems[item.item_id.item_name] = false;
    });
    setSelectedItems(newSelectedItems);
  };

  const selectedHostData = hosts.find((host) => host._id._id === selectedHost);

  const sortedItems = React.useMemo(() => {
    if (!selectedHostData?.items) return [];
    return [...selectedHostData.items].sort((a: Items, b: Items) =>
      a.item_id.item_name.localeCompare(b.item_id.item_name)
    );
  }, [selectedHostData]);

  const filteredItems = sortedItems.filter(
    (item) => selectedItems[item.item_id.item_name]
  );

  const filteredItemsForSearch = sortedItems.filter((item) =>
    item.item_id.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Loading data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Error loading data: {error}</Alert>
        </Box>
      </Container>
    );
  }

  if (hosts.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">No host data available</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            mb: 4,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

          <IconButton
            onClick={handleFilterClick}
            size="large"
            sx={{
              ml: 2,
              backgroundColor: open ? "action.selected" : "transparent",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <FilterListIcon />
          </IconButton>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                width: "300px",
                p: 2,
                maxHeight: "70vh",
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filter Graphs
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 0 }}>
              <Button
                size="small"
                onClick={handleSelectAll}
                sx={{ mr: 1, color: "black" }}
              >
                Select All
              </Button>
              <Button
                size="small"
                onClick={handleDeselectAll}
                sx={{ color: "black" }}
              >
                Deselect All
              </Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <FormGroup
              sx={{
                maxHeight: "1500vh",
                overflow: "auto",
                "& .MuiFormControlLabel-root": {
                  marginLeft: 0,
                  marginRight: 0,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                  padding: "8px 0",
                },
              }}
            >
              {filteredItemsForSearch.map((item) => (
                <FormControlLabel
                  key={item.item_id.item_name}
                  control={
                    <Checkbox
                      sx={{
                        color: "black",
                        padding: "4px",
                        "&.Mui-checked": {
                          color: "blue", // Set background color when checked
                        },
                      }}
                      checked={selectedItems[item.item_id.item_name] || false}
                      onChange={() =>
                        handleCheckboxChange(item.item_id.item_name)
                      }
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        display: "block",
                        width: "100%",
                        paddingLeft: "4px",
                      }}
                    >
                      {item.item_id.item_name}
                    </Typography>
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                />
              ))}
            </FormGroup>
          </Popover>
        </Box>

        <Grid container spacing={3}>
          {filteredItems.map((item: Items) => (
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
