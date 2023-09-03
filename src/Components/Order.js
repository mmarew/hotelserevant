import React, { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import OrderRequested from "./OrderRequested";
import OrderRecived from "./OrderRecived";
import { ConsumeContext } from "./ContextProvider";
import { Badge, Box } from "@mui/material";
import { useLocation } from "react-router-dom";

function Order({ orderValues }) {
  let [{ OrderMenuItems, OrderRecivedItems }, SETORDER] = ConsumeContext();
  const [value, setValue] = useState(orderValues);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  let Location = useLocation();
  useEffect(() => {
    SETORDER((prevState) => {
      return { ...prevState, token: localStorage.getItem("token") };
    });
  }, [Location]);
  //////////////////////////
  const [orderRecivedqty, setOrderRecivedqty] = useState(0);
  useEffect(() => {
    setOrderRecivedqty(OrderRecivedItems?.length);
  }, [OrderRecivedItems]);

  const [OrderRequestedQty, setOrderRequestedQty] = useState(0);
  useEffect(() => {
    setOrderRequestedQty(OrderMenuItems?.length);
  }, [OrderMenuItems]);

  return (
    <div className="componenntWrapper">
      <Tabs value={value} onChange={handleChange}>
        <Tab
          label={
            <div>
              Received
              <Badge badgeContent={orderRecivedqty} color="error" />
            </div>
          }
        />
        <Tab
          label={
            <div>
              Requested
              <Badge badgeContent={OrderRequestedQty} color="error" />
            </div>
          }
        />
      </Tabs>
      <Typography>
        {value === 0 && (
          <div>
            <OrderRecived />
            <Box sx={{ display: "none" }}>
              <OrderRequested />
            </Box>
          </div>
        )}
        {value === 1 && (
          <div>
            <OrderRequested />
            <Box sx={{ display: "none" }}>
              <OrderRecived />
            </Box>
          </div>
        )}
      </Typography>
      <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
    </div>
  );
}

export default Order;
