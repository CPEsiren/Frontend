import { Grid, Typography, Box, Avatar } from "@mui/material";
import Profile from "../assets/Dog01.jpg";
import { color } from "chart.js/helpers";

const AccountComponent = () => {
  return (
    <>
      <Grid
        item
        sx={{
          display: "flex",
          justifyItems: "flex-start",
          alignItems: "start",
          width: "100%",
          mt: 1,
        }}
      >
        <Typography sx={{ mb: 1, fontSize: "21px", fontWeight: "medium" }}>
          My profile
        </Typography>
      </Grid>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3", 
          borderRadius: "10px", 
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 , padding: 3 }}>
            <Avatar
            src={Profile}
            alt="Profile Picture"
            sx={{
                width: 100,
                height: 100,
            }}
            />
            <Box sx={{ ml: 5 }}>
            <Box sx={{ display: "flex", gap: 1 , mb: 0.8  }}>
                <Typography sx={{ fontWeight: "bold" }}>Firstname</Typography>
                <Typography sx={{ fontWeight: "bold" }}>Lastname</Typography>
            </Box>
            <Typography sx={{ mb: 0.4}}>xxxxxx@gmail.com</Typography>
            <Typography>Admin</Typography>
            </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3", 
          borderRadius: "10px", 
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", padding: 3 }}>
            <Box sx={{ ml: 5 }}>
            <Typography sx={{ fontWeight: "medium" ,fontSize:"18px", mb:3 }}>Personal information</Typography>
            <Typography sx={{ mb: 0.4 , color:"#888888"}}>Firstname</Typography>
            <Typography sx={{ mb: 0.4 , color:"#888888"}}>Smith</Typography>
            </Box>
        </Box>
      </Box>      
    </>
  );
};

export default AccountComponent;
