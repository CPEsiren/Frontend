import React from "react";
import { Box, Typography } from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";

const Action = () => {
  const windowSize = useWindowSize();
  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "flex-start",
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
          actionnnnnnnnnnn
        </Box>
      </Box>
    </>
  );
};

export default Action;
