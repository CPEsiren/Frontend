import { useEffect, useState } from "react";
import { Item, ITrigger } from "../interface/InterfaceCollection";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { InfoOutlined } from "@mui/icons-material";

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
  MenuItem,
  Container,
  Menu,
  Fade,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  onDuplicateTrigger?: (trigger: ITrigger) => void;
}

const functionofItem = [
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "last", label: "Latest" },
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

const TriggerComponent = ({
  refreshTriggers,
  onDuplicateTrigger,
}: TriggerComponentProps) => {
  //Global State
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({
    trigger_name: false,
    severity: false,
    expression: false,
    ok_eventGen: false,
    recoveryExpression: false,
  });

  const [expandedGroup, setExpandedGroup] = useState<string | false>(false);

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
  const handleAccordionChange =
    (groupId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedGroup(isExpanded ? groupId : false);
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
        setDataGroupByHost(DataIndexHost);

        // Set the first group as expanded by default if there are groups
        if (DataIndexHost.length > 0) {
          setExpandedGroup(DataIndexHost[0].host_id._id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // setError("Failed to fetch trigger data");
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
    if ("functionofItem" === field && value === "last") {
      newParts[index] = {
        ...newParts[index],
        [field]: value,
        ["duration"]: "",
      };
    } else {
      newParts[index] = { ...newParts[index], [field]: value };
    }
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
    if ("functionofItem" === field && value === "last") {
      newParts[index] = {
        ...newParts[index],
        [field]: value,
        ["duration"]: "",
      };
    } else {
      newParts[index] = { ...newParts[index], [field]: value };
    }
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
  const [selectedTrigger, setSelectedTrigger] = useState<ITrigger | null>(null);
  //Threshold Breach Duration
  const [ThresholdBreachDuration, setThresholdBreachDuration] =
    useState<number>(0);

  const handleEditClick = (trigger: ITrigger) => {
    // console.log("Editing trigger ID:", trigger._id); // ตรวจสอบค่า ID
    setSelectedTrigger(trigger);
    setEditTriggerName(trigger.trigger_name);
    setEditIdTrigger(trigger._id);
    setEditSeverity(trigger.severity);
    setEditOk_eve(trigger.ok_event_generation);
    setEditEnabled(trigger.enabled);
    setThresholdBreachDuration(trigger.thresholdDuration);

    // Set expression parts from trigger data
    if (trigger.expressionPart && trigger.expressionPart.length > 0) {
      setExpressionParts(
        trigger.expressionPart.map((part) => ({
          item: part.item || "",
          operation: part.operation || "",
          value: part.value || "",
          operator: part.operator || "and",
          functionofItem: part.functionofItem || "",
          duration: part.duration?.toString(),
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
        // console.log("Fetched items:", items); // Debug log
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
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    trigger: ITrigger
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrigger(trigger);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const validateForm = () => {
    // Check basic fields
    const basicFieldsValid = {
      trigger_name: !editTriggerName,
      severity: !editSeverity,
      ok_eventGen: !editOk_eve,
    };

    // Check expression parts
    const expressionPartsValid = expressionParts.every((part) => {
      return (
        part.item &&
        part.operation &&
        part.value &&
        part.functionofItem &&
        (part.functionofItem === "last" || part.duration)
      );
    });

    // Check recovery expression parts if needed
    const recoveryPartsValid =
      editOk_eve !== "resolved expression" ||
      recoveryParts.every((part) => {
        return (
          part.item &&
          part.operation &&
          part.value &&
          part.functionofItem &&
          (part.functionofItem === "last" || part.duration)
        );
      });

    // Update errors state
    setErrors({
      trigger_name: basicFieldsValid.trigger_name,
      severity: basicFieldsValid.severity,
      expression: !expressionPartsValid,
      ok_eventGen: basicFieldsValid.ok_eventGen,
      recoveryExpression:
        editOk_eve === "resolved expression" && !recoveryPartsValid,
    });

    // Return true if all validations pass
    return (
      !Object.values(basicFieldsValid).some((error) => error) &&
      expressionPartsValid &&
      recoveryPartsValid
    );
  };
  const handleEditSubmit = async () => {
    if (!editIdTrigger) {
      console.error("No editIdTrigger found!");
      return;
    }

    // Check if form is valid before submitting
    if (!validateForm()) {
      // Check which validation failed and show appropriate message
      const expressionMissing = expressionParts.some(
        (part) =>
          !part.item ||
          !part.operation ||
          !part.value ||
          !part.functionofItem ||
          (part.functionofItem !== "last" && !part.duration)
      );

      const recoveryMissing =
        editOk_eve === "resolved expression" &&
        recoveryParts.some(
          (part) =>
            !part.item ||
            !part.operation ||
            !part.value ||
            !part.functionofItem ||
            (part.functionofItem !== "last" && !part.duration)
        );

      let errorMessage = "Please fill in all required fields";

      if (expressionMissing) {
        errorMessage =
          "All expression fields are required. Please complete all expression fields.";
      } else if (recoveryMissing) {
        errorMessage =
          "All recovery expression fields are required. Please complete all recovery expression fields.";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      return;
    }

    setFormLoading(true);
    try {
      // Format expression parts for submission
      const formattedExpressionParts = expressionParts.map((part) => ({
        item: part.item,
        operation: part.operation,
        value: part.value,
        operator: part.operator,
        functionofItem: part.functionofItem,
        duration: part.duration,
      }));

      const editExpression = expressionParts
        .map((part, idx) => {
          // Format: functionofItem(item,duration) operation value
          const durationInMinutes =
            part.functionofItem === "last" ? "" : `${part.duration}`;
          const functionCall =
            part.functionofItem !== "last"
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
        duration: part.duration,
      }));

      const editRecoveryExpression = recoveryParts
        .map((part, idx) => {
          // Format: functionofItem(item,duration) operation value
          const durationInMinutes =
            part.functionofItem === "last" ? "" : `${part.duration}`;
          const functionCall =
            part.functionofItem !== "last"
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
          thresholdDuration: ThresholdBreachDuration,
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

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ mb: 3, mt: 3 }}>
          {DataGroupByHost.map((group) => (
            <Accordion
              key={group.host_id._id}
              // expanded={expandedGroup === group.host_id._id}
              onChange={handleAccordionChange(group.host_id._id)}
              sx={{ mb: 2}}
            
            >
             <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                sx={{ backgroundColor: "#1f2b5d" }}
              >
                <Typography fontWeight="medium" sx={{ color: "white" }}>
                  {group.host_id.hostname.toUpperCase()} 
                  <Box
                    component="span"
                    sx={{
                      border: "3px solid rgb(79, 93, 155)", 
                      fontSize: "15px",
                      borderRadius: "50px", 
                      padding: "3px 8px", 
                      color: "white", 
                      marginLeft:"15px",
                    }}
                  >
                    {group.triggers.length}{" "}
                    {group.triggers.length === 1 ? "trigger" : "triggers"}
                  </Box>
                  
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                {group.triggers.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body1">
                      No triggers for this host
                    </Typography>
                  </Paper>
                ) : (
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
                              Trigger Name
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: "black" }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Severity
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ color: "black" }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Expression
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ color: "black" }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              OK event generation
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ color: "black" }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Status
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ color: "black" }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Actions
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.triggers.map((trigger) => (
                          <TableRow key={trigger._id} 
                          sx={{
                            "&:hover": {
                              backgroundColor: "#EBF5FF"
                              
                            },
                          }}
                          >
                            <TableCell
                              sx={{
                                wordBreak: "break-word",
                                hyphens: "auto",
                              }}
                            >
                              <Typography variant="body2">
                                {trigger.trigger_name}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: (() => {
                                  switch (trigger.severity.toLowerCase()) {
                                    case "warning":
                                      return "#FFA500";
                                    case "critical":
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
                                title={trigger.expression}
                                arrow
                                placement="top"
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      backgroundColor: "white",
                                      color: "black",
                                      padding: "10px",
                                      borderRadius: "8px",
                                      boxShadow:
                                        "0px 4px 10px rgba(0, 0, 0, 0.2)",
                                      maxWidth: "400px",
                                      fontSize: "14px",
                                    },
                                  },
                                }}
                              >
                                <Typography
                                  sx={{ cursor: "pointer", fontSize: "14px" }}
                                >
                                  {trigger.expression}
                                </Typography>
                              </Tooltip>
                            </TableCell>
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
                                  trigger.ok_event_generation.toLowerCase() ===
                                  "resolved expression" ? (
                                    <Box>{trigger.recovery_expression}</Box>
                                  ) : (
                                    ""
                                  )
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
                                      boxShadow:
                                        "0px 4px 10px rgba(0, 0, 0, 0.2)",
                                      maxWidth: "400px",
                                      fontSize: "14px",
                                      
                                    },
                                  },
                                }}
                              >
                                <Typography
                                  sx={{ cursor: "pointer", fontSize: "14px" }}
                                >
                                  {trigger.ok_event_generation.toLocaleUpperCase()}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                color: trigger.enabled ? "green" : "red",
                                fontWeight: "bold",
                              }}
                            >
                              {trigger.enabled ? "Enabled" : "Disabled"}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                aria-controls={`fade-menu-${trigger._id}`}
                                aria-haspopup="true"
                                onClick={(event) =>
                                  handleMenuClick(event, trigger)
                                }
                                sx={{
                                  justifySelf: "center",
                                  borderRadius: "50%",
                                  width: "40px",
                                  height: "40px",
                                  minWidth: "unset",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  "&:hover": {
                                    backgroundColor: "rgb(239, 239, 255)",
                                  },
                                }}
                              >
                                <MoreVertIcon
                                  sx={{ fontSize: 24, color: "#242d5d" }}
                                />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Menu
          id="fade-menu"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          sx={{
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            "& .MuiMenu-paper": {
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {/* Edit */}
          <MenuItem
            onClick={() => {
              if (selectedTrigger) {
                handleEditClick(selectedTrigger);
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <EditNoteIcon sx={{ color: "warning.main", fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: 14,
                color: "black",
                marginLeft: 1,
              }}
            >
              Edit
            </Typography>
          </MenuItem>

          {/* Duplicate - if applicable */}
          <MenuItem
            onClick={() => {
              if (selectedTrigger && onDuplicateTrigger) {
                onDuplicateTrigger(selectedTrigger);
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ContentCopyIcon sx={{ color: "warning.main", fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: 14,
                color: "black",
                marginLeft: 1,
              }}
            >
              Duplicate
            </Typography>
          </MenuItem>

          {/* Delete */}
          <MenuItem
            onClick={() => {
              if (selectedTrigger) {
                handleDeleteClick(selectedTrigger);
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DeleteIcon sx={{ color: "error.main", fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: 14,
                color: "black",
                marginLeft: 1,
              }}
            >
              Delete
            </Typography>
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Edit Trigger</DialogTitle>
          <DialogContent>
            <Paper elevation={0} sx={{ px: 3, backgroundColor: "#FFFFFB" }}>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  border: "2px solid rgb(232, 232, 232)",
                  borderRadius: 3,
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    color: "black",
                    fontWeight: "medium",
                    width: "10%",
                    mb: 2,
                  }}
                >
                  TRIGGER
                </Typography>
                {/* Trigger Name field */}
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
                    error={errors.trigger_name}
                    helperText={
                      errors.trigger_name ? "Trigger name is required" : ""
                    }
                  />
                </Box>

                {/* Threshold Breach Duration selection field */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: 150,
                      width: "13%",
                    }}
                  >
                    <Typography color="error" {...typographyProps}>
                      *
                    </Typography>
                    <Typography sx={{ ml: 1 }} {...typographyProps}>
                      Threshold Breach Duration
                    </Typography>
                  </Box>
                  <TextField
                    select
                    value={ThresholdBreachDuration}
                    onChange={(e) =>
                      setThresholdBreachDuration(parseInt(e.target.value))
                    }
                    size="small"
                    sx={{
                      backgroundColor: "white",
                      "&.MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  >
                    <MenuItem value={0}>Real-Time</MenuItem>
                    {[...Array(6)].map((_, index) => (
                      <MenuItem
                        key={index + 1}
                        value={(index * 5 + 5) * 60 * 1000}
                      >
                        {index * 5 + 5} minute.
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Severity field */}
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
                      Severity
                    </Typography>
                    <Tooltip
                      title={
                        <Box sx={{ p: 1 }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="#FFA500"
                            >
                              Warning
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ ml: 1, fontSize: 13 }}
                            >
                              Moderate - Requires Monitoring
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                display: "block",
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              There is a potential issue, but it has not yet
                              directly impacted network operations. Monitoring
                              is required, and preventive action may be needed
                              to prevent escalation.
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="#FF0000"
                            >
                              Critical
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ ml: 1, fontSize: 13 }}
                            >
                              Severe - Immediate Action Required
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                display: "block",
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              The issue is affecting network operations,
                              potentially causing service disruptions or
                              failures. Immediate action is required to minimize
                              damage.
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="#8B0000"
                            >
                              Disaster
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ ml: 1, fontSize: 13 }}
                            >
                              Catastrophic - Full System Failure
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                display: "block",
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              The network or system has completely failed,
                              severely impacting the organization or business.
                              Emergency disaster recovery measures must be
                              implemented immediately.
                            </Typography>
                          </Box>
                        </Box>
                      }
                      arrow
                      placement="right"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "white",
                            color: "black",
                            maxWidth: "350px",
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                            borderRadius: "8px",
                            p: 1.5,
                          },
                        },
                      }}
                    >
                      <IconButton>
                        <InfoOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
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
                      { level: "Warning", color: "#FFA500" },
                      { level: "Critical", color: "#FF0000" },
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  {expressionParts.map((part, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                      }}
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
                        error={errors.expression && !part.functionofItem}
                        required
                        label="Function"
                        size="small"
                        sx={{
                          width: "12%",
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
                        disabled={part.functionofItem === "last"}
                        required={part.functionofItem !== "last"}
                        error={
                          errors.expression &&
                          part.functionofItem !== "last" &&
                          !part.duration
                        }
                        select
                        label="Interval"
                        size="small"
                        sx={{
                          width: "11%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        <MenuItem value="15m">15m</MenuItem>
                        <MenuItem value="30m">30m</MenuItem>
                        <MenuItem value="1h">1h</MenuItem>
                      </TextField>

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
                          width: "13%",
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
                        <IconButton
                          onClick={() => handleRemoveExpression(index)}
                          sx={{
                            fontSize: 12,
                            color: "red",
                            cursor: "pointer",
                            // "&:hover": {
                            //   textDecoration: "underline",
                            // },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>

                {/* OK event generation */}
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
                      { level: "Resolved expression", color: "#808080" },
                      { level: "None", color: "#808080" },
                    ].map(({ level, color }) => (
                      <Button
                        key={level}
                        variant={
                          editOk_eve === level.toLowerCase()
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => {
                          setEditOk_eve(level.toLowerCase());
                        }}
                        sx={{
                          fontSize: 12,
                          minWidth: "auto",
                          flex: "1 0 auto",
                          color:
                            editOk_eve === level.toLowerCase()
                              ? "white"
                              : color,
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
                {editOk_eve === "resolved expression" && (
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
                        Add Resolved Expression
                      </Button>
                    </Box>
                    {recoveryParts.map((part, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
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
                            width: "12%",
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
                          select
                          value={part.duration}
                          onChange={(e) =>
                            handleRecoveryPartChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          disabled={part.functionofItem === "last"}
                          label="Interval"
                          size="small"
                          sx={{
                            width: "11%",
                            backgroundColor: "white",
                            "& .MuiInputBase-input": {
                              fontSize: 14,
                            },
                          }}
                        >
                          <MenuItem value="15m">15m</MenuItem>
                          <MenuItem value="30m">30m</MenuItem>
                          <MenuItem value="1h">1h</MenuItem>
                        </TextField>

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
                            width: "13%",
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
                          <IconButton
                            onClick={() => handleRemoveRecovery(index)}
                            sx={{
                              fontSize: 12,
                              color: "red",
                              cursor: "pointer",
                              // "&:hover": {
                              //   textDecoration: "underline",
                              // },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Enabled Switch */}
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
    </>
  );
};
export default TriggerComponent;
