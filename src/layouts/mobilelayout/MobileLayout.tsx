import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import {
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  useTheme,
} from "@mui/material";
import { getPageName } from "../MainLayout";
import { useLocation } from "react-router-dom";
import Footer from "../Footer";
import DrawerSidebarList from "./DrawerSidebarList";

const MobileLayout = () => {
  const location = useLocation();
  const theme = useTheme();
  const [isShowDrawer, setIsShowDrawer] = useState(false);

  const handleDrawerToggle = (newOpen: boolean) => {
    setIsShowDrawer(newOpen);
  };

  return (
    <>
      <AppBar
        component="nav"
        sx={{
          backgroundColor: "#F25A28",
          color: "#FFFFFB",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => handleDrawerToggle(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {getPageName(location.pathname)}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Footer isHideSidebar={false} />
        </Toolbar>
      </AppBar>
      <Drawer open={isShowDrawer} onClose={() => handleDrawerToggle(false)}>
        <DrawerSidebarList onClick={() => handleDrawerToggle(false)} />
      </Drawer>
    </>
  );
};

export default MobileLayout;
