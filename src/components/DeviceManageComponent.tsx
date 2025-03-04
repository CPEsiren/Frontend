import { useState, useEffect } from "react";
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
  FormControl,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IDevice } from "../interface/InterfaceCollection";

// Add these interfaces at the top of your file
interface FormErrors {
  hostname?: string;
  ip_address?: string;
  snmp_port?: string;
  snmp_version?: string;
  snmp_community?: string;
  hostgroup?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: IDevice[];
}

interface EditFormData {
  hostname: string;
  ip_address: string;
  template: string;
  snmp_port: string;
  snmp_version: string;
  snmp_community: string;
  hostgroup: string;
  details: { [key: string]: string };
  status: number;
  authenV3: {
    username: string;
    securityLevel: string;
    authenProtocol: string;
    authenPass: string;
    privacyProtocol: string;
    privacyPass: string;
  };
}

// New interface for grouping devices
interface GroupedDevices {
  [key: string]: {
    normalizedName: string;
    originalName: string;
    devices: IDevice[];
  };
}

const textFieldProps = {
  size: "small" as const,
  fullWidth: true,
  sx: {
    backgroundColor: "white",
    "& .MuiInputBase-input": {
      fontSize: 14,
    },
  },
};

const typographyProps = {
  fontSize: 14,
};

const ManageComponent = () => {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [groupedDevices, setGroupedDevices] = useState<GroupedDevices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<IDevice | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IDevice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | false>(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Add this validation function
  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate hostname
    if (!editForm.hostname.trim()) {
      errors.hostname = "Hostname is required";
      isValid = false;
    }

    // Validate IP address
    if (!editForm.ip_address.trim()) {
      errors.ip_address = "IP Address is required";
      isValid = false;
    }

    // Validate SNMP port
    if (!editForm.snmp_port.trim()) {
      errors.snmp_port = "SNMP Port is required";
      isValid = false;
    }

    // Validate SNMP version
    if (!editForm.snmp_version) {
      errors.snmp_version = "SNMP Version is required";
      isValid = false;
    }

    // Validate SNMP community
    if (!editForm.snmp_community.trim()) {
      errors.snmp_community = "SNMP Community is required";
      isValid = false;
    }

    // Validate host group
    if (!editForm.hostgroup.trim()) {
      errors.hostgroup = "Host Group is required";
      isValid = false;
    }

    return isValid;
  };

  const [editForm, setEditForm] = useState<EditFormData>({
    hostname: "",
    ip_address: "",
    template: "",
    snmp_port: "",
    snmp_version: "",
    snmp_community: "",
    hostgroup: "",
    details: {}, // Initialize with empty object
    status: 1,
    authenV3: {
      username: "",
      securityLevel: "",
      authenProtocol: "",
      authenPass: "",
      privacyProtocol: "",
      privacyPass: "",
    },
  });

  // Function to normalize a hostgroup name (convert to uppercase)
  const normalizeGroupName = (name: string): string => {
    return name ? name.toUpperCase() : "UNCATEGORIZED";
  };

  // Function to group devices by normalized hostgroup name
  const groupDevicesByHostgroup = (devices: IDevice[]) => {
    const grouped: GroupedDevices = {};

    devices.forEach((device) => {
      const originalName = device.hostgroup || "Uncategorized";
      const normalizedName = normalizeGroupName(originalName);

      if (!grouped[normalizedName]) {
        grouped[normalizedName] = {
          normalizedName,
          originalName,
          devices: [],
        };
      }

      grouped[normalizedName].devices.push(device);

      // Use the most recent name format we've seen for display
      grouped[normalizedName].originalName = originalName;
    });

    return grouped;
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/host`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        return;
      }

      const result: ApiResponse = await response.json();

      if (result.status !== "success" || !result.data.length) {
        return;
      }

      setDevices(result.data);

      // Group devices by normalized hostgroup names
      const grouped = groupDevicesByHostgroup(result.data);
      setGroupedDevices(grouped);

      // Set the first group as expanded by default if there are groups
      const groups = Object.keys(grouped);
      if (groups.length > 0) {
        setExpandedGroup(groups[0]);
      }
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

  // Modify the edit click handler
  const handleEditClick = (device: IDevice) => {
    setEditingDevice(device);
    setEditForm({
      hostname: device.hostname,
      ip_address: device.ip_address,
      template: device.template,
      snmp_port: device.snmp_port,
      snmp_version: device.snmp_version,
      snmp_community: device.snmp_community,
      hostgroup: device.hostgroup,
      details: device.details || {}, // Include details, fallback to empty object if null
      status: device.status,
      authenV3: device.authenV3 || {
        username: "",
        securityLevel: "",
        authenProtocol: "",
        authenPass: "",
        privacyProtocol: "",
        privacyPass: "",
      }, // Include authenV3, fallback to empty object if null
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (device: IDevice) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDevice) return;

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    setFormLoading(true);
    try {
      const requestBody = {
        ...editForm,
        // Add user role and username for tracking who made the edit
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("username"),
        // Add oldHostname to track the original hostname
        oldHostname: editingDevice.hostname,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/host/edit/${editingDevice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update device: ${response.statusText}`);
      }

      // Update devices state
      const updatedDevices = devices.map((device) =>
        device._id === editingDevice._id ? { ...device, ...editForm } : device
      );

      setDevices(updatedDevices);

      // Regroup devices after update
      const regrouped = groupDevicesByHostgroup(updatedDevices);
      setGroupedDevices(regrouped);

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
        `${import.meta.env.VITE_API_URL}/host/${deviceToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userRole: localStorage.getItem("userRole"),
            userName: localStorage.getItem("username"),
            hostname: deviceToDelete.hostname,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.statusText}`);
      }

      // Remove the device from the local state
      const updatedDevices = devices.filter(
        (device) => device._id !== deviceToDelete._id
      );
      setDevices(updatedDevices);

      // Regroup devices after deletion
      const regrouped = groupDevicesByHostgroup(updatedDevices);
      setGroupedDevices(regrouped);

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

  // Handle accordion state
  const handleAccordionChange =
    (groupName: string) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedGroup(isExpanded ? groupName : false);
    };

  // Modify the dialog close handler
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
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

  const handleVersionChange = (event: SelectChangeEvent) => {
    setEditForm((prev) => ({
      ...prev,
      snmp_version: event.target.value,
    }));
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

  const hostGroups = Object.keys(groupedDevices);

  if (hostGroups.length === 0) {
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

  // Function to render a table for a specific group
  const renderDeviceTable = (devices: IDevice[]) => {
    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
        }}
      >
        <Table
          sx={{
            width: 1,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              padding: "16px",
            },
            "& .MuiTableCell-head": {
              borderBottom: "1px solid #dbdbdb",
            },
            "& .MuiTableRow-body:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "#ffffff" }}>
            <TableRow>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Device's name
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  IP Address
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  SNMP Version
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Status
                </Typography>
              </TableCell>
              <TableCell width={120} align="center" sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device._id} hover>
                <TableCell
                  sx={{
                    display: "block",
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                >
                  <Typography variant="body2">{device.hostname}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{device.ip_address}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{device.snmp_version}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(device.status)}
                    color={getStatusColor(device.status)}
                    size="small"
                    sx={{ minWidth: "80px", py: 2 }}
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
    );
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ mb: 3,mt:3 }}>
        {hostGroups.map((groupKey) => {
          const group = groupedDevices[groupKey];
          return (
            <Accordion
              key={groupKey}
              // expanded={expandedGroup === groupKey}
              onChange={handleAccordionChange(groupKey)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "#f5f5f5" }}
              >
                <Typography fontWeight="medium">
                  {group.originalName.toUpperCase()} ({group.devices.length}{" "}
                  {group.devices.length === 1 ? "device" : "devices"})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {group.devices.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body1">
                      No devices in this group
                    </Typography>
                  </Paper>
                ) : (
                  renderDeviceTable(group.devices)
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 0, backgroundColor: "#FFFFFB" }}>
            <Box
              component="form"
              sx={{
                display: "flex",
                bgcolor: "white",
                flexDirection: "column",
                gap: 0,
                p: 3,
                border: "2px solid rgb(232, 232, 232)",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  mb: 2,
                  fontSize: "1.2rem",
                  color: "black",
                  fontWeight: "medium",
                }}
                {...typographyProps}
              >
                DEVICE
              </Typography>

              {/* Host Section */}
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Box sx={{ textAlign: "right", mt: 1, width: "20%" }}>
                  <Box sx={{ display: "flex", justifyContent: "right" }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>Device's name</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "right",
                      mt: 4,
                    }}
                  >
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>Host groups</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, mt: 4.5 }}>
                    Description
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "left", width: "50%" }}>
                  <TextField
                    {...textFieldProps}
                    value={editForm.hostname}
                    onChange={(e) =>
                      setEditForm({ ...editForm, hostname: e.target.value })
                    }
                    sx={{
                      mb: 2,
                      width: 1,
                      "& .MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  />

                  <TextField
                    {...textFieldProps}
                    value={editForm.hostgroup}
                    onChange={(e) =>
                      setEditForm({ ...editForm, hostgroup: e.target.value })
                    }
                    sx={{
                      mb: 2,
                      width: 1,
                      "& .MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  />
                  <TextField
                    multiline
                    rows={3}
                    {...textFieldProps}
                    value={editForm.details?.description || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          description: e.target.value,
                        },
                      }))
                    }
                    sx={{
                      width: 1,
                      "& .MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                ></Box>
              </Box>
            </Box>
            {/* Interface Section */}
            <Box
              sx={{
                p: 3,
                border: "2px solid rgb(232, 232, 232)",
                borderRadius: 3,
                mb: 2,
                mt: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  color: "black",
                  fontWeight: "medium",
                  mb: 2,
                }}
                {...typographyProps}
              >
                SNMP INTERFACE
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                  }}
                >
                  <Box sx={{ textAlign: "right", mt: 1, width: "20%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>IP address</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        SNMP version
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.snmp_version === "SNMPv1" ||
                          editForm.snmp_version === "SNMPv2"
                            ? "flex"
                            : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        SNMP community
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.snmp_version === "SNMPv3" ? "flex" : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>Username</Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.snmp_version === "SNMPv3" ? "flex" : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14, mt: 0.3 }}>
                        Security Level
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.authenV3.securityLevel === "authNoPriv" ||
                          editForm.authenV3.securityLevel === "authPriv"
                            ? "flex"
                            : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14, mt: 0.1 }}>
                        Authen Protocol
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.authenV3.securityLevel === "authNoPriv" ||
                          editForm.authenV3.securityLevel === "authPriv"
                            ? "flex"
                            : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        Authen Passphrase
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.authenV3.securityLevel === "authPriv"
                            ? "flex"
                            : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14, mt: 0.2 }}>
                        Privacy Protocol
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display:
                          editForm.authenV3.privacyProtocol === "DES" ||
                          editForm.authenV3.privacyProtocol === "AES"
                            ? "flex"
                            : "none",
                        justifyContent: "right",
                        mt: 4,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                        *
                      </Typography>
                      <Typography sx={{ fontSize: 14, mt: 0.3 }}>
                        Privacy Passphrase
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "left", width: "40%" }}>
                    <TextField
                      {...textFieldProps}
                      value={editForm.ip_address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ip_address: e.target.value })
                      }
                      sx={{
                        mb: 2,
                        width: 1,
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* SNMP Version */}
                      <FormControl
                        component="fieldset"
                        sx={{ minWidth: 200, mb: 2 }}
                      >
                        <RadioGroup
                          value={editForm.snmp_version}
                          onChange={handleVersionChange}
                          row
                        >
                          <FormControlLabel
                            value="SNMPv1"
                            control={<Radio size="small" />}
                            label="SNMPv1"
                          />
                          <FormControlLabel
                            value="SNMPv2"
                            control={<Radio size="small" />}
                            label="SNMPv2"
                          />
                          <FormControlLabel
                            value="SNMPv3"
                            control={<Radio size="small" />}
                            label="SNMPv3"
                          />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        {...textFieldProps}
                        value={editForm.snmp_community}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            snmp_community: e.target.value,
                          })
                        }
                        sx={{
                          display:
                            editForm.snmp_version === "SNMPv1" ||
                            editForm.snmp_version === "SNMPv2"
                              ? ""
                              : "none",
                          width: 1,
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      />

                      <TextField
                        {...textFieldProps}
                        value={editForm.authenV3.username}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            authenV3: {
                              ...editForm.authenV3,
                              username: e.target.value,
                            },
                          })
                        }
                        sx={{
                          display:
                            editForm.snmp_version === "SNMPv3" ? "" : "none",
                          width: 1,
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                          mb: 2.5,
                        }}
                      />

                      <FormControl sx={{ minWidth: 200 }} size="small">
                        <RadioGroup
                          value={editForm.authenV3.securityLevel}
                          onChange={(e) => {
                            setEditForm({
                              ...editForm,
                              authenV3: {
                                ...editForm.authenV3,
                                securityLevel: e.target.value,
                              },
                            });
                          }}
                          row
                          sx={{
                            display:
                              editForm.snmp_version === "SNMPv3" ? "" : "none",
                            mb: 2,
                            mt: -0.5,
                            fontSize: 14,
                          }}
                        >
                          <FormControlLabel
                            value="noAuthNoPriv"
                            control={<Radio size="small" />}
                            label="noAuthNoPriv"
                          />
                          <FormControlLabel
                            value="authNoPriv"
                            control={<Radio size="small" />}
                            label="authNoPriv"
                          />
                          <FormControlLabel
                            value="authPriv"
                            control={<Radio size="small" />}
                            label="authPriv"
                          />
                        </RadioGroup>
                      </FormControl>

                      <FormControl sx={{ minWidth: 200 }} size="small">
                        <RadioGroup
                          value={editForm.authenV3.authenProtocol}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              authenV3: {
                                ...editForm.authenV3,
                                authenProtocol: e.target.value,
                              },
                            })
                          }
                          row // This makes the radio buttons appear horizontally
                          sx={{
                            display:
                              editForm.authenV3.securityLevel ===
                                "authNoPriv" ||
                              editForm.authenV3.securityLevel === "authPriv"
                                ? ""
                                : "none",
                            mb: 2,
                            fontSize: 14,
                          }}
                        >
                          <FormControlLabel
                            value="MD5"
                            control={<Radio size="small" />}
                            label="MD5"
                          />
                          <FormControlLabel
                            value="SHA"
                            control={<Radio size="small" />}
                            label="SHA"
                          />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        {...textFieldProps}
                        value={editForm.authenV3.authenPass}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            authenV3: {
                              ...editForm.authenV3,
                              authenPass: e.target.value,
                            },
                          })
                        }
                        sx={{
                          display:
                            editForm.authenV3.securityLevel === "authNoPriv" ||
                            editForm.authenV3.securityLevel === "authPriv"
                              ? ""
                              : "none",
                          width: 1,
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                          mb: 2,
                        }}
                      />

                      <FormControl sx={{ minWidth: 200 }} size="small">
                        <RadioGroup
                          value={editForm.authenV3.privacyProtocol}
                          onChange={(e) => {
                            setEditForm({
                              ...editForm,
                              authenV3: {
                                ...editForm.authenV3,
                                privacyProtocol: e.target.value,
                              },
                            });
                          }}
                          row // This makes the radio buttons appear horizontally
                          sx={{
                            display:
                              editForm.authenV3.securityLevel === "authPriv"
                                ? ""
                                : "none",
                            mb: 2,
                            fontSize: 14,
                          }}
                        >
                          <FormControlLabel
                            value="NONE"
                            control={<Radio size="small" />}
                            label="NONE"
                          />
                          <FormControlLabel
                            value="DES"
                            control={<Radio size="small" />}
                            label="DES"
                          />
                          <FormControlLabel
                            value="AES"
                            control={<Radio size="small" />}
                            label="AES"
                          />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        {...textFieldProps}
                        value={editForm.authenV3.privacyPass}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            authenV3: {
                              ...editForm.authenV3,
                              privacyPass: e.target.value,
                            },
                          })
                        }
                        sx={{
                          display:
                            editForm.authenV3.privacyProtocol === "DES" ||
                            editForm.authenV3.privacyProtocol === "AES"
                              ? ""
                              : "none",
                          width: 1,
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                          mb: 2,
                          mt: 0.3,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 14, mt: 1 }}>Port</Typography>
                  </Box>
                  <Box>
                    <TextField
                      {...textFieldProps}
                      value={editForm.snmp_port}
                      onChange={(e) =>
                        setEditForm({ ...editForm, snmp_port: e.target.value })
                      }
                      sx={{
                        width: "90%",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog} // Use the new handler here too
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
          <Button
            sx={{ color: "black" }}
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
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
        autoHideDuration={3000}
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
