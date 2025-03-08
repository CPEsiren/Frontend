import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import useWindowSize from "../../hooks/useWindowSize";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { InfoOutlined } from "@mui/icons-material";

import {
  ITemplate,
  ITriggerTemplate,
  Item,
} from "../../interface/InterfaceCollection";
import {
  ExpressionPart,
  RecoveryPart,
} from "../../interface/InterfaceCollection";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NumberFormatTextField from "../NumberFormatTextField";

interface AddTemplateProps {
  onClose: () => void;
  onSuccess?: (message: string, refreshCallback?: () => void) => void; // Updated with optional refresh callback
}
const functionofItem = [
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "last", label: "Lastest" },
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

// Type for new template before submission (without _id)
type NewTemplateItem = Omit<Item, "_id">;

const AddTemplate: React.FC<AddTemplateProps> = ({ onClose, onSuccess }) => {
  const windowSize = useWindowSize();
  const [template_name, setTemplateName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [items, setItems] = useState<NewTemplateItem[]>([]);
  const [item, setItem] = useState<NewTemplateItem>({
    item_name: "",
    oid: "",
    type: "",
    unit: "",
    interval: 60,
  });

  const [errorFieldItem, setErrorFieldItem] = useState({
    item_name: false,
    oid: false,
    type: false,
    unit: false,
    interval: false,
  });

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await storeNewTemplate();
    if (success) {
      setTemplateName("");
      setDescription("");
      setItems([]);
      setTriggers([]);

      // Close the modal
      onClose();
      if (onSuccess) {
        // Pass the success message with REFRESH keyword and a callback function
        onSuccess(
          `Template "${template_name}" successfully added. REFRESH`,
          () => {
            // This function will be called when the REFRESH link is clicked
            window.location.reload();
          }
        );
      }
    } else {
      // Show error alert
      alert("Failed to add template. Please try again.");
    }
  };

  const storeNewTemplate = async (): Promise<boolean> => {
    try {
      if (!template_name.trim()) {
        setSnackbarMessage("Template name is required");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }

      // Filter out empty items
      const filledItems = items.filter(
        (item) => item.item_name.trim() || item.oid.trim()
      );

      // Construct the template data with additional user info
      const templateData: Omit<ITemplate, "_id"> & {
        userRole: string | null;
        userName: string | null;
      } = {
        template_name,
        description,
        items: filledItems as Item[], // Type assertion to ignore *id
        triggers: triggers as ITriggerTemplate[], // Type assertion to ignore *id
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("username"),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/template`,
        templateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error storing template:", error);
      if (axios.isAxiosError(error)) {
        setSnackbarMessage(
          `Failed to store template: ${
            error.response?.data?.message || error.message
          }`
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(
          "An unexpected error occurred while storing the template"
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return false;
    }
  };

  // In your form submission or validation function
  const validateItemForm = () => {
    const newErrors = {
      item_name: !item.item_name,
      oid: !item.oid,
      type: !item.type,
      unit: !item.unit,
      interval: !item.interval,
    };
    setErrorFieldItem(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleAddRow = () => {
    if (validateItemForm()) {
      // Add the item to the list
      setItems([...items, item]);

      // Clear the item input fields after adding
      setItem({
        item_name: "",
        oid: "",
        type: "",
        unit: "",
        interval: 60,
      });

      // Clear errors
      setErrorFieldItem({
        item_name: false,
        oid: false,
        type: false,
        unit: false,
        interval: false,
      });

      // Show success notification
      setSnackbarMessage("Item added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleCopyItem = (itemToCopy: NewTemplateItem) => {
    // Set the item state to the copied item values
    setItem({
      item_name: itemToCopy.item_name,
      oid: itemToCopy.oid,
      type: itemToCopy.type,
      unit: itemToCopy.unit,
      interval: itemToCopy.interval,
    });

    // Show notification
    setSnackbarMessage("Item copied to input");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);

    // Optionally, scroll to the input section
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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

  const typographyProps = {
    fontSize: 14,
  };

  const [activeTab, setActiveTab] = useState("template");
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    // Prevent switching to trigger tab if there are no items
    if (newValue === "trigger" && items.length === 0) {
      setSnackbarMessage(
        "You need to add at least one item before creating triggers"
      );
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }

    // Reset error states when switching to trigger tab
    if (newValue === "trigger") {
      setErrorsFieldTrigger({
        trigger_name: false,
        severity: false,
        expression: false,
        ok_eventGen: false,
        recoveryExpression: false,
      });
    }

    setActiveTab(newValue);
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openConfirmDeleteItemAll, setOpenConfirmDeleteItemAll] =
    useState(false);

  const handleDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(true);
  };

  const handleConfirmDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(false);
    setItems([]);
  };

  const handleCancleDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(false);
  };

  //Trigger
  const [triggers, setTriggers] = useState<ITriggerTemplate[]>([]);
  const [trigger_name, setTrigger_name] = useState("");
  const [severity, setSeverity] = useState("");
  const [expression, setExpression] = useState("");
  const [ok_eventGen, setOk_eventGen] = useState<string>("");
  const [recoveryExpression, setRecoveryExpression] = useState<string>("");
  const [ThresholdBreachDuration, setThresholdBreachDuration] =
    useState<number>(0);

  // Expression parts state
  const [expressionParts, setExpressionParts] = useState<ExpressionPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      operator: "",
      functionofItem: "",
      duration: "15m",
    },
  ]);

  // Recovery parts state
  const [recoveryParts, setRecoveryParts] = useState<RecoveryPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      operator: "",
      functionofItem: "",
      duration: "15m",
    },
  ]);

  const [errorFieldTrigger, setErrorsFieldTrigger] = useState({
    trigger_name: false,
    severity: false,
    expression: false,
    ok_eventGen: false,
    recoveryExpression: false,
  });

  // Add new expression row
  const handleAddExpression = () => {
    setExpressionParts((prev) => [
      ...prev,
      { item: "", operation: "", value: "", functionofItem: "", duration: "" },
    ]);
  };

  // Update expression when parts change
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

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newExpression = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes = part.duration ? `${part.duration}m` : "";
        const functionCall = part.duration
          ? `${part.functionofItem}(${part.item},${durationInMinutes})`
          : `${part.functionofItem}(${part.item})`;
        const expr = `${functionCall} ${part.operation} ${part.value}`;
        return idx < validParts.length - 1
          ? `${expr} ${part.operator || "and"}`
          : expr;
      })
      .join(" ");
    setExpression(newExpression);
  };

  // Remove expression row
  const handleRemoveExpression = (index: number) => {
    if (expressionParts.length > 1) {
      const newParts = expressionParts.filter((_, i) => i !== index);
      setExpressionParts(newParts);

      // Update the final expression
      const validParts = newParts.filter(
        (part) => part.item && part.operation && part.value
      );
      const newExpression = validParts
        .map((part) => `${part.item} ${part.operation} ${part.value}`)
        .join(" and ");
      setExpression(newExpression);
    }
  };

  // Add new recovery row
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

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newRecovery = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes = part.duration ? `${part.duration}m` : "";
        const functionCall = part.duration
          ? `${part.functionofItem}(${part.item},${durationInMinutes})`
          : `${part.functionofItem}(${part.item})`;
        const expr = `${functionCall} ${part.operation} ${part.value}`;
        return idx < validParts.length - 1
          ? `${expr} ${part.operator || "and"}`
          : expr;
      })
      .join(" ");
    setRecoveryExpression(newRecovery);
  };

  // Remove recovery row
  const handleRemoveRecovery = (index: number) => {
    if (recoveryParts.length > 1) {
      const newParts = recoveryParts.filter((_, i) => i !== index);
      setRecoveryParts(newParts);

      // Update the final expression
      const validParts = newParts.filter(
        (part) => part.item && part.operation && part.value
      );
      const newRecovery = validParts
        .map((part) => `${part.item} ${part.operation} ${part.value}`)
        .join(" and ");
      setExpression(newRecovery);
    }
  };

  const validateForm = useCallback(() => {
    const isTemplateNameValid = template_name.trim() !== "";
    return isTemplateNameValid;
  }, []);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [template_name, validateForm]);

  const handleAddTrigger = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateTriggerForm()) {
      // Show error message based on which validation failed
      const expressionMissing = expressionParts.some(
        (part) =>
          !part.item ||
          !part.operation ||
          !part.value ||
          !part.functionofItem ||
          (part.functionofItem !== "last" && !part.duration)
      );

      const recoveryMissing =
        ok_eventGen === "resolved expression" &&
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

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setTriggers([
      ...triggers,
      {
        trigger_name,
        severity,
        expression,
        ok_event_generation: ok_eventGen,
        recovery_expression: recoveryExpression,
        thresholdDuration: ThresholdBreachDuration,
        expressionPart: expressionParts.map((part) => ({
          item: part.item,
          operation: part.operation,
          value: part.value,
          operator: part.operator || "and",
          functionofItem: part.functionofItem,
          duration: part.duration,
        })),
        expressionRecoveryPart: recoveryParts.map((part) => ({
          item: part.item,
          operation: part.operation,
          value: part.value,
          operator: part.operator || "and",
          functionofItem: part.functionofItem,
          duration: part.duration,
        })),
      },
    ]);

    // Reset form fields
    setTrigger_name("");
    setSeverity("");
    setExpression("");
    setOk_eventGen("");
    setRecoveryExpression("");
    setExpressionParts([
      {
        item: "",
        operation: "",
        value: "",
        operator: "",
        functionofItem: "",
        duration: "15m",
      },
    ]);
    setThresholdBreachDuration(0);
    setRecoveryParts([
      {
        item: "",
        operation: "",
        value: "",
        operator: "",
        functionofItem: "",
        duration: "15m",
      },
    ]);

    // Show success message
    setSnackbarMessage("Trigger added successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeleteTrigger = (index: number) => {
    const newTriggers = [...triggers];
    newTriggers.splice(index, 1);
    setTriggers(newTriggers);
  };

  const [isFormValid, setIsFormValid] = useState(false);

  const validateTriggerForm = () => {
    // Check if expression parts have all required fields
    const expressionPartsValid = expressionParts.every((part) => {
      return (
        part.item &&
        part.operation &&
        part.value &&
        part.functionofItem &&
        (part.functionofItem === "last" || part.duration)
      );
    });

    // Check if recovery parts have all required fields (when ok_eventGen is "resolved expression")
    const recoveryPartsValid =
      ok_eventGen !== "resolved expression" ||
      recoveryParts.every((part) => {
        return (
          part.item &&
          part.operation &&
          part.value &&
          part.functionofItem &&
          (part.functionofItem === "last" || part.duration)
        );
      });

    // Create error object
    const newErrors = {
      trigger_name: !trigger_name,
      severity: !severity,
      expression: !expressionPartsValid,
      ok_eventGen: !ok_eventGen,
      recoveryExpression:
        ok_eventGen === "resolved expression" && !recoveryPartsValid,
    };

    setErrorsFieldTrigger(newErrors);

    // Return true only if all validations pass
    return !Object.values(newErrors).some((error) => error);
  };

  const handleDuplicateTrigger = (index: number) => {
    const newTriggers = [...triggers];
    const duplicatedTrigger = {
      ...newTriggers[index],
      trigger_name: `${newTriggers[index].trigger_name}`,
    };
    setTrigger_name(duplicatedTrigger.trigger_name);
    setSeverity(duplicatedTrigger.severity);
    setExpression(duplicatedTrigger.expression);
    setRecoveryExpression(duplicatedTrigger.recovery_expression);
    setOk_eventGen(duplicatedTrigger.ok_event_generation);
    setThresholdBreachDuration(duplicatedTrigger.thresholdDuration);
    setExpressionParts(duplicatedTrigger.expressionPart);
    setRecoveryParts(duplicatedTrigger.expressionRecoveryPart);
  };

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {windowSize.width > 600 && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0 }} />
      )}

      <Paper elevation={0} sx={{ px: 3, backgroundColor: "#FFFFFB", mt: -2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab value="template" label="Template" />
            <Tab value="item" label="Item" />
            {items.length === 0 ? (
              <Tooltip title="Add at least one item before creating triggers">
                <Box component="span" sx={{ display: "inline-block" }}>
                  <Tab value="trigger" label="Trigger" disabled={true} />
                </Box>
              </Tooltip>
            ) : (
              <Tab value="trigger" label="Trigger" />
            )}
          </Tabs>
          {activeTab === "template" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 3,
                gap: 2,
                border: "2px solid rgb(232, 232, 232)",
                borderRadius: 3,
                mt: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "80%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                    minWidth: 150,
                  }}
                >
                  <Typography color="error" {...typographyProps}>
                    *
                  </Typography>
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Template name
                  </Typography>
                </Box>
                <TextField
                  {...textFieldProps}
                  value={template_name}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "80%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                    minWidth: 150,
                  }}
                >
                  <Typography sx={{ ml: 1 }} {...typographyProps}>
                    Description
                  </Typography>
                </Box>
                <TextField
                  {...textFieldProps}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>
            </Box>
          )}
          {activeTab === "item" && (
            <Box>
              {(errorFieldItem.item_name ||
                errorFieldItem.oid ||
                errorFieldItem.type ||
                errorFieldItem.interval) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Please fill in all required fields for the item.
                </Alert>
              )}
              <Box
                sx={{
                  gap: 2,
                  border: "2px solid rgb(232, 232, 232)",
                  borderRadius: 3,
                  mt: 3,
                  p: 3,
                }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item's name</TableCell>
                        <TableCell>OID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Update Interval(s)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={item.item_name}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                item_name: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={item.oid}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                oid: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            {...textFieldProps}
                            value={item.type}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                type: e.target.value.toLowerCase(),
                              })
                            }
                            size="small"
                            sx={{
                              width: 120,
                              backgroundColor: "white",
                              "& .MuiInputBase-input": {
                                fontSize: 14,
                              },
                            }}
                          >
                            <MenuItem value="counter">Counter</MenuItem>
                            <MenuItem value="integer">Integer</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={item.unit}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                unit: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            type="number"
                            value={item.interval}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                interval: parseInt(e.target.value, 10),
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "raw",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    onClick={handleAddRow}
                    sx={{
                      color: "white",
                      bgcolor: "#F25A28",
                      border: "1px solid #F25A28",
                      borderRadius: "8px",
                      width: "12%",
                      mr: 0.5,
                    }}
                  >
                    <AddIcon
                      sx={{
                        color: "white",
                        mr: 1,
                        // border: "2px solid",
                        "&.Mui-selected": {},
                        "&:focus": {
                          outline: "none",
                        },
                      }}
                    />
                    <Typography fontSize={14}> item</Typography>
                  </Button>
                  <Button
                    onClick={handleDeleteAllItems}
                    disabled={items.length === 0}
                    sx={{
                      color: "white",
                      bgcolor: "#F25A28",
                      border: "1px solid #F25A28",
                      borderRadius: "8px",
                    }}
                  >
                    <DeleteSweepIcon sx={{ color: "disable" }} />
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  gap: 2,
                  border: "2px solid rgb(232, 232, 232)",
                  borderRadius: 3,
                  mt: 3,
                  p: 3,
                }}
              >
                {items.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      mb: 3,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No items added yet. Create a item to get started.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">Item's name</TableCell>
                            <TableCell align="center">OID</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Unit</TableCell>
                            <TableCell align="center">
                              Update Interval
                            </TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((item, index) => (
                              <TableRow key={index}>
                                <TableCell align="center">
                                  {item.item_name}
                                </TableCell>
                                <TableCell align="center">{item.oid}</TableCell>
                                <TableCell align="center">
                                  {item.type}
                                </TableCell>
                                <TableCell align="center">
                                  {item.unit}
                                </TableCell>
                                <TableCell align="center">
                                  {item.interval}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    onClick={() => handleCopyItem(item)}
                                    title="Copy item"
                                  >
                                    <ContentCopyIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => handleDeleteRow(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={items.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
          {activeTab === "trigger" && (
            <Box>
              <Box
                sx={{
                  gap: 2,
                  border: "2px solid rgb(232, 232, 232)",
                  borderRadius: 3,
                  mt: 3,
                  p: 3,
                }}
              >
                {/* Trigger Name field */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
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
                    {...textFieldProps}
                    value={trigger_name}
                    onChange={(e) => setTrigger_name(e.target.value)}
                  />
                </Box>

                {/* Threshold Breach Duration selection field */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: 150,
                      width: "14%",
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
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
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
                          severity === level.toLowerCase()
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => setSeverity(level.toLowerCase())}
                        sx={{
                          fontSize: 12,
                          minWidth: "auto",
                          flex: "1 0 auto",
                          color:
                            severity === level.toLowerCase() ? "white" : color,
                          backgroundColor:
                            severity === level.toLowerCase()
                              ? color
                              : "transparent",
                          borderColor: color,
                          "&:hover": {
                            backgroundColor:
                              severity === level.toLowerCase()
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
                <Box sx={{ gap: 2, mb: 3 }}>
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
                    <Typography sx={{ ml: 1, mr: 2 }} {...typographyProps}>
                      Expression
                    </Typography>
                    <Button
                      onClick={handleAddExpression}
                      sx={{
                        color: "white",
                        textAlign: "center",
                        bgcolor: "#0281F2",
                        border: "1px solid #0281F2",
                        borderRadius: "8px",
                        gap: 1,
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      + Expression
                    </Button>
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
                          width: 1,
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
                            handleExpressionPartChange(
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
                          <MenuItem value="1m">1m</MenuItem>
                          <MenuItem value="5m">5m</MenuItem>
                          <MenuItem value="10m">10m</MenuItem>
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
                          {items.map((item, idx) => (
                            <MenuItem key={idx} value={item.item_name}>
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

                        {/* Value field */}
                        <NumberFormatTextField
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
                          <IconButton
                            onClick={() => handleRemoveExpression(index)}
                            sx={{
                              fontSize: 12,
                              color: "red",
                              cursor: "pointer",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* OK event generation */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
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
                          ok_eventGen === level.toLowerCase()
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => setOk_eventGen(level.toLowerCase())}
                        sx={{
                          fontSize: 12,
                          minWidth: "auto",
                          flex: "1 0 auto",
                          color:
                            ok_eventGen === level.toLowerCase()
                              ? "white"
                              : color,
                          backgroundColor:
                            ok_eventGen === level.toLowerCase()
                              ? color
                              : "transparent",
                          borderColor: color,
                          "&:hover": {
                            backgroundColor:
                              ok_eventGen === level.toLowerCase()
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
                {ok_eventGen === "resolved expression" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 2,
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
                          color: "white",
                          textAlign: "center",
                          bgcolor: "#0281F2",
                          border: "1px solid #0281F2",
                          borderRadius: "8px",
                          gap: 1,
                          mt: 2,
                          mb: 1,
                        }}
                      >
                        + Resolved Expression
                      </Button>
                    </Box>

                    {errorFieldTrigger.recoveryExpression && (
                      <Typography
                        color="error"
                        sx={{ fontSize: 12, ml: 4, mt: 1 }}
                      >
                        All recovery expression fields are required
                      </Typography>
                    )}

                    {recoveryParts.map((part, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                          width: 1,
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
                        <TextField
                          select
                          disabled={part.functionofItem === "last"}
                          required={part.functionofItem !== "last"}
                          value={part.duration}
                          onChange={(e) =>
                            handleRecoveryPartChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
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
                          <MenuItem value="1m">1m</MenuItem>
                          <MenuItem value="5m">5m</MenuItem>
                          <MenuItem value="10m">10m</MenuItem>
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
                          {items.map((item, index) => (
                            <MenuItem key={index} value={item.item_name}>
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

                        <NumberFormatTextField
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
                          <IconButton
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
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Button section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Button
                    onClick={handleAddTrigger}
                    variant="outlined"
                    sx={{
                      fontSize: 14,
                      color: "white",
                      bgcolor: "#0281F2",
                      borderColor: "white",
                      borderRadius: 2,
                      "&:hover": {
                        color: "white",
                        bgcolor: "#0274d9",
                        borderColor: "white",
                      },
                    }}
                  >
                    Add Trigger
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  gap: 2,
                  border: "2px solid rgb(232, 232, 232)",
                  borderRadius: 3,
                  mt: 3,
                  p: 3,
                }}
              >
                {/* Display triggers */}
                {triggers.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      mb: 3,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No triggers added yet. Create a trigger to get started.
                    </Typography>
                  </Box>
                ) : (
                  triggers.map((trigger, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        padding: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#0281F2", mb: 1 }}
                        >
                          {trigger.trigger_name}
                        </Typography>
                        <Chip
                          label={`Severity : ${trigger.severity}`}
                          sx={{
                            mr: 1,
                            mb: 1,
                            ...(trigger.severity === "critical" && {
                              backgroundColor: "#FF0000",
                            }),
                            ...(trigger.severity === "warning" && {
                              backgroundColor: "#FFA500",
                            }),
                            ...(trigger.severity === "disaster" && {
                              backgroundColor: "#8B0000",
                            }),
                            color: "#ffffff",
                          }}
                        />
                        <Chip
                          label={`OK Event : ${trigger.ok_event_generation}`}
                          sx={{ mb: 1, backgroundColor: "#e0e0e0" }}
                        />
                        <Chip
                          label={
                            ThresholdBreachDuration === 0
                              ? `Threshold Breach Duration : Real-Time.`
                              : `Threshold Breach Duration : ${
                                  ThresholdBreachDuration / 60000
                                } minute.`
                          }
                        />
                      </Box>
                      <Box
                        sx={{ flex: 1, pl: 2, borderLeft: "1px solid #e0e0e0" }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", mb: 1 }}
                        >
                          Expression:
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{ p: 1, backgroundColor: "#ffffff" }}
                        >
                          <code>{trigger.expression}</code>
                        </Paper>
                      </Box>
                      <Box
                        sx={{ flex: 1, pl: 2, borderLeft: "1px solid #e0e0e0" }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", mb: 1 }}
                        >
                          Resolved Expression:
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{ p: 1, backgroundColor: "#ffffff" }}
                        >
                          <code>
                            {trigger.recovery_expression === ""
                              ? "No resolved expression"
                              : trigger.recovery_expression}
                          </code>
                        </Paper>
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {/* Duplicate button */}
                        <IconButton
                          onClick={() => handleDuplicateTrigger(index)}
                          sx={{
                            width: 30,
                            color: "primary.main",
                            backgroundColor: "transparent",
                            mr: 1,
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>

                        {/* Delete button */}
                        <IconButton
                          onClick={() => handleDeleteTrigger(index)}
                          sx={{
                            width: 30,
                            color: "error.main",
                            backgroundColor: "transparent",
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              sx={{
                fontSize: 14,
                color: "black",
                borderColor: "#B9B9B9",
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outlined"
              disabled={items.length === 0 || template_name === ""}
              sx={{
                fontSize: 14,
                color: "white",
                bgcolor:
                  !(items.length === 0) && !(template_name === "")
                    ? "#0281F2"
                    : "#cccccc",
                borderColor: "white",
                borderRadius: 2,
                "&:hover": {
                  color: "white",
                  bgcolor:
                    !(items.length === 0) && !(template_name === "")
                      ? "#0274d9"
                      : "#cccccc",
                  borderColor: "white",
                },
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Paper>
      <Dialog
        open={openConfirmDeleteItemAll}
        onClose={handleCancleDeleteAllItems}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete all items? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancleDeleteAllItems} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteAllItems} color="error" autoFocus>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontSize: 14,
            "& .MuiAlert-icon": {
              fontSize: 20,
              mt: 0.5,
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddTemplate;
