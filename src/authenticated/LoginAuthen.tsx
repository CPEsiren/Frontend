import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Box } from "@mui/system";

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

const LoginAuthen = () => {
    const onSuccess = (credentialResponse: any) => {
        console.log("Login Success:", credentialResponse);
    };

    const onError = () => {
        console.log("Login Failed");
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
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
