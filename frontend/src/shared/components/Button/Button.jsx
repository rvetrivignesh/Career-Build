import React from "react";
import styles from "./Button.module.css";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <div className={styles.spinner} role="status" aria-hidden="true" />}
      {children}
    </button>
  );
};
export default Button;
