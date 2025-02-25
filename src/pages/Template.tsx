import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Pagination,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  DialogContentText,
  TablePagination,
  MenuItem,
  Chip,
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddTemplate from "../components/Modals/AddTemplate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import {
  ExpressionPart,
  ItemTemplate,
  ITemplate,
  RecoveryPart,
} from "../interface/InterfaceCollection";
import TemplateIcon from "../assets/template.svg";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

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

const Templates: React.FC = () => {
  const windowSize = useWindowSize();
  const [isModalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Edit/Delete states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ITemplate>(
    {} as ITemplate
  );
  const [templateToDelete, setTemplateToDelete] = useState<ITemplate | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [item, setItem] = useState<ItemTemplate>({
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

  // Pagination edit
  const [pageEdit, setPageEdit] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      setEditingTemplate({
        ...editingTemplate,
        items: [...(editingTemplate.items || []), item],
      });
      // Clear errors
      setErrorFieldItem({
        item_name: false,
        oid: false,
        type: false,
        unit: false,
        interval: false,
      });
    }
  };

  const [openConfirmDeleteItemAll, setOpenConfirmDeleteItemAll] =
    useState(false);

  const handleDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(true);
  };

  const handleConfirmDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(false);
    setEditingTemplate({
      ...editingTemplate,
      items: [],
    });
  };

  const handleCancleDeleteAllItems = () => {
    setOpenConfirmDeleteItemAll(false);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/template`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const result = await response.json();
      setTemplates(result.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch templates",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEditClick = (template: ITemplate) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTemplate) return;

    setFormLoading(true);
    try {
      const requestData = {
        ...editingTemplate,
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("username"),
        oldtemplate_name: editingTemplate.template_name, // Assuming you want to store the original name
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/template/edit/${editingTemplate._id}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) =>
            template._id === editingTemplate._id
              ? { ...template, ...editingTemplate }
              : template
          )
        );

        setSnackbar({
          open: true,
          message: "Template updated successfully",
          severity: "success",
        });
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating template:", error);
      setSnackbar({
        open: true,
        message: "Failed to update template",
        severity: "error",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (template: ITemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/template/${templateToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userRole: localStorage.getItem("userRole"),
            userName: localStorage.getItem("username"),
            template_name: templateToDelete.template_name,
          }),
        }
      );

      if (response.status === 200) {
        setTemplates((prevTemplates) =>
          prevTemplates.filter(
            (template) => template._id !== templateToDelete._id
          )
        );

        setSnackbar({
          open: true,
          message: "Template deleted successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete template",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const pageCount = Math.ceil(templates.length / itemsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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

  const handleDeleteRow = (index: number) => {
    setEditingTemplate((prevTemplate) => ({
      ...prevTemplate,
      items: prevTemplate.items?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleChangePageEdit = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPageEdit(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPageEdit(0);
  };

  //Trigger Edit
  const [trigger_name, setTrigger_name] = useState("");
  const [severity, setSeverity] = useState("");
  const [expression, setExpression] = useState("");
  const [ok_eventGen, setOk_eventGen] = useState<string>("");
  const [recoveryExpression, setRecoveryExpression] = useState<string>("");

  const [errorFieldTrigger, setErrorsFieldTrigger] = useState({
    trigger_name: false,
    severity: false,
    expression: false,
    ok_eventGen: false,
    recoveryExpression: false,
  });

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

  // Add new expression row
  const handleAddExpression = () => {
    setExpressionParts((prev) => [
      ...prev,
      {
        item: "",
        operation: "",
        value: "",
        functionofItem: "",
        duration: "15m",
      },
    ]);
  };

  // Update expression when parts change
  const handleExpressionPartChange = (
    index: number,
    field: keyof ExpressionPart,
    value: string
  ) => {
    const newParts = [...expressionParts];
    newParts[index] = { ...newParts[index], [field]: value };
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
      {
        item: "",
        operation: "",
        value: "",
        functionofItem: "",
        duration: "15m",
      },
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

  const handleAddTrigger = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSubmitTrigger(e as unknown as React.FormEvent<HTMLFormElement>);
  };

  const handleSubmitTrigger = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setEditingTemplate((prevTemplate) => ({
      ...prevTemplate,
      triggers: [
        ...editingTemplate.triggers,
        {
          trigger_name,
          severity,
          expression,
          ok_event_generation: ok_eventGen,
          recovery_expression: recoveryExpression,
          expressionPart: expressionParts.map((part) => ({
            item: part.item,
            operation: part.operation,
            value: part.value,
            operator: part.operator || "and",
            functionofItem: part.functionofItem,
            duration: part.duration,
          })),
          // Store recoveryParts as expressionRecoveryPart in the model
          expressionRecoveryPart: recoveryParts.map((part) => ({
            item: part.item,
            operation: part.operation,
            value: part.value,
            operator: part.operator || "and",
            functionofItem: part.functionofItem,
            duration: part.duration,
          })),
        },
      ],
    }));

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
  };

  const validateForm = () => {
    const newErrors = {
      trigger_name: !trigger_name,
      severity: !severity,
      expression: !expression,
      ok_eventGen: !ok_eventGen,
      recoveryExpression:
        ok_eventGen === "recovery expression" && !recoveryExpression,
    };

    setErrorsFieldTrigger(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleDeleteTrigger = (index: number) => {
    const newTriggers = [...editingTemplate.triggers];
    newTriggers.splice(index, 1);
    setEditingTemplate((prevTemplate) => ({
      ...prevTemplate,
      triggers: newTriggers,
    }));
  };

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            TEMPLATES
          </Typography>
          <Button
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "9rem",
              height: "2.5rem",
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            Add Template
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {templates
              .slice((page - 1) * itemsPerPage, page * itemsPerPage)
              .map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template._id}>
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      height: "80%",
                      backgroundColor: "#f9f9f9",
                      transition: "opacity 0.3s ease-in-out",
                      opacity: 1,
                    }}
                  >
                    {/* Edit/Delete buttons positioned at the top right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        zIndex: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          padding: 0.5,
                          mr: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(255, 193, 7, 0.1)",
                          },
                        }}
                        onClick={() => handleEditClick(template)}
                      >
                        <EditIcon
                          sx={{ color: "warning.main", fontSize: 18 }}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          padding: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                          },
                        }}
                        onClick={() => handleDeleteClick(template)}
                      >
                        <DeleteIcon
                          sx={{ color: "error.main", fontSize: 18 }}
                        />
                      </IconButton>
                    </Box>

                    {/* Main template content */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <img
                        src={TemplateIcon}
                        alt="Template Icon"
                        style={{
                          width: "30%",
                          marginRight: 2,
                        }}
                      />
                      <Box sx={{ width: "70%" }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.2,
                            maxHeight: "3.6em",
                            maxWidth: "70%",
                          }}
                        >
                          {template.template_name}
                        </Typography>
                        <Typography variant="body2">
                          Description: {template.description}
                        </Typography>
                        <Typography variant="body2">
                          Items: {template.items.length}
                        </Typography>
                        <Typography variant="body2">
                          Trigger: {template.triggers.length}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
          {pageCount > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: 6,
                mb: 2,
              }}
            >
              <Pagination
                count={pageCount}
                page={page}
                onChange={handleChangePage}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Add Template Modal */}
      <Dialog open={isModalOpen} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle
          sx={{
            borderBottom: 0,
            borderColor: "#a9a9a9",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "medium", pt: 2, pl: 1 }}>
            New Template
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddTemplate onClose={handleClose} onSuccess={fetchTemplates} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: 0,
            borderColor: "#a9a9a9",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "medium", pt: 2, pl: 1 }}>
            Edit Template
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 0, width: "100%" }}>
            {windowSize.width > 600 && (
              <Box
                sx={{ display: "flex", justifyContent: "flex-start", mb: 0 }}
              />
            )}

            <Paper
              elevation={0}
              sx={{ px: 3, backgroundColor: "#FFFFFB", mt: -2 }}
            >
              <Box component="form">
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="Template" />
                  <Tab label="Item" />
                  <Tab label="Trigger" />
                </Tabs>
                {activeTab === 0 && (
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
                        required
                        value={editingTemplate.template_name}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            template_name: e.target.value,
                          })
                        }
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
                        required
                        value={editingTemplate.description}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            description: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Box>
                )}
                {activeTab === 1 && (
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
                                  required
                                  value={item.item_name}
                                  onChange={(e) =>
                                    setItem({
                                      ...item,
                                      item_name: e.target.value,
                                    })
                                  }
                                  error={errorFieldItem.item_name}
                                  helperText={
                                    errorFieldItem.item_name
                                      ? "Item name is required"
                                      : ""
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  {...textFieldProps}
                                  required
                                  value={item.oid}
                                  onChange={(e) =>
                                    setItem({
                                      ...item,
                                      oid: e.target.value,
                                    })
                                  }
                                  error={errorFieldItem.oid}
                                  helperText={
                                    errorFieldItem.oid ? "OID is required" : ""
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
                                  error={errorFieldItem.type}
                                  helperText={
                                    errorFieldItem.type
                                      ? "Type is required"
                                      : ""
                                  }
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
                                  error={errorFieldItem.unit}
                                  helperText={
                                    errorFieldItem.unit
                                      ? "Unit is required"
                                      : ""
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
                                  error={errorFieldItem.interval}
                                  helperText={
                                    errorFieldItem.interval
                                      ? "Interval is required"
                                      : ""
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
                            width: "17%",
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
                          <Typography fontSize={14}>another item</Typography>
                        </Button>
                        <Button
                          onClick={handleDeleteAllItems}
                          disabled={editingTemplate.items.length === 0}
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
                      {editingTemplate.items.length === 0 ? (
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
                                  <TableCell align="center">
                                    Item's name
                                  </TableCell>
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
                                {editingTemplate.items
                                  .slice(
                                    pageEdit * rowsPerPage,
                                    pageEdit * rowsPerPage + rowsPerPage
                                  )
                                  .map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell align="center">
                                        {item.item_name}
                                      </TableCell>
                                      <TableCell align="center">
                                        {item.oid}
                                      </TableCell>
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
                            count={editingTemplate.items.length}
                            rowsPerPage={rowsPerPage}
                            page={pageEdit}
                            onPageChange={handleChangePageEdit}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
                {activeTab === 2 && (
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
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
                          error={errorFieldTrigger.trigger_name}
                          helperText={
                            errorFieldTrigger.trigger_name
                              ? "Trigger name is required"
                              : ""
                          }
                        />
                      </Box>

                      {/* Severity field */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
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
                                  severity === level.toLowerCase()
                                    ? "white"
                                    : color,
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
                        {errorFieldTrigger.severity && (
                          <Typography
                            color="error"
                            sx={{ fontSize: 12, mt: 1 }}
                          >
                            Severity is required
                          </Typography>
                        )}
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
                          <Typography
                            sx={{ ml: 1, mr: 2 }}
                            {...typographyProps}
                          >
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
                                select
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
                              >
                                <MenuItem key={1} value={"15m"}>
                                  15m
                                </MenuItem>
                                <MenuItem key={2} value={"30m"}>
                                  30m
                                </MenuItem>
                                <MenuItem key={3} value={"60m"}>
                                  60m{" "}
                                </MenuItem>
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
                                error={errorFieldTrigger.expression}
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
                                {editingTemplate.items.map((item, index) => (
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
                                <IconButton
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
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      {/* OK event generation */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
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
                            { level: "Recovery expression", color: "#808080" },
                            { level: "None", color: "#808080" },
                          ].map(({ level, color }) => (
                            <Button
                              key={level}
                              variant={
                                ok_eventGen === level.toLowerCase()
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() =>
                                setOk_eventGen(level.toLowerCase())
                              }
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
                        {errorFieldTrigger.severity && (
                          <Typography
                            color="error"
                            sx={{ fontSize: 12, mt: 1 }}
                          >
                            OK event generation is required
                          </Typography>
                        )}
                      </Box>

                      {/* Recovery Expression field */}
                      {ok_eventGen === "recovery expression" && (
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
                              + Recovery Expression
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
                                label="Duration"
                                size="small"
                                sx={{
                                  width: "10%",
                                  backgroundColor: "white",
                                  "& .MuiInputBase-input": {
                                    fontSize: 14,
                                  },
                                }}
                              >
                                <MenuItem key={1} value={"15m"}>
                                  15m
                                </MenuItem>
                                <MenuItem key={2} value={"30m"}>
                                  30m
                                </MenuItem>
                                <MenuItem key={3} value={"60m"}>
                                  60m{" "}
                                </MenuItem>
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
                                error={errorFieldTrigger.expression}
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
                                {editingTemplate.items.map((item, index) => (
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
                      {editingTemplate.triggers.length === 0 ? (
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
                            No triggers added yet. Create a trigger to get
                            started.
                          </Typography>
                        </Box>
                      ) : (
                        editingTemplate.triggers.map((trigger, index) => (
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
                                sx={{
                                  fontWeight: "bold",
                                  color: "#0281F2",
                                  mb: 1,
                                }}
                              >
                                {trigger.trigger_name}
                              </Typography>
                              <Chip
                                label={`Severity: ${trigger.severity}`}
                                sx={{
                                  mr: 1,
                                  mb: 1,
                                  backgroundColor: "#e0e0e0",
                                }}
                              />
                              <Chip
                                label={`OK Event: ${trigger.ok_event_generation}`}
                                sx={{ mb: 1, backgroundColor: "#e0e0e0" }}
                              />
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                pl: 2,
                                borderLeft: "1px solid #e0e0e0",
                              }}
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
                              sx={{
                                flex: 1,
                                pl: 2,
                                borderLeft: "1px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold", mb: 1 }}
                              >
                                Recovery Expression:
                              </Typography>
                              <Paper
                                elevation={0}
                                sx={{ p: 1, backgroundColor: "#ffffff" }}
                              >
                                <code>
                                  {trigger.recovery_expression === ""
                                    ? "No recovery expression"
                                    : trigger.recovery_expression}
                                </code>
                              </Paper>
                            </Box>

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
                        ))
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
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
            Are you sure you want to delete the template "
            {templateToDelete?.template_name}
            "? This action cannot be undone.
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
    </>
  );
};

export default Templates;
