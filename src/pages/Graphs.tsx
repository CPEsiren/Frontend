import {
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  keyframes,
  ListSubheader,
  MenuItem,
  Pagination,
  Paper,
  Popover,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import React, { useEffect, useState } from "react";
import MetricGraph, { Items } from "../components/graphComponent/MetricGraph";
import FilterListIcon from "@mui/icons-material/FilterList";
import { SearchIcon } from "lucide-react";
import AutoModeIcon from "@mui/icons-material/AutoMode";

interface IItem {
  item_name: string;
}

interface IHost {
  host_id: string;
  hostname: string;
  hostgroup: string;
  items: IItem[];
}

interface IGroupHost {
  [key: string]: IHost[];
}

interface SelectedItems {
  [key: string]: boolean;
}

const Graphs: React.FC = () => {
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  //Select Host
  const [hosts, setHosts] = useState<IHost[]>([]);
  const [selectedHost, setSelectedHost] = useState("");
  const [hostgroupHosts, setHostgroupHosts] = useState<IGroupHost>({});

  const fetchHosts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/host`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 404) {
        setHosts([
          {
            host_id: "not-found",
            hostname: "Host Not Found",
            hostgroup: "Host Not Found",
            items: [],
          },
        ]);
        setSelectedHost("not-found");
        return;
      }

      const result = await res.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        const listHost = result.data.map(
          (host: {
            _id: string;
            hostname: string;
            hostgroup: string;
            items: IItem[];
          }) => {
            return {
              host_id: host._id,
              hostname: host.hostname,
              hostgroup: host.hostgroup,
              items: [...host.items].sort((a: IItem, b: IItem) =>
                a.item_name.localeCompare(b.item_name)
              ),
            };
          }
        );
        // Sort hosts alphabetically by hostname
        const sortedHosts = listHost.sort((a: IHost, b: IHost) =>
          a.hostname.localeCompare(b.hostname)
        );
        setHosts(sortedHosts);
        setSelectedHost(sortedHosts[0].hostname);

        // Group hosts by hostgroup
        const groupHosts: IGroupHost = {};
        sortedHosts.forEach((host: IHost) => {
          if (!groupHosts[host.hostgroup]) {
            groupHosts[host.hostgroup] = [];
          }
          groupHosts[host.hostgroup].push(host);
        });

        setHostgroupHosts(groupHosts);

        // Set the URL and fetch data immediately after setting the host
        const initialUrl = `${
          import.meta.env.VITE_API_URL
        }/data/between?startTime=${selectedDateTimeStart.toISOString()}&endTime=${selectedDateTimeEnd.toISOString()}&host_id=${
          sortedHosts[0].host_id
        }`;
        setUrl(initialUrl);
      }
    } catch (error) {
      // const errorMessage =
      //   error instanceof Error ? error.message : "An unknown error occurred";
      // console.log(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchHosts();
  }, []);

  // Update the useEffect for host changes
  useEffect(() => {
    const host = hosts.find((host) => host.hostname === selectedHost);
    if (host) {
      setHostNow(host);

      // Update URL with the new host's ID
      setUrl(
        `${
          import.meta.env.VITE_API_URL
        }/data/between?startTime=${selectedDateTimeStart.toISOString()}&endTime=${selectedDateTimeEnd.toISOString()}&host_id=${
          host.host_id
        }`
      );

      // Reset filters for new host
      const initialSelectedItems: SelectedItems = {};
      host.items.forEach((item) => {
        initialSelectedItems[item.item_name] = true;
      });
      setSelectedItems(initialSelectedItems);
      localStorage.setItem(
        "graphFilters",
        JSON.stringify(initialSelectedItems)
      );
    } else {
      setHostNow({
        host_id: "",
        hostname: "",
        hostgroup: "",
        items: [],
      });
    }
  }, [selectedHost]);

  // Update handleHostChange to trigger a data refresh
  const handleHostChange = (event: SelectChangeEvent<string>) => {
    setSelectedHost(event.target.value);
    setData([]); // Clear existing data
    setCurrentPage(1); // Reset to first page
  };

  const [hostNow, setHostNow] = useState<IHost>({
    host_id: "",
    hostname: "",
    hostgroup: "",
    items: [],
  });

  //DateTime Range
  const [selectedDateTimeStart, setSelectedDateTimeStart] = useState<Date>(
    () => {
      const now = new Date();
      return new Date(now.setMinutes(now.getMinutes() - 15));
    }
  );

  const [selectedDateTimeEnd, setSelectedDateTimeEnd] = useState<Date>(
    new Date()
  );

  //Now Range Data
  const [rangeTime, setRangeTime] = useState<string>("15 m");
  const setTimeRange = () => {
    const itemDiff =
      selectedDateTimeEnd.getTime() - selectedDateTimeStart.getTime();
    const diff = Math.floor(itemDiff / 1000);
    if (diff < 60) {
      setRangeTime(`${diff} s`);
    } else if (diff < 3600) {
      setRangeTime(`${Math.floor(diff / 60)} m`);
    } else if (diff < 86400) {
      setRangeTime(`${Math.floor(diff / 3600)} h`);
    } else if (diff < 2592000) {
      setRangeTime(`${Math.floor(diff / 86400)} d`);
    } else if (diff < 15768000) {
      setRangeTime(`${Math.floor(diff / 2592000)} M`);
    }
  };

  //Set Last Time
  const lastTime: string[] = [
    "Last 15 Minutes",
    "Last 30 Minutes",
    "Last 1 Hour",
    "Last 3 Hours",
    "Last 6 Hours",
    "Last 12 Hours",
    "Last 1 Day",
    "Last 3 Days",
    "Last 7 Days",
    "Last 1 Month",
    "Last 6 Months",
  ];
  const [selectedLastTime, setSelectedLastTime] = useState<string>(lastTime[0]);
  const handleLastTimeChange = (event: SelectChangeEvent<string>) => {
    const time = event.target.value;
    setSelectedLastTime(time);
  };
  useEffect(() => {
    const setLastTime = () => {
      const dateTimeStart = new Date(selectedDateTimeEnd);
      const dateTimeEnd = new Date(selectedDateTimeEnd);

      switch (selectedLastTime) {
        case "Last 15 Minutes":
          dateTimeStart.setMinutes(dateTimeEnd.getMinutes() - 15);
          break;
        case "Last 30 Minutes":
          dateTimeStart.setMinutes(dateTimeEnd.getMinutes() - 30);
          break;
        case "Last 1 Hour":
          dateTimeStart.setHours(dateTimeEnd.getHours() - 1);
          break;
        case "Last 3 Hours":
          dateTimeStart.setHours(dateTimeEnd.getHours() - 3);
          break;
        case "Last 6 Hours":
          dateTimeStart.setHours(dateTimeEnd.getHours() - 6);
          break;
        case "Last 12 Hours":
          dateTimeStart.setHours(dateTimeEnd.getHours() - 12);
          break;
        case "Last 1 Day":
          dateTimeStart.setDate(dateTimeEnd.getDate() - 1);
          break;
        case "Last 3 Days":
          dateTimeStart.setDate(dateTimeEnd.getDate() - 3);
          break;
        case "Last 7 Days":
          dateTimeStart.setDate(dateTimeEnd.getDate() - 7);
          break;
        case "Last 1 Month":
          dateTimeStart.setMonth(dateTimeEnd.getMonth() - 1);
          break;
        case "Last 6 Months":
          dateTimeStart.setMonth(dateTimeEnd.getMonth() - 6);
          break;
        default:
          // If no match, don't change the date
          return;
      }
      setSelectedDateTimeStart(dateTimeStart);
    };

    setLastTime();
  }, [selectedLastTime]);

  //Apply Button
  const handleApplyClick = () => {
    setUrl(
      `${
        import.meta.env.VITE_API_URL
      }/data/between?startTime=${selectedDateTimeStart.toISOString()}&endTime=${selectedDateTimeEnd.toISOString()}&host_id=${
        hostNow.host_id
      }`
    );
    setIsAuto(false);
    setTimeRange();
  };

  // Modify the reset button click handler to include filter reset
  const handleResetClick = () => {
    setSelectedLastTime(lastTime[0]);
    setSelectedDateTimeEnd(new Date());
    setSelectedDateTimeStart(() => {
      const now = new Date();
      return new Date(now.setMinutes(now.getMinutes() - 15));
    });
    setGraphsPerPage(5);
    setColumnsPerRow(1);
    setIsAuto(true);
    setRangeTime("15 m");
  };

  //Fetch Data
  const [isAuto, setIsAuto] = useState(true);
  const [url, setUrl] = useState<string>("");
  const [data, setData] = useState<Items[]>([]);

  useEffect(() => {
    const updateUrlAndFetch = async () => {
      if (isAuto) {
        const now = new Date();
        setSelectedDateTimeEnd(now);
        const past = new Date(now.getTime() - 15 * 60000);

        setSelectedDateTimeStart(past); // 15 minutes ago

        // Check if hosts array is not empty before accessing the first element
        if (hosts.length > 0) {
          const host = hosts.find((host) => host.hostname === selectedHost);
          setUrl(
            `${
              import.meta.env.VITE_API_URL
            }/data/between?startTime=${past.toISOString()}&endTime=${now.toISOString()}&host_id=${
              host?.host_id
            }`
          );
        } else {
          console.warn("No hosts available");
          // Optionally, you can set a default URL or handle this case differently
        }
      }
    };
    updateUrlAndFetch();
    const interval = setInterval(updateUrlAndFetch, 10000);
    return () => clearInterval(interval);
  }, [isAuto, hosts, selectedHost]);

  const fetchData = async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 404) {
        setData([]);
        return;
      }

      const result = await res.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const sortedData = result.data[0].items.sort((a: Items, b: Items) => {
          return a.item_id.item_name.localeCompare(b.item_id.item_name);
        });
        setData(sortedData);
      } else {
        setData([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);

  //Filter Date
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("graphFilters");
    if (savedFilters) {
      setSelectedItems(JSON.parse(savedFilters));
    } else {
      // If no saved filters, initialize with all items selected
      const initialSelectedItems: SelectedItems = {};
      hostNow.items.forEach((item) => {
        initialSelectedItems[item.item_name] = true;
      });
      setSelectedItems(initialSelectedItems);
      // localStorage.setItem(
      //   "graphFilters",
      //   JSON.stringify(initialSelectedItems)
      // );
    }
  }, [data]); // Add data as dependency to update when items change

  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const filteredItems = data.filter(
    (item) => selectedItems[item.item_id.item_name]
  );
  const filteredItemsForSearch = hostNow.items
    .filter((item: IItem) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: IItem, b: IItem) => a.item_name.localeCompare(b.item_name));
  // Update localStorage whenever filters change
  const handleCheckboxChange = (itemName: string) => {
    const newSelectedItems = {
      ...selectedItems,
      [itemName]: !selectedItems[itemName],
    };
    setSelectedItems(newSelectedItems);
    localStorage.setItem("graphFilters", JSON.stringify(newSelectedItems));
  };

  const handleSelectAll = () => {
    const newSelectedItems = { ...selectedItems };
    filteredItemsForSearch.forEach((item) => {
      newSelectedItems[item.item_name] = true;
    });
    setSelectedItems(newSelectedItems);
    localStorage.setItem("graphFilters", JSON.stringify(newSelectedItems));
  };

  const handleDeselectAll = () => {
    const newSelectedItems = { ...selectedItems };
    filteredItemsForSearch.forEach((item) => {
      newSelectedItems[item.item_name] = false;
    });
    setSelectedItems(newSelectedItems);
    localStorage.setItem("graphFilters", JSON.stringify(newSelectedItems));
  };

  //Graph
  const [graphsPerPage, setGraphsPerPage] = useState(5);
  const [columnsPerRow, setColumnsPerRow] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  // Calculate the current graphs to display
  const indexOfLastGraph = currentPage * graphsPerPage;
  const indexOfFirstGraph = indexOfLastGraph - graphsPerPage;
  const currentGraphs = filteredItems.slice(
    indexOfFirstGraph,
    indexOfLastGraph
  );
  // Change page
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  // Add these new handlers
  const handleGraphsPerPageChange = (event: SelectChangeEvent<number>) => {
    setGraphsPerPage(event.target.value as number);
    setCurrentPage(1); // Reset to first page when changing graphs per page
  };
  const handleColumnsPerRowChange = (event: SelectChangeEvent<number>) => {
    setColumnsPerRow(event.target.value as number);
  };

  const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

  //Loading State
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            {/* Select Host */}
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
                {Object.entries(hostgroupHosts).map(([category, hosts]) => [
                  <ListSubheader
                    key={category}
                    sx={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "text.secondary",
                      backgroundColor: "background.paper",
                      lineHeight: "36px",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {category}
                  </ListSubheader>,
                  ...hosts.map((host: IHost) => (
                    <MenuItem
                      key={host.host_id}
                      value={host.hostname}
                      disabled={host.host_id === "not-found"}
                      sx={{
                        fontSize: 14,
                        pl: 4,
                        py: 1,
                        "&.Mui-selected": {
                          backgroundColor: "action.selected",
                          "&:hover": { backgroundColor: "action.hover" },
                        },
                      }}
                    >
                      {host.hostname}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
            {/* Filter */}
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
                    key={item.item_name}
                    control={
                      <Checkbox
                        sx={{
                          color: "black",
                          padding: "4px",
                          "&.Mui-checked": {
                            color: "blue", // Set background color when checked
                          },
                        }}
                        checked={selectedItems[item.item_name] || false}
                        onChange={() => handleCheckboxChange(item.item_name)}
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
                        {item.item_name}
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

          {/* Date and Time */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pt: "10px",
            }}
          >
            <DateTimePicker
              label="Start"
              sx={{ mr: 1, backgroundColor: "white" }}
              format="dd/MM/yyyy HH:mm"
              ampm={false}
              value={selectedDateTimeStart}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDateTimeStart(newValue);
                  setIsAuto(false);
                }
              }}
              disableFuture
              maxDateTime={selectedDateTimeEnd}
            ></DateTimePicker>
            <DateTimePicker
              label="End"
              sx={{ backgroundColor: "white" }}
              format="dd/MM/yyyy HH:mm"
              ampm={false}
              value={selectedDateTimeEnd}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDateTimeEnd(newValue);
                  setIsAuto(false);
                }
              }}
              disableFuture
            ></DateTimePicker>
            {/* Cheack Box For Auto */}
            <Box sx={{ ml: 1 }}>
              <Badge color={isAuto ? "success" : "error"} variant="dot">
                <AutoModeIcon
                  sx={{
                    animation: isAuto
                      ? `${rotateAnimation} 2s linear infinite`
                      : "none",
                    mr: 0.5,
                  }}
                />
              </Badge>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pt: "10px",
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                backgroundColor: "white",
                mr: 1,
              }}
            >
              <InputLabel>Graphs per page</InputLabel>
              <Select
                value={graphsPerPage}
                label="Graphs per page"
                onChange={handleGraphsPerPageChange}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 100,
                backgroundColor: "white",
                mr: 1,
              }}
            >
              <InputLabel>Columns</InputLabel>
              <Select
                value={columnsPerRow}
                label="Columns"
                onChange={handleColumnsPerRowChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{
                minWidth: 20,
                backgroundColor: "white",
              }}
            >
              <InputLabel>Presets</InputLabel>
              <Select
                value={selectedLastTime}
                onChange={handleLastTimeChange}
                label="Presets"
              >
                {lastTime.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyClick}
              sx={{
                backgroundColor: "#3533D3",
                color: "white",
                "&:hover": {
                  backgroundColor: "#2826B5",
                },
                ml: 1,
                mr: 1,
              }}
            >
              Apply
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleResetClick}
              sx={{
                backgroundColor: "#F26000",
                color: "white",
                "&:hover": {
                  backgroundColor: "#F24000",
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
        {/* Graph */}
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {data.length === 0 ? (
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  minHeight: "200px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">No data available</Typography>
              </Paper>
            </Grid>
          ) : (
            currentGraphs.map((item: Items) => (
              <Grid
                item
                xs={12}
                sm={12 / columnsPerRow}
                key={item.item_id.item_name}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    height: { xs: "400px", sm: "450px", md: "500px" },
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      {item.item_id.item_name}
                    </Typography>
                    <Typography variant="caption" gutterBottom sx={{ ml: 0.5 }}>
                      (
                      {item.item_id.type === "counter"
                        ? `${item.item_id.unit}/s`
                        : item.item_id.unit}
                      )
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      width: "100%",
                      height: "calc(100% - 40px)",
                    }}
                  >
                    <MetricGraph item={item} selectedLastTime={rangeTime} />
                  </Box>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
        {filteredItems.length > graphsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              mb: 2,
              pb: 3,
              pt: 1,
            }}
          >
            <Pagination
              count={Math.ceil(filteredItems.length / graphsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default Graphs;
