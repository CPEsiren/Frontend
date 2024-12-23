import TriggerComponent from "../components/TriggerComponent";
import useWindowSize from "../hooks/useWindowSize";
import { Box, Typography, Button, Dialog, DialogContent } from "@mui/material";
import React, { useState } from "react"; 
import AddTrigger from "../components/Modules/AddTrigger";

const Triggers = () => {
  const windowSize = useWindowSize();
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            Triggers
          </Typography>
          <Button
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "7rem",
              height: "2.5rem",
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            + Trigger
          </Button>
        </Box>
      )}
      <Box
        sx={{
          width: 1,
          marginTop: 2,
          height: "auto",
          display: "flex",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFB",
            flex: 1,
            display: "flex",
            borderRadius: 3,
            flexDirection: "column",
            justifyContent: windowSize.width >= 1100 ? "center" : "start",
            alignItems: "center",
            minHeight: "fit-content",
            py: 3,
            px: 3,
          }}
        >
          {windowSize.width < 1100 && (
            <Typography
              align="center"
              sx={{
                color: "#242D5D",
                fontWeight: 400,
                fontSize: 25,
              }}
            />
          )}
          <TriggerComponent />
        </Box>
      </Box>

      <Dialog open={isModalOpen} onClose={toggleModal} fullWidth maxWidth="lg">
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: "#a9a9a9", 
            px: 3,
            py: 2
          }}
        >
          <Typography 
            component="div" 
            variant="h6"
          >
            New Trigger
          </Typography>
        </Box>
        <DialogContent>
          <AddTrigger onClose={toggleModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Triggers;