import axios from "axios";
import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import LocalStorage from "./LocalStorage";
import { Box } from "@mui/material";
import Order from "./Order";
import ProgressBar from "./ProgressBar";
import { useLocation, useParams } from "react-router-dom";
import { ConsumeContext } from "./ContextProvider";
function GetMenueItems() {
  let path = process.env.REACT_APP_PATH;
  const [menueData, setMenueData] = useState([]);
  let [{ token, fullName }, SETORDER] = ConsumeContext();
  let Location = useLocation();

  const { hotelName } = useParams();
  // alert(hotelName);
  const fetchMenueData = async () => {
    try {
      token = await LocalStorage("token", "", "get");
      setShowProgressBar(true);
      // console.log("token is ", token);
      const response = await axios.get(`${path}/getMenuItems/${hotelName}`, {
        headers: {
          authorization: token,
        },
      });
      // console.log("response is ", response);
      setShowProgressBar(false);
      setMenueData(response.data);
    } catch (error) {}
  };
  useEffect(() => {
    fetchMenueData();
    SETORDER((prevState) => {
      return { ...prevState, token: localStorage.getItem("token") };
    });
  }, [Location]);
  const [ShowProgressBar, setShowProgressBar] = useState(false);
  let savedFullName = localStorage.getItem("fullName");
  useEffect(() => {
    if (savedFullName == null) {
      savedFullName = "USER";
    }
    SETORDER((prevState) => {
      return { ...prevState, fullName: savedFullName };
    });
  }, [savedFullName]);

  return (
    <div className="componenntWrapper">
      {ShowProgressBar && <ProgressBar />}

      <Box sx={{ display: "flex", justifyContent: "center", fontSize: "28px" }}>
        Dear {fullName}, welcome to smart order.
      </Box>
      <br />
      {menueData.length > 0 ? (
        <>
          {/* {console.log("6262b menueData", menueData)} */}
          <Menu menuItems={menueData} Reload={fetchMenueData} />
        </>
      ) : (
        <>
          {ShowProgressBar ? (
            "loading... "
          ) : (
            <h3>No menu data found in this business</h3>
          )}
        </>
      )}
    </div>
  );
}
export default GetMenueItems;
