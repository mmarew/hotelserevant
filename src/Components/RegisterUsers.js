import React, { useState } from "react";
import { TextField, Button, Grid, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  let Navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  let path = process.env.REACT_APP_PATH;
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios
      .post(path + "/registerUsers", {
        fullName,
        phoneNumber,
        password,
      })
      .then((response) => {
        //  Navigate("/login");
        // Handle successful registration
        console.log("Registration successful:", response.data);
        if (response.data.affectedRows == 1) {
          Navigate("/login");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          // Phone number already exists
          console.error("Registration error:", error.response.data.error);
          alert(error.response.data.error);
          // Navigate("/login");
        } else {
          // Other error occurred
          console.error("Registration error:", error.message);
        }
      });
    // Handle successful registration response

    // Handle registration error
    //   console.error(error);
  };

  return (
    <Grid sx={{ marginTop: "0px" }} container justifyContent="center">
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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
              {/* Add more fields for other details */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Register
                </Button>
              </Grid>
            </Grid>
            <br />
            <h3 style={{ color: "blue" }} onClick={() => Navigate("/login")}>
              If you have accont click here to login{" "}
            </h3>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RegistrationForm;
