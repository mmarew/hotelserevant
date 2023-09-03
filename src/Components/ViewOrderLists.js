import React, { useEffect, useState } from "react";
import { ConsumeContext } from "./ContextProvider";
import Menu from "./Menu";
import { Box, Button, Modal, TextField } from "@mui/material";
import axios from "axios";
import LocalStorage from "./LocalStorage";
import { useNavigate } from "react-router-dom";

import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

function ViewOrderLists() {
  let Navigate = useNavigate();
  const [SavedTableNumbers, setSavedTableNumbers] = useState([]);

  let Path = process.env.REACT_APP_PATH;
  let [{ OrderBasket, token }, SETORDER] = ConsumeContext();

  let getToken = async () => {
    SETORDER((prevState) => {
      return { ...prevState, token: localStorage.getItem("token") };
    });
  };
  useEffect(() => {
    getToken();
    getTableNumbers();
  }, []);

  const [tableNumber, handleTableNumberChange] = useState("");
  const [TableAdressInputValues, handleTableAdressInputValues] = useState({});
  let SendYourOrderToKichen = async (e) => {
    e.preventDefault();
    const { phoneNumber, selectedAddress, specificAddress } =
      TableAdressInputValues;
    // console.log(
    //   "OrderBasket,token,tableNumber,",
    //   OrderBasket,
    //   token,
    //   TableAdressInputValues,
    //   tableNumber
    // );
    let obData = {
      OrderBasket,
      token,
      tableNumber,
      phoneNumber,
      selectedAddress,
      specificAddress,
    };
    // console.log("obData is ", { obData });
    // return;
    try {
      let responces = await axios.put(Path + "/orderToKitchen", obData);

      let responcesData = responces.data.data;
      let insertId = responces.data.results.insertId;

      // if (token == null || token == "" || token == undefined)
      LocalStorage("setOrdersLocally", insertId, "setOrdersLocally");
      if (responcesData == "inserted") {
        Navigate("/");
        SETORDER((prevstate) => {
          return { ...prevstate, OrderBasket: [] };
        });
      }
      // Handle the successful response if needed
    } catch (error) {
      console.log(error);
      // Handle the error if needed
    }
  };
  const [EnterTableNumber, setEnterTableNumber] = useState(false);
  let getTableNumbers = () => {
    // console.log("OrderBasket", OrderBasket);
    if (OrderBasket.length == 0) return;
    // console.log(OrderBasket[0]?.ownerId);
    let ownerId = OrderBasket[0]?.ownerId;

    axios
      .post(Path + "/getTableNumbers", { ownerId })
      .then((data) => {
        console.log(data.data.data);
        setSavedTableNumbers(data.data.data);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  return (
    <div>
      <center>
        <h3>Your order list items ({OrderBasket.length})</h3>
        <br />
        <br />
      </center>
      <Menu menuItems={OrderBasket} SOURCE="VIEW" />
      <div>
        <br />
        <br />
        {OrderBasket.length > 0 ? (
          <>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button
              onClick={(e) => {
                setEnterTableNumber(true);
                // SendYourOrderToKichen();
              }}
              variant="contained"
            >
              Verify your order.
            </Button>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                Navigate("/");
              }}
            >
              Back
            </Button>
          </>
        ) : (
          <>
            {/* https://chrome.google.com/webstore/detail/dragon-angel/jcghngppbohgjpipcekgbgcckcbldonc */}
            <h1>You 0 orders redirecting to home ... </h1>
            <div style={{ display: "none" }}>
              {/* {setTimeout(() => {
                Navigate("/");
              }, 2000)} */}
            </div>
          </>
        )}
      </div>
      <Modal open={EnterTableNumber} onClose={() => setEnterTableNumber(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "400px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <form
            style={{ display: "flex", flexDirection: "column" }}
            onSubmit={(e) => SendYourOrderToKichen(e)}
          >
            <h3>Enter Your Table Address.</h3>
            <br />
            <FormControl>
              <InputLabel>Choose Table Number</InputLabel>
              <Select
                name="selectedAddress"
                required
                value={tableNumber}
                onChange={(e) => {
                  handleTableNumberChange(e.target.value);
                  handleTableAdressInputValues((previousStates) => {
                    return {
                      ...previousStates,
                      [e.target.name]: e.target.value,
                    };
                  });
                }}
              >
                {SavedTableNumbers?.map((item) => {
                  return (
                    <MenuItem value={item.tableNumber}>
                      {item.tableNumber}
                    </MenuItem>
                  );
                })}{" "}
                <MenuItem value="Others"> Others </MenuItem>
              </Select>
            </FormControl>
            {tableNumber === "Others" && (
              <>
                <br />
                <TextField
                  onChange={(e) => {
                    handleTableAdressInputValues((previousStates) => {
                      return {
                        ...previousStates,
                        [e.target.name]: e.target.value,
                      };
                    });
                  }}
                  name="phoneNumber"
                  id="tableAddress"
                  required
                  label="Phone Number"
                  // value={tableNumber}
                />
                <br />
                <TextField
                  onChange={(e) => {
                    handleTableAdressInputValues((previousStates) => {
                      return {
                        ...previousStates,
                        [e.target.name]: e.target.value,
                      };
                    });
                  }}
                  label="your location"
                  required
                  name="specificAddress"
                  id="specificAddress"
                />
              </>
            )}
            <br />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
export default ViewOrderLists;
