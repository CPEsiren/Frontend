import { Grid, Typography, Box, Avatar } from "@mui/material";
import catProfile from "../assets/catProfile.jpg";

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
          mt: 2,
        }}
      >
        <Typography sx={{ ml: 2, mb: 1, fontSize: "20px", fontWeight: "medium" }}>
          My profile
        </Typography>
      </Grid>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          mb: 1,
        }}
      >
        <Avatar
          src={catProfile}
          alt="Profile Picture"
          sx={{
            width: 100,
            height: 100,
            ml: 2,
          }}
        />
        <Box sx={{ ml: 5 }}>
          <Box sx={{ display: "flex", gap: 1 , mb: 0.8  }}>
            <Typography sx={{ fontWeight: "bold" }}>Firstname</Typography>
            <Typography sx={{ fontWeight: "bold" }}>Lastname</Typography>
          </Box>
          <Typography sx={{ mb: 0.2}}>xxxxxx@gmail.com</Typography>
          <Typography>Admin</Typography>
        </Box>
      </Box>
    </>
  );
};

export default AccountComponent;
