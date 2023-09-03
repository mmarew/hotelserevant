import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterMenue from "./Components/RegisterMenue.js";
import Login from "./Components/Login.js";
import Home from "./Components/Home.js";
import RegisterUsers from "./Components/RegisterUsers.js";
import Navbar from "./Components/NavBar.js";
import "./App.css";
import Setting from "./Components/Setting.js";
import ViewOrderLists from "./Components/ViewOrderLists.js";
import Order from "./Components/Order.js";
import QRCodeGenerator from "./Components/QRCodeGenerator.js";
import Search from "./Components/Search.js";
import EditTableNumbers from "./Components/EditTableNumbers.js";
import EditItems from "./Components/EditItems.js";
export default function App() {
  return (
    <div className="appWrapper">
      <Router>
        <Routes>
          <Route
            path="/search"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <Search />
              </>
            }
          />{" "}
          <Route
            path="/ViewOrderLists"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <ViewOrderLists />
              </>
            }
          />
          <Route
            path="myQr"
            element={
              <>
                <Navbar />
                <br /> <br />
                <QRCodeGenerator />
              </>
            }
          />
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <Home />
              </>
            }
          />{" "}
          <Route
            path="/Business/:hotelName"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <Home />
              </>
            }
          />{" "}
          {/* <Route
            path="/"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <Home />
              </>
            }
          /> */}
          <Route
            path="/order"
            element={
              <>
                <Navbar />
                <br />
                <br />
                <Order orderValues={1} />
              </>
            }
          />
          <Route
            path="/registerMenu"
            element={
              <>
                <Navbar />
                <RegisterMenue />
              </>
            }
          />
          <Route path="/registerUsers" element={<RegisterUsers />} />
          <Route path="/Setting">
            <Route
              path=""
              element={
                <>
                  <Navbar />
                  <Setting />
                </>
              }
            />
            <Route
              path="editTableNumbers"
              element={
                <>
                  <Navbar />
                  <EditTableNumbers />
                </>
              }
            />{" "}
            <Route
              path="editItems"
              element={
                <>
                  <Navbar />
                  <EditItems />
                </>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      <br /> <br /> <br /> <br /> <br />
    </div>
  );
}
