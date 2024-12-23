import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Stack, Box, Typography } from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import MobileLayout from "./mobilelayout/MobileLayout";

export const getPageName = (pathname: string): string => {
  const pageName = [
    "Dashboard",
    "Devices",
    "Graphs",
    "Storages",
    "Management",
    "Alerts",
    "Contact",
  ];

  return pathname.includes("dashboard")
    ? "Dashboard"
    : pageName.find((i) => pathname.includes(i.toLowerCase())) ?? "Dashboard";
};

export default function MainLayout() {
  const windowSize = useWindowSize();
  const [isHideSidebar, setIsHideSidebar] = useState(false);

  // Function to toggle sidebar visibility
  const handleHideSidebar = (width: number) => {
    if (width >= 1100) setIsHideSidebar((state) => !state);
  };

  const isDesktop = windowSize.width > 600;

  return (
    <Stack
      direction={isDesktop ? "row" : "column"}
      sx={{
        width: "100vw",
        height: isDesktop ? "100vh" : "auto",
        overflow: "auto",
      }}
    >
      {isDesktop ? (
        <Stack
          direction="column"
          sx={{
            m: 0,
            maxWidth: 250,
            minHeight: 400,
            backgroundColor: "#FFFFFB",
            alignContent: "center",
            p: "20px 10px 10px 10px",
          }}
        >
          <Header
            isHideSidebar={isHideSidebar}
            handleHideSidebar={handleHideSidebar}
          />
          {/* Pass both isHideSidebar and handleHideSidebar to Sidebar */}
          <Sidebar
            isHideSidebar={isHideSidebar}
            toggleSidebar={() => setIsHideSidebar(!isHideSidebar)}
          />
          <Footer isHideSidebar={isHideSidebar} />
        </Stack>
      ) : (
        <MobileLayout />
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: windowSize.width >= 470 ? 24 : 20,
            fontWeight: 700,
            ml: "20px",
            mt: "15px",
            mb: "10px",
          }}
        ></Typography>

        <Box
          sx={{
            width: 0.9,
            height: 0.9,
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Stack>
  );
}
