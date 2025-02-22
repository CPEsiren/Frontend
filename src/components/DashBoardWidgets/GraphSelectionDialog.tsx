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
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { SearchIcon } from "lucide-react";

interface GraphSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (graphName: string) => void;
}

const GraphSelectionDialog: React.FC<GraphSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [availableGraphs, setAvailableGraphs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGraphs = async () => {
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
        if (
          result.status === "success" &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const host = result.data[0];

          const now = new Date();
          const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);

          const dataRes = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/data/between?startTime=${fifteenMinutesAgo.toISOString()}&endTime=${now.toISOString()}&host_id=${
              host._id
            }`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!dataRes.ok) throw new Error("Failed to fetch graph data");

          const dataResult = await dataRes.json();
          if (
            dataResult.status === "success" &&
            Array.isArray(dataResult.data)
          ) {
            const sortedData = dataResult.data[0].items.sort((a: any, b: any) =>
              a.item_id.item_name.localeCompare(b.item_id.item_name)
            );
            setAvailableGraphs(sortedData);
          }
        }
      } catch (error) {
        console.error("Error fetching graphs:", error);
      }
    };

    fetchGraphs();
  }, [open]);

  const filteredGraphs = availableGraphs.filter((graph) =>
    graph.item_id.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Graph</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search graphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredGraphs.length > 0 ? (
            filteredGraphs.map((graph) => (
              <ListItem
                key={graph.item_id.item_name}
                onClick={() => onSelect(graph.item_id.item_name)}
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
                  primary={graph.item_id.item_name}
                  secondary={`Unit: ${graph.item_id.unit}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No matching graphs found"
                sx={{ textAlign: "center", color: "text.secondary" }}
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default GraphSelectionDialog;
