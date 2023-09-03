import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import VerifyLogin from "./VerifyLogin";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import Order from "./Order";

const Setting = () => {
  const [UserProfile, setUserProfile] = useState([{}]);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [EditedProfile, setEditedProfile] = useState({});

  const [OldPassword, setOldPassword] = useState("");
  const [NewPassword, setNewPassword] = useState("");
  const [RetypeNewPassword, setRetypeNewPassword] = useState("");
  const [EditPassword, setEditPassword] = useState(false);
  let Path = process.env.REACT_APP_PATH;
  useEffect(() => {
    console.log("UserProfile", UserProfile);
    try {
      setFullName(UserProfile[0].usersFullName);
      setPhoneNumber(UserProfile[0].phoneNumber);
      setEditedProfile(UserProfile[0]);
    } catch (error) {
      console.log("err", error);
    }
  }, [UserProfile]);
  useEffect(() => {
    let updateProfile = async () => {
      console.log("EditedProfile", EditedProfile);
      // return;
      let responce = await axios.put(
        Path + "/updateUsersProfile",
        EditedProfile
      );
      alert(responce.data.data);
      setOldPassword("");
      setRetypeNewPassword("");
      setNewPassword("");
      amILogedIn();
    };
    if (
      EditedProfile.OldPassword != "" &&
      EditedProfile.OldPassword != undefined &&
      EditedProfile.OldPassword != null
    )
      updateProfile();
  }, [EditedProfile]);
  let amILogedIn = async () => {
    setUserProfile((await VerifyLogin()).data.data);
  };
  let Navigate = useNavigate();
  const [token, settoken] = useState(localStorage.getItem("token"));
  useEffect(() => {
    if (token == null || token == undefined || token == "") Navigate("/");
    else amILogedIn();
  }, [token]);
  setInterval(() => {
    settoken(localStorage.getItem("token"));
  }, 2000);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (OldPassword == "") return alert("Password cannot be empity");
    setEditedProfile({
      ...EditedProfile,
      OldPassword,
      usersFullName: fullName,
      phoneNumber: phoneNumber,
    });
    if (EditPassword) {
      if (NewPassword !== RetypeNewPassword) {
        return alert("new password and retyped password are not same.");
      } else {
        setEditedProfile({ ...EditedProfile, NewPassword });
      }
    }
  };
  const [EditableItems, setEditableItems] = useState("");
  return (
    <div className="componenntWrapper">
      <Box
        sx={{
          display: "flex",
          maxWidth: "500px",
          flexWrap: "wrap",
        }}
      >
        <Button
          sx={{ margin: "10px 5px" }}
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Edit Profile
        </Button>

        <Button
          sx={{ margin: "10px 5px" }}
          variant="contained"
          color="primary"
          onClick={() => Navigate("editItems")}
        >
          Edit Items
        </Button>
        <Button
          sx={{ margin: "10px 5px" }}
          variant="contained"
          color="primary"
          onClick={() => {
            Navigate("editTableNumbers");
          }}
        >
          Edit Table Numbers
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "400px",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" id="modal-title" gutterBottom>
            Edit Profile
          </Typography>
          <form style={{ display: "flex", flexDirection: "column" }}>
            <TextField
              required
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Password"
              type="password"
              name="password"
              value={OldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <h3>
              <Checkbox
                onClick={() => {
                  setEditPassword(!EditPassword);
                }}
              />
              <span>Edit Password</span>
            </h3>
            {EditPassword && (
              <>
                <TextField
                  required
                  label="New Password"
                  type="password"
                  value={NewPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  required
                  label="Re type Password"
                  type="password"
                  value={RetypeNewPassword}
                  onChange={(e) => setRetypeNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </>
            )}
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default Setting;
