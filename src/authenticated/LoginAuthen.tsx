import { useEffect, useState } from "react";
declare global {
  interface Window {
    gapi: any;
  }
}
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { gapi } from "gapi-script";
import { Box, Button, Typography, styled, CircularProgress } from "@mui/material";
import GoogleLogo from "../assets/GoogleIcon.png";

interface LoginAuthenProps {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

const authenticateWithServer = async (token: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/authen/signup`,
      { token }
    );

    if (!response || !response.data) {
      throw new Error("No response data received from server");
    }

    localStorage.setItem("isAuthenticated", "true");
    const userRole = response.data.role || response.data.user?.role;
    const user_id = response.data._id || response.data.user?._id;
    const username = response.data.username || response.data.user?.username;

    if (!userRole) {
      throw new Error("No role found in server response");
    }
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("user_id", user_id);
    localStorage.setItem("username", username);

    return response.data;
  } catch (error: any) {
    console.error("Server authentication error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Styled components using MUI styling system
const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  padding: "10px",
  paddingLeft: "20px",
  paddingRight: "20px",
  borderRadius: "50px",
  width: "100%",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  color: "black",
  boxShadow: theme.shadows[1],
  "&:hover": {
    backgroundColor: "#f5f5f5",
    boxShadow: theme.shadows[2],
  },
  "&.Mui-disabled": {
    backgroundColor: "#FFFFFF",
  }
}));

const GoogleButtonIcon = styled("img")({
  width: "38px",
  marginRight: "10px",
});

const LoginContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "transparent",
  fontWeight: "bold",
  padding: "10px 10px",
  borderRadius: "100px",
  maxWidth: "350px",
  width: "100%",
  outline: "none",
  border: `3px solid #242D5D`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginRight: theme.spacing(12),
}));

const LoginAuthen: React.FC<LoginAuthenProps> = ({ onSuccess, onError }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initGapi = () => {
      gapi.load("auth2", () => {
        gapi.auth2.init({
          client_id: clientId,
          scope: "openid profile email",
        });
      });
    };

    if (window.gapi) {
      initGapi();
    } else {
      onError("Google API (gapi) not loaded");
    }
  }, [clientId, onError]);

  const handleGoogleLogin = async (googleUser: any) => {
    try {
      setLoading(true);
      console.log("Google authentication successful");
      const token = googleUser.getAuthResponse().id_token;
      localStorage.setItem("token", token);

      const serverResponse = await authenticateWithServer(token);

      if (serverResponse && localStorage.getItem("userRole")) {
        setTimeout(() => {
          onSuccess();
          setLoading(false);
        }, 2000);
      } else {
        const errorMessage = !serverResponse
          ? "No response from server"
          : "User role not received from server";
        console.error(errorMessage);
        setLoading(false);
        onError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Authentication failed";
      console.error("Authentication error:", errorMessage);
      setLoading(false);
      onError(`Authentication failed: ${errorMessage}`);
    }
  };

  const handleError = (error: any) => {
    const errorMessage = error?.error || "Failed to authenticate with Google";
    console.error(errorMessage);
    setLoading(false);
    onError(errorMessage);
  };

  const handleLoginClick = () => {
    setLoading(true);
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(
      (googleUser: any) => handleGoogleLogin(googleUser),
      (error: any) => handleError(error)
    );
  };

  return (
    <LoginContainer>
      <GoogleOAuthProvider clientId={clientId}>
        <Box sx={{ width: "100%" }}>
          <GoogleButton
            onClick={handleLoginClick}
            variant="contained"
            disableElevation
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="primary" />
            ) : (
              <>
                <GoogleButtonIcon src={GoogleLogo} alt="Google Logo" />
                <Typography variant="button">Sign in with Google</Typography>
              </>
            )}
          </GoogleButton>
        </Box>
      </GoogleOAuthProvider>
    </LoginContainer>
  );
};

export default LoginAuthen;