import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Stack,
  Typography,
  Button,
  Box,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import LogoutAuthen from "../authenticated/LogoutAuthen";
import axios from "axios";

interface FooterProps {
  isHideSidebar: boolean;
}

interface IUser {
  _id: string;
  role: string;
  picture?: string;
}

export default function Footer({ isHideSidebar }: FooterProps) {
  const [openSignout, setOpenSignout] = useState(false);
  const windowSize = useWindowSize();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleclick = () => {
    navigate(`/account`);
  };

  const handleOpenSignout = () => {
    if (isHideSidebar || windowSize.width <= 1100) {
      setOpenSignout(true);
    }
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpenSignout(false);
  };

  const [user, setUser] = useState<{ username: string; picture?: string }>({
    username: "Guest",
    picture: undefined,
  });

  const getUserData = async () => {
    const loggedInUserId = localStorage.getItem("user_id");
    if (loggedInUserId) {
      try {
        const response = await axios.get( `${import.meta.env.VITE_API_URL}/user`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = response.data.users.find((user: IUser) => user._id === loggedInUserId);
        if (userData) {
      
          const firstNameOnly = userData.username.split(" ")[0]; 
          setUser({ username: firstNameOnly, picture: userData.picture });
        } else {
          console.warn("User not found in the response.");
          setUser({ username: "Guest", picture: undefined }); 
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } 
  };
  
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "admin" || role === "superadmin") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        marginTop: "auto",
        px: 0,
        pb: 2,
        whiteSpace: "nowrap",
      }}
    >
      <Button
        onClick={handleclick}
        sx={{
          ml: isHideSidebar ? 0 : 1,
          mr: isHideSidebar ? 0 : 2,
          color: "black",
          width: "50%",
          "&:focus": {
            outline: "none",
            border: "none",
          },
        }}
      >
        <Avatar
          ref={anchorRef}
          sx={{
            width: "30px",
            height: "30px",
            cursor: isAdmin ? "pointer" : "default",
          }}
          src={user.picture || "default-profile-image-url"} 
          alt="Profile Picture"
          onClick={isAdmin ? handleOpenSignout : undefined}
        />
        {!isHideSidebar && (
          <Stack direction="row" spacing={1} marginLeft={1.5}>
            <Typography fontWeight={"medium"}>{user.username}</Typography>
          </Stack>
        )}
      </Button>

      <Popper open={openSignout} anchorEl={anchorRef.current} placement="right" transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper>
              <Box sx={{ marginBlockEnd: 1, width: "100%" }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <LogoutAuthen />
                </ClickAwayListener>
              </Box>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Logout button when sidebar is not hidden */}
      {!(isHideSidebar || windowSize.width < 1100) && (
        <Box sx={{ marginLeft: "auto", marginRight: 2 }}>
          <LogoutAuthen />
        </Box>
      )}
    </Stack>
  );
}
