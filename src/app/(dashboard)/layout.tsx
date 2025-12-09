import React from "react";
import { DashboardProvider } from "../../components/dashboard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <DashboardProvider>{children}</DashboardProvider>
    </div>
  );
};

export default DashboardLayout;
