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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const roleColors = {
    admin: "red",
    superadmin: "orange",
    viewer: "blue",
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch( `${import.meta.env.VITE_API_URL}/user`,{
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

  const handleSwapRole = async (user: IUser) => {
    try {
      setLoading(true);
      const newRole = user.role === "admin" ? "viewer" : "admin";

      const response = await fetch(
        // `http://localhost:3000/user/editrole/${user._id}`,
        `${import.meta.env.VITE_API_URL}/user/editrole/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );

      setSnackbar({
        open: true,
        message: `Successfully changed ${user.username}'s role to ${newRole}`,
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

  return (
    <Box>
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
            "& .MuiTableRow-root:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
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
                      p: 2,
                      m: 0,
                      color: "white",
                      backgroundColor:
                        roleColors[user.role] || roleColors.viewer,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  <IconButton
                    onClick={() => handleSwapRole(user)}
                    disabled={loading || user.role === "superadmin"}
                  >
                    <SwapHorizIcon
                      sx={{
                        color: user.role === "superadmin" ? "gray" : "black",
                      }}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
