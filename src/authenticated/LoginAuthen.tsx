import { useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface LoginAuthenProps {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

const authenticateWithServer = async (token: string) => {
  try {
    // const response = await axios.post("http://localhost:3000/authen/signup", {
    //   token,
    // });
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/authen/signup`,
      {
        token,
      }
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

const LoginAuthen: React.FC<LoginAuthenProps> = ({ onSuccess, onError }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: any) => {
    try {
      console.log("Google authentication successful");

      const token = credentialResponse.credential;
      localStorage.setItem("token", token);

      const serverResponse = await authenticateWithServer(token);

      if (serverResponse && localStorage.getItem("userRole")) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        const errorMessage = !serverResponse
          ? "No response from server"
          : "User role not received from server";
        console.error(errorMessage);
        onError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Authentication failed";
      console.error("Authentication error:", errorMessage);
      onError(`Authentication failed: ${errorMessage}`);
    }
  };

  const handleError = () => {
    const errorMessage = "Failed to authenticate with Google";
    console.error(errorMessage);
    onError(errorMessage);
  };

  const customStyle = {
    backgroundColor: "transparent",
    fontSize: "16px",
    fontWeight: "bold",
    padding: "15px 20px",
    borderRadius: "50px",
    maxWidth: "350px",
    width: "100%",
    outline: "none",
    border: "4px solid #3e51c7",
    cursor: "pointer",
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        text="continue_with"
        width="350px"
        shape="pill"
        containerProps={{
          style: customStyle,
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default LoginAuthen;
