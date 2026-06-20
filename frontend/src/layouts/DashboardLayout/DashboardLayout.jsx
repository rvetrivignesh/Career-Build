import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useTheme } from "@hooks/useTheme";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  FileText,
  Compass,
  GraduationCap,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from "lucide-react";
import styles from "./DashboardLayout.module.css";

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close sidebar drawer on route change
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", path: "/dashboard/profile", icon: <User size={18} /> },
    { label: "Resume Builder", path: "/dashboard/resume-builder", icon: <FileText size={18} /> },
    { label: "Resume Analyzer", path: "/dashboard/resume-analyzer", icon: <Sparkles size={18} /> },
    { label: "Career Roadmaps", path: "/dashboard/career-roadmaps", icon: <Compass size={18} /> },
    { label: "AI Coach", path: "/dashboard/ai-coach", icon: <GraduationCap size={18} /> },
    { label: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.logoText} onClick={() => navigate("/dashboard")}>
          Career-Build
        </span>

        {/* Desktop: User Name Only */}
        <div className={styles.headerUsername}>
          {user?.username}
        </div>

        {/* Mobile: Hamburger Menu Only */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
      </header>

      <div className={styles.bodyContainer}>
        {/* Mobile Drawer Backdrop */}
        <div
          className={`${styles.drawerBackdrop} ${
            isSidebarOpen ? styles.drawerBackdropVisible : ""
          }`}
          onClick={closeSidebar}
        />

        {/* Sidebar / Mobile Drawer Navigation */}
        <aside
          className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
          role="navigation"
        >
          {/* Close button inside sidebar for mobile */}
          <div className={styles.drawerHeader}>
            <button
              type="button"
              className={styles.closeDrawerBtn}
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.sidebarContent}>
            <ul className={styles.navLinks}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      style={{ width: "100%", background: "none", border: "none", textAlign: "left", padding: 0 }}
                    >
                      <div className={`${styles.navItem} ${isActive ? styles.activeNavItem : ""}`}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.sidebarFooter}>
            <hr className={styles.divider} />
            <button
              type="button"
              className={styles.footerActionBtn}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
            <button
              type="button"
              className={styles.footerActionBtn}
              onClick={logoutUser}
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={styles.mainContentArea}>
          <main className={styles.main}>
            <Outlet />
          </main>
          <footer className={styles.footer}>
            Career-Build &copy; 2026
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
