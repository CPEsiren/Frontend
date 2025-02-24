import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const PrivateRoutes: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default PrivateRoutes;
