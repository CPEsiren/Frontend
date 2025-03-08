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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IUser } from "../interface/InterfaceCollection";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ApiResponse {
  message: string;
  users: IUser[];
}

// Interface for grouping users by role
interface GroupedUsers {
  [key: string]: {
    normalizedName: string;
    originalName: string;
    users: IUser[];
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [groupedUsers, setGroupedUsers] = useState<GroupedUsers>({});
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
  const [expandedGroup, setExpandedGroup] = useState<string | false>(false);
  const currentUserRole = localStorage.getItem("userRole");

  const roleColors = {
    admin: "red",
    superadmin: "orange",
    viewer: "blue",
  };

  // Function to normalize a role name (convert to uppercase)
  const normalizeRoleName = (name: string): string => {
    return name ? name.toUpperCase() : "UNKNOWN";
  };

  // Function to group users by role
  const groupUsersByRole = (users: IUser[]) => {
    const grouped: GroupedUsers = {};

    users.forEach((user) => {
      const originalName = user.role || "Unknown";
      const normalizedName = normalizeRoleName(originalName);

      if (!grouped[normalizedName]) {
        grouped[normalizedName] = {
          normalizedName,
          originalName,
          users: [],
        };
      }

      grouped[normalizedName].users.push(user);
    });

    return grouped;
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

      // Group users by role
      const grouped = groupUsersByRole(result.users);
      setGroupedUsers(grouped);

      // Set the first group as expanded by default if there are groups
      const groups = Object.keys(grouped);
      if (groups.length > 0) {
        setExpandedGroup(groups[0]);
      }

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
      const updatedUsers = users.map((u) =>
        u._id === selectedUser._id ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);

      // Regroup users after update
      const regrouped = groupUsersByRole(updatedUsers);
      setGroupedUsers(regrouped);

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

  // Handle accordion state
  const handleAccordionChange =
    (groupName: string) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedGroup(isExpanded ? groupName : false);
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

  // Function to render a table for a specific role group
  const renderUserTable = (users: IUser[]) => {
    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFB",
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              padding: "16px",
            },
            "& .MuiTableCell-head": {
              borderBottom: "1px solid #dbdbdb",
            },
            "& .MuiTableRow-body:hover": {
              backgroundColor: "rgba(255, 0, 0, 0.71)",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "#ffffff" }}>
            <TableRow>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Username
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Email
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Role
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
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
                      width: "8rem",
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
    );
  };

  const roleGroups = Object.keys(groupedUsers);

  return (
    <Container maxWidth={false}>
      <Box sx={{ mb: 3, mt: 3 }}>
        {roleGroups.map((groupKey) => {
          const group = groupedUsers[groupKey];
          return (
            <Accordion
              key={groupKey}
              // expanded={expandedGroup === groupKey}
              onChange={handleAccordionChange(groupKey)}
              sx={{
                mb: 2,
                borderRadius: "6px",
                overflow: "hidden",
                "& .MuiPaper-root": {
                  borderRadius: "12px",
                },
                "&::before": {
                  display: "none",
                },
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}
                sx={{
                  backgroundColor: "#1f2b5d",
                }}
              >
                <Typography fontWeight="medium" sx={{ color: "#fff" }}>
                  {group.originalName.toUpperCase()}
                  <Box
                    component="span"
                    sx={{
                      border: "3px solid rgb(79, 93, 155)",
                      fontSize: "15px",
                      borderRadius: "50px",
                      padding: "3px 8px",
                      color: "white",
                      marginLeft: "15px",
                    }}
                  >
                    {group.users.length}{" "}
                    {group.users.length === 1 ? "user" : "users"}
                  </Box>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {group.users.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body1">
                      No users in this role
                    </Typography>
                  </Paper>
                ) : (
                  renderUserTable(group.users)
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <Dialog
        open={swapRoleDialogOpen}
        onClose={() => setSwapRoleDialogOpen(false)}
        aria-labelledby="swap-role-dialog-title"
      >
        <DialogTitle id="swap-role-dialog-title">Change User Role</DialogTitle>
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
                setNewRole(e.target.value as "admin" | "viewer" | "superadmin")
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
    </Container>
  );
};

export default UserManagement;
