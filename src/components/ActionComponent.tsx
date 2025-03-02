import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

interface ActionComponentProps {
  _id: string;
  action_name: string;
  media_ids: {
    type: string;
  }[];
  messageProblemTemplate: string;
  messageRecoveryTemplate: string;
  duration: string;
  enabled: boolean;
}

const ActionComponent = () => {
  //Global state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const user_id = localStorage.getItem("user_id");

  //Actions
  const [actions, setActions] = useState<ActionComponentProps[]>([]);
  const fetchActions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:3000/action/user/${user_id}`
      );
      if (response.data.status === "success" && response.data.data.length > 0) {
        setActions(response.data.data);
      }

      if (response.data.status === "fail") {
        setActions([]);
        setError(response.data.message);
      }
    } catch (error) {
      setActions([]);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchActions();
  }, []);

  //Delete Actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeIdAction, setRemoveIdAction] = useState("");
  const [removeActionName, setRemoveActionName] = useState("");
  const hendleDeleteClick = (action: ActionComponentProps) => {
    setRemoveIdAction(action._id);
    setRemoveActionName(action.action_name);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!removeIdAction) return;

    try {
      await axios.delete(`http://127.0.0.1:3000/action/${removeIdAction}`);

      setSnackbar({
        open: true,
        message: "Action deleted successfully",
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
      fetchActions();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
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
      <Box sx={{ mb: 4 }}>
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
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Action Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Number of Media
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Message Problem
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Message Recovery
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Duration
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  {" "}
                  Enabled
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                >
                  ⚙️
                </TableCell>
              </TableRow>
            </TableHead>

            {actions.length > 0 ? (
              actions?.map((action) => (
                <TableBody>
                  <TableRow key={action._id}>
                    {/* Action Name */}
                    <TableCell align="center">{action.action_name}</TableCell>

                    {/* Number of Media */}
                    <TableCell align="center">
                      {action.media_ids.length}
                    </TableCell>

                    {/* Message Problem Template */}
                    <TableCell align="center">
                      {action.messageProblemTemplate}
                    </TableCell>

                    {/* Message Recovery Template */}
                    <TableCell align="center">
                      {action.messageRecoveryTemplate}
                    </TableCell>

                    {/* Duration */}
                    <TableCell align="center">{action.duration}</TableCell>

                    {/* Enabled */}
                    <TableCell
                      align="center"
                      sx={{
                        color: action.enabled ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {action.enabled ? "Enabled" : "Disabled"}
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
                        onClick={() => hendleDeleteClick(action)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ))
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1">No actions found.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the Action "{removeActionName}"?
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
    </Box>
  );
};

export default ActionComponent;
