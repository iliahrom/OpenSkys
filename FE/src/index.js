import React from "react";
import ReactDOM from "react-dom/client"; // שינוי כאן!
import App from "./App";
import "./index.css";  // חובה לוודא שהקובץ נטען!


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
