import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddAction from "../components/Modals/AddAction";
import ActionComponent from "../components/ActionComponent";

const Action = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const windowSize = useWindowSize();
  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            ACTION
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
            + Action
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
            justifyContent: "flex-start",
            alignItems: "flex-start",
            minHeight: "fit-content",
            marginBottom: 5,
            height: 1,
            py: 3,
            px: 3,
          }}
        >
          <ActionComponent />
        </Box>
      </Box>

      <Dialog open={isModalOpen} onClose={toggleModal} fullWidth maxWidth="lg">
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#a9a9a9",
            px: 3,
            py: 2,
          }}
        >
          <Typography component="div" variant="h6">
            New Action
          </Typography>
        </Box>
        <DialogContent>
          <AddAction onClose={toggleModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Action;
