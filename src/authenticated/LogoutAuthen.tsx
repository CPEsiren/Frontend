import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const LogoutAuthen = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false); 

  const onLogoutSuccess = () => {
    localStorage.clear();
    console.log("Logout Success");

    navigate("/login");  
  };

  const handleLogout = () => {
    setOpenDialog(true); 
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); 
  };

  const handleConfirmLogout = () => {
    googleLogout();
    onLogoutSuccess();
    setOpenDialog(false); 
  };

  return (
    <Box id="signOutButton">
      <Button
        color="secondary"
        sx={{
          m: 0,
          marginLeft: 0,
          fontSize: 13,
          fontWeight: 300,
          "&:focus": {
            outline: "none",
            color: "#F25A28",
          },
          "&:hover": {
            color: "#F25A28",
            bgcolor: "transparent",
          },
        }}
        onClick={handleLogout}
      >
        <ExitToAppIcon sx={{ }} /> 
        {/* Sign out */}
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Sign out</DialogTitle>
        <DialogContent>
          Are you sure you want to Sign out?
        </DialogContent>
        <DialogActions sx={{ padding: '25px', paddingInline: '50px', justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              backgroundColor: "#f1f1f1",
              color: "#000", 
              fontSize: "14px", 
              padding: "8px 12px", 
              width: "130px", 
              borderRadius: "20px", 
              marginRight: "15px", 
              '&:hover': {
                backgroundColor: "#d1d1d1", 
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmLogout} 
            sx={{ 
              backgroundColor: "#f25a28", 
              fontSize: "14px", 
              padding: "8px 12px", 
              color: "white",
              width: "130px",
              borderRadius: "20px", 
              '&:hover': {
                backgroundColor: "#e14d2a", 
              }
            }}
          >
            <ExitToAppIcon sx={{ marginRight: "8px" }} /> Sign out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogoutAuthen;
