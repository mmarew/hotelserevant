import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";

import PersonIcon from "@material-ui/icons/Person";

// import HumanIcon from "@material-ui/icons/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import { ConsumeContext } from "./ContextProvider";
import Order from "./Order";
import Search from "./Search";
import LocalStorage from "./LocalStorage";

const Navbar = () => {
  let Navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  let Location = useLocation();
  let [{ OrderBasket, OrderMenuItems, OrderRecivedItems, token }, SETORDER] =
    ConsumeContext();
  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };
  useEffect(() => {
    if (searchQuery?.length > 0) Navigate("/search");
    SETORDER((prevState) => {
      return { ...prevState, searchQuery: searchQuery };
    });
  }, [searchQuery]);

  useEffect(() => {
    SETORDER((prevState) => {
      return { ...prevState, token: localStorage.getItem("token") };
    });
  }, [Location]);
  const [OrderRecivedQty, setOrderRecivedQty] = useState(0);
  useEffect(() => {
    setOrderRecivedQty(OrderRecivedItems?.length);
  }, [OrderRecivedItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleButtonClick = (buttonName) => {
    // Add your navigation logic here
  };

  let [numberOfOrders, SetNumberOfOrders] = useState(0);
  useEffect(() => {
    SetNumberOfOrders(OrderMenuItems?.length);
  }, [OrderMenuItems]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box>
      <AppBar
        position="static"
        style={{
          zIndex: 11,
          color: "black",
          backgroundColor: "white",
          // padding: "10px",
          position: "fixed",
          width: "100%",
        }}
      >
        {/* {console.log("numberOfOrders", numberOfOrders)} */}
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}{" "}
          {isMobile && !isSearchOpen && (
            <>
              <Button
                onClick={() => {
                  Navigate("/order");
                }}
              >
                {Location.pathname !== "/order"
                  ? OrderRecivedItems?.length > 0 && (
                      <Badge badgeContent={OrderRecivedQty} color="error">
                        Recived
                      </Badge>
                    )
                  : ""}
                {/* {console.log("OrderRecivedItems", OrderRecivedItems)} */}
              </Button>

              {Location.pathname !== "/order" ? (
                <Button
                  onClick={() => {
                    Navigate("/order");
                  }}
                >
                  {OrderMenuItems?.length > 0 && (
                    <Badge badgeContent={numberOfOrders} color="error">
                      Sent
                    </Badge>
                  )}
                </Button>
              ) : (
                ""
              )}
            </>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <div>
              <h3 style={{ color: "blue", cursor: "pointer" }}>
                {OrderBasket?.length > 0 ? (
                  <div>
                    <Button
                      onClick={() => {
                        if (OrderBasket?.length > 0)
                          Navigate("/ViewOrderLists");
                        else {
                          alert("You havent selected items");
                        }
                      }}
                      color="inherit"
                    >
                      {/* <span>Your Have Ordered </span> */}
                      <Badge badgeContent={OrderBasket?.length} color="error">
                        <ShoppingCartIcon />
                      </Badge>
                    </Button>
                  </div>
                ) : (
                  !isMobile && (
                    <Button onClick={() => Navigate("/")}>Hotel service</Button>
                  )
                )}
              </h3>
            </div>
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Box style={{ display: "flex" }}>
              <Button
                sx={{
                  color: Location.pathname == "/" ? "white" : "inherit",
                  backgroundColor:
                    Location.pathname == "/" ? "#1976D2" : "inherit",
                  "&:hover": {
                    backgroundColor:
                      Location.pathname == "/" ? "blue" : "inherit",
                  },
                }}
                onClick={() => {
                  Navigate("/");
                }}
              >
                Home
              </Button>

              <Button
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  color: Location.pathname == "/order" ? "white" : "inherit",
                  backgroundColor:
                    Location.pathname == "/order" ? "#1976D2" : "inherit",
                  "&:hover": {
                    backgroundColor:
                      Location.pathname == "/order" ? "blue" : "inherit",
                  },
                }}
                onClick={() => {
                  Navigate("/order");
                }}
              >
                {Location.pathname !== "/order" ? (
                  <Badge
                    badgeContent={OrderRecivedQty + numberOfOrders}
                    color="error"
                  >
                    Orders
                  </Badge>
                ) : (
                  "Orders"
                )}
              </Button>

              {token?.length > 10 && (
                <Button
                  sx={{
                    color:
                      Location.pathname == "/registerMenu"
                        ? "white"
                        : "inherit",
                    backgroundColor:
                      Location.pathname == "/registerMenu"
                        ? "#1976D2"
                        : "inherit",
                    "&:hover": {
                      backgroundColor:
                        Location.pathname == "/registerMenu"
                          ? "blue"
                          : "inherit",
                    },
                  }}
                  onClick={() => {
                    Navigate("/registerMenu");
                  }}
                >
                  Register
                </Button>
              )}
              {token == "" ||
                token == null ||
                (token == undefined && (
                  <Button
                    onClick={() => {
                      Navigate("/login");
                    }}
                  >
                    Login
                  </Button>
                ))}
            </Box>
          </Box>
          {!isSearchOpen && (
            <Box>
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                }}
                onClick={handleMenuClick}
              >
                <PersonIcon />
                {/* {console.log("token is===", token)} */}
                {token == null || token == undefined || token == "" ? (
                  <span>{"login"}</span>
                ) : (
                  "logout"
                )}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  {token?.length > 10 ? (
                    <div
                      color="secondary"
                      onClick={async (e) => {
                        await LocalStorage("", "", "logout");
                        handleMenuClose(e);
                        Navigate("/");
                      }}
                    >
                      Logout
                    </div>
                  ) : (
                    <div
                      variant="contained"
                      onClick={async (e) => {
                        handleMenuClose(e);
                        await LocalStorage("", "", "logout");
                        Navigate("/login");
                      }}
                    >
                      Login
                    </div>
                  )}
                </MenuItem>
                {token != null && token != "" && token != undefined && (
                  <MenuItem
                    onClick={(e) => {
                      Navigate("/Setting");
                      handleMenuClose(e);
                    }}
                  >
                    {/* <div
                      sx={{
                        marginRight: "10px",
                        color:
                          Location.pathname == "/Setting" ? "white" : "inherit",
                        backgroundColor:
                          Location.pathname == "/Setting"
                            ? "#1976D2"
                            : "inherit",
                        "&:hover": {
                          backgroundColor:
                            Location.pathname == "/Setting"
                              ? "blue"
                              : "inherit",
                        },
                      }}
                      onClick={() => {
                        
                      }}
                    > */}
                    Settings
                  </MenuItem>
                )}
                <MenuItem
                  onClick={(e) => {
                    Navigate("/myQr");
                    handleMenuClose(e);
                  }}
                >
                  my Qr
                </MenuItem>
                {/*<MenuItem onClick={handleMenuClose}>Services</MenuItem>
              <MenuItem onClick={handleMenuClose}>Contact</MenuItem>*/}
              </Menu>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!isSearchOpen && (
              <IconButton
                color="inherit"
                onClick={handleSearchClick}
                sx={{ mr: 1 }}
              >
                <SearchIcon />
              </IconButton>
            )}
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit}>
                <InputBase
                  autoFocus
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  sx={{
                    marginLeft: "10px",
                    paddingLeft: "10px",
                    color: "black",
                    borderRadius: "20px",
                    border: isSearchFocused
                      ? "2px solid blue"
                      : "1px solid black",
                    transition: "border 0.3s",
                  }}
                />
                <IconButton color="inherit" onClick={closeSearch}>
                  <CloseIcon />
                </IconButton>
              </form>
            )}
          </Box>
        </Toolbar>
        <Drawer
          anchor="left"
          open={openDrawer}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          <List sx={{ width: "200px" }}>
            <ListItem
              sx={{
                cursor: "pointer",
                "&:hover": {
                  color: "blue",
                },
              }}
              onClick={() => {
                Navigate("/");
                setOpenDrawer(false);
                handleButtonClick("home");
              }}
              component="div"
            >
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem
              sx={{}}
              onClick={() => {
                setOpenDrawer(false);
                Navigate("/order");
              }}
            >
              {numberOfOrders == 0 && (
                <Badge
                  sx={{ marginTop: "3px" }}
                  badgeContent={numberOfOrders}
                  color="error"
                ></Badge>
              )}
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem
              sx={{
                cursor: "pointer",
                "&:hover": {
                  color: "blue",
                },
              }}
              component="div"
              onClick={() => {
                setOpenDrawer(false);
                Navigate("/registerMenu");
                handleButtonClick("registerMenu");
              }}
            >
              <ListItemText primary="Register" />
            </ListItem>
            {token != null && token != "" && token != undefined && (
              <ListItem
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    color: "blue",
                  },
                }}
                component="div"
                onClick={() => {
                  setOpenDrawer(false);
                  Navigate("/Setting");
                  handleButtonClick("settings");
                }}
              >
                <ListItemText primary="Settings" />
              </ListItem>
            )}
          </List>
        </Drawer>
      </AppBar>
      <hr />
    </Box>
  );
};
export default Navbar;
