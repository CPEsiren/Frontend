import axios from "axios";

const API_URL = "http://localhost:3000/authen/signup"; 

const AuthenSignIn = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const token = localStorage.getItem("token"); 

        if (!token) {
            throw new Error("Token not found in localStorage");
        }

        // console.log("Sending token to server...");
        const response = await axios.post(API_URL, { token });

        // console.log("Response from server:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending token to server:", error);
        throw error;
    }
};

export { AuthenSignIn };

