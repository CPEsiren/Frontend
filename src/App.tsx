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

// Create a PrivateRoute component for protecting routes that require authentication

// Create a PublicRoute component to prevent logged-in users from accessing the login page
const PublicRoute = ({ children }: any) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated === 'true' ? <Navigate to="/dashboard" replace /> : children;
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

          {/* Protected routes, only accessible after login */}
          <Route element={<PrivateRoute />}>
            {/* <Route element={<MainLayout />}> */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/graphs" element={<Graphs />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/management" element={<Management />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/devicedetail/:_id" element={<DeviceDetail />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/trigger" element={<Trigger />} />
              <Route path="/event" element={<Event />} />
              <Route path="/account" element={<Account />} />
            {/* </Route> */}
          </Route>

          {/* Catch all other routes and redirect to main login page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;