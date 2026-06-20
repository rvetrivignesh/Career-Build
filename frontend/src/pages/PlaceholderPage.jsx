import React from "react";

export const PlaceholderPage = ({ title }) => {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={descriptionStyle}>
          This section is currently under development. In the future, this module will enable you to interact with the {title} tools on Career-Build.
        </p>
        <div style={badgeStyle}>Coming Soon</div>
      </div>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
};

const cardStyle = {
  backgroundColor: "var(--card-bg)",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  padding: "var(--space-8)",
  maxWidth: "500px",
  width: "100%",
  boxShadow: "var(--shadow-md)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: 600,
  color: "var(--text-color)",
};

const descriptionStyle = {
  fontSize: "14px",
  color: "var(--text-muted)",
  lineHeight: "1.6",
};

const badgeStyle = {
  display: "inline-block",
  backgroundColor: "rgba(26, 115, 232, 0.1)",
  color: "var(--primary-color)",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
  marginTop: "8px",
};

export default PlaceholderPage;
