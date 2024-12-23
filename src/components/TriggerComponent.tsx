import React, { useState, useEffect } from "react";
import {
  Table,
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import { ITrigger } from "../interface/InterfaceCollection";

interface GroupedTriggers {
  [hostId: string]: {
    hostname: string;
    triggers: ITrigger[];
  };
}

interface EditTriggerForm {
  trigger_name: string;
  severity: string;
  ComparisonOperator: string;
  valuetrigger: number;
  enabled: boolean;
}

const formatDate = (date: string | Date) => {
  const englishMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = englishMonths[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${day} ${month} ${year}`;
};

const TriggerComponent = () => {
  const [groupedTriggers, setGroupedTriggers] = useState<GroupedTriggers>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<ITrigger | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  const [editForm, setEditForm] = useState<EditTriggerForm>({
    trigger_name: "",
    severity: "",
    ComparisonOperator: "",
    valuetrigger: 0,
    enabled: true
  });

  const fetchTriggerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:3000/trigger");
      const triggersData = response.data.triggers;

      const hostIds = [...new Set(triggersData.map((trigger: ITrigger) => trigger.host_id))];

      const hostsInfo = await Promise.all(
        hostIds.map(async (hostId) => {
          try {
            const hostResponse = await axios.get(`http://127.0.0.1:3000/host/${hostId}`);
            return hostResponse.data.data;
          } catch (error) {
            console.error(`Error fetching host info for ${hostId}:`, error);
            return null;
          }
        })
      );

      const hostMap = hostsInfo.reduce((acc, host) => {
        if (host) {
          acc[host._id] = host.hostname;
        }
        return acc;
      }, {} as Record<string, string>);

      const grouped = triggersData.reduce((acc: GroupedTriggers, trigger: ITrigger) => {
        const hostname = hostMap[trigger.host_id] || "Unknown Host";
        if (!acc[trigger.host_id]) {
          acc[trigger.host_id] = {
            hostname,
            triggers: [],
          };
        }
        acc[trigger.host_id].triggers.push({
          ...trigger,
          hostname,
        });
        return acc;
      }, {});

      setGroupedTriggers(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch trigger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggerData();
  }, []);

  const handleEditClick = (trigger: ITrigger) => {
    setSelectedTrigger(trigger);
    setEditForm({
      trigger_name: trigger.trigger_name,
      severity: trigger.severity,
      ComparisonOperator: trigger.ComparisonOperator,
      valuetrigger: trigger.valuetrigger,
      enabled: trigger.enabled
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (trigger: ITrigger) => {
    setSelectedTrigger(trigger);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTrigger) return;

    setFormLoading(true);
    try {
      await axios.put(`http://127.0.0.1:3000/trigger/${selectedTrigger._id}`, editForm);
      
      // Update local state
      const updatedTriggers = { ...groupedTriggers };
      const hostGroup = updatedTriggers[selectedTrigger.host_id];
      if (hostGroup) {
        hostGroup.triggers = hostGroup.triggers.map(trigger => 
          trigger._id === selectedTrigger._id 
            ? { ...trigger, ...editForm }
            : trigger
        );
      }
      setGroupedTriggers(updatedTriggers);

      setSnackbar({
        open: true,
        message: "Trigger updated successfully",
        severity: "success"
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating trigger:', error);
      setSnackbar({
        open: true,
        message: "Failed to update trigger",
        severity: "error"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrigger) return;

    try {
      await axios.delete(`http://127.0.0.1:3000/trigger/${selectedTrigger._id}`);
      
      // Update local state
      const updatedTriggers = { ...groupedTriggers };
      const hostGroup = updatedTriggers[selectedTrigger.host_id];
      if (hostGroup) {
        hostGroup.triggers = hostGroup.triggers.filter(
          trigger => trigger._id !== selectedTrigger._id
        );
        if (hostGroup.triggers.length === 0) {
          delete updatedTriggers[selectedTrigger.host_id];
        }
      }
      setGroupedTriggers(updatedTriggers);

      setSnackbar({
        open: true,
        message: "Trigger deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error deleting trigger:', error);
      setSnackbar({
        open: true,
        message: "Failed to delete trigger",
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTrigger(null);
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'valuetrigger' ? Number(value) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ width: 1 }}>
      {Object.entries(groupedTriggers).map(([hostId, { hostname, triggers }]) => (
        <Box key={hostId} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              backgroundColor: "#242D5D",
              color: "white",
              p: 2,
              borderRadius: "4px 4px 0 0",
            }}
          >
            {hostname}
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              "& .MuiPaper-root": { boxShadow: "none" },
              backgroundColor: "transparent",
              mb: 2,
            }}
          >
            <Table
              sx={{
                "& .MuiTable-root": {
                  borderCollapse: "separate",
                  borderSpacing: 0,
                },
                "& .MuiTableCell-root": { borderBottom: "none" },
                "& .MuiTableBody-root .MuiTableRow-root": {
                  "&:nth-of-type(even)": { backgroundColor: "white" },
                  "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                  "&:hover": {
                    backgroundColor: "#FFF3E0",
                    transition: "background-color 0.3s ease",
                    cursor: "pointer",
                  },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Trigger Name
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Severity
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Comparison Operator
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Trigger Value
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Created At
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {triggers.map((trigger) => (
                  <TableRow key={trigger._id}>
                    <TableCell>{trigger.trigger_name}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: trigger.severity === "critical" ? "red" : "orange",
                          fontWeight: "bold",
                        }}
                      >
                        {trigger.severity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{trigger.ComparisonOperator}</TableCell>
                    <TableCell align="center">{trigger.valuetrigger}</TableCell>
                    <TableCell align="center">{formatDate(trigger.createdAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{
                          mr: 1,
                          color: "warning.main",
                          "&:hover": { 
                            backgroundColor: "warning.light",
                          },
                        }}
                        onClick={() => handleEditClick(trigger)}
                      >
                        <EditNoteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "error.main",
                          "&:hover": { 
                            backgroundColor: "error.light",
                          },
                        }}
                        onClick={() => handleDeleteClick(trigger)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

       {/* Edit Dialog */}
       <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Trigger
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Trigger Name"
              name="trigger_name"
              value={editForm.trigger_name}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                label="Severity"
                name="severity"
                value={editForm.severity}
                onChange={handleSelectChange}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Comparison Operator</InputLabel>
              <Select
                label="Comparison Operator"
                name="ComparisonOperator"
                value={editForm.ComparisonOperator}
                onChange={handleSelectChange}
              >
                <MenuItem value=">">&gt;</MenuItem>
                <MenuItem value=">=">&gt;=</MenuItem>
                <MenuItem value="<">&lt;</MenuItem>
                <MenuItem value="<=">&lt;=</MenuItem>
                <MenuItem value="==">=</MenuItem>
                <MenuItem value="!=">!=</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Trigger Value"
              name="valuetrigger"
              type="number"
              value={editForm.valuetrigger}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={formLoading}
            sx={{color:"black",}}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained" 
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the trigger "{selectedTrigger?.trigger_name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {Object.keys(groupedTriggers).length === 0 && (
        <Typography align="center" sx={{ mt: 2 }}>
          No triggers found
        </Typography>
      )}
    </Box>
  );
};

export default TriggerComponent;