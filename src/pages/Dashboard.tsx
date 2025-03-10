import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
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
  Select,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
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
import DraggableDashboard from "../components/DraggableDashboard";
import { SelectChangeEvent } from "@mui/material";
import GraphSelectionDialog from "../components/DashBoardWidgets/GraphSelectionDialog";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import {
  ActiveComponentWithGraph,
  APIComponent,
  APIDashboard,
  ComponentConfig,
  DashboardLayout,
  SnackbarState,
  TodoItem,
} from "../components/DashBoardWidgets/interface_Dashboard";
import TodoList from "../components/DashBoardWidgets/TodoList";

const DASHBOARD_STORAGE_KEY = "dashboard_layout";

const availableComponents: ComponentConfig[] = [
  {
    id: "digitalClock",
    name: "Digital Clock",
    icon: <AccessTimeFilledIcon />,
    component: DigitalClock,
    defaultSize: { xs: 10, sm: 5, md: 4 },
    height: "17rem", // Smaller height for digital clock
    allowMultiple: false,
  },
  {
    id: "analogClock",
    name: "Analog Clock",
    icon: <AccessTimeIcon />,
    component: AnalogClock,
    defaultSize: { xs: 12, sm: 6, md: 4 },
    height: "17rem", // Taller for analog clock
    allowMultiple: false,
  },
  {
    id: "table",
    name: "Table",
    icon: <TableChartIcon />,
    component: TableComponent,
    defaultSize: { xs: 12, md: 6 },
    height: "19rem", // Taller for table content
    allowMultiple: false,
  },
  {
    id: "graph",
    name: "Graph",
    icon: <ShowChartIcon />,
    component: Graph,
    defaultSize: { xs: 12, md: 6 },
    height: "25rem", // Taller for graphs
    allowMultiple: true,
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: <CalendarTodayIcon />,
    component: Calendar,
    defaultSize: { xs: 12, sm: 6, md: 4 },
    height: "17rem", // Medium height for calendar
    allowMultiple: false,
  },
  {
    id: "eventblock",
    name: "Event",
    icon: <NotificationImportantIcon />,
    component: EventBlock,
    defaultSize: { xs: 12, sm: 6, md: 6 },
    height: "20rem", // Medium height for events
    allowMultiple: false,
  },
  {
    id: "todolist",
    name: "Todo List",
    icon: <FormatListBulletedIcon />,
    component: TodoList,
    defaultSize: { xs: 12, sm: 6, md: 6 },
    height: "20rem", // Medium height for events
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
  // Add state to track Select menu open status
  const [graphSelectionOpen, setGraphSelectionOpen] = useState(false);
  const [pendingGraphAdd, setPendingGraphAdd] = useState(false);
  const [activeComponents, setActiveComponents] = useState<
    ActiveComponentWithGraph[]
  >([]);
  const [dashboards, setDashboards] = useState<DashboardLayout[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewerDashboards, setViewerDashboards] = useState<DashboardLayout[]>(
    []
  );
  const [isViewerDashboard, setIsViewerDashboard] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleDashboardMenuItemClick = async (
    dashboard: DashboardLayout,
    isViewer: boolean
  ) => {
    setCurrentDashboardId(dashboard.id);
    setActiveComponents(dashboard.components);
    setIsViewerDashboard(isViewer);
    setSelectOpen(false);
    
    // Set this dashboard as the default dashboard (only for user dashboards, not viewer dashboards)
    if (!isViewer) {
      try {
        // Update selected dashboard to be default
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/${dashboard.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              isDefault: true,
              components: dashboard.components.map((comp) => ({
                componentType: comp.id,
                position: comp.position,
                graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
                todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
              })),
            }),
          }
        );
  
        if (!response.ok) {
          console.error("Failed to set dashboard as default");
        }
  
        // Set all other dashboards to non-default
        const otherDashboards = dashboards.filter(d => d.id !== dashboard.id);
        for (const otherDashboard of otherDashboards) {
          const updateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/dashboard/${otherDashboard.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                isDefault: false,
                components: otherDashboard.components.map((comp) => ({
                  componentType: comp.id,
                  position: comp.position,
                  graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
                  todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
                })),
              }),
            }
          );
          
          if (!updateResponse.ok) {
            console.error(`Failed to update dashboard ${otherDashboard.id}`);
          }
        }
        
        // Update local state to reflect new default status
        setDashboards(prevDashboards => 
          prevDashboards.map(dash => ({
            ...dash,
            isDefault: dash.id === dashboard.id
          }))
        );
        
      } catch (error) {
        console.error("Error setting default dashboard:", error);
      }
    }
  };

  // useEffect(() => {
  //   const fetchDashboards = async () => {
  //     try {
  //       const userId = localStorage.getItem("user_id");
  //       if (!userId) {
  //         throw new Error("No user ID found");
  //       }

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/dashboard/user/${userId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch dashboards");
  //       }

  //       const data = await response.json();
  //       if (data.status === "success" && Array.isArray(data.dashboards)) {
  //         const transformedDashboards: DashboardLayout[] = data.dashboards.map(
  //           (dashboard: any) => ({
  //             id: dashboard._id,
  //             name: dashboard.dashboard_name,
  //             components: dashboard.components.map(
  //               (comp: any, index: number) => ({
  //                 id: comp.componentType,
  //                 position: index,
  //                 componentType: comp.componentType,
  //                 graphSelection:
  //                   comp.componentType === "graph"
  //                     ? comp.graphSelection
  //                     : undefined,
  //                 todoItems:
  //                   comp.id === "todolist" ? comp.todoItems : undefined,
  //               })
  //             ),
  //           })
  //         );

  //         setDashboards(transformedDashboards);
  //         if (transformedDashboards.length > 0) {
  //           setCurrentDashboardId(transformedDashboards[0].id);
  //           setActiveComponents(transformedDashboards[0].components);
  //         } else {
  //           // If no dashboards exist, set to empty string explicitly
  //           setCurrentDashboardId("");
  //           setActiveComponents([]);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboards:", error);
  //       setError(
  //         error instanceof Error ? error.message : "Failed to fetch dashboards"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDashboards();
  // }, []);

  // Check user role
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin" || userRole === "superadmin");
    setIsSuperAdmin(userRole === "superadmin"); // Add this line
  }, []);

useEffect(() => {
  // Helper function to set the first dashboard as default
  const setFirstDashboardAsDefault = async (
    firstDashboard: DashboardLayout, 
    allDashboards: DashboardLayout[]
  ) => {
    // Set first dashboard as default
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/dashboard/${firstDashboard.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          isDefault: true,
          components: firstDashboard.components.map((comp) => ({
            componentType: comp.id,
            position: comp.position,
            graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
            todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
          })),
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to set initial dashboard as default");
    }
    
    // Set all other dashboards to non-default
    const otherDashboards = allDashboards.filter(d => d.id !== firstDashboard.id);
    for (const otherDashboard of otherDashboards) {
      const updateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/${otherDashboard.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            isDefault: false,
            components: otherDashboard.components.map((comp) => ({
              componentType: comp.id,
              position: comp.position,
              graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
              todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
            })),
          }),
        }
      );
      
      if (!updateResponse.ok) {
        console.error(`Failed to update dashboard ${otherDashboard.id}`);
      }
    }
  };

  const fetchAllDashboards = async () => {
    try {
      // Always start with loading set to true
      setLoading(true);
      
      // Record start time for ensuring 1 second minimum loading
      const startTime = Date.now();
      
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("No user ID found");
      }

      // Fetch user dashboards
      const userDashboardResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!userDashboardResponse.ok) {
        throw new Error("Failed to fetch user dashboards");
      }

      const userDashboardData = await userDashboardResponse.json();
      let transformedUserDashboards: DashboardLayout[] = [];
      let viewerDashboardsData: DashboardLayout[] = [];

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
              graphSelection: comp.graphSelection,
              todoItems: comp.todoItems,
            })),
            isDefault: dashboard.isDefault || false,
          })
        );
      }

      // Check if user is superadmin before fetching viewer dashboards
      const userRole = localStorage.getItem("userRole");
      if (userRole === "superadmin") {
        const viewerDashboardResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/viewer`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (viewerDashboardResponse.ok) {
          const viewerDashboardData = await viewerDashboardResponse.json();

          if (
            viewerDashboardData.status === "success" &&
            Array.isArray(viewerDashboardData.dashboards)
          ) {
            viewerDashboardsData = viewerDashboardData.dashboards.map(
              (dashboard: APIDashboard) => ({
                id: dashboard._id,
                name: `${dashboard.dashboard_name} (Viewer)`, // Add (Viewer) suffix for clarity
                components: dashboard.components.map(
                  (comp: APIComponent) => ({
                    id: comp.componentType,
                    position: comp.position,
                    graphSelection: comp.graphSelection,
                    todoItems: comp.todoItems,
                  })
                ),
              })
            );
          }
        } else {
          console.error("Failed to fetch viewer dashboards");
        }
      }

      // Find default dashboard or set first dashboard as default
      const defaultDashboard = transformedUserDashboards.find(dash => dash.isDefault);
      
      // Determine which dashboard to show initially and set all states in a batch
      let initialDashboard: DashboardLayout | undefined;
      let isViewer = false;
      
      if (defaultDashboard) {
        // We have a default dashboard
        initialDashboard = defaultDashboard;
      } 
      else if (transformedUserDashboards.length > 0) {
        // No default, but we have user dashboards - use the first one
        initialDashboard = transformedUserDashboards[0];
        
        // Set the first dashboard as default and others as non-default
        try {
          const firstDashboard = transformedUserDashboards[0];
          await setFirstDashboardAsDefault(firstDashboard, transformedUserDashboards);
          
          // Update isDefault in our local state
          transformedUserDashboards = transformedUserDashboards.map(dash => ({
            ...dash,
            isDefault: dash.id === firstDashboard.id
          }));
        } catch (error) {
          console.error("Error setting default dashboard:", error);
        }
      }
      else if (userRole === "superadmin" && viewerDashboardsData.length > 0) {
        // Only viewer dashboards available for superadmin
        initialDashboard = viewerDashboardsData[0];
        isViewer = true;
      }
      
      // Calculate time elapsed for ensuring minimum 1 second loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      
      // Use setTimeout to ensure minimum loading time
      setTimeout(() => {
        // Only update all the states after the loading time
        // This prevents any dashboard from showing before the default one is determined
        if (initialDashboard) {
          setDashboards(transformedUserDashboards);
          setViewerDashboards(viewerDashboardsData);
          setCurrentDashboardId(initialDashboard.id);
          setActiveComponents(initialDashboard.components);
          setIsViewerDashboard(isViewer);
        } else {
          setDashboards(transformedUserDashboards);
          setViewerDashboards(viewerDashboardsData);
          setCurrentDashboardId("");
          setActiveComponents([]);
        }
        
        // Finally set loading to false to show the dashboard
        setLoading(false);
      }, remainingTime);
      
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
      
      // Ensure minimum 1 second loading even on error
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Remove previous useEffect with the empty dependency array
  // and just call this one
  fetchAllDashboards();
}, [isSuperAdmin]);
  const handleDashboardChange = async (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    if (!selectedId) return;
  
    // If the target is the "New Dashboard" option, handle it separately
    if (selectedId === "new") {
      handleAddDashboard();
      setSelectOpen(false);
      return;
    }
  
    // Find the selected dashboard from either user or viewer dashboards
    const selectedViewerDashboard = viewerDashboards.find(
      (d) => d.id === selectedId
    );
    const selectedUserDashboard = dashboards.find((d) => d.id === selectedId);
    const selectedDashboard = selectedViewerDashboard || selectedUserDashboard;
  
    if (selectedDashboard) {
      setCurrentDashboardId(selectedId);
      // Filter out event components if switching to viewer dashboard
      const filteredComponents = selectedViewerDashboard
        ? selectedDashboard.components.filter(
            (comp) => comp.id !== "eventblock" || "todolist"
          )
        : selectedDashboard.components;
  
      setActiveComponents(filteredComponents);
      setIsViewerDashboard(!!selectedViewerDashboard);
      setIsEditing(false);
      setSelectOpen(false);
      
      // Set this dashboard as the default dashboard and others as non-default
      if (!selectedViewerDashboard) {
        try {
          // Update selected dashboard to be default
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/dashboard/${selectedId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                isDefault: true,
                components: selectedDashboard.components.map((comp) => ({
                  componentType: comp.id,
                  position: comp.position,
                  graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
                  todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
                })),
              }),
            }
          );
  
          if (!response.ok) {
            console.error("Failed to set dashboard as default");
          }
  
          // Set all other dashboards to non-default
          const otherDashboards = dashboards.filter(d => d.id !== selectedId);
          for (const dashboard of otherDashboards) {
            const updateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/dashboard/${dashboard.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  isDefault: false,
                  components: dashboard.components.map((comp) => ({
                    componentType: comp.id,
                    position: comp.position,
                    graphSelection: comp.id === "graph" ? comp.graphSelection : undefined,
                    todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
                  })),
                }),
              }
            );
            
            if (!updateResponse.ok) {
              console.error(`Failed to update dashboard ${dashboard.id}`);
            }
          }
          
          // Update local state to reflect new default status
          setDashboards(prevDashboards => 
            prevDashboards.map(dash => ({
              ...dash,
              isDefault: dash.id === selectedId
            }))
          );
          
        } catch (error) {
          console.error("Error setting default dashboard:", error);
        }
      }
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            dashboard_name: `Dashboard ${dashboards.length + 1}`,
            user_id: userId,
            components: [defaultComponent],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create dashboard");
      }

      const data = await response.json();
      // console.log("Create dashboard response:", data); // Debug log

      if (data.status === "success") {
        // Refresh dashboards list
        const refreshResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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
                graphSelection: comp.graphSelection,
                todoItems: comp.todoItems,
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
              // ...(comp.settings || {}),
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

useEffect(() => {
  const updateDashboard = async () => {
    if (!currentDashboardId || !isEditing) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/${currentDashboardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            components: activeComponents.map((comp) => ({
              componentType: comp.id,
              position: comp.position,
              graphSelection:
                comp.id === "graph" ? comp.graphSelection : undefined,
              todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
            })),
            isDefault: true, // Set this dashboard as default
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update dashboard");
      }
      
      // After successful update, fetch all dashboards again
      const userId = localStorage.getItem("user_id");
      if (userId) {
        // Fetch user dashboards
        const userDashboardResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (!userDashboardResponse.ok) {
          throw new Error("Failed to refresh dashboards");
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
                graphSelection: comp.graphSelection,
                todoItems: comp.todoItems,
              })),
            })
          );
          setDashboards(transformedUserDashboards);
        }

        // Check if user is superadmin before fetching viewer dashboards
        const userRole = localStorage.getItem("userRole");
        if (userRole === "superadmin") {
          const viewerDashboardResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/dashboard/viewer`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (viewerDashboardResponse.ok) {
            const viewerDashboardData = await viewerDashboardResponse.json();

            if (
              viewerDashboardData.status === "success" &&
              Array.isArray(viewerDashboardData.dashboards)
            ) {
              const transformedViewerDashboards =
                viewerDashboardData.dashboards.map(
                  (dashboard: APIDashboard) => ({
                    id: dashboard._id,
                    name: `${dashboard.dashboard_name} (Viewer)`,
                    components: dashboard.components.map(
                      (comp: APIComponent) => ({
                        id: comp.componentType,
                        position: comp.position,
                        graphSelection: comp.graphSelection,
                        todoItems: comp.todoItems,
                      })
                    ),
                  })
                );
              setViewerDashboards(transformedViewerDashboards);
            }
          } else {
            console.error("Failed to fetch viewer dashboards");
          }
        }
      }
      
    } catch (error) {
      console.error("Error updating dashboard:", error);
      setSnackbar({
        open: true,
        message: "Failed to update dashboard",
        severity: "error",
      });
    }
  };

  updateDashboard();
}, [activeComponents, currentDashboardId, isEditing]);
  const handleAddComponent = (componentId: string) => {
    if (componentId === "graph") {
      setPendingGraphAdd(true);
      setGraphSelectionOpen(true);
      return;
    }

    setActiveComponents((prev) => [
      ...prev,
      {
        id: componentId,
        position: prev.length,
        componentType: componentId,
      },
    ]);

    setComponentDialog(false);
    setSnackbar({
      open: true,
      message: "Widget added successfully",
      severity: "success",
    });
  };

  const handleGraphSelection = (itemId: string, hostId: string) => {
    if (pendingGraphAdd) {
      setActiveComponents((prev) => [
        ...prev,
        {
          id: "graph",
          position: prev.length,
          componentType: "graph",
          graphSelection: {
            itemId,
            hostId, // Make sure to include hostId in graphSelection
          },
        },
      ]);
    }

    setGraphSelectionOpen(false);
    setComponentDialog(false);
    setPendingGraphAdd(false);
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
      // Save only when clicking DoneIcon to finish editing
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
        `${import.meta.env.VITE_API_URL}/dashboard/${currentDashboardId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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

    // Restrict event component to non-viewer dashboards only
    if (
      (componentId === "eventblock" || componentId === "todolist") &&
      isViewerDashboard
    ) {
      return false;
    }

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
    componentConfig: ComponentConfig
  ) => {
    const Component = componentConfig.component;

    const handleTodoUpdate = async (newTodos: TodoItem[]) => {
      try {
        // First update local state
        const updatedComponents = activeComponents.map((comp) =>
          comp.position === activeComp.position
            ? { ...comp, todoItems: newTodos }
            : comp
        );
        setActiveComponents(updatedComponents);

        // Then update in database
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/${currentDashboardId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              components: updatedComponents.map((comp) => ({
                componentType: comp.id,
                position: comp.position,
                graphSelection:
                  comp.id === "graph" ? comp.graphSelection : undefined,
                todoItems: comp.id === "todolist" ? comp.todoItems : undefined,
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update dashboard");
        }

        setSnackbar({
          open: true,
          message: "Todo list updated successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Error updating todos:", error);
        setSnackbar({
          open: true,
          message: "Failed to update todo list",
          severity: "error",
        });
      }
    };

    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isEditing && !isViewerDashboard && (
          <IconButton
            size="small"
            onClick={() => handleRemoveComponent(activeComp.position)}
            sx={{
              position: "absolute",
              right: 4,
              top: 2,
              zIndex: 10,
              color: "black",
            }}
          >
            <RemoveIcon />
          </IconButton>
        )}
        <Box
          sx={{
            flexGrow: 1,
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Component
            graphSelection={activeComp.graphSelection}
            todoItems={activeComp.todoItems}
            onUpdate={handleTodoUpdate}
          />
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

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
                <Tooltip title={isEditing ? "Save Changes" : "Edit Dashboard"}>
                  <IconButton
                    onClick={toggleEdit} // This will now save only when clicking DoneIcon
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
              {isEditing && !isViewerDashboard && (
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
                      value={currentDashboardId || ""}
                      onChange={handleDashboardChange}
                      open={selectOpen}
                      onOpen={() => setSelectOpen(true)}
                      onClose={() => setSelectOpen(false)}
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) return "Select Dashboard";

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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDashboardMenuItemClick(dashboard, false);
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDashboardMenuItemClick(dashboard, true);
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
                            value="new"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddDashboard();
                              setSelectOpen(false);
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
          // backgroundColor: "#FFFFFB",
          backgroundColor: "#ebf1ff",
          borderRadius: 3,
          p: 1,
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
            {availableComponents
              .filter(
                (component) =>
                  // Filter out both eventblock and todolist for viewer dashboards
                  !(
                    isViewerDashboard &&
                    (component.id === "eventblock" ||
                      component.id === "todolist")
                  )
              )
              .map((component) => {
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
