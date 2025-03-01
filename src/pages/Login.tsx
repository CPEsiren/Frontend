import { useState } from "react";
import { Typography, Alert, useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import NewLogo from "../assets/NewLogo.svg";
import LoginLeftside from "../assets/LoginLeftside.svg";
import useWindowSize from "../hooks/useWindowSize";
import LoginAuthen from "../authenticated/LoginAuthen";

const Login = () => {
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const theme = useTheme();

  // Media queries for different iPad sizes
  const isIpadMini = useMediaQuery("(min-width:768px) and (max-width:1024px)");
  const isIpadAir = useMediaQuery("(min-width:820px) and (max-width:1180px)");
  const isIpadPro = useMediaQuery("(min-width:1024px) and (max-width:1366px)");
  const isIpad = isIpadMini || isIpadAir || isIpadPro;

  // Function to handle successful login
  const handleLoginSuccess = () => {
    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
  };

  // Function to handle login failure
  const handleLoginFailure = (errorMessage: string) => {
    setError(errorMessage);
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
          top: isIpad ? "3px" : "5px",
          right: isIpad ? "3px" : "5px",
          width: isIpad ? "15vh" : "20vh",
          height: "auto",
          zIndex: 10,
        }}
      />

      {/* Left Section */}
      <Box
        sx={{
          flex: isIpadMini ? 70 : isIpadAir ? 70 : isIpadPro ? 80 : 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(${LoginLeftside})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "auto",
        }}
      ></Box>

      {/* Right Section */}
      <Box
        sx={{
          flex: isIpadMini ? 30 : isIpadAir ? 30 : isIpadPro ? 20 : 35,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isIpad ? 2 : 3,
          marginRight: isIpad ? 4 : 8,
          marginLeft: isIpadMini ? -8 : isIpadAir ? -10 : isIpadPro ? -12 : -15,
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
            fontSize: isIpadMini
              ? "3rem"
              : isIpadAir
              ? "3.5rem"
              : isIpadPro
              ? "4rem"
              : "4.5rem",
            color: "#2c44b7",
            mb: isIpad ? 1 : 2,
            fontFamily: "Georgia, serif",
          }}
        >
          Welcome !
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: "#2e2e2e",
            mb: isIpad ? 4 : 8,
            fontSize: isIpad ? "1rem" : "1.2rem",
          }}
        >
          Sign in to your Account
        </Typography>

        <Box
          sx={{
            width: isIpad ? "90%" : "auto",
          }}
        >
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
