import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import LocalStorage from "./LocalStorage";
let InitializeContext = createContext();
function ContextProvider({ children }) {
  const [ORDER, SETORDER] = useState({
    OrderMenuItems: [], //OrderMenuItems is order requeted by user to hotel
    OrderBasket: [],
    token: null,
    searchQuery: "",
    fullName: null,
    OrderRecivedItems: [], //OrderRecivedItems is order recived by hotel from user
  });

  let path = process.env.REACT_APP_PATH;
  let getItems = async () => {
    // console.log("requested");
    let token = localStorage.getItem("token");
    let savedOrders = await LocalStorage("savedOrders", "", "get");
    // console.log("savedOrders", savedOrders);
    await axios
      .get(path + "/getRecivedOrders", {
        params: {
          savedOrders: savedOrders,
        },
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        // alert("savedOrders", savedOrders);
        // console.log("response", response);
        // return;

        //   resultsOfOrderRecived,
        //   "resultsOfOrderRequest",
        let resultsOfOrderRequest = response.data.resultsOfOrderRequest;
        let resultsOfOrderRecived = response.data.resultsOfOrderRecived;
        // console.log("Message", Message);

        // if Message.length=0,remove savedOrders from browser
        if (resultsOfOrderRequest?.length == 0) {
          localStorage.removeItem("savedOrders");
        }
        // let orderContent = resultsOfOrderRequest.map((order) => {
        //   return JSON.parse(order.orderContent);
        // });
        // setOrderRequestes(Message);
        SETORDER((prevstate) => {
          return { ...prevstate, OrderMenuItems: resultsOfOrderRequest };
        });
        // let recivedOrderContent = resultsOfOrderRecived.map((order) => {
        //   return JSON.parse(order.orderContent);
        // });
        // well
        SETORDER((prevstate) => {
          return { ...prevstate, OrderRecivedItems: resultsOfOrderRecived };
        });
      })
      .catch((error) => {
        // alert(error);
        console.log("first", error);
      });
  };
  useEffect(() => {
    setInterval(() => {
      getItems();
    }, 3000);
    getItems();
  }, []);

  return (
    <InitializeContext.Provider value={[ORDER, SETORDER]}>
      {children}
    </InitializeContext.Provider>
  );
}
const ConsumeContext = () => useContext(InitializeContext);

export { ConsumeContext };
export default ContextProvider;
