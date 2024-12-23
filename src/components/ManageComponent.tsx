import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Container,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import { IDevice } from "../interface/InterfaceCollection";

interface ApiResponse {
  status: string;
  message: string;
  data: IDevice[];
}

interface EditFormData {
  hostname: string;
  ip_address: string;
  snmp_port: string;
  snmp_version: string;
  snmp_community: string;
  hostgroup: string;
  status: number;
}

const ManageComponent = () => {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<IDevice | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IDevice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [editForm, setEditForm] = useState<EditFormData>({
    hostname: "",
    ip_address: "",
    snmp_port: "",
    snmp_version: "",
    snmp_community: "",
    hostgroup: "",
    status: 1,
  });

  const fetchDevices = async () => {
    try {
      const response = await fetch("http://localhost:3000/host");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch devices");
      }

      setDevices(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch devices";
      setError(errorMessage);
      console.error("Error fetching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleEditClick = (device: IDevice) => {
    setEditingDevice(device);
    setEditForm({
      hostname: device.hostname,
      ip_address: device.ip_address,
      snmp_port: device.snmp_port,
      snmp_version: device.snmp_version,
      snmp_community: device.snmp_community,
      hostgroup: device.hostgroup,
      status: device.status,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (device: IDevice) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDevice) return;

    setFormLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/host/edit/${editingDevice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update device: ${response.statusText}`);
      }

      // Update the device in local state
      setDevices(
        devices.map((device) =>
          device._id === editingDevice._id ? { ...device, ...editForm } : device
        )
      );

      setSnackbar({
        open: true,
        message: "Device updated successfully",
        severity: "success",
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating device:", error);
      setSnackbar({
        open: true,
        message: "Failed to update device",
        severity: "error",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/host/${deviceToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.statusText}`);
      }

      // Remove the device from the local state
      setDevices(devices.filter((device) => device._id !== deviceToDelete._id));

      setSnackbar({
        open: true,
        message: "Device deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting device:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete device",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "success";
      case 0:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 0:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
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
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (devices.length === 0) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography color="textSecondary" variant="h6">
            No devices found
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          mt: 2,
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              padding: "16px",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  IP Address
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  SNMP Version
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  Group
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  Location
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="medium">
                  Status
                </Typography>
              </TableCell>
              <TableCell width={120} align="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device._id} hover>
                <TableCell>
                  <Typography variant="body2">{device.hostname}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{device.ip_address}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {device.snmp_version.toUpperCase()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{device.hostgroup}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {device.details?.location ||
                      device.details?.location ||
                      "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(device.status)}
                    color={getStatusColor(device.status)}
                    size="small"
                    sx={{ minWidth: "80px" }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    sx={{
                      mr: 1,
                      "&:hover": {
                        backgroundColor: "warning.light",
                      },
                    }}
                    onClick={() => handleEditClick(device)}
                  >
                    <EditNoteIcon sx={{ color: "warning.main" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.light",
                      },
                    }}
                    onClick={() => handleDeleteClick(device)}
                  >
                    <DeleteIcon sx={{ color: "error.main" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Hostname"
              name="hostname"
              value={editForm.hostname}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <TextField
              label="IP Address"
              name="ip_address"
              value={editForm.ip_address}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <TextField
              label="SNMP Port"
              name="snmp_port"
              value={editForm.snmp_port}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>SNMP Version</InputLabel>
              <Select
                label="SNMP Version"
                name="snmp_version"
                value={editForm.snmp_version}
                onChange={handleSelectChange}
              >
                <MenuItem value="v1">SNMPv1</MenuItem>
                <MenuItem value="v2c">SNMPv2</MenuItem>
                <MenuItem value="v3">SNMPv3</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="SNMP Community"
              name="snmp_community"
              value={editForm.snmp_community}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <TextField
              label="Host Group"
              name="hostgroup"
              value={editForm.hostgroup}
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
            sx={{ color: "black" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the device "
            {deviceToDelete?.hostname}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageComponent;
