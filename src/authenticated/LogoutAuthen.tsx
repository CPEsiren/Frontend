import { Button } from '@mui/material';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const LogoutAuthen = () => {
    const navigate = useNavigate(); // Initialize navigate function
    
    const clientId = "262664249105-7nqhq3e2hh9ls0k4s29k5veia9u6ung6.apps.googleusercontent.com";

    const onLogoutSuccess = () => {
        // Remove authentication data from localStorage
        localStorage.removeItem("isAuthenticated");
        console.log("Logout Success and LocalStorage Cleared");

        navigate("/login");  
    };

    const handleLogout = () => {
        googleLogout();
        onLogoutSuccess();
    };

    return (
        <div id="signOutButton">
            <Button
                color="secondary"
                sx={{
                    m: 0,
                    marginLeft: "10px",
                    fontSize: 13,
                    fontWeight: 300,
                    "&:focus": {
                        outline: "none",
                        color: "#F25A28",
                    },
                    "&:hover": {
                        color: "#F25A28",
                    },
                }}
                onClick={handleLogout} 
            >
                Sign out
            </Button>
        </div>
    );
};

export default LogoutAuthen;
