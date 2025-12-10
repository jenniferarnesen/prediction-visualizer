import React from "react";
import classes from "./App.module.css";
import "./locales";

const MyApp = () => {
  return (
    <div className={classes.container}>
      <h1>Prediction Visualizer</h1>
      <p>This is the Prediction Visualizer app.</p>
    </div>
  );
};

export default MyApp;
