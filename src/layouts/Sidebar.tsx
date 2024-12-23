import { useState } from "react";
import { Typography, Box, Stack } from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ErrorIcon from "@mui/icons-material/Error";
import DnsIcon from "@mui/icons-material/Dns";
import CottageIcon from "@mui/icons-material/Cottage";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import DatabaseIcon from "@mui/icons-material/Storage";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import DevicesIcon from "@mui/icons-material/Devices";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import EventIcon from "@mui/icons-material/Event";

interface SidebarProps {
  isHideSidebar: boolean;
  toggleSidebar: () => void;
}

export const SlideBarItems = [
  {
    id: 0,
    icon: <CottageIcon sx={{ fontSize: 20 }} />,
    name: "Dashboard",
    path: "/dashboard",
    newIcon: "",
  },
  {
    id: 1,
    icon: <DatabaseIcon sx={{ fontSize: 20 }} />,
    name: "Data Collection",
    newIcon: "",
    subItems: [
      {
        id: "sub-1",
        icon: <DevicesIcon sx={{ fontSize: 20 }} />,
        name: "Devices",
        path: "/devices",
        newIcon: "",
      },
      {
        id: "sub-2",
        icon: <DnsIcon sx={{ fontSize: 20 }} />,
        name: "Templates",
        path: "/templates",
        newIcon: "",
      },
    ],
  },
  {
    id: 2,
    icon: <TimelineOutlinedIcon sx={{ fontSize: 20 }} />,
    name: "Graphs",
    path: "/graphs",
    newIcon: "",
  },
  {
    id: 4,
    icon: <CloudUploadIcon sx={{ fontSize: 20 }} />,
    name: "Storage",
    path: "/storage",
    newIcon: "",
  },
  {
    id: 5,
    icon: <SettingsIcon sx={{ fontSize: 20 }} />,
    name: "Management",
    path: "/management",
    newIcon: "",
  },
  {
    id: 6,
    icon: <ErrorIcon sx={{ fontSize: 22 }} />,
    name: "Alerts",
    // path: "/alerts",
    newIcon: "",
    subItems: [
      {
        id: "sub-1",
        icon: <NewReleasesIcon sx={{ fontSize: 20 }} />,
        name: "Trigger",
        path: "trigger",
        newIcon: "",
      },
      {
        id: "sub-2",
        icon: <EventIcon sx={{ fontSize: 20 }} />,
        name: "Event",
        path: "event",
        newIcon: "",
      },
    ],
  },
  {
    id: 7,
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />,
    name: "Contact Us",
    path: "/contactus",
    newIcon: "",
  },
];

export default function Sidebar({ isHideSidebar }: SidebarProps) {
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState<number | null>(
    location.pathname.includes("/devices") ||
      location.pathname.includes("/templates") ||
      location.pathname.includes("/alerts")
      ? 1
      : null
  );

  const handleItemClick = (item: any) => {
      if (item.subItems) {
        if (expandedItem === item.id) {
          setExpandedItem(null);
        } else {
          setExpandedItem(item.id);
          navigate(item.subItems[0].path);
        }
      } else {
        setExpandedItem(null);
        navigate(item.path);
      }
    
  };

  return (
    <Stack direction="column" spacing="10px">
      {SlideBarItems.map((item) => (
        <div key={item.id}>
          <Box
            onClick={() => handleItemClick(item)}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "5px",
              p: "10px 25px",
              m: 0,
              backgroundColor:
                location.pathname === item.path ||
                item.subItems?.some((sub) => sub.path === location.pathname) ||
                (item.id === 6 && expandedItem === item.id)
                  ? "#F25A28"
                  : "transparent",
              color:
                location.pathname === item.path ||
                item.subItems?.some((sub) => sub.path === location.pathname) ||
                (item.id === 6 && expandedItem === item.id)
                  ? "#FFFFFB"
                  : "#242D5D",
              transition: "background-color 0.3s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              {item.icon}
              <Box
                sx={{
                  overflow: "hidden",
                  maxWidth:
                    !isHideSidebar && windowSize.width >= 1100
                      ? "200px"
                      : "0px",
                  transition: "max-width 0.5s ease",
                }}
              >
                <Typography
                  sx={{
                    marginLeft: "30px",
                    fontSize: 16,
                    fontWeight: 500,
                    paddingRight: 1,
                    whiteSpace: "nowrap",
                    opacity: !isHideSidebar && windowSize.width >= 1100 ? 1 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
            </Box>
            {item.subItems &&
              !isHideSidebar &&
              windowSize.width >= 1100 &&
              (expandedItem === item.id ? (
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
              ) : (
                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
              ))}
          </Box>

          {/* Sub-items */}
          {item.subItems &&
            expandedItem === item.id &&
            !isHideSidebar &&
            windowSize.width >= 1100 && (
              <div>
                {item.subItems.map((subItem) => (
                  <Box
                    key={subItem.id}
                    onClick={() => {
                      navigate(subItem.path);
                      setExpandedItem(item.id);
                    }}
                    sx={{
                      mt: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "5px",
                      p: "5px 30px",
                      ml: "50px",
                      backgroundColor:
                        location.pathname === subItem.path ||
                        (expandedItem === 6 &&
                          location.pathname.includes("/alerts"))
                          ? "transparent"
                          : "transparent",

                      "&:hover": {
                        backgroundColor:
                          location.pathname !== subItem.path
                            ? "#FFEAE3"
                            : "#FFEAE3",
                      },
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      {subItem.icon}
                      {location.pathname.includes(subItem.path) && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "-12%",
                            transform: "translate(-50%, -50%)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#FF5722",
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          overflow: "hidden",
                          maxWidth:
                            !isHideSidebar && windowSize.width >= 1100
                              ? "200px"
                              : "0px",
                          transition: "max-width 0.5s ease",
                        }}
                      >
                        <Typography
                          sx={{
                            marginLeft: "30px",
                            fontSize: 16,
                            fontWeight: 500,
                            paddingRight: 1,
                            whiteSpace: "nowrap",
                            opacity:
                              !isHideSidebar && windowSize.width >= 1100
                                ? 1
                                : 0,
                            transition: "opacity 0.5s ease",
                          }}
                        >
                          {subItem.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </div>
            )}
        </div>
      ))}
    </Stack>
  );
}
