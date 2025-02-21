interface DashboardLayout {
  id: string;
  name: string;
  components: ActiveComponentWithGraph[];
}

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableChartIcon from "@mui/icons-material/TableChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AnalogClock from "../components/DashBoardWidgets/AnalogClock";
import DigitalClock from "../components/DashBoardWidgets/DigitalClock";
import TableComponent from "../components/DashBoardWidgets/TableComponent";
import Graph from "../components/DashBoardWidgets/GraphInDashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Calendar from "../components/DashBoardWidgets/Calendar";
import EventBlock from "../components/DashBoardWidgets/EventBlock";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { SearchIcon } from "lucide-react";
import DraggableDashboard from "../components/DraggableDashboard";
import { SelectChangeEvent } from "@mui/material";

// Add new interfaces for graph selection
interface GraphSelection {
  graphName: string;
}

interface ActiveComponentWithGraph extends ActiveComponent {
  graphSelection?: GraphSelection;
}

const GraphSelectionDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (graphName: string) => void;
}> = ({ open, onClose, onSelect }) => {
  const [availableGraphs, setAvailableGraphs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGraphs = async () => {
      if (!open) return;

      try {
        const res = await fetch("http://localhost:3000/host", {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch hosts");

        const result = await res.json();
        if (
          result.status === "success" &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const host = result.data[0];

          const now = new Date();
          const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);

          const dataRes = await fetch(
            `http://127.0.0.1:3000/data/between?startTime=${fifteenMinutesAgo.toISOString()}&endTime=${now.toISOString()}&host_id=${
              host._id
            }`
          );

          if (!dataRes.ok) throw new Error("Failed to fetch graph data");

          const dataResult = await dataRes.json();
          if (
            dataResult.status === "success" &&
            Array.isArray(dataResult.data)
          ) {
            const sortedData = dataResult.data[0].items.sort((a: any, b: any) =>
              a.item_id.item_name.localeCompare(b.item_id.item_name)
            );
            setAvailableGraphs(sortedData);
          }
        }
      } catch (error) {
        console.error("Error fetching graphs:", error);
      }
    };

    fetchGraphs();
  }, [open]);

  const filteredGraphs = availableGraphs.filter((graph) =>
    graph.item_id.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Graph</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search graphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredGraphs.length > 0 ? (
            filteredGraphs.map((graph) => (
              <ListItem
                key={graph.item_id.item_name}
                onClick={() => onSelect(graph.item_id.item_name)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon>
                  <ShowChartIcon />
                </ListItemIcon>
                <ListItemText
                  primary={graph.item_id.item_name}
                  secondary={`Unit: ${graph.item_id.unit}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No matching graphs found"
                sx={{ textAlign: "center", color: "text.secondary" }}
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

// API response interfaces
interface APIComponent {
  id: string;
  position: number;
  componentType: string;
  settings: Record<string, any>;
  _id: string;
}

interface APIDashboard {
  _id: string;
  dashboard_name: string;
  user_id: string;
  isDefault: boolean;
  components: APIComponent[];
  isViewer: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface APIResponse {
  status: string;
  dashboards: APIDashboard[];
}

interface ComponentConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  component: React.ComponentType<any>; // Update to accept props
  defaultSize: {
    xs: number;
    sm?: number;
    md?: number;
  };
  allowMultiple: boolean;
}

interface ActiveComponent {
  id: string;
  position: number;
  graphSelection?: {
    graphName: string;
  };
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}
const DASHBOARD_STORAGE_KEY = "dashboard_layout";
const availableComponents: ComponentConfig[] = [
  {
    id: "digitalClock",
    name: "Digital Clock",
    icon: <AccessTimeFilledIcon />,
    component: DigitalClock,
    defaultSize: { xs: 10, sm: 5, md: 4 },
    allowMultiple: false,
  },
  {
    id: "analogClock",
    name: "Analog Clock",
    icon: <AccessTimeIcon />,
    component: AnalogClock,
    defaultSize: { xs: 12, sm: 6, md: 4 },
    allowMultiple: false,
  },
  {
    id: "table",
    name: "Table",
    icon: <TableChartIcon />,
    component: TableComponent,
    defaultSize: { xs: 12, md: 6 },
    allowMultiple: false,
  },
  {
    id: "graph",
    name: "Graph",
    icon: <ShowChartIcon />,
    component: Graph,
    defaultSize: { xs: 12, md: 6 },
    allowMultiple: true,
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: <CalendarTodayIcon />,
    component: Calendar,
    defaultSize: { xs: 12, sm: 6, md: 4 },
    allowMultiple: false,
  },
  {
    id: "eventblock",
    name: "Event",
    icon: <NotificationImportantIcon />,
    component: EventBlock,
    defaultSize: { xs: 12, sm: 6, md: 6 },
    allowMultiple: false,
  },
];

const Dashboard = () => {
  const windowSize = useWindowSize();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [componentDialog, setComponentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [graphSelectionOpen, setGraphSelectionOpen] = useState(false);
  const [pendingGraphAdd, setPendingGraphAdd] = useState(false);
  const [activeComponents, setActiveComponents] = useState<
    ActiveComponentWithGraph[]
  >([]);
  const [dashboards, setDashboards] = useState<DashboardLayout[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewerDashboards, setViewerDashboards] = useState<DashboardLayout[]>(
    []
  );
  const [isViewerDashboard, setIsViewerDashboard] = useState(false);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          throw new Error("No user ID found");
        }

        const response = await fetch(
          `http://localhost:3000/dashboard/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch dashboards");
        }

        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.dashboards)) {
          // Transform API data to match our DashboardLayout interface
          const transformedDashboards: DashboardLayout[] = data.dashboards.map(
            (dashboard: APIDashboard) => ({
              id: dashboard._id,
              name: dashboard.dashboard_name,
              components: dashboard.components.map((comp: APIComponent) => ({
                id: comp.componentType,
                position: comp.position,
                ...(comp.settings || {}),
              })),
            })
          );

          setDashboards(transformedDashboards);

          // Set current dashboard to the first one
          if (transformedDashboards.length > 0) {
            setCurrentDashboardId(transformedDashboards[0].id);
            setActiveComponents(transformedDashboards[0].components);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboards"
        );
        setSnackbar({
          open: true,
          message: "Failed to load dashboards",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  // Check user role
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin" || userRole === "superadmin");
    setIsSuperAdmin(userRole === "superadmin");
  }, []);

  // Fetch both user and viewer dashboards
  useEffect(() => {
    const fetchAllDashboards = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          throw new Error("No user ID found");
        }

        // Fetch user dashboards
        const userDashboardResponse = await fetch(
          `http://localhost:3000/dashboard/user/${userId}`
        );
        if (!userDashboardResponse.ok) {
          throw new Error("Failed to fetch user dashboards");
        }

        const userDashboardData = await userDashboardResponse.json();
        let transformedUserDashboards: DashboardLayout[] = [];

        if (
          userDashboardData.status === "success" &&
          Array.isArray(userDashboardData.dashboards)
        ) {
          transformedUserDashboards = userDashboardData.dashboards.map(
            (dashboard: APIDashboard) => ({
              id: dashboard._id,
              name: dashboard.dashboard_name,
              components: dashboard.components.map((comp: APIComponent) => ({
                id: comp.componentType,
                position: comp.position,
                ...(comp.settings || {}),
              })),
            })
          );
          setDashboards(transformedUserDashboards);
        }

        // If superadmin, fetch viewer dashboards
        let transformedViewerDashboards: DashboardLayout[] = [];
        if (isSuperAdmin) {
          const viewerDashboardResponse = await fetch(
            "http://localhost:3000/dashboard/viewer"
          );
          if (viewerDashboardResponse.ok) {
            const viewerDashboardData = await viewerDashboardResponse.json();
            if (
              viewerDashboardData.status === "success" &&
              Array.isArray(viewerDashboardData.dashboards)
            ) {
              transformedViewerDashboards = viewerDashboardData.dashboards.map(
                (dashboard: APIDashboard) => ({
                  id: dashboard._id,
                  name: `${dashboard.dashboard_name}`,
                  components: dashboard.components.map(
                    (comp: APIComponent) => ({
                      id: comp.componentType,
                      position: comp.position,
                      ...(comp.settings || {}),
                    })
                  ),
                })
              );
              setViewerDashboards(transformedViewerDashboards);
            }
          }
        }

        // Set initial dashboard and components
        const allDashboards = [
          ...transformedUserDashboards,
          ...transformedViewerDashboards,
        ];
        if (allDashboards.length > 0) {
          const firstDashboard = allDashboards[0];
          setCurrentDashboardId(firstDashboard.id);
          setActiveComponents(firstDashboard.components);
          setIsViewerDashboard(
            transformedViewerDashboards.some((d) => d.id === firstDashboard.id)
          );
        }
      } catch (err) {
        console.error("Error fetching dashboards:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboards"
        );
        setSnackbar({
          open: true,
          message: "Failed to load dashboards",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDashboards();
  }, [isSuperAdmin]);

  const handleDashboardChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    console.log("Selected Dashboard ID:", selectedId);
    console.log("Available Dashboards:", dashboards);
    console.log("Available Viewer Dashboards:", viewerDashboards);

    // If the target is the "New Dashboard" option, handle it separately
    if (selectedId === "new") {
      handleAddDashboard();
      return;
    }

    // Find the selected dashboard from either user or viewer dashboards
    const selectedViewerDashboard = viewerDashboards.find(
      (d) => d.id === selectedId
    );
    const selectedUserDashboard = dashboards.find((d) => d.id === selectedId);
    const selectedDashboard = selectedViewerDashboard || selectedUserDashboard;

    console.log("Selected Dashboard:", selectedDashboard);

    if (selectedDashboard) {
      setCurrentDashboardId(selectedId);
      setActiveComponents(selectedDashboard.components);
      setIsViewerDashboard(!!selectedViewerDashboard);
      setIsEditing(false); // Exit edit mode when switching dashboards
    }
  };

  const handleAddDashboard = async () => {
    if (dashboards.length >= 3) {
      setSnackbar({
        open: true,
        message: "Maximum number of dashboards reached (3)",
        severity: "error",
      });
      return;
    }

    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const defaultComponent = {
        componentType: "digitalClock",
        position: 0,
        settings: {},
      };

      // Create new dashboard
      const response = await fetch("http://localhost:3000/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dashboard_name: `Dashboard ${dashboards.length + 1}`,
          user_id: userId,
          components: [defaultComponent],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create dashboard");
      }

      const data = await response.json();
      // console.log("Create dashboard response:", data); // Debug log

      if (data.status === "success") {
        // Refresh dashboards list
        const refreshResponse = await fetch(
          `http://localhost:3000/dashboard/user/${userId}`
        );
        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh dashboards");
        }

        const refreshData = await refreshResponse.json();
        // console.log("Refresh dashboards response:", refreshData); // Debug log

        if (refreshData.status === "success") {
          const transformedDashboards: DashboardLayout[] =
            refreshData.dashboards.map((dashboard: APIDashboard) => ({
              id: dashboard._id,
              name: dashboard.dashboard_name,
              components: dashboard.components.map((comp: APIComponent) => ({
                id: comp.componentType,
                position: comp.position,
                ...(comp.settings || {}),
              })),
            }));

          // Update state
          setDashboards(transformedDashboards);
          // Get the latest created dashboard from the refreshed data
          const newDashboard =
            refreshData.dashboards[refreshData.dashboards.length - 1];
          setCurrentDashboardId(newDashboard._id);
          setActiveComponents(
            newDashboard.components.map((comp: APIComponent) => ({
              id: comp.componentType,
              position: comp.position,
              ...(comp.settings || {}),
            }))
          );

          // Show success message
          setSnackbar({
            open: true,
            message: "New dashboard created successfully",
            severity: "success",
          });
        } else {
          throw new Error("Failed to refresh dashboards data");
        }
      } else {
        throw new Error(data.message || "Failed to create dashboard");
      }
    } catch (error) {
      console.error("Dashboard creation error:", error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to create dashboard",
        severity: "error",
      });
    }
  };

  // Update dashboard components
  useEffect(() => {
    const updateDashboard = async () => {
      if (!currentDashboardId || !isEditing) return;

      try {
        const response = await fetch(
          `http://localhost:3000/dashboard/${currentDashboardId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              components: activeComponents.map((comp) => ({
                componentType: comp.id,
                position: comp.position,
                settings: comp.graphSelection
                  ? { graphSelection: comp.graphSelection }
                  : {},
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update dashboard");
        }
      } catch (error) {
        console.error("Error updating dashboard:", error);
      }
    };

    updateDashboard();
  }, [activeComponents, currentDashboardId, isEditing]);
  const handleAddComponent = (componentId: string) => {
    const componentConfig = availableComponents.find(
      (c) => c.id === componentId
    );
    if (!componentConfig) return;

    const isAlreadyAdded = activeComponents.some(
      (comp) => comp.id === componentId && !componentConfig.allowMultiple
    );
    if (isAlreadyAdded && !componentConfig.allowMultiple) return;

    // If it's a graph component, show selection dialog
    if (componentId === "graph") {
      setPendingGraphAdd(true);
      setGraphSelectionOpen(true);
      return;
    }

    setActiveComponents((prev) => {
      const newLayout = [...prev, { id: componentId, position: prev.length }];
      return newLayout;
    });
    setComponentDialog(false);
    setSnackbar({
      open: true,
      message: "Widget added successfully",
      severity: "success",
    });
  };

  const handleGraphSelection = (graphName: string) => {
    setActiveComponents((prev) => {
      const newComponent = {
        id: "graph",
        position: prev.length,
        graphSelection: { graphName },
      };
      return [...prev, newComponent];
    });

    setGraphSelectionOpen(false);
    setComponentDialog(false);
    setPendingGraphAdd(false);

    setSnackbar({
      open: true,
      message: "Graph widget added successfully",
      severity: "success",
    });

    // Save to localStorage after updating
    try {
      const updatedLayout = [
        ...activeComponents,
        {
          id: "graph",
          position: activeComponents.length,
          graphSelection: { graphName },
        },
      ];
      localStorage.setItem(
        DASHBOARD_STORAGE_KEY,
        JSON.stringify(updatedLayout)
      );
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };

  const handleRemoveComponent = (position: number) => {
    setActiveComponents((prev) => {
      const newLayout = prev
        .filter((comp) => comp.position !== position)
        .map((comp, index) => ({
          ...comp,
          position: index,
        }));
      return newLayout;
    });
    setSnackbar({
      open: true,
      message: "Widget removed successfully",
      severity: "success",
    });
  };

  const toggleEdit = () => {
    if (isEditing) {
      try {
        localStorage.setItem(
          DASHBOARD_STORAGE_KEY,
          JSON.stringify(activeComponents)
        );
        setSnackbar({
          open: true,
          message: "Dashboard layout saved successfully",
          severity: "success",
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to save dashboard layout",
          severity: "error",
        });
      }
    }
    setIsEditing(!isEditing);
  };
  const handleDeleteDashboard = async () => {
    if (!currentDashboardId) return;

    // Don't allow deletion if there's only one dashboard
    if (dashboards.length <= 1) {
      setSnackbar({
        open: true,
        message: "Cannot delete the last dashboard",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/dashboard/${currentDashboardId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete dashboard");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Update local state
        const updatedDashboards = dashboards.filter(
          (dashboard) => dashboard.id !== currentDashboardId
        );
        setDashboards(updatedDashboards);

        // Switch to the first available dashboard
        if (updatedDashboards.length > 0) {
          setCurrentDashboardId(updatedDashboards[0].id);
          setActiveComponents(updatedDashboards[0].components);
        }

        setSnackbar({
          open: true,
          message: "Dashboard deleted successfully",
          severity: "success",
        });

        setIsEditing(false); // Exit edit mode after deletion
      } else {
        throw new Error(data.message || "Failed to delete dashboard");
      }
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to delete dashboard",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const canAddComponent = (componentId: string) => {
    const componentConfig = availableComponents.find(
      (c) => c.id === componentId
    );
    if (!componentConfig) return false;

    if (componentConfig.allowMultiple) return true;

    return !activeComponents.some((comp) => comp.id === componentId);
  };

  const handleReorder = (newLayout: ActiveComponentWithGraph[]) => {
    setActiveComponents(newLayout);
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newLayout));
      setSnackbar({
        open: true,
        message: "Dashboard layout updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving layout:", error);
      setSnackbar({
        open: true,
        message: "Failed to save dashboard layout",
        severity: "error",
      });
    }
  };

  const renderComponent = (
    activeComp: ActiveComponentWithGraph,
    componentConfig: ComponentConfig,
    index: number
  ) => {
    const Component = componentConfig.component;

    return (
      <Box sx={{ position: "relative", height: "100%" }}>
        {isEditing && (
          <IconButton
            size="small"
            onClick={() => handleRemoveComponent(activeComp.position)}
            sx={{
              position: "absolute",
              right: 2,
              top: 2,
              zIndex: 10,
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
              boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            }}
          >
            <AddIcon
              sx={{
                transform: "rotate(45deg)",
                zIndex: 11,
              }}
            />
          </IconButton>
        )}
        <Component
          graphKey={`graph-${activeComp.position}`}
          graphSelection={activeComp.graphSelection}
        />
      </Box>
    );
  };

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
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            DASHBOARD
          </Typography>
          {isAdmin && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* Allow editing for superadmin regardless of dashboard type */}
              {(!isViewerDashboard || (isViewerDashboard && isSuperAdmin)) && (
                <Tooltip title={isEditing ? "Save & Done" : "Edit Dashboard"}>
                  <IconButton
                    onClick={toggleEdit}
                    sx={{
                      "&:focus": {
                        outline: "none",
                        border: "none",
                      },
                    }}
                  >
                    {isEditing ? <DoneIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
              )}

              {isEditing &&
                (!isViewerDashboard || (isViewerDashboard && isSuperAdmin)) && (
                  <Tooltip title="Delete Dashboard">
                    <IconButton
                      onClick={handleDeleteDashboard}
                      sx={{
                        color: "red",
                        "&:focus": {
                          outline: "none",
                          border: "none",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}

              {!isEditing && (
                <>
                  {(dashboards.length > 0 ||
                    (isSuperAdmin && viewerDashboards.length > 0)) && (
                    <Select
                      value={currentDashboardId}
                      onChange={handleDashboardChange}
                      displayEmpty
                      renderValue={(value) => {
                        const selectedUserDash = dashboards.find(
                          (d) => d.id === value
                        );
                        const selectedViewerDash = viewerDashboards.find(
                          (d) => d.id === value
                        );
                        return (
                          (selectedUserDash || selectedViewerDash)?.name ||
                          "Select Dashboard"
                        );
                      }}
                      sx={{
                        backgroundColor: "white",
                        minWidth: 200,
                        "& .MuiSelect-select": {
                          py: 1,
                        },
                      }}
                    >
                      
                      {dashboards.length > 0 && (
                        <>
                          <MenuItem disabled>Your Dashboards</MenuItem>
                          {dashboards.map((dashboard) => (
                            <MenuItem
                              key={dashboard.id}
                              value={dashboard.id}
                              onClick={() => {
                                console.log("Clicked dashboard:", dashboard.id);
                                setCurrentDashboardId(dashboard.id);
                                setActiveComponents(dashboard.components);
                                setIsViewerDashboard(false);
                              }}
                            >
                              {dashboard.name}
                            </MenuItem>
                          ))}
                        </>
                      )}

                      {isSuperAdmin && viewerDashboards.length > 0 && (
                        <>
                          {dashboards.length > 0 && <MenuItem divider />}
                          <MenuItem disabled>Viewer Dashboards</MenuItem>
                          {viewerDashboards.map((dashboard) => (
                            <MenuItem
                              key={dashboard.id}
                              value={dashboard.id}
                              onClick={() => {
                                console.log(
                                  "Clicked viewer dashboard:",
                                  dashboard.id
                                );
                                setCurrentDashboardId(dashboard.id);
                                setActiveComponents(dashboard.components);
                                setIsViewerDashboard(true);
                              }}
                            >
                              {dashboard.name}
                            </MenuItem>
                          ))}
                        </>
                      )}

                      {!isViewerDashboard && dashboards.length < 3 && (
                        <>
                          <MenuItem divider />
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddDashboard();
                            }}
                            sx={{
                              color: "#4CAF50",
                              "&:hover": {
                                backgroundColor: "rgba(76, 175, 80, 0.08)",
                              },
                            }}
                          >
                            <AddIcon sx={{ mr: 1 }} />
                            New Dashboard
                          </MenuItem>
                        </>
                      )}
                    </Select>
                  )}

                  {dashboards.length === 0 &&
                    (!isSuperAdmin || viewerDashboards.length === 0) && (
                      <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={handleAddDashboard}
                        sx={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(76, 175, 80, 0.8)",
                          },
                        }}
                      >
                        New Dashboard
                      </Button>
                    )}
                </>
              )}

              {isEditing &&
                (!isViewerDashboard || (isViewerDashboard && isSuperAdmin)) && (
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setComponentDialog(true)}
                    sx={{
                      backgroundColor: "#F25A28",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#F37E58",
                      },
                    }}
                  >
                    Add Component
                  </Button>
                )}
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          width: 1,
          marginTop: 2,
          minHeight: "calc(100vh - 200px)",
          backgroundColor: "#FFFFFB",
          borderRadius: 3,
          p: 3,
        }}
      >
        <DraggableDashboard
          components={availableComponents}
          activeComponents={activeComponents}
          onReorder={handleReorder}
          isEditing={isEditing}
          onRemoveComponent={handleRemoveComponent}
          renderComponent={renderComponent}
        />

        {/* Graph Selection Dialog */}
        <GraphSelectionDialog
          open={graphSelectionOpen}
          onClose={() => {
            setGraphSelectionOpen(false);
            setPendingGraphAdd(false);
          }}
          onSelect={handleGraphSelection}
        />
      </Box>

      {/* Add Component Dialog */}
      <Dialog
        open={componentDialog}
        onClose={() => setComponentDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Component</DialogTitle>
        <DialogContent>
          <List>
            {availableComponents.map((component) => {
              const canAdd = canAddComponent(component.id);
              return (
                <ListItem
                  key={component.id}
                  onClick={() => canAdd && handleAddComponent(component.id)}
                  component="div"
                  sx={{
                    cursor: canAdd ? "pointer" : "not-allowed",
                    opacity: canAdd ? 1 : 0.5,
                    "&:hover": {
                      backgroundColor: canAdd ? "action.hover" : undefined,
                    },
                    pointerEvents: canAdd ? "auto" : "none",
                  }}
                >
                  <ListItemIcon>{component.icon}</ListItemIcon>
                  <ListItemText
                    primary={component.name}
                    secondary={!canAdd ? "Already added" : undefined}
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;
