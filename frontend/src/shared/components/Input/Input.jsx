import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Input.module.css";

export const Input = ({
  label,
  id,
  type = "text",
  error,
  required = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputClass = `${styles.inputField} ${error ? styles.errorBorder : ""} ${className}`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputContainer}>
        <input
          id={id}
          type={inputType}
          className={inputClass}
          required={required}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.eyeButton}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
