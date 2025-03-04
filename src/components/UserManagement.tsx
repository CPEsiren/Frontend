import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  Button,
  DialogActions,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { IUser } from "../interface/InterfaceCollection";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

interface ApiResponse {
  message: string;
  users: IUser[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "viewer" | "superadmin">(
    "viewer"
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [swapRoleDialogOpen, setSwapRoleDialogOpen] = useState(false);
  const currentUserRole = localStorage.getItem("userRole");

  const roleColors = {
    admin: "red",
    superadmin: "orange",
    viewer: "blue",
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const result: ApiResponse = await response.json();
      setUsers(result.users);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching users";
      console.error("Error fetching users:", errorMessage);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRoleClick = (user: IUser) => {
    setSelectedUser(user);
    // Set initial role based on current logic or user's current role
    const nextRole = user.role === "admin" ? "viewer" : "admin";
    setNewRole(nextRole);
    setSwapRoleDialogOpen(true);
  };

  const handleSwapRoleConfirm = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setLoading(true);
      const nameofuserchanged = selectedUser.username;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/editrole/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            role: newRole,
            userRole: localStorage.getItem("userRole"),
            userName: localStorage.getItem("username"),
            NOC: nameofuserchanged,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === selectedUser._id ? { ...u, role: newRole } : u
        )
      );

      setSnackbar({
        open: true,
        message: `Successfully changed ${selectedUser.username}'s role to ${newRole}`,
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating user role";
      console.error("Error updating role:", errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSwapRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (!users || users.length === 0) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography color="textSecondary" variant="h6">
            No users found
          </Typography>
        </Box>
      </Container>
    );
  }

  // Define available roles based on current user's role
  const getAvailableRoles = (
    currentRole: string
  ): Array<"admin" | "viewer" | "superadmin"> => {
    if (currentRole === "superadmin") {
      return ["admin", "viewer", "superadmin"];
    } else {
      return ["admin", "viewer"];
    }
  };

  const availableRoles = getAvailableRoles(currentUserRole || "");
  
  // Check if current user can swap roles
  const canSwapRoles = currentUserRole === "superadmin";

  return (
    <Box>
      {users.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">No users found</Typography>
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
              minWidth: 650,
              "& .MuiTableCell-root": {
                borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
                padding: "16px",
              },
              "& .MuiTableRow-body:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "& .MuiTableCell-head": {
                borderBottom: "1px solid #dbdbdb",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Username
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Role
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Typography variant="body2">{user.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        width: "55%",
                        p: 2,
                        m: 0,
                        color: "white",
                        backgroundColor:
                          roleColors[user.role] || roleColors.viewer,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "left" }}>
                    {user.username === localStorage.getItem("username") ? (
                      <Typography variant="body2" color="textSecondary">
                        (You)
                      </Typography>
                    ) : !canSwapRoles ? (
                      <Typography variant="body2" color="textSecondary">
                        (No permissions)
                      </Typography>
                    ) : (
                      <IconButton
                        onClick={() => handleSwapRoleClick(user)}
                        disabled={loading}
                      >
                        <SwapHorizIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={swapRoleDialogOpen}
        onClose={() => setSwapRoleDialogOpen(false)}
        aria-labelledby="swap-role-dialog-title"
      >
        <DialogTitle id="swap-role-dialog-title">
          Change User Role
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Change role for user "{selectedUser?.username}":
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newRole}
              label="Role"
              onChange={(e) =>
                setNewRole(
                  e.target.value as "admin" | "viewer" | "superadmin"
                )
              }
            >
              {availableRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ color: "black" }}
            onClick={() => setSwapRoleDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSwapRoleConfirm}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;