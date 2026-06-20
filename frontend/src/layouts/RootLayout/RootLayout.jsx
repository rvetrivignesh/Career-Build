import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useTheme } from "@hooks/useTheme";
import { Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import styles from "./RootLayout.module.css";

export const RootLayout = () => {
  const { isAuthenticated, logoutUser, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logoContainer} onClick={handleLogoClick}>
          <span className={styles.logoText}>Career-Build</span>
        </div>
        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>
                {user?.username}
              </span>
              <button
                type="button"
                className={styles.themeToggle}
                onClick={logoutUser}
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  background: "none",
                  border: "none",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "6px 12px",
                  color: "var(--text-color)",
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                style={{
                  backgroundColor: "var(--primary-color)",
                  border: "none",
                  color: "white",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "6px 16px",
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="container">
          Career-Build &copy; 2026
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
