import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StorageIcon from "@mui/icons-material/Storage";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Item {
  _id: string;
  item_name: string;
  unit?: string;
}

interface Host {
  _id: string;
  hostname: string;
  ip_address: string;
  snmp_port: string;
  snmp_version: string;
  snmp_community: string;
  hostgroup: string;
  status: number;
  items: Item[];
  interfaces: any[];
  createAt: string;
  updateAt: string;
}

interface GraphSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (itemId: string, hostId: string) => void;
}

const GraphSelectionDialog: React.FC<GraphSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [step, setStep] = useState<number>(1); // 1 for host selection, 2 for graph selection
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [hostSearchQuery, setHostSearchQuery] = useState<string>("");
  const [graphSearchQuery, setGraphSearchQuery] = useState<string>("");

  // Fetch hosts when dialog opens
  useEffect(() => {
    const fetchHosts = async () => {
      if (!open) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/host`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch hosts");

        const result = await res.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          // Sort hosts by hostname when setting the initial data
          const sortedHosts = result.data.sort((a: Host, b: Host) => 
            a.hostname.toLowerCase().localeCompare(b.hostname.toLowerCase())
          );
          setHosts(sortedHosts);
        }
      } catch (error) {
        console.error("Error fetching hosts:", error);
      }
    };

    fetchHosts();
  }, [open]);

  const filteredHosts = hosts
    .filter((host) =>
      host.hostname.toLowerCase().includes(hostSearchQuery.toLowerCase())
    )
    .sort((a: Host, b: Host) => 
      a.hostname.toLowerCase().localeCompare(b.hostname.toLowerCase())
    );

  const filteredGraphs = (selectedHost?.items || [])
    .filter((item) =>
      item.item_name.toLowerCase().includes(graphSearchQuery.toLowerCase())
    )
    .sort((a: Item, b: Item) => 
      a.item_name.toLowerCase().localeCompare(b.item_name.toLowerCase())
    );

  const handleHostSelect = (host: Host) => {
    // Sort items array when selecting a host
    const sortedItems = [...host.items].sort((a: Item, b: Item) =>
      a.item_name.toLowerCase().localeCompare(b.item_name.toLowerCase())
    );
    setSelectedHost({ ...host, items: sortedItems });
    setStep(2);
  };

  const handleGraphSelect = (item: Item) => {
    if (selectedHost) {
      setGraphSearchQuery(""); // Reset the graph search query
      onSelect(item._id, selectedHost._id);
      onClose();
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedHost(null);
    setGraphSearchQuery("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          {step === 2 && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          {step === 1 ? "Select Host" : "Select Graph"}
        </Box>
      </DialogTitle>
      <DialogContent>
        {step === 1 ? (
          // Host Selection Step
          <>
            <TextField
              fullWidth
              size="small"
              placeholder="Search hosts..."
              value={hostSearchQuery}
              onChange={(e) => setHostSearchQuery(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {filteredHosts.length > 0 ? (
                filteredHosts.map((host) => (
                  <ListItem
                    key={host._id}
                    onClick={() => handleHostSelect(host)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={host.hostname}
                      secondary={`${host.ip_address}:${host.snmp_port} (${host.hostgroup})`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No hosts found"
                    sx={{ textAlign: "center", color: "text.secondary" }}
                  />
                </ListItem>
              )}
            </List>
          </>
        ) : (
          // Graph Selection Step
          <>
            {selectedHost && (
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Host: {selectedHost.hostname} ({selectedHost.ip_address})
              </Typography>
            )}
            <TextField
              fullWidth
              size="small"
              placeholder="Search graphs..."
              value={graphSearchQuery}
              onChange={(e) => setGraphSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {filteredGraphs.length > 0 ? (
                filteredGraphs.map((item) => (
                  <ListItem
                    key={item._id}
                    onClick={() => handleGraphSelect(item)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <ShowChartIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.item_name}
                      secondary={`Unit: ${item.unit || 'N/A'}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No graphs found"
                    sx={{ textAlign: "center", color: "text.secondary" }}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GraphSelectionDialog;