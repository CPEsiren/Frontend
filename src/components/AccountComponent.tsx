import Profile from "../assets/Dog01.jpg";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Container,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { IUser } from "../interface/InterfaceCollection";

interface ApiResponse {
  message: string;
  user: IUser;
}

interface ProcessedUser extends Omit<IUser, "username"> {
  picture: string;
  firstName: string;
  lastName: string;
}

const AccountComponent = () => {
  const [user, setUser] = useState<ProcessedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const processUserData = (userData: IUser): ProcessedUser => {
    // Split username into first and last name
    const nameParts = userData.username.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const picture = userData.picture || "default-profile-image-url";

    return {
      ...userData,
      firstName,
      lastName,
      picture,
    };
  };

  const fetchUserData = async () => {
    const userId = localStorage.getItem("user_id");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const result: ApiResponse = await response.json();
  
      // ใช้รูปภาพจาก API
      const processedUser = {
        ...processUserData(result.user),
        picture: result.user.picture || "default-profile-image-url",
      };
  
      setUser(processedUser);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching user data";
      console.error("Error fetching user:", errorMessage);
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchUserData();
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

  if (!user) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography color="textSecondary" variant="h6">
            No user data found
          </Typography>
        </Box>
      </Container>
    );
  }
  return (
    <>
      <Grid
        item
        sx={{
          display: "flex",
          justifyItems: "flex-start",
          alignItems: "start",
          width: "100%",
          mt: 1,
        }}
      >
        <Typography sx={{ mb: 1, fontSize: "21px", fontWeight: "medium" }}>
          My profile
        </Typography>
      </Grid>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3",
          borderRadius: "10px",
          width: "100%",
        }}
      >
        
        <Box sx={{ display: "flex", alignItems: "center", ml: 2, padding: 3 }}>
          
        <Avatar
          src={user.picture} 
          alt="Profile Picture"
          sx={{
            width: 100,
            height: 100,
          }}
        />
          <Box sx={{ ml: 5 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 0.8 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  // fontSize: "20px"
                }}
              >
                {user.firstName}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  // fontSize: "20px"
                }}
              >
                {user.lastName}
              </Typography>
            </Box>
            <Typography sx={{ mb: 0.4, color: "#888888" }}>
              {user.email}
            </Typography>
            <Typography sx={{ mb: 0.4, color: "#888888" }}>
              {user.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3",
          borderRadius: "10px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 3,
          }}
        >
          <Typography sx={{ fontWeight: "medium", fontSize: "18px", mb: 2 }}>
            Personal information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 17,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: "#000000" }}>Firstname</Typography>
              <Typography sx={{ color: "#888888" }}>
                {user.firstName}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: "#000000" }}>Lastname</Typography>
              <Typography sx={{ color: "#888888" }}>{user.lastName}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: "#000000" }}>Email Address</Typography>
              <Typography sx={{ color: "#888888" }}>{user.email}</Typography>
            </Box>

            <Box>
              <Typography sx={{ color: "#000000" }}>Phone</Typography>
              <Typography sx={{ color: "#888888" }}>
                {user.phone || "-"}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8.5,
            }}
          >
            <Box>
              <Typography sx={{ color: "#000000" }}>Role</Typography>
              <Typography sx={{ color: "#888888" }}>{user.role}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AccountComponent;
