import React from "react";
import { Card, Box, Typography, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IDevice } from "../../interface/InterfaceCollection";
import ComputerDevice from "../../assets/ComputerDevice.svg";

interface DevicesCardProps {
  device: IDevice;
}

const DevicesCard: React.FC<DevicesCardProps> = ({ device }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // if (device.status) {
      navigate(`/devicedetail/${device._id}`, { state: { device } });
    // }
  };

  const numofInterface = device.interfaces.length;
  const numofItem = device.items.length;

  return (
    <ButtonBase
      onClick={handleClick}
      // disabled={!device.status}
      sx={{
        width: "18rem",
        height: "9.3rem",
        textAlign: "left",
        opacity: device.status ? 1 : 0.5,
        transition: "all 0.3s ease",
        outline: "none",
        "&:focus": {
          outline: "none !important",
        },
        "&:hover": {
          transform: device.status ? "scale(1.05)" : "none",
        },
      }}
    >
      <Card
        sx={{
          height: "100%",
          width: "100%",
          bgcolor: "#FFFFFB",
          borderRadius: "30px",
          position: "relative",
          boxShadow: "none",
          border: "3px solid #242D5D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "all 0.3s ease",
        }}
      >
        <Box sx={{ marginTop: "0.6rem" }}>
          <Typography
            variant="h6"
            component="div"
            color={"#242D5D"}
            sx={{
              transition: "color 0.3s ease",
              "&:focus": {
                outline: "none",
              },
              "&:hover": {
                color: device.status ? "#3f51b5" : "#242D5D",
              },
            }}
          >
            {device.hostname || "Device Name"}
          </Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: "1.5rem",
            left: "1.5rem",
            right: "1.5rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={ComputerDevice}
              alt="Computer Device"
              width={100}
              sx={{
                marginRight: "18px",
                transition: "transform 0.3s ease",
              }}
            />
            <Box>
              <Box sx={{}}>
              {/* <Typography variant="h6" component="div" color={"#242D5D"}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Room</Typography>
                  <Typography style={{ marginLeft: 10 }}>
                    {device.details?.Room || "N/A"}
                  </Typography>
                </Box>
              </Typography>
              <Typography variant="h6" component="div" color={"#242D5D"}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Type</Typography>
                  <Typography style={{ marginLeft: 10 }}>
                    {device.details?.type || "N/A"}
                  </Typography>
                </Box>
              </Typography> */}
              <Typography variant="h6" component="div" color={"#242D5D"}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Interfaces:</Typography>
                  <Typography style={{ marginLeft: 10 }}>
                    {numofInterface}
                  </Typography>
                </Box>
              </Typography>
              <Typography variant="h6" component="div" color={"#242D5D"}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Items :</Typography>
                  <Typography style={{ marginLeft: 10 }}>
                    {numofItem}
                  </Typography>
                </Box>
              </Typography>
              <Typography variant="h6" component="div" color={"#242D5D"}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Status :</Typography>
                  <Typography style={{ marginLeft: 10 }}>
                    {device.status === 1 ? "on" : "off"}
                  </Typography>
                </Box>
              </Typography>
            </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </ButtonBase>
  );
};

export default DevicesCard;
