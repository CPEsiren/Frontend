import { useEffect, useMemo, useState } from "react";
import { Item, ITrigger } from "../interface/InterfaceCollection";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import { SearchIcon } from "lucide-react";
interface GroupedTriggers {
  triggers: ITrigger[];
  host_id: {
    _id: string;
    hostname: string;
  };
}

const TriggerComponent = () => {
  //Global State
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typographyProps = {
    fontSize: 14,
  };
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  //All Trigger Data
  const [DataGroupByHost, setDataGroupByHost] = useState<GroupedTriggers[]>([]);
  //Fetch Trigger
  const fetchTriggerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:3000/trigger`);
      if (response.data.status === "success" && response.data.data) {
        const DataIndexHost = response.data.data;
        setDataGroupByHost(DataIndexHost); // Now we store the complete item objects
      }
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

  //Edit Trigger

  const [editTriggerName, setEditTriggerName] = useState("");
  const [editIdTrigger, setEditIdTrigger] = useState("");
  const [edithostId, setEditHostId] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editExpression, setEditExpression] = useState("");
  const [editRecoveryExpression, setEditRecoveryExpression] = useState("");
  const [editOk_eve, setEditOk_eve] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const handleEditClick = (trigger: ITrigger) => {
    setEditTriggerName(trigger.trigger_name);
    setEditIdTrigger(trigger._id);
    setEditHostId(trigger.host_id);
    setEditSeverity(trigger.severity);
    setEditExpression(trigger.expression);
    setEditRecoveryExpression(trigger.recovery_expression);
    setEditOk_eve(trigger.ok_event_generation);
    setEditEnabled(trigger.enabled);
    setEditDialogOpen(true);
    fetchItems(edithostId);
  };

  //Delete Trigger
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeIdTrigger, setRemoveIdTrigger] = useState("");
  const [removeTriggerName, setRemoveTriggerName] = useState("");
  const handleDeleteClick = (trigger: ITrigger) => {
    setRemoveIdTrigger(trigger._id);
    setRemoveTriggerName(trigger.trigger_name);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!removeIdTrigger) return;

    try {
      await axios.delete(`http://127.0.0.1:3000/trigger/${removeIdTrigger}`);

      fetchTriggerData();

      setSnackbar({
        open: true,
        message: "Trigger deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting trigger:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete trigger",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  //items
  const [items, setItems] = useState<Item[]>([]);

  const fetchItems = async (hostId: string) => {
    if (!hostId) return;

    try {
      const response = await axios.get(`http://127.0.0.1:3000/host/${hostId}`);
      if (response.data.status === "success" && response.data.data) {
        const items = response.data.data.items;
        setItems(items);
        console.log("Fetched items:", items); // Debug log
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    }
  };

  //Expression
  //Dialog add Item in edit
  const [openDialogExpression, setOpenDialogExpression] = useState(false);
  const [searchTermExpression, setSearchTermExpression] = useState("");
  const handleOpenDialogExpression = () => {
    setOpenDialogExpression(true);
    setSearchTermExpression("");
  };
  const handleCloseDialogExpression = () => {
    setOpenDialogExpression(false);
  };
  const handleItemSelectExpression = (itemName: string) => {
    setEditExpression((prev) => prev + (prev ? " " : "") + itemName);
    handleCloseDialogExpression();
  };

  //Recovery Expression
  //Dialog add Item in edit
  const [openDialogRecoveryExpression, setOpenDialogRecoveryExpression] =
    useState(false);
  const [searchTermRecoveryExpression, setSearchTermRecoveryExpression] =
    useState("");
  const handleOpenDialogRecoveryExpression = () => {
    setOpenDialogRecoveryExpression(true);
    fetchItems(edithostId);
    setSearchTermRecoveryExpression("");
  };
  const handleCloseDialogRecoveryExpression = () => {
    setOpenDialogRecoveryExpression(false);
  };
  const handleItemSelectRecoveryExpression = (itemName: string) => {
    setEditRecoveryExpression((prev) => prev + (prev ? " " : "") + itemName);
    handleCloseDialogRecoveryExpression();
  };

  const filteredItemsExpression = useMemo(() => {
    return items.filter((item) =>
      item.item_name.toLowerCase().includes(searchTermExpression.toLowerCase())
    );
  }, [items, searchTermExpression]);

  const handleEditSubmit = async () => {
    if (!editIdTrigger) return;

    setFormLoading(true);
    try {
      await axios.put(`http://127.0.0.1:3000/trigger/${editIdTrigger}`, {
        trigger_name: editTriggerName,
        severity: editSeverity,
        expression: editExpression,
        ok_event_generation: editOk_eve,
        recovery_expression: editRecoveryExpression,
        enabled: editEnabled,
      });

      fetchTriggerData();

      setSnackbar({
        open: true,
        message: "Trigger updated successfully",
        severity: "success",
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating trigger:", error);
      setSnackbar({
        open: true,
        message: "Failed to update trigger",
        severity: "error",
      });
    } finally {
      setFormLoading(false);
    }
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
      {DataGroupByHost.map((group, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              backgroundColor: "#242D5D",
              color: "white",
              p: 2,
              borderRadius: "4px 4px 0 0",
              fontWeight: "bold",
            }}
          >
            {group.host_id.hostname}
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
                  <TableCell
                    align="center"
                    sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                  >
                    Expression
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                  >
                    ⚙️
                  </TableCell>
                </TableRow>
              </TableHead>

              {group.triggers.map((trigger, index) => (
                <TableBody>
                  <TableRow key={index}>
                    {/* Trigger Name */}
                    <TableCell>{trigger.trigger_name}</TableCell>

                    {/* Severity */}
                    <TableCell
                      sx={{
                        color: (() => {
                          switch (trigger.severity.toLowerCase()) {
                            case "not classified":
                              return "#808080";
                            case "information":
                              return "#0000FF";
                            case "warning":
                              return "#FFA500";
                            case "average":
                              return "#FF4500";
                            case "high":
                              return "#FF0000";
                            case "disaster":
                              return "#8B0000";
                            default:
                              return "inherit";
                          }
                        })(),
                        fontWeight: "bold",
                      }}
                    >
                      {trigger.severity}
                    </TableCell>

                    {/* Expression */}
                    <TableCell align="center">
                      {trigger.expression
                        .split(/\b(and|or)\b/)
                        .map((part, index) => {
                          if (
                            part.toLowerCase() === "and" ||
                            part.toLowerCase() === "or"
                          ) {
                            return (
                              <span
                                key={index}
                                style={{
                                  backgroundColor: "#FFD700",
                                  fontWeight: "bold",
                                  padding: "0 2px",
                                  borderRadius: "3px",
                                }}
                              >
                                {part}
                              </span>
                            );
                          }
                          return part;
                        })}
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      align="center"
                      sx={{
                        color: trigger.enabled ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {trigger.enabled ? "Enabled" : "Disabled"}
                    </TableCell>

                    {/* Manage */}
                    {/* Edit */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{
                          color: "warning.main",
                          "&:hover": {
                            backgroundColor: "warning.light",
                          },
                        }}
                        onClick={() => handleEditClick(trigger)}
                      >
                        <EditNoteIcon fontSize="small" />
                      </IconButton>

                      {/* Delete */}
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
                </TableBody>
              ))}
            </Table>
          </TableContainer>
        </Box>
      ))}
      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Trigger</DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: "#FFFFFB" }}>
            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Trigger Name field */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Trigger Name
                  </Typography>
                </Box>
                <TextField
                  name="trigger_name"
                  {...textFieldProps}
                  value={editTriggerName}
                  onChange={(e) => setEditTriggerName(e.target.value)}
                  fullWidth
                  required
                />
              </Box>

              {/* Severity field */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Severity
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    maxWidth: "calc(100% - 150px)",
                  }}
                >
                  {[
                    { level: "Not classified", color: "#808080" },
                    { level: "Information", color: "#0000FF" },
                    { level: "Warning", color: "#FFA500" },
                    { level: "Average", color: "#FF4500" },
                    { level: "High", color: "#FF0000" },
                    { level: "Disaster", color: "#8B0000" },
                  ].map(({ level, color }) => (
                    <Button
                      key={level}
                      variant={
                        editSeverity === level.toLowerCase()
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => setEditSeverity(level.toLowerCase())}
                      sx={{
                        fontSize: 12,
                        minWidth: "auto",
                        flex: "1 0 auto",
                        color:
                          editSeverity === level.toLowerCase()
                            ? "white"
                            : color,
                        backgroundColor:
                          editSeverity === level.toLowerCase()
                            ? color
                            : "transparent",
                        borderColor: color,
                        "&:hover": {
                          backgroundColor:
                            editSeverity === level.toLowerCase()
                              ? color
                              : `${color}22`,
                        },
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Expression field */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Expression
                  </Typography>
                </Box>
                <TextField
                  {...textFieldProps}
                  value={editExpression}
                  onChange={(e) => setEditExpression(e.target.value)}
                  multiline
                  rows={4}
                  sx={{
                    ...textFieldProps.sx,
                    "& .MuiOutlinedInput-root": {
                      padding: "8px",
                    },
                  }}
                />
                <Button
                  onClick={handleOpenDialogExpression}
                  sx={{
                    mt: 1,
                    alignSelf: "flex-start",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                    "&:disabled": {
                      backgroundColor: "#a5d6a7",
                      color: "#e8f5e9",
                    },
                    fontSize: 14,
                    padding: "6px 16px",
                  }}
                >
                  Add Item
                </Button>
              </Box>

              {/* OK event generation */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    OK event generation
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    maxWidth: "calc(100% - 150px)",
                  }}
                >
                  {[
                    { level: "Expression", color: "#808080" },
                    { level: "Recovery expression", color: "#808080" },
                    { level: "None", color: "#808080" },
                  ].map(({ level, color }) => (
                    <Button
                      key={level}
                      variant={
                        editOk_eve === level.toLowerCase()
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => setEditOk_eve(level.toLowerCase())}
                      sx={{
                        fontSize: 12,
                        minWidth: "auto",
                        flex: "1 0 auto",
                        color:
                          editOk_eve === level.toLowerCase() ? "white" : color,
                        backgroundColor:
                          editOk_eve === level.toLowerCase()
                            ? color
                            : "transparent",
                        borderColor: color,
                        "&:hover": {
                          backgroundColor:
                            editOk_eve === level.toLowerCase()
                              ? color
                              : `${color}22`,
                        },
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Recovery Expression field */}
              {editOk_eve === "recovery expression" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: 150,
                    }}
                  >
                    <Typography color="error" {...typographyProps}>
                      *
                    </Typography>
                    <Typography sx={{ ml: 1 }} {...typographyProps}>
                      Recovery Expression
                    </Typography>
                  </Box>
                  <TextField
                    {...textFieldProps}
                    value={editRecoveryExpression}
                    onChange={(e) => setEditRecoveryExpression(e.target.value)}
                    multiline
                    rows={4}
                    sx={{
                      ...textFieldProps.sx,
                      "& .MuiOutlinedInput-root": {
                        padding: "8px",
                      },
                    }}
                  />
                  <Button
                    onClick={handleOpenDialogRecoveryExpression}
                    sx={{
                      mt: 1,
                      alignSelf: "flex-start",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#45a049",
                      },
                      "&:disabled": {
                        backgroundColor: "#a5d6a7",
                        color: "#e8f5e9",
                      },
                      fontSize: 14,
                      padding: "6px 16px",
                    }}
                  >
                    Add Item
                  </Button>
                </Box>
              )}

              {/* Enabled Switch */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Enabled
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editEnabled}
                      onChange={(e) => setEditEnabled(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4CAF50",
                          "&:hover": {
                            backgroundColor: "#4CAF5022",
                          },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#4CAF50",
                          },
                        "& .MuiSwitch-switchBase.Mui-disabled": {
                          color: "#bdbdbd",
                        },
                        "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track":
                          {
                            backgroundColor: "#e0e0e0",
                          },
                      }}
                    />
                  }
                  label=""
                />
              </Box>
            </Box>
          </Paper>

          {/* Dialog for item selection for Expression */}
          <Dialog
            open={openDialogExpression}
            onClose={handleCloseDialogExpression}
          >
            <DialogTitle>Select an Item</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items..."
                value={searchTermExpression}
                onChange={(e) => setSearchTermExpression(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <List>
                {filteredItemsExpression.map((item) => (
                  <ListItemButton
                    key={item._id}
                    onClick={() => handleItemSelectExpression(item.item_name)}
                  >
                    <ListItemText primary={item.item_name} />
                  </ListItemButton>
                ))}
              </List>
            </DialogContent>
          </Dialog>

          {/* Dialog for item selection for Recovery Expression */}
          <Dialog
            open={openDialogRecoveryExpression}
            onClose={handleCloseDialogRecoveryExpression}
          >
            <DialogTitle>Select an Item</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items..."
                value={searchTermRecoveryExpression}
                onChange={(e) =>
                  setSearchTermRecoveryExpression(e.target.value)
                }
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <List>
                {filteredItemsExpression.map((item) => (
                  <ListItemButton
                    key={item._id}
                    onClick={() =>
                      handleItemSelectRecoveryExpression(item.item_name)
                    }
                  >
                    <ListItemText primary={item.item_name} />
                  </ListItemButton>
                ))}
              </List>
            </DialogContent>
          </Dialog>
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
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the trigger "{removeTriggerName}"?
            This action cannot be undone.
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
    </Box>
  );
};

export default TriggerComponent;
