import { useState } from "react";
import { Typography, Alert } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import NewLogo from "../assets/NewLogo.svg";
import LoginLeftside from "../assets/LoginLeftside.svg";
import useWindowSize from "../hooks/useWindowSize";
import LoginAuthen from "../authenticated/LoginAuthen"; // ✅ นำเข้า Component ที่แยกออกมา

const Login = () => {
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Function to handle successful login
  const handleLoginSuccess = () => {
    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard"); // Redirect to dashboard after successful login
  };

  // Function to handle login failure
  const handleLoginFailure = (errorMessage: string) => {
    setError(errorMessage); // Display error message if login fails
  };

  // Screen is too small (smaller than iPad mini)
  if (windowSize.width < 768) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          bgcolor: "#f5f5f5",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          color="#242D5D"
          fontWeight={600}
          gutterBottom
          sx={{ mb: 2 }}
        >
          Device Resolution Notice
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400, lineHeight: 1.6 }}
        >
          Your current device resolution does not meet the minimum requirements
          for optimal system operation. Please access this application using a
          device with a minimum display size equivalent to iPad mini (768px) or
          larger.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: 1,
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* CMU Siren Logo */}
      <Box
        component="img"
        src={NewLogo}
        alt="CMU Siren Logo"
        sx={{
          position: "absolute",
          top: "5px",
          right: "5px",
          width: "20vh",
          height: "auto",
        }}
      />

      {/* Left Section */} 
      <Box
        sx={{
          flex: 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(${LoginLeftside})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vh",
          height: "100vh",
        }}
      ></Box>

      {/* Right Section */}
      <Box
        sx={{
          flex: 35,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
          marginRight: 8,
          marginLeft: -15,
          bgcolor: "#ebf1ff",
          overflowY: "auto",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 1000,
            fontSize: "4.5rem",
            color: "#2c44b7",
            mb: 2,
            fontFamily: "Georgia, serif",
          }}
        >
          Welcome !
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: "#2e2e2e",
            mb: 8,
            fontSize: "1.2rem",
          }}
        >
          Sign in to your Account
        </Typography>

        <Box >
          <LoginAuthen  
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
