// Sidebar.tsx
import { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HistoryIcon from "@mui/icons-material/History";
import ErrorIcon from "@mui/icons-material/Error";
import DnsIcon from "@mui/icons-material/Dns";
import CottageIcon from "@mui/icons-material/Cottage";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import DatabaseIcon from "@mui/icons-material/Storage";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DevicesIcon from "@mui/icons-material/Devices";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import BuildIcon from "@mui/icons-material/Build";

interface SubItem {
  id: string;
  icon: JSX.Element;
  name: string;
  path: string;
  newIcon: string;
}

interface SidebarItem {
  id: number;
  icon: JSX.Element;
  name: string;
  path?: string;
  newIcon: string;
  subItems?: SubItem[];
  alternativePaths?: string[]; // Add this new property
  requiredRole?: "admin" | "superadmin"; // Add role requirement
}

interface SidebarProps {
  isHideSidebar: boolean;
  toggleSidebar: () => void;
}

// Define base items that all users can see
const BaseItems: SidebarItem[] = [
  {
    id: 0,
    icon: <CottageIcon sx={{ fontSize: 20 }} />,
    name: "Dashboard",
    path: "/dashboard",
    alternativePaths: ["/viewerdashboard"], // Add the viewer dashboard path
    newIcon: "",
  },
  {
    id: 2,
    icon: <TimelineOutlinedIcon sx={{ fontSize: 20 }} />,
    name: "Graphs",
    path: "/graphs",
    newIcon: "",
  },
  {
    // id: 7,
    id: 6,
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />,
    name: "Contact Us",
    path: "/contactus",
    newIcon: "",
  },
];

// Additional items only admins can see
const AdminItems: SidebarItem[] = [
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
    id: 3,
    icon: <HistoryIcon sx={{ fontSize: 20 }} />,
    name: "Activity",
    path: "/activity",
    newIcon: "",
    requiredRole: "superadmin", // Only superadmin can see this
  },
  {
    id: 4,
    icon: <ErrorIcon sx={{ fontSize: 22 }} />,
    name: "Alerts",
    newIcon: "",
    subItems: [
      {
        id: "sub-1",
        icon: <NewReleasesIcon sx={{ fontSize: 20 }} />,
        name: "Trigger",
        path: "/trigger",
        newIcon: "",
      },
      {
        id: "sub-2",
        icon: <EventIcon sx={{ fontSize: 20 }} />,
        name: "Event",
        path: "/event",
        newIcon: "",
      },
    ],
  },
  {
    id: 5,
    icon: <SettingsIcon sx={{ fontSize: 20 }} />,
    name: "Management",
    path: "/management",
    newIcon: "",
  },

  // {
  //   id: 6,
  //   icon: <BuildIcon sx={{ fontSize: 20 }} />,
  //   name: "Actions",
  //   path: "/action",
  //   newIcon: "",
  // },
];

export default function Sidebar({ isHideSidebar }: SidebarProps) {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(BaseItems);
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole === "superadmin") {
      // Superadmin sees all items
      setSidebarItems(
        [...BaseItems, ...AdminItems].sort((a, b) => a.id - b.id)
      );
    } else if (userRole === "admin") {
      // Admin sees all items except those requiring superadmin
      const adminAccessibleItems = AdminItems.filter(
        (item) => !item.requiredRole || item.requiredRole === "admin"
      );
      setSidebarItems(
        [...BaseItems, ...adminAccessibleItems].sort((a, b) => a.id - b.id)
      );
    } else {
      // Other users only see base items
      setSidebarItems(BaseItems);
    }
  }, []);

  const [expandedItem, setExpandedItem] = useState<number | null>(
    location.pathname.includes("/devices") ||
      location.pathname.includes("/templates") ||
      location.pathname.includes("trigger") ||
      location.pathname.includes("event")
      ? location.pathname.includes("/devices") ||
        location.pathname.includes("/templates")
        ? 1
        : 5
      : null
  );

  const handleItemClick = (item: SidebarItem) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else if (item.path) {
      setExpandedItem(null);
      const userRole = localStorage.getItem("userRole");
      // If user is viewer and clicking dashboard, navigate to viewer dashboard
      if (userRole === "viewer" && item.path === "/dashboard") {
        navigate("/viewerdashboard");
      } else {
        navigate(item.path);
      }
    }
  };

  // Helper function to check if a path matches, including alternative paths
  const isPathActive = (item: SidebarItem) => {
    const currentPath = location.pathname;
    return (
      (item.path && currentPath === item.path) ||
      (item.alternativePaths && item.alternativePaths.includes(currentPath)) ||
      item.subItems?.some((sub) => sub.path === currentPath) ||
      (item.id === 5 &&
        (currentPath.includes("trigger") || currentPath.includes("event")))
    );
  };

  return (
    <Stack direction="column" spacing="10px">
      {sidebarItems.map((item) => (
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
              backgroundColor: isPathActive(item) ? "#F25A28" : "transparent",
              color: isPathActive(item) ? "#FFFFFB" : "#242D5D",
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

          {/* Sub-items section remains the same */}
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
                        (expandedItem === 5 &&
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
