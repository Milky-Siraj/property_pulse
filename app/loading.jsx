"use client";
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";
const override = {
  display: "block",
  margin: "100px auto",
};
const LoadingPage = () => {
  const [loading, setLoading] = useState(true);
  return (
    <ClipLoader
      color="#3b82f6"
      loading={loading}
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
    />
  );
};

export default LoadingPage;
