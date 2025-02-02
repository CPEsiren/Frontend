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
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddTemplate from "../components/Modals/AddTemplate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ITemplate } from "../interface/InterfaceCollection";
import { Item } from "../interface/InterfaceCollection";

interface EditFormData {
  template_name: string;
  description: string;
  items: Item[];
}

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
  const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(
    null
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
  const [editForm, setEditForm] = useState<EditFormData>({
    template_name: "",
    description: "",
    items: [],
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/template");
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
    setEditForm({
      template_name: template.template_name,
      description: template.description,
      items: [...template.items], // Create a deep copy of items
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTemplate) return;

    setFormLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:3000/template/edit/${editingTemplate._id}`,
        editForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) =>
            template._id === editingTemplate._id
              ? { ...template, ...editForm }
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

  const handleRemoveItem = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteClick = (template: ITemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/template/${templateToDelete._id}`
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

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {templates
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template._id}>
                <Box
                  sx={{
                    padding: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    height: "80%",
                    backgroundColor: "#f9f9f9",
                    transition: "opacity 0.3s ease-in-out",
                    opacity: 1,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      sx={{
                        mr: 0,
                        "&:hover": {
                          backgroundColor: "warning.light",
                        },
                      }}
                      onClick={() => handleEditClick(template)}
                    >
                      <EditIcon sx={{ color: "warning.main" }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        "&:hover": {
                          backgroundColor: "error.light",
                        },
                      }}
                      onClick={() => handleDeleteClick(template)}
                    >
                      <DeleteIcon sx={{ color: "error.main" }} />
                    </IconButton>
                  </Box>
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
                    }}
                  >
                    {template.template_name}
                  </Typography>
                  <Typography>Description: {template.description}</Typography>
                  <Typography>Items: {template.items.length}</Typography>
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

      {/* Add Template Modal */}
      <Dialog open={isModalOpen} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ borderBottom: 1, borderColor: "#a9a9a9" }}>
          <Typography variant="h6" component="div">
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Template Name"
              name="template_name"
              value={editForm.template_name}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={editForm.description}
              onChange={handleTextFieldChange}
              fullWidth
              required
            />
            {editForm.items.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Items
              </Typography>
            )}

            {editForm.items.map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <TextField
                  label="OID"
                  value={item.oid}
                  onChange={(e) =>
                    handleItemChange(index, "oid", e.target.value)
                  }
                  size="small"
                  required
                />
                <TextField
                  label="Type"
                  value={item.type}
                  onChange={(e) =>
                    handleItemChange(index, "type", e.target.value)
                  }
                  size="small"
                  required
                />
                <TextField
                  label="Unit"
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                  size="small"
                  required
                />
                {/* Add more items detail upper this sections */}
                <IconButton
                  onClick={() => handleRemoveItem(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
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
    </>
  );
};

export default Templates;
