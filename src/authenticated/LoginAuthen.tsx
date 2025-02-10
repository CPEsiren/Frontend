import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface LoginAuthenProps {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

// Enhanced API call with role handling and debugging
const authenticateWithServer = async (token: string) => {
  try {
    const response = await axios.post("http://localhost:3000/authen/signup", {
      token,
    });

    // Log the full response for debugging
    // console.log('Server response:', response.data);

    // Check if response exists and has data
    if (!response || !response.data) {
      throw new Error("No response data received from server");
    }

    // Store authentication status
    localStorage.setItem("isAuthenticated", "true");

    // Check if role exists in response data
    // Adjust this based on your actual response structure
    const userRole = response.data.role || response.data.user?.role;

    if (!userRole) {
      throw new Error("No role found in server response");
    }

    // Store the role
    localStorage.setItem("userRole", userRole);
    // console.log('User role stored:', userRole);

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

      // Store Google token
      localStorage.setItem("token", credentialResponse.credential);

      // Authenticate with your server and get role
      const serverResponse = await authenticateWithServer(
        credentialResponse.credential
      );

      // Check if we have a valid response with role
      if (serverResponse && localStorage.getItem("userRole")) {
        // console.log('Authentication complete, triggering success callback');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        // More specific error message based on what's missing
        const errorMessage = !serverResponse
          ? "No response from server"
          : "User role not received from server";
        console.error(errorMessage);
        onError(errorMessage);
      }
    } catch (error: any) {
      // More detailed error message
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
