import React from "react";
import { PageLoader } from "@components/Loader";

export const LoadingScreen = ({ message }) => {
  return (
    <PageLoader text={message || "AI Generation In Progress..."} />
  );
};

export default LoadingScreen;
