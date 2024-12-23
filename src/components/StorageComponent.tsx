import { Grid, Typography, Box } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import StorageIcon from "@mui/icons-material/Storage";

const StorageComponent = () => {
  // const [showStorage, setShowStorage] = useState(false);

  // const handleClick = () => {
  //   setShowStorage(!showStorage);
  // };

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
          //cursor: "pointer", // Add cursor pointer for click interaction
        }}
        //onClick={handleClick} // Toggle visibility on click
      >
        <AddBoxIcon sx={{ backgroundColor: "black", color: "white", ml: 2 }} />
        <Typography sx={{ ml: 2, mb: 1, fontSize: "18px" }}>
          Aiven cloud
        </Typography>
      </Grid>
      
        <Box
          sx={{
            display: "flex",
            mt: 2,
            mb: 1,
          }}
        >
          <StorageIcon sx={{ ml: 6 }} />
          <Typography sx={{ ml: 2, alignItems: "start" }}>
            cpesiren-cmu-dsng.h.aivencloud.com
          </Typography>
        </Box>
    </>
  );
};

export default StorageComponent;
