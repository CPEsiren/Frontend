import TriggerComponent from "../components/TriggerComponent";
import useWindowSize from "../hooks/useWindowSize";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useState } from "react";
import AddTrigger from "../components/Modals/AddTrigger";

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
            TRIGGER
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
        <DialogTitle
          sx={{
            borderBottom: 0,
            borderColor: "#a9a9a9",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "medium", pt: 2, pl: 1 }}>
            New Trigger
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddTrigger onClose={toggleModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Triggers;
