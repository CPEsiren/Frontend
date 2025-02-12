import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Stack,
  Typography,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
  Button,
  Box,
} from "@mui/material";
import Grow from "@mui/material/Grow";
import useWindowSize from "../hooks/useWindowSize";
import LogoutAuthen from "../authenticated/LogoutAuthen";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  isHideSidebar: boolean;
}
interface UserName {
  firstName: string;
  lastName: string;
}

export default function Footer({ isHideSidebar }: FooterProps) {
  const [openSignout, setOpenSignout] = useState(false);
  const windowSize = useWindowSize();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<UserName>({
    firstName: "",
    lastName: "",
  });
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

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  });

  useEffect(() => {
    const fullName = localStorage.getItem("username") || "";
    const nameParts = fullName.split(" ");
    setUserName({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    });
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
          alt="userProfile"
          src={
            "https://i.pinimg.com/564x/2b/c0/fe/2bc0feb541b86dfe46cbd70c2bb63b7f.jpg"
          }
          onClick={
            isAdmin
              ? () => {
                  // handleclick();
                  handleOpenSignout();
                }
              : undefined
          }
        />
        {!isHideSidebar && (
          <Stack direction="row" spacing={1} marginLeft={1.5}>
            <Typography fontWeight={"medium"}>{userName.firstName}</Typography>
            {/* <Typography>{userName.lastName}</Typography> */}
          </Stack>
        )}
      </Button>
      <Popper
        open={openSignout}
        anchorEl={anchorRef.current}
        placement="right"
        transition
        disablePortal={true}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
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
      {!(isHideSidebar || windowSize.width < 1100) && (
        <Box sx={{ marginLeft: "auto", marginRight: 2 }}>
          <LogoutAuthen />
        </Box>
      )}
    </Stack>
  );
}
