import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  LinearProgress,
  Stack,
} from "@mui/material";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LocalStorage from "./LocalStorage";
import { ConsumeContext } from "./ContextProvider";
import MenueSnack from "./MenueSnack";

const Menu = ({ menuItems, SOURCE, ORDEREDITEMS, tableNumber }) => {
  const [ShowProgressBar, setShowProgressBar] = useState(false);
  const [token, setToken] = useState("");
  const [ShowDeleteConfirMation, setShowDeleteConfirMation] = useState({
    item: {},
    open: false,
  });
  let getToken = async () => {
    let res = await LocalStorage("token", "", "get");
    setToken(res);
  };
  useEffect(() => {
    getToken();
  }, []);

  let [{ OrderBasket }, SETORDER] = ConsumeContext();
  const [showMenueItems, setshowMenueItems] = useState(menuItems);
  const [DinnerMenu, setDinnerMenu] = useState([]);
  const [BreakfastMenu, setBreakfastMenu] = useState([]);
  const [LunchMenu, setLunchMenu] = useState([]);
  useEffect(() => {
    showMenueItems.map((item) => {
      //  dinner
      //  lunch
      //  breakfast
      if (item.PreparationTime == "dinner") {
        setDinnerMenu((prevstate) => {
          return [...prevstate, item];
        });
      } else if (item.PreparationTime == "lunch") {
        setLunchMenu((prevstate) => {
          return [...prevstate, item];
        });
      } else if (item.PreparationTime == "breakfast") {
        setBreakfastMenu((prevstate) => {
          return [...prevstate, item];
        });
      }

      console.log(item.PreparationTime);
    });
  }, [showMenueItems]);

  let path = process.env.REACT_APP_PATH;
  const [open, setOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const handleOpen = (item) => {
    setEditedItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const updatedItem = {
        ...editedItem,
        token,
      };
      setShowProgressBar(true);
      // return;
      const response = await axios.put(path + "/updateMenueItems", updatedItem);
      // console.log("Update successful:", response.data);
      setShowProgressBar(false);
      let copy = showMenueItems.map((item) => {
        if (item.id == updatedItem.id) return updatedItem;
        return item;
      });
      setisUpdateSuccessful({ open: true, message: "Updated successfully" });
      setshowMenueItems(copy);
      setOpen(false);
      // Handle any further logic or UI updates after successful update
    } catch (error) {
      console.error("Error updating content:", error);
      // Handle error and show appropriate error message to the user
    }
  };

  const handleOrder = (item) => {
    SETORDER((prevstate) => {
      return { ...prevstate, OrderBasket: [...OrderBasket, item] };
    });
    // Handle order request for the selected item
    // console.log("Order requested for:", item);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };
  const [isUpdateSuccessful, setisUpdateSuccessful] = useState({
    open: false,
    message: "",
  });

  let RemoveItemsFromBasket = (item, index) => {
    // console.log(item);
    let copy = [];
    OrderBasket.map((order, i) => {
      if (index == i) {
        return;
      }
      copy.push(order);
    });
    SETORDER((prevstate) => {
      return { ...prevstate, OrderBasket: copy };
    });
    setshowMenueItems(copy);
  };
  let orderDeliveredToCustomer = async () => {
    let copy = [];
    setShowProgressBar(true);
    let updateRequest = await axios.put(path + "/updateDeliverySuccess", {
      ORDEREDITEMS,
    });
    setShowProgressBar(false);
  };
  let deleteMenueItems = async (item) => {
    try {
      // console.log(item);
      let responce = await axios
        .post(path + "/deleteMenueItem", { item: { ...item, token } })
        .then(async (data) => {
          // console.log(data.data.data);
          let responce = data.data.data;

          setshowMenueItems(responce);
          // console.log("data is data===", data);
          setisUpdateSuccessful({
            open: true,
            message: "Deleted successfully",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };
  let cancelMyOrderRequest = (e, items) => {
    // console.log(items);
    axios
      .post(path + "/cancelMyOrderRequest", {
        token,
        orderId: items.orderId,
      })
      .then((responce) => {
        // console.log(responce.data.data);
        // getOrderItems();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const [cancelOrderRequest, setcancelOrderRequest] = useState({
    open: false,
    item: {},
  });
  return (
    <>
      {tableNumber != undefined && tableNumber != null && tableNumber != "" && (
        <Box>
          {ORDEREDITEMS != undefined && ORDEREDITEMS?.outOfOursAddress != "" ? (
            <h2>
              {"Table number: " +
                tableNumber +
                ", " +
                `${JSON.parse(ORDEREDITEMS?.outOfOursAddress)?.phoneNumber}` +
                ", " +
                JSON.parse(ORDEREDITEMS?.outOfOursAddress)?.specificAddress}
            </h2>
          ) : (
            <h3> Table number : {tableNumber}</h3>
          )}
        </Box>
      )}
      <br />
      {ShowProgressBar && <ProgressBar />}
      <Grid container spacing={2}>
        {BreakfastMenu.length > 0 && (
          <>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Typography variant="h4">Breakfast Menu</Typography>
            </Grid>
            <Grid
              container
              spacing={2}
              sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {BreakfastMenu.map((item, index) => (
                <Grid
                  item
                  key={"keyOfMenuItems_" + index + "_" + new Date()}
                  xs={12}
                  sm={4}
                  md={3}
                  sx={{ margin: "5px" }}
                >
                  <Card>
                    <Slider {...settings}>
                      <div key={"imgs_" + index}>
                        <CardMedia
                          component="img"
                          height={300}
                          image={
                            item.filesName === "" ||
                            item.filesName === "NoFile" ||
                            item.filesName === undefined ||
                            item.filesName === null
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                          alt={
                            item.filesName === "" || item.filesName === "NoFile"
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                        />
                      </div>
                    </Slider>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {item.ProductName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="subtitle1" color="text.primary">
                        Price: ${item.price}
                      </Typography>
                      <h4> Supplied By {item.usersFullName}</h4>
                      <br />
                      {SOURCE == "VIEW" ? (
                        <Button
                          style={{ zIndex: 1 }}
                          variant="contained"
                          onClick={() => RemoveItemsFromBasket(item, index)}
                          color="warning"
                        >
                          Remove
                        </Button>
                      ) : SOURCE == "ORDER" ? (
                        // <Button variant="contained" color="error">
                        //   Cancel this order
                        // </Button>
                        ""
                      ) : SOURCE == "ORDERRECIVED" ? (
                        ""
                      ) : (
                        <Box
                          sx={{
                            width: "250px",
                            display: "flex",
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => handleOrder(item)}
                          >
                            Order
                          </Button>

                          {item.isOwner == "YES" && (
                            <>
                              <Button
                                variant="outlined"
                                onClick={() => handleOpen(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                color="error"
                                onClick={(e) => {
                                  // console.log(e);
                                  setShowDeleteConfirMation({
                                    item: item,
                                    open: true,
                                  });
                                }}
                                variant="contained"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {LunchMenu.length > 0 && (
          <>
            <Grid item xs={12} sx={{ textAlign: "center", marginTop: "100px" }}>
              <Typography variant="h4">Lunch Menu</Typography>
            </Grid>
            <Grid
              sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {LunchMenu.map((item, index) => (
                <Grid
                  key={"keyOfMenuItems_" + index + "_" + new Date()}
                  xs={12}
                  sm={4}
                  md={3}
                  sx={{ margin: "5px" }}
                >
                  <Card>
                    <Slider {...settings}>
                      <div key={"imgs_" + index}>
                        <CardMedia
                          component="img"
                          height={300}
                          image={
                            item.filesName === "" ||
                            item.filesName === "NoFile" ||
                            item.filesName === undefined ||
                            item.filesName === null
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                          alt={
                            item.filesName === "" || item.filesName === "NoFile"
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                        />
                      </div>
                    </Slider>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {item.ProductName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="subtitle1" color="text.primary">
                        Price: ${item.price}
                      </Typography>
                      <h4> Supplied By {item.usersFullName}</h4>
                      <br />
                      {SOURCE == "VIEW" ? (
                        <Button
                          style={{ zIndex: 1 }}
                          variant="contained"
                          onClick={() => RemoveItemsFromBasket(item, index)}
                          color="warning"
                        >
                          Remove
                        </Button>
                      ) : SOURCE == "ORDER" ? (
                        // <Button variant="contained" color="error">
                        //   Cancel this order
                        // </Button>
                        ""
                      ) : SOURCE == "ORDERRECIVED" ? (
                        ""
                      ) : (
                        <Box
                          sx={{
                            width: "250px",
                            display: "flex",
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => handleOrder(item)}
                          >
                            Order
                          </Button>

                          {item.isOwner == "YES" && (
                            <>
                              <Button
                                variant="outlined"
                                onClick={() => handleOpen(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                color="error"
                                onClick={(e) => {
                                  // console.log(e);
                                  setShowDeleteConfirMation({
                                    item: item,
                                    open: true,
                                  });
                                }}
                                variant="contained"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {DinnerMenu.length > 0 && (
          <>
            <Grid xs={12} sx={{ textAlign: "center", marginTop: "100px" }}>
              <Typography variant="h4">Dinner Menu</Typography>
            </Grid>
            <Grid
              sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {DinnerMenu.map((item, index) => (
                <Grid
                  key={"keyOfMenuItems_" + index + "_" + new Date()}
                  xs={12}
                  sm={4}
                  md={3}
                  sx={{ margin: "5px" }}
                >
                  <Card>
                    <Slider {...settings}>
                      <div key={"imgs_" + index}>
                        <CardMedia
                          component="img"
                          height={300}
                          image={
                            item.filesName === "" ||
                            item.filesName === "NoFile" ||
                            item.filesName === undefined ||
                            item.filesName === null
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                          alt={
                            item.filesName === "" || item.filesName === "NoFile"
                              ? item.imageUrl
                              : path + "/uploads/" + item.filesName
                          }
                        />
                      </div>
                    </Slider>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {item.ProductName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="subtitle1" color="text.primary">
                        Price: ${item.price}
                      </Typography>
                      <h4> Supplied By {item.usersFullName}</h4>
                      <br />
                      {SOURCE == "VIEW" ? (
                        <Button
                          style={{ zIndex: 1 }}
                          variant="contained"
                          onClick={() => RemoveItemsFromBasket(item, index)}
                          color="warning"
                        >
                          Remove
                        </Button>
                      ) : SOURCE == "ORDER" ? (
                        // <Button variant="contained" color="error">
                        //   Cancel this order
                        // </Button>
                        ""
                      ) : SOURCE == "ORDERRECIVED" ? (
                        ""
                      ) : (
                        <Box
                          sx={{
                            width: "250px",
                            display: "flex",
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => handleOrder(item)}
                          >
                            Order
                          </Button>

                          {item.isOwner == "YES" && (
                            <>
                              <Button
                                variant="outlined"
                                onClick={() => handleOpen(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                color="error"
                                onClick={(e) => {
                                  // console.log(e);
                                  setShowDeleteConfirMation({
                                    item: item,
                                    open: true,
                                  });
                                }}
                                variant="contained"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <br />
        <br />
        {/* /////////////////////////////////// */}
        <Modal open={open} onClose={handleClose}>
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
            <Typography variant="h6" gutterBottom>
              Edit Content
            </Typography>
            <TextField
              name="ProductName"
              onChange={(e) => handleInputChange(e)}
              label="Product name "
              value={editedItem?.ProductName}
              fullWidth
              margin="normal"
            />
            <TextField
              name="imageUrl"
              onChange={(e) => handleInputChange(e)}
              label="Image url"
              value={editedItem?.imageUrl}
              fullWidth
              margin="normal"
            />
            <TextField
              name="description"
              onChange={(e) => handleInputChange(e)}
              label="Description"
              value={editedItem?.description}
              fullWidth
              margin="normal"
            />
            <TextField
              name="price"
              onChange={(e) => handleInputChange(e)}
              label="Products price"
              value={editedItem?.price}
              fullWidth
              margin="normal"
            />
            {!ShowProgressBar ? (
              <Button variant="contained" color="primary" onClick={handleSave}>
                Update
              </Button>
            ) : (
              <Button variant="contained" disabled>
                Processing ...
              </Button>
            )}
          </Box>
        </Modal>
      </Grid>

      {SOURCE == "ORDER" && (
        <Button
          onClick={(e) => {
            setcancelOrderRequest({ open: true, item: ORDEREDITEMS });
          }}
          variant="contained"
          color="error"
        >
          {/* cancelMyOrderRequest(e, ORDEREDITEMS); */}
          Cancel this order
        </Button>
      )}
      {SOURCE == "ORDERRECIVED" && (
        <center>
          <br />
          <Button
            onClick={() => orderDeliveredToCustomer()}
            variant="contained"
          >
            Delivered
          </Button>
          <br />
          <br />
          <br />
        </center>
      )}
      <MenueSnack
        isUpdateSuccessful={isUpdateSuccessful}
        setisUpdateSuccessful={setisUpdateSuccessful}
      />
      {/* Confirmation dialog to cancel requested orders */}
      {cancelOrderRequest.open && (
        // cancilation modal will be here
        <Modal
          open={cancelOrderRequest.open}
          onClose={() => setcancelOrderRequest({ open: false, item: {} })}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              backgroundColor: "#fff",
              padding: 16,
            }}
          >
            <Typography variant="h6">Confirm</Typography>
            <Typography variant="body1">
              Are you sure you want to cancel this request?
            </Typography>
            {/* <Typography variant="body1">
              Item: {cancelOrderRequest.item.orderId}
            </Typography> */}
            <Button
              sx={{ marginRight: "10px" }}
              variant="contained"
              onClick={(e) => cancelMyOrderRequest(e, cancelOrderRequest.item)}
            >
              Verify
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => setcancelOrderRequest({ open: false, item: {} })}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
      {/* deleteMenueItems(item); */}
      {ShowDeleteConfirMation.open && (
        <Dialog
          open={ShowDeleteConfirMation.open}
          onClose={() => setOpen(false)}
        >
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the item?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setShowDeleteConfirMation({ open: false, item: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowDeleteConfirMation({ open: false, item: "" });
                deleteMenueItems(ShowDeleteConfirMation.item);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
export default Menu;
