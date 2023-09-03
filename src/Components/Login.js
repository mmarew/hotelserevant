import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LocalStorage from "./LocalStorage";
import ProgressBar from "./ProgressBar";
const LoginForm = () => {
  let Navigate = useNavigate();
  let Path = process.env.REACT_APP_PATH;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("username", username, " password", password, "Path", Path);

    setShowProgressBar(true);
    await axios
      .post(Path + "/login", {
        username,
        password,
      })
      .then((Responces) => {
        // console.log("@handle login steps Responces", Responces);
        setShowProgressBar(false);
        // Handle successful login response
        let Obj = Responces.data;
        // alert(Obj.BuseinessName);
        // return;
        let data = Obj.data;
        if (data == "WrongPassword") {
          alert("Wrong password.");
        } else if (data == "unregisteredPhoneNumber") {
          alert("This phone number is not registered");
        } else if (data == "success") {
          LocalStorage("token", Obj.token, "set");
          LocalStorage("fullName", Obj.fullName, "set");
          LocalStorage("BuseinessName", Obj.BuseinessName, "set");
          Navigate("/Business/" + Obj.BuseinessName);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error");
      });
  };
  useEffect(() => {
    let getData = async () => {
      let token = await LocalStorage("token", "", "get");
      if (token !== "" && token !== null && token !== undefined) Navigate("/");
    };
    getData();
  }, []);
  const [ShowProgressBar, setShowProgressBar] = useState(false);
  return (
    <Grid container justifyContent="center">
      {ShowProgressBar && <ProgressBar />}
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Login
                </Button>
              </Grid>
            </Grid>
            <br />
            <h3
              style={{ color: "blue" }}
              onClick={() => {
                Navigate("/registerUsers");
              }}
            >
              If you haven't account click here to register
            </h3>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginForm;
