// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import ThemeProvider from "@mui/material/styles/ThemeProvider";
// import { ThemeConfig } from "./config/ThemeConfig";
// import "./App.css";
// import MainLayout from "./layouts/MainLayout";
// import Dashboard from "./pages/Dashboard";
// import Graphs from "./pages/Graphs";
// import Storage from "./pages/Storage";
// import Management from "./pages/Management";
// import Alerts from "./pages/Alerts";
// import ContactUs from "./pages/ContactUs";
// import Devices from "./pages/Devices";
// import DeviceDetail from "./pages/DeviceDetail";
// import Templates from "./pages/Template";
// import Login from "./pages/Login";

// // Protected Route wrapper component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   // Replace this with your actual authentication check
//   const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
//   const location = useLocation();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return <>{children}</>;
// };

// const App = () => {
//   return (
//     <ThemeProvider theme={ThemeConfig}>
//       <Router>
//         <Routes>
//           {/* Public route - Login page */}
//           <Route path="/login" element={<Login />} />

//           {/* Protected routes with MainLayout */}
//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <MainLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<Navigate replace to="/dashboard" />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/graphs" element={<Graphs />} />
//             <Route path="/storage" element={<Storage />} />
//             <Route path="/management" element={<Management />} />
//             <Route path="/alerts" element={<Alerts />} />
//             <Route path="/contactus" element={<ContactUs />} />
//             <Route path="/devices" element={<Devices />} />
//             <Route path="/devicedetail/:serialNo" element={<DeviceDetail />} />
//             <Route path="/templates" element={<Templates />} />
//           </Route>

//           {/* Catch all other routes and redirect to login */}
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </Router>
//     </ThemeProvider>
//   );
// };

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { ThemeConfig } from "./config/ThemeConfig";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Graphs from "./pages/Graphs";
import Storage from "./pages/Storage";
import Management from "./pages/Management";
import Alerts from "./pages/Alerts";
import ContactUs from "./pages/ContactUs";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Templates from "./pages/Template";
import Login from "./pages/Login";
import Event from "./pages/Event";
import Trigger from "./pages/Trigger";

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Replace this with your actual authentication check
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider theme={ThemeConfig}>
      <Router>
        <Routes>
          {/* Public route - Login page as main route */}
          <Route path="/" element={<Login />} />

          {/* Protected routes with MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/graphs" element={<Graphs />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/management" element={<Management />} />
            {/* <Route path="/alerts" element={<Alerts />} /> */}
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/devicedetail/:_id" element={<DeviceDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/trigger" element={<Trigger />} />
            <Route path="/event" element={<Event />} />
          </Route>

          {/* Catch all other routes and redirect to main login page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
