import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Pagination,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
} from "@mui/material";
import { Item } from "../../../interface/InterfaceCollection";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface EditFormData {
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
}

interface FormErrors {
  item_name?: string;
  oid?: string;
  type?: string;
  unit?: string;
  interval?: number;
}


const DeviceItemComponent = ({ items }: { items: Item[] }) => {
  const [items2, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const pageCount = Math.ceil(items.length / itemsPerPage);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/item/${itemToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
      }

      // Remove the item from the local state
      setItems(items.filter((item) => item._id !== itemToDelete._id));

      setSnackbar({
        open: true,
        message: "Item deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete item",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };


  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being changed
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate item_name
    if (!editForm.item_name.trim()) {
      errors.item_name = "Item name is required";
      isValid = false;
    }

    // Validate oid
    if (!editForm.oid.trim()) {
      errors.oid = "Oid is required";
      isValid = false;
    }

    // Validate type
    if (!editForm.type.trim()) {
      errors.type = "Type is required";
      isValid = false;
    }

    // Validate unit
    if (!editForm.unit.trim()) {
      errors.unit = "Unit is required";
      isValid = false;
    }

    if (!editForm.interval || editForm.interval <= 0) {
      errors.interval = 0;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  

  const handleEditSubmit = async () => {
    if (!editingItem) return;

    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/item/edit/${editingItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.statusText}`);
      }

      setItems(
        items.map((item) =>
          item._id === editingItem._id ? { ...item, ...editForm } : item
        )
      );

      setSnackbar({
        open: true,
        message: "Item updated successfully",
        severity: "success",
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      setSnackbar({
        open: true,
        message: "Failed to update item",
        severity: "error",
      });
    } finally {
      setFormLoading(false);
      setIsSubmitting(false);
    }
  };

  const [editForm, setEditForm] = useState<EditFormData>({
    item_name: "",
    oid: "",
    type: "",
    unit: "",
    interval: 60,
  });

  const resetFormState = () => {
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    resetFormState(); // Clear errors when closing
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setEditForm({
      item_name: item.item_name,
      oid: item.oid,
      type: item.type,
      unit: item.unit,
      interval: item.interval,
    });
    resetFormState(); // Clear any previous errors
    setEditDialogOpen(true);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {items
          .slice((page - 1) * itemsPerPage, page * itemsPerPage)
          .map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 0 }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      mr: 1,
                      "&:hover": {
                        backgroundColor: "warning.light",
                      },
                    }}
                    onClick={() => handleEditClick(item)}
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
                    onClick={() => handleDeleteClick(item)}
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
                    maxHeight: "3.6em", // 3 lines * 1.2em line-height
                  }}
                >
                  {item.item_name}
                </Typography>
                <Typography>OID: {item.oid}</Typography>
                <Typography>Type: {item.type}</Typography>
                <Typography>Unit: {item.unit}</Typography>
                <Typography>Interval: {item.interval}</Typography>
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog} // Use the new handler here
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Item_name"
              name="item_name"
              value={editForm.item_name}
              onChange={handleTextFieldChange}
              fullWidth
              required
              error={!!formErrors.item_name}
              helperText={formErrors.item_name}
            />

            <TextField
              label="OID"
              name="oid"
              value={editForm.oid}
              onChange={handleTextFieldChange}
              fullWidth
              required
              error={!!formErrors.oid}
              helperText={formErrors.oid}
            />

            <TextField
              label="Type"
              name="type"
              value={editForm.type}
              onChange={handleTextFieldChange}
              fullWidth
              required
              error={!!formErrors.type}
              helperText={formErrors.type}
            />
            <TextField
              label="Unit"
              name="unit"
              value={editForm.unit}
              onChange={handleTextFieldChange}
              fullWidth
              required
              error={!!formErrors.unit}
              helperText={formErrors.unit}
            />
            <TextField
              label="Interval"
              name="interval"
              type="number"
              value={editForm.interval}
              onChange={handleTextFieldChange}
              fullWidth
              required
              error={!!formErrors.interval}
              helperText={formErrors.interval}
            />
          </Box>
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
                  Are you sure you want to delete the item "
                  {itemToDelete?.item_name}"? This action cannot be undone.
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
    </Box>
  );
};

export default DeviceItemComponent;
