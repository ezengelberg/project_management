import React, { useEffect, useState } from "react";
import "./UploadSubmissions.scss";

import React from "react";

const UploadSubmissions = () => {
  const fetchPendingSubmissions = async () => {
    const response = await fetch("http://localhost:5000/api/submissions/pending");
    const data = await response.json();
    console.log(data);
  };
  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  return <div></div>;
};

export default UploadSubmissions;
