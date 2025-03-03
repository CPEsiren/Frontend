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
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Container,
  Fade,
  Menu,
  MenuItem,
} from "@mui/material";
import { IDevice, Item } from "../../../interface/InterfaceCollection";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

interface ApiResponse {
  status: string;
  message: string;
  data: Item[];
}

const DeviceItemComponent = ({ deviceData }: { deviceData: IDevice }) => {
  const [items, setItems] = useState<Item[]>(deviceData.items || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // State management
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [editForm, setEditForm] = useState<EditFormData>({
    item_name: "",
    oid: "",
    type: "",
    unit: "",
    interval: 60,
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    item: Item
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "interval" ? parseInt(value) || 0 : value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!editForm.item_name.trim()) {
      errors.item_name = "Item name is required";
      isValid = false;
    }

    if (!editForm.oid.trim()) {
      errors.oid = "OID is required";
      isValid = false;
    }

    if (!editForm.type.trim()) {
      errors.type = "Type is required";
      isValid = false;
    }

    if (!editForm.unit.trim()) {
      errors.unit = "Unit is required";
      isValid = false;
    }

    // For number type, check if it's a valid number and greater than 0
    // if (
    //   typeof editForm.interval !== "number" ||
    //   isNaN(editForm.interval) ||
    //   editForm.interval <= 0
    // ) {
    //   errors.interval = "Interval must be a number greater than 0";
    //   isValid = false;
    // }

    setFormErrors(errors);
    return isValid;
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
    setFormErrors({});
    setEditDialogOpen(true);
  };

  // Add this effect to listen for updates
  useEffect(() => {
    if (deviceData?.items) {
      setItems(deviceData.items);
    }
  }, [deviceData]);

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

    const requestBody = {
      ...editForm,
      // Add user role and username for tracking who made the edit
      userRole: localStorage.getItem("userRole"),
      userName: localStorage.getItem("username"),
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/item/edit/${editingItem._id}`,
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
        throw new Error(`Failed to update item: ${response.statusText}`);
      }

      // Update the item in the local state
      setItems((prevItems) =>
        prevItems.map((item) =>
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

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/item/${itemToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userRole: localStorage.getItem("userRole"),
            userName: localStorage.getItem("username"),
            itemToDelete_name: itemToDelete.item_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
      }

      // Remove the item from the local state
      setItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemToDelete._id)
      );

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

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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

  const pageCount = Math.ceil(items.length / itemsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      {items.length == 0 ? (
        <Typography
          sx={{ textAlign: "center", width: 1, fontSize: "1.2rem", py: 3 }}
        >
          No items found
        </Typography>
      ) : (
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
                    // height: "80%",
                    backgroundColor: "#f9f9f9",
                    transition: "opacity 0.3s ease-in-out",
                    opacity: 1,
                  }}
                >
                  {/* Manage */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "10%%",
                    }}
                  >
                    <IconButton
                      id="fade-button"
                      aria-controls={open ? "fade-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={(event) => handleMenuClick(event, item)}
                      sx={{
                        borderRadius: "50%",
                        width: "5",
                       
                        "&:hover": {
                          backgroundColor: "rgba(239, 239, 255, 0.1)",
                        },
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 24, color: "#242d5d" }} />
                    </IconButton>

                    {/* Menu */}
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
                          if (selectedItem) {
                            handleEditClick(selectedItem);
                          }
                          handleClose();
                        }}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <EditNoteIcon
                          sx={{ color: "warning.main", fontSize: 20 }}
                        />
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

                      {/* Delete */}
                      <MenuItem
                        onClick={() => {
                          if (selectedItem) {
                            handleDeleteClick(selectedItem);
                          }
                          handleClose();
                        }}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <DeleteIcon
                          sx={{ color: "error.main", fontSize: 20 }}
                        />
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
                  </Box>

                  <Box sx={{ flexGrow: 1,width: "100%",mt:-2.5 }}>
                    {/* This box will grow to fill available space */}
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
                        mb: 1,
                        width:"90%"
                      }}
                    >
                      {item.item_name}
                    </Typography>
                    <Typography>OID: {item.oid}</Typography>
                    <Typography>Type: {item.type}</Typography>
                    <Typography>Unit: {item.unit}</Typography>
                    <Typography>Interval: {item.interval}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
        </Grid>
      )}
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
            Are you sure you want to delete the item "{itemToDelete?.item_name}
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

      {/* Add Snackbar for notifications */}
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
    </Box>
  );
};

export default DeviceItemComponent;
