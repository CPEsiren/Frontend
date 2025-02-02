import { googleLogout } from '@react-oauth/google';

const LogoutAuthen = () => {
    const handleLogout = () => {
        googleLogout();
        console.log("Logout Success");
    };

    return (
        <div id="signOutButton">
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default LogoutAuthen;
