import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,

} from "@mui/material";
import { Box } from "@mui/system";
import useWindowSize from "../hooks/useWindowSize";
import ManageComponent from "../components/DeviceManageComponent";
import Usermanagemnet from "../components/UserManagement";

const Management: React.FC = () => {
  const windowSize = useWindowSize();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsuperadmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "superadmin") {
      setIsuperadmin(true);
    }
  }, []);

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
            height: "auto",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            DEVICE MANAGEMENT
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
          display: "grid",
          gridTemplateColumns: "1fr",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          overflowY: "auto",
          backgroundColor: "transparent",
          borderRadius: 3,
          border: "7px solid rgb(255, 255, 255)", 
          py: 2,
          mb: 5,
         }}
        >
          <ManageComponent />
        </Box>
      </Box>

      {isSuperadmin ? (
        <Box>
          <Box
            sx={{
              width: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
              height: "auto",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight={600}
              color={"#242D5D"}
            >
              USER MANAGEMENT
            </Typography>
          </Box>

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
          display: "grid",
          gridTemplateColumns: "1fr",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          overflowY: "auto",
          backgroundColor: "transparent",
          borderRadius: 3,
          border: "7px solid rgb(255, 255, 255)", 
          py: 2,
          mb: 5,
         }}
        >
              <Usermanagemnet />
            </Box>
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
};

export default Management;
