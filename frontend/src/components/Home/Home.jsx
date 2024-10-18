import React from "react";
import "./Home.css";
import Navbar from "../Navbar/Navbar";

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <div className="home-container">
        <h1>ברוכים הבאים לאתר הספרים שלנו</h1>
        <p>האתר נועד לאסוף ספרים ולשתף אותם עם הקהל</p>
      </div>
    </div>
  );
};

export default Home;
