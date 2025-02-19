import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { ThemeConfig } from "./config/ThemeConfig";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Graphs from "./pages/Graphs";
import Storage from "./pages/Storage";
import Management from "./pages/Management";
import ContactUs from "./pages/ContactUs";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Templates from "./pages/Template";
import Login from "./pages/Login";
import Event from "./pages/Event";
import Trigger from "./pages/Trigger";
import Account from "./pages/Account";
import PrivateRoute from "./authenticated/PrivateRoute";
import Action from "./pages/Action";
import ViewerDashboard from "./pages/ViewerDashboard";

// Create a RoleBasedRoute component to handle role-based access
const RoleBasedRoute = ({
  element,
  allowedRoles,
}: {
  element: JSX.Element;
  allowedRoles: string[];
}) => {
  const userRole = localStorage.getItem("userRole");

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === "viewer") {
      return <Navigate to="/viewerdashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Create a ViewerRoute component to handle viewer-only routes
const ViewerRoute = ({ element }: { element: JSX.Element }) => {
  const userRole = localStorage.getItem("userRole");

  if (userRole !== "viewer") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

const PublicRoute = ({ children }: any) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  if (isAuthenticated === "true") {
    // Redirect based on user role
    if (userRole === "viewer") {
      return <Navigate to="/viewerdashboard" replace />;
    } else {
      // For admin and superadmin
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={ThemeConfig}>
      <Router>
        <Routes>
          {/* Public route - Login page as main route */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            {/* Viewer Dashboard */}
            <Route
              path="/viewerdashboard"
              element={
                <ViewerRoute element={<ViewerDashboard />} />
              }
            />

            {/* Shared routes */}
            <Route path="/graphs" element={<Graphs />} />
            <Route path="/contactus" element={<ContactUs />} />

            {/* Admin/Superadmin only routes */}
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute
                  element={<Dashboard />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/storage"
              element={
                <RoleBasedRoute
                  element={<Storage />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/management"
              element={
                <RoleBasedRoute
                  element={<Management />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/devices"
              element={
                <RoleBasedRoute
                  element={<Devices />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/devicedetail/:_id"
              element={
                <RoleBasedRoute
                  element={<DeviceDetail />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/templates"
              element={
                <RoleBasedRoute
                  element={<Templates />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/trigger"
              element={
                <RoleBasedRoute
                  element={<Trigger />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/event"
              element={
                <RoleBasedRoute
                  element={<Event />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/account"
              element={
                <RoleBasedRoute
                  element={<Account />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
            <Route
              path="/action"
              element={
                <RoleBasedRoute
                  element={<Action />}
                  allowedRoles={["admin", "superadmin"]}
                />
              }
            />
          </Route>

          {/* Catch all other routes and redirect to appropriate dashboard */}
          <Route
            path="*"
            element={
              <Navigate
                to={localStorage.getItem("userRole") === "viewer" ? "/viewerdashboard" : "/dashboard"}
                replace
              />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;