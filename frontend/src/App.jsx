import React from "react";
import { HashRouter } from "react-router-dom";
import { ToastProvider } from "@contexts/ToastContext";
import { AuthProvider } from "@contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}

export default App;
