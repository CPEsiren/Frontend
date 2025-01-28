import { Grid, Typography, Box, Avatar } from "@mui/material";
import Profile from "../assets/Dog01.jpg";

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
        <Box sx={{ display: "flex", alignItems: "center", ml: 2, padding: 3 }}>
          <Avatar
            src={Profile}
            alt="Profile Picture"
            sx={{
              width: 100,
              height: 100,
            }}
          />
          <Box sx={{ ml: 5 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 0.8 }}>
              <Typography sx={{ fontWeight: "bold" }}>Firstname</Typography>
              <Typography sx={{ fontWeight: "bold" }}>Lastname</Typography>
            </Box>
            <Typography sx={{ mb: 0.4, color: "#888888" }}>
              xxxxxx@gmail.com
            </Typography>
            <Typography sx={{ mb: 0.4, color: "#888888" }}>Admin</Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3",
          borderRadius: "10px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 3,
          }}
        >
          <Typography sx={{ fontWeight: "medium", fontSize: "18px", mb: 2 }}>
            Personal information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 17,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: "#000000" }}>Firstname</Typography>
              <Typography sx={{ color: "#888888" }}>Smith</Typography>
            </Box>

            <Box>
              <Typography sx={{ color: "#000000" }}>Lastname</Typography>
              <Typography sx={{ color: "#888888" }}>John</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: "#000000" }}>Email Address</Typography>
              <Typography sx={{ color: "#888888" }}>
                xxxxxx@gmail.com
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: "#000000" }}>Phone</Typography>
              <Typography sx={{ color: "#888888" }}>095-5284568</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8.5,
            }}
          >
            <Box>
              <Typography sx={{ color: "#000000" }}>Role</Typography>
              <Typography sx={{ color: "#888888" }}>Admin</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AccountComponent;
