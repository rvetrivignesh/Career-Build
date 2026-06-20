import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} color="var(--success-color)" />;
      case "error":
        return <AlertCircle size={18} color="var(--error-color)" />;
      case "warning":
        return <AlertTriangle size={18} color="var(--warning-color)" />;
      case "info":
      default:
        return <Info size={18} color="var(--info-color)" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success": return "var(--success-color)";
      case "error": return "var(--error-color)";
      case "warning": return "var(--warning-color)";
      case "info":
      default: return "var(--info-color)";
    }
  };

  return (
    <div style={{ ...toastItemStyle, borderLeftColor: getBorderColor() }}>
      <div style={toastIconStyle}>{getIcon()}</div>
      <div style={toastMessageStyle}>{message}</div>
      <button style={toastCloseButtonStyle} onClick={onClose} aria-label="Close Notification">
        <X size={14} />
      </button>
    </div>
  );
};

/* Inline Premium Styling for Toasts */
const toastContainerStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "350px",
  width: "100%",
  pointerEvents: "none",
};

const toastItemStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--card-bg)",
  color: "var(--text-color)",
  padding: "12px 16px",
  borderRadius: "8px",
  borderLeft: "4px solid",
  boxShadow: "var(--shadow-lg)",
  pointerEvents: "auto",
  animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  position: "relative",
};

const toastIconStyle = {
  marginRight: "12px",
  display: "flex",
  alignItems: "center",
};

const toastMessageStyle = {
  flex: 1,
  fontSize: "14px",
  fontWeight: "500",
  paddingRight: "20px",
  wordBreak: "break-word",
};

const toastCloseButtonStyle = {
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "4px",
  marginLeft: "8px",
  transition: "opacity 0.2s",
  outline: "none",
};

// Add CSS animation directly to document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
