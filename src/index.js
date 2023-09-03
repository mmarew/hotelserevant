import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ContextProvider from "./Components/ContextProvider";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div className="appWrapper">
    <ContextProvider>
      <App />
    </ContextProvider>
  </div>
);
