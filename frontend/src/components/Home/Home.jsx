import React from "react";
import "./Home.css";
import Navbar from "../Navbar/Navbar";

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <div className="home-container">
        <h1>ברוכים הבאים למערכת ניהול פרוייקטים</h1>
        <p>במערכת זו תוכלו לנהל את הפרוייקטים שלכם בצורה יעילה ונוחה.</p>
      </div>
    </div>
  );
};

export default Home;
