import useWindowSize from "../hooks/useWindowSize";
import { Box, Typography } from "@mui/material";
import contactus from "../assets/ContactUs.png";

const ContactUs = () => {
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
            CONTACT US
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
            backgroundColor: "#EBF1FF",
            flex: 1,
            display: "flex",
            borderRadius: 3,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
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
            ></Typography>
          )}
          <Box
            sx={{
              position: "relative", // Set relative positioning
              width: "100%",
              height: "auto",
              borderRadius: "25px",
              pt: 5,
            }}
          >
            <Box
              component="img"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: "25px",
                mt: "-80px",
              }}
              alt="Contact Us"
              src={contactus}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ContactUs;
