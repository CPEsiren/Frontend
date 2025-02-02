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
} from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
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

interface ComponentConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  component: React.ComponentType;
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
  const [componentDialog, setComponentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [activeComponents, setActiveComponents] = useState<ActiveComponent[]>(
    () => {
      try {
        const savedLayout = localStorage.getItem(DASHBOARD_STORAGE_KEY);
        return savedLayout
          ? JSON.parse(savedLayout)
          : [
              { id: "digitalClock", position: 0 },
              { id: "graph1", position: 1 },
            ];
      } catch (error) {
        console.error("Error loading layout:", error);
        return [
          { id: "digitalClock", position: 0 },
          { id: "graph1", position: 1 },
        ];
      }
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        DASHBOARD_STORAGE_KEY,
        JSON.stringify(activeComponents)
      );
    } catch (error) {
      console.error("Error saving layout:", error);
      setSnackbar({
        open: true,
        message: "Failed to save dashboard layout",
        severity: "error",
      });
    }
  }, [activeComponents]);

  const handleAddComponent = (componentId: string) => {
    const componentConfig = availableComponents.find(
      (c) => c.id === componentId
    );
    if (!componentConfig) return;

    const isAlreadyAdded = activeComponents.some(
      (comp) => comp.id === componentId
    );
    if (isAlreadyAdded && !componentConfig.allowMultiple) return;

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
          <Box>
            <Tooltip title={isEditing ? "Save & Done" : "Edit Dashboard"}>
              <IconButton onClick={toggleEdit} sx={{ mr: 1 }}>
                {isEditing ? <DoneIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
            {isEditing && (
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setComponentDialog(true)}
                sx={{
                  backgroundColor: "#F25A28",
                  "&:hover": {
                    backgroundColor: "#F37E58",
                  },
                }}
              >
                Add Component
              </Button>
            )}
          </Box>
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
        <Grid container rowSpacing={1} columnSpacing={2}>
          {activeComponents.map((activeComp) => {
            const componentConfig = availableComponents.find(
              (c) => c.id === activeComp.id
            );
            if (!componentConfig) return null;

            const Component = componentConfig.component;
            return (
              <Grid
                item
                key={activeComp.position}
                {...componentConfig.defaultSize}
                sx={{ mb: 1 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 0,
                    border: "1px solid #eee",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {isEditing && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveComponent(activeComp.position)}
                      sx={{
                        position: "absolute",
                        right: 2,
                        top: 2,
                        zIndex: 10, // Increased z-index
                        backgroundColor: "white", // Added background color to make it stand out
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent on hover
                        },
                        boxShadow: "0 0 4px rgba(0,0,0,0.1)", // Added subtle shadow
                      }}
                    >
                      <AddIcon
                        sx={{
                          transform: "rotate(45deg)",
                          zIndex: 11, // Higher z-index than the button
                        }}
                      />
                    </IconButton>
                  )}
                  <Component />
                </Box>
              </Grid>
            );
          })}
        </Grid>
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
