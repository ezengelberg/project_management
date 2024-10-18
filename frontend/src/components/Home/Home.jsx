import React from "react";
import "./Home.css";
import Sidebar from "../Sidebar/Sidebar";

const Home = () => {
  return (
    <div className="home">
      <Sidebar />
      <div className="home-container">
        <h1>ברוכים הבאים למערכת ניהול פרוייקטים</h1>
        <p>במערכת זו תוכלו לנהל את הפרוייקטים שלכם בצורה יעילה ונוחה.</p>
      </div>
    </div>
  );
};

export default Home;
