import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AnalogClock from "../components/DashBoardWidgets/AnalogClock";
import DigitalClock from "../components/DashBoardWidgets/DigitalClock";
import TableComponent from "../components/DashBoardWidgets/TableComponent";
import Graph from "../components/DashBoardWidgets/GraphInDashboard";
import Calendar from "../components/DashBoardWidgets/Calendar";
import EventBlock from "../components/DashBoardWidgets/EventBlock";

interface DashboardLayout {
  id: string;
  name: string;
  components: ActiveComponentWithGraph[];
}

interface GraphSelection {
  graphName: string;
}

interface ActiveComponentWithGraph extends ActiveComponent {
  graphSelection?: GraphSelection;
}

interface ActiveComponent {
  id: string;
  position: number;
  graphSelection?: {
    graphName: string;
  };
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

interface APIComponent {
  id: string;
  position: number;
  componentType: string;
  settings: Record<string, any>;
  _id: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface ComponentProps {
  graphSelection?: GraphSelection;
}

const availableComponents: Record<
  string,
  React.ComponentType<ComponentProps>
> = {
  digitalClock: DigitalClock,
  analogClock: AnalogClock,
  table: TableComponent,
  graph: Graph,
  calendar: Calendar,
  eventblock: EventBlock,
};

const ViewerDashboard = () => {
  const windowSize = useWindowSize();
  const [dashboards, setDashboards] = useState<DashboardLayout[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string>("");
  const [activeComponents, setActiveComponents] = useState<
    ActiveComponentWithGraph[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/viewer`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch dashboards");
        }

        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.dashboards)) {
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

  const handleDashboardChange = (event: SelectChangeEvent<string>) => {
    const dashboardId = event.target.value;
    setCurrentDashboardId(dashboardId);
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (dashboard) {
      setActiveComponents(dashboard.components);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderComponent = (component: ActiveComponentWithGraph) => {
    const Component = availableComponents[component.id];

    if (!Component) {
      console.warn(`Component type ${component.id} not found`);
      return null;
    }

    return (
      <Box
        sx={{
          height: "100%",
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Component graphSelection={component.graphSelection} />
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
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

          {dashboards.length > 1 && (
            <Select
              value={currentDashboardId}
              onChange={handleDashboardChange}
              sx={{
                backgroundColor: "white",
                minWidth: 150,
                "& .MuiSelect-select": {
                  py: 1,
                },
              }}
            >
              {dashboards.map((dashboard) => (
                <MenuItem key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </MenuItem>
              ))}
            </Select>
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
        <Grid container spacing={2}>
          {activeComponents.map((component, index) => (
            <Grid
              item
              key={`${component.id}-${index}`}
              xs={12}
              md={component.id === "graph" ? 6 : 4}
            >
              {renderComponent(component)}
            </Grid>
          ))}
        </Grid>
      </Box>

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

export default ViewerDashboard;
