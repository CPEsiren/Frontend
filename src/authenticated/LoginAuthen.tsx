import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"; 
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";

// Define your custom styles here
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

const clientId = "262664249105-7nqhq3e2hh9ls0k4s29k5veia9u6ung6.apps.googleusercontent.com";

interface LoginAuthenProps {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

const LoginAuthen: React.FC<LoginAuthenProps> = ({ onSuccess, onError }) => {
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: any) => {
        console.log("Login Success:", credentialResponse);
        localStorage.setItem("isAuthenticated", "true");
        onSuccess();  // Call the onSuccess handler passed from Login
    };

    const handleError = () => {
        console.log("Login Failed");
        onError("Failed to authenticate with Google");  // Call the onError handler
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
