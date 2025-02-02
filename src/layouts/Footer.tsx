import { useRef, useState } from "react";
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

export default function Footer({ isHideSidebar }: FooterProps) {
  const [openSignout, setOpenSignout] = useState(false);
  const windowSize = useWindowSize();
  const anchorRef = useRef<HTMLDivElement>(null); // Ref type assertion for anchorRef

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

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        marginTop: "auto",
        px: 2.5,
        pb: 2,
        whiteSpace: "nowrap",
      }}
    >
      <Avatar
        ref={anchorRef}
        sx={{ width: "30px", height: "30px", cursor: "pointer" }}
        alt="userProfile"
        src={
          "https://i.pinimg.com/564x/2b/c0/fe/2bc0feb541b86dfe46cbd70c2bb63b7f.jpg"
        }
        onClick={() => {
          handleclick();
          handleOpenSignout();
        }}
      />
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
              <Box sx={{ marginBlockEnd:1 ,width: "100%" }}>
              <ClickAwayListener onClickAway={handleClose}>
                  <LogoutAuthen />
              </ClickAwayListener>   
              </Box>
            </Paper>
          </Grow>
        )}
      </Popper>
      {!(isHideSidebar || windowSize.width < 1100) && (
        <>
          <Typography
            noWrap={true}
            sx={{
              m: 0,
              marginLeft: "70px",
              fontSize: 15,
              fontWeight: 400,
              color: "black",
            }}
          >
          </Typography>
          <LogoutAuthen />
        </>
      )}
    </Stack>
  );
}
