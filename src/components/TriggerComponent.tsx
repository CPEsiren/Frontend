import { useEffect, useState } from "react";
import { Item, ITrigger } from "../interface/InterfaceCollection";
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Container,
  Menu,
  Fade,
  Tooltip,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
interface GroupedTriggers {
  triggers: ITrigger[];
  host_id: {
    _id: string;
    hostname: string;
  };
}

interface ExpressionPart {
  item: string;
  operation: string;
  value: string;
  operator?: string; // 'and' or 'or'
  functionofItem: string;
  duration: string;
}

interface RecoveryPart {
  item: string;
  operation: string;
  value: string;
  operator?: string; // 'and' or 'or'
  functionofItem: string;
  duration: string;
}

interface TriggerComponentProps {
  refreshTriggers?: () => void;
}


const functionofItem = [
  { value: "avg", label: "avg()" },
  { value: "min", label: "min()" },
  { value: "max", label: "max()" },
  { value: "last", label: "last()" },
];

const operators = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];

const operations = [
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "=", label: "=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
];

const TriggerComponent =({ refreshTriggers }: TriggerComponentProps) => {
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/trigger`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
  const [expressionParts, setExpressionParts] = useState<ExpressionPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      functionofItem: "",
      duration: "",
    },
  ]);

  const [recoveryParts, setRecoveryParts] = useState<RecoveryPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      functionofItem: "",
      duration: "",
    },
  ]);
  const handleRemoveRecovery = (index: number) => {
    if (recoveryParts.length > 1) {
      const newParts = recoveryParts.filter((_, i) => i !== index);
      setRecoveryParts(newParts);
    }
  };
  const handleAddRecovery = () => {
    setRecoveryParts((prev) => [
      ...prev,
      { item: "", operation: "", value: "", functionofItem: "", duration: "" },
    ]);
  };

  const handleRecoveryPartChange = (
    index: number,
    field: keyof RecoveryPart,
    value: string
  ) => {
    const newParts = [...recoveryParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setRecoveryParts(newParts);
  };

  const handleRemoveExpression = (index: number) => {
    if (expressionParts.length > 1) {
      const newParts = expressionParts.filter((_, i) => i !== index);
      setExpressionParts(newParts);
    }
  };

  const handleExpressionPartChange = (
    index: number,
    field: keyof ExpressionPart,
    value: string
  ) => {
    const newParts = [...expressionParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setExpressionParts(newParts);
  };

  const handleAddExpression = () => {
    setExpressionParts((prev) => [
      ...prev,
      { item: "", operation: "", value: "", functionofItem: "", duration: "" },
    ]);
  };

  const [editTriggerName, setEditTriggerName] = useState("");
  const [editIdTrigger, setEditIdTrigger] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editOk_eve, setEditOk_eve] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const handleEditClick = (trigger: ITrigger) => {
    setEditTriggerName(trigger.trigger_name);
    setEditIdTrigger(trigger._id);
    setEditSeverity(trigger.severity);
    setEditOk_eve(trigger.ok_event_generation);
    setEditEnabled(trigger.enabled);

    // Set expression parts from trigger data
    if (trigger.expressionPart && trigger.expressionPart.length > 0) {
      setExpressionParts(
        trigger.expressionPart.map((part) => ({
          item: part.item || "",
          operation: part.operation || "",
          value: part.value || "",
          operator: part.operator || "and",
          functionofItem: part.functionofItem || "",
          duration: part.duration?.toString() || "",
        }))
      );
    } else {
      setExpressionParts([
        {
          item: "",
          operation: "",
          value: "",
          functionofItem: "",
          duration: "",
        },
      ]);
    }

    // Set recovery expression parts from trigger data
    if (
      trigger.expressionRecoveryPart &&
      trigger.expressionRecoveryPart.length > 0
    ) {
      setRecoveryParts(
        trigger.expressionRecoveryPart.map((part) => ({
          item: part.item || "",
          operation: part.operation || "",
          value: part.value || "",
          operator: part.operator || "and",
          functionofItem: part.functionofItem || "",
          duration: part.duration?.toString() || "",
        }))
      );
    } else {
      setRecoveryParts([
        {
          item: "",
          operation: "",
          value: "",
          functionofItem: "",
          duration: "",
        },
      ]);
    }

    setEditDialogOpen(true);
    fetchItems(trigger.host_id);
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
      // await axios.delete(`http://127.0.0.1:3000/trigger/${removeIdTrigger}`);
      await fetch(
        `${import.meta.env.VITE_API_URL}/trigger/${removeIdTrigger}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userRole: localStorage.getItem("userRole"),
            userName: localStorage.getItem("username"),
            trigger_name: removeTriggerName,
          }),
        }
      );

      if (refreshTriggers) {
        refreshTriggers();
      } else {
        fetchTriggerData();
      }

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
      // const response = await axios.get(`http://127.0.0.1:3000/host/${hostId}`);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/host/${hostId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleEditSubmit = async () => {
    if (!editIdTrigger) return;

    setFormLoading(true);
    try {
      // Format expression parts for submission
      const formattedExpressionParts = expressionParts.map((part) => ({
        item: part.item,
        operation: part.operation,
        value: part.value,
        operator: part.operator,
        functionofItem: part.functionofItem,
        duration: parseInt(part.duration) || 0,
      }));

      const editExpression = expressionParts
        .map((part, idx) => {
          // Format: functionofItem(item,duration) operation value
          const durationInMinutes = part.duration ? `${part.duration}m` : "";
          const functionCall = part.duration
            ? `${part.functionofItem}(${part.item},${durationInMinutes})`
            : `${part.functionofItem}(${part.item})`;
          const expr = `${functionCall} ${part.operation} ${part.value}`;
          return idx < expressionParts.length - 1
            ? `${expr} ${part.operator || "and"}`
            : expr;
        })
        .join(" ");

      // Format recovery expression parts for submission
      const formattedRecoveryParts = recoveryParts.map((part) => ({
        item: part.item,
        operation: part.operation,
        value: part.value,
        operator: part.operator,
        functionofItem: part.functionofItem,
        duration: parseInt(part.duration) || 0,
      }));

      const editRecoveryExpression = recoveryParts
        .map((part, idx) => {
          // Format: functionofItem(item,duration) operation value
          const durationInMinutes = part.duration ? `${part.duration}m` : "";
          const functionCall = part.duration
            ? `${part.functionofItem}(${part.item},${durationInMinutes})`
            : `${part.functionofItem}(${part.item})`;
          const expr = `${functionCall} ${part.operation} ${part.value}`;
          return idx < recoveryParts.length - 1
            ? `${expr} ${part.operator || "and"}`
            : expr;
        })
        .join(" ");

      // await axios.put(`http://127.0.0.1:3000/trigger/${editIdTrigger}`, {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/trigger/${editIdTrigger}`,
        {
          trigger_name: editTriggerName,
          severity: editSeverity,
          expression: editExpression,
          ok_event_generation: editOk_eve,
          recovery_expression: editRecoveryExpression,
          enabled: editEnabled,
          expressionPart: formattedExpressionParts,
          expressionRecoveryPart: formattedRecoveryParts,
          userRole: localStorage.getItem("userRole"),
          userName: localStorage.getItem("username"),
        },
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (refreshTriggers) {
        refreshTriggers();
      } else {
        fetchTriggerData();
      }

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
    <>
    <Container maxWidth={false} >
       {DataGroupByHost.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">No triggers found</Typography>
        </Paper>
      ) : (
    <Box sx={{ width: 1 }}>
      {DataGroupByHost.map((group, index) => (
        <Box key={index} sx={{ mb: 4 ,mt:4}}>
          <Box sx={{ mb:3}}>
          <Typography
            variant="h6"
            sx={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#242d5d",
              borderRadius: "80px",
              display: "inline-block",
              color: "white",
              fontWeight: "semi-bold",
              minWidth: "100px",
              textAlign: "center",
              p: 1.5,             
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",          
              width: "100%",             
              // margin: "0 auto",          
            }}
          >
            {group.host_id.hostname}
          </Typography>
          </Box>
          
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              "& .MuiPaper-root": { boxShadow: "none" },
              backgroundColor: "transparent",
              mb: 10,
              border: "2px solid white", 
              borderRadius: "8px", 
              overflow: "hidden",
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
                  // "&:nth-of-type(even)": {backgroundColor: "transparent" },
                  "&:nth-of-type(odd)": { backgroundColor: "#f6f8ff" },
                  "&:hover": {
                    backgroundColor: "#ebf1ff",
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
                    OK event generation
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
                    <TableCell
                      align="center"
                      sx={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip
                        title={trigger.expression}  // ใช้ข้อความจาก trigger.expression
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: "white",
                              color: "black",
                              padding: "10px",
                              borderRadius: "8px",
                              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                              maxWidth: "400px",
                              fontSize: "14px",
                            },
                          },
                        }}
                      >
                        <Typography sx={{ cursor: "pointer", fontSize: "14px" }}>
                          {trigger.expression}
                        </Typography>
                      </Tooltip>
                    </TableCell>


                    {/* Ok event generation */}
                    <TableCell
                      align="center"
                      sx={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip
                        title={
                          trigger.ok_event_generation.toLowerCase() === "recovery expression"
                            ? (
                              <Box>
                                {trigger.recovery_expression}
                              </Box>
                            )
                            : ""
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: "white",
                              color: "black",
                              padding: "10px",
                              borderRadius: "8px",
                              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                              maxWidth: "400px",
                              fontSize: "14px",
                            },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          {trigger.ok_event_generation.toLocaleUpperCase()}
                        </Typography>
                      </Tooltip>
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
                <TableCell align="center">
                  <Button
                    id="fade-button"
                    aria-controls={open ? "fade-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                    sx={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      minWidth: "unset",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        backgroundColor: "rgba(175, 175, 255, 0.1)",
                      },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 24, color: "#242d5d", }} />
                  </Button>

                  <Menu
                    id="fade-menu"
                    MenuListProps={{
                      "aria-labelledby": "fade-button",
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                  >

                    <MenuItem onClick={() => handleEditClick(trigger)} sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="medium"
                        sx={{
                          color: "black",
                          width: "40px",
                          height: "40px",
                          minWidth: "unset",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        <EditNoteIcon fontSize="inherit" color="warning" />
                      </IconButton>
                      <Typography sx={{ fontSize: 14, color: "black", marginLeft: 1 }}>Edit</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleDeleteClick(trigger)} sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "black",
                          width: "40px",
                          height: "40px",
                          minWidth: "unset",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                      <Typography sx={{ fontSize: 14, color: "black", marginLeft: 1 }}>Delete</Typography>
                    </MenuItem>
                  </Menu>
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
                    gap: 1,
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
              <Box sx={{ gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Expression
                  </Typography>
                  <Button
                    onClick={handleAddExpression}
                    sx={{
                      ml: 3,
                      fontSize: 12,
                      color: "blue",
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Add Expression
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                {expressionParts.map((part, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                  >
                    {/* functionofitem section */}
                    <TextField
                      select
                      value={part.functionofItem}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "functionofItem",
                          e.target.value
                        )
                      }
                      label="Function"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {functionofItem.map((fn) => (
                        <MenuItem key={fn.value} value={fn.value}>
                          {fn.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {/* Duration section */}
                    <TextField
                      value={part.duration}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      label="Duration"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Item Selection */}
                    <TextField
                      select
                      value={part.item}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "item",
                          e.target.value
                        )
                      }
                      size="small"
                      label="Item"
                      sx={{
                        width: "40%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {items.map((item) => (
                        <MenuItem key={item._id} value={item.item_name}>
                          {item.item_name}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Operation Selection */}
                    <TextField
                      select
                      value={part.operation}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "operation",
                          e.target.value
                        )
                      }
                      label="Operation"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {operations.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      value={part.value}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      label="Value"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Operator Selection (show only if not the last row) */}
                    {index < expressionParts.length - 1 && (
                      <TextField
                        select
                        value={part.operator || "and"}
                        onChange={(e) =>
                          handleExpressionPartChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        label="Operator"
                        size="small"
                        sx={{
                          width: "8%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {operators.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Remove button (only show for rows after the first) */}
                    {index > 0 && (
                      <Typography
                        onClick={() => handleRemoveExpression(index)}
                        sx={{
                          fontSize: 12,
                          color: "red",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Remove
                      </Typography>
                    )}
                  </Box>
                ))}
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
                    gap: 1,
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mt: -2,
                      mb: -1,
                    }}
                  >
                    <Button
                      onClick={handleAddRecovery}
                      sx={{
                        fontSize: 12,
                        color: "blue",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Add Recovery Expression
                    </Button>
                  </Box>
                  {recoveryParts.map((part, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                    >
                      {/* functionofitem section */}
                      <TextField
                        select
                        value={part.functionofItem}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "functionofItem",
                            e.target.value
                          )
                        }
                        label="Function"
                        size="small"
                        sx={{
                          width: "10%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {functionofItem.map((fn) => (
                          <MenuItem key={fn.value} value={fn.value}>
                            {fn.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      {/* Duration section */}
                      <TextField
                        value={part.duration}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        label="Duration"
                        size="small"
                        sx={{
                          width: "10%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      />

                      {/* Item Selection */}
                      <TextField
                        select
                        value={part.item}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "item",
                            e.target.value
                          )
                        }
                        size="small"
                        label="Item"
                        sx={{
                          width: "40%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {items.map((item) => (
                          <MenuItem key={item._id} value={item.item_name}>
                            {item.item_name}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Operation Selection */}
                      <TextField
                        select
                        value={part.operation}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "operation",
                            e.target.value
                          )
                        }
                        label="Operation"
                        size="small"
                        sx={{
                          width: "10%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {operations.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        value={part.value}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        label="Value"
                        size="small"
                        sx={{
                          width: "10%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      />

                      {/* Operator Selection (show only if not the last row) */}
                      {index < recoveryParts.length - 1 && (
                        <TextField
                          select
                          value={part.operator || "and"}
                          onChange={(e) =>
                            handleRecoveryPartChange(
                              index,
                              "operator",
                              e.target.value
                            )
                          }
                          label="Operator"
                          size="small"
                          sx={{
                            width: "8%",
                            backgroundColor: "white",
                            "& .MuiInputBase-input": {
                              fontSize: 14,
                            },
                          }}
                        >
                          {operators.map((op) => (
                            <MenuItem key={op.value} value={op.value}>
                              {op.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}

                      {/* Remove button (only show for rows after the first) */}
                      {index > 0 && (
                        <Typography
                          onClick={() => handleRemoveRecovery(index)}
                          sx={{
                            fontSize: 12,
                            color: "red",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Remove
                        </Typography>
                      )}
                    </Box>
                  ))}
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
      )}
  </Container>
  {/* </Box> */}
  </>
  );
};

export default TriggerComponent;
