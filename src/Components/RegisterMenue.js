import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Tabs,
  Tab,
  Input,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { ConsumeContext } from "./ContextProvider";

let Path = process.env.REACT_APP_PATH;

export default function RegisterForm() {
  const [selectedOption, setSelectedOption] = useState("");
  const [PreparationTime, setPreparationTime] = useState("");
  const [TableAdress, setTableAdress] = useState("");
  const [ShowProgressBar, setShowProgressBar] = useState(false);
  const [ProductName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const Navigate = useNavigate();
  const [{ token }, SETORDER] = ConsumeContext();
  let submitTableNumberForm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(Path + "/insertTableNumbers", {
        TableAdress,
        token,
      });

      console.log(response.data.data);
      let message = response.data.data;
      if (message === "already registered before.") {
        alert(message);
      } else if (message === "registered successfully") {
        alert("registered successfully");
      } else {
        alert("unknown errors");
      }
    } catch (error) {
      alert("error on response");
      console.log("error", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(
      "selectedOption",
      selectedOption,
      "PreparationTime",
      PreparationTime
    );
    // return;
    if (selectedOption == "") {
      //  url, imgFile;
      // return alert("img is mandatory. please select images");
    } else if (selectedOption == "url") {
      if (selectedOption == "imageUrl") {
        return alert(`please type image url`);
      }
    } else if (selectedOption == "imgFile") {
      console.log("selectedFiles[0].length");
      if (!selectedFiles) {
        return alert(`please choose files`);
      }
    }
    try {
      setShowProgressBar(true);
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      formData.append("ProductName", ProductName);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("imageUrl", imageUrl);
      formData.append("PreparationTime", PreparationTime);
      // PreparationTime;
      // Assuming only one file is selected

      const response = await axios.post(Path + "/registerMenuItems", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      setShowProgressBar(false);
      console.log("Form submitted successfully:", response.data);
      if (response.data.message === "Menu item added successfully") {
        alert(response.data.message);
      }
      // Reset form fields
      setProductName("");
      setPrice("");
      setDescription("");
      setImageUrl("");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (token == null || token == undefined || token == "") {
      Navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    setInterval(() => {
      SETORDER((prevState) => {
        return { ...prevState, token: localStorage.getItem("token") };
      });
    }, 2000);
  }, []);

  const handleFileChange = (event) => {
    console.log(event.target.files[0]);
    setSelectedFiles(event.target.files);
  };

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="componenntWrapper">
      <div>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Items" />
          <Tab label="Table Numbers" />
        </Tabs>

        {selectedTab === 0 && (
          <div>
            {/* Content for Register Items tab */}
            {/* Add your item registration form or component here */}
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                width: "75%",
                maxWidth: "300px",
                padding: "20px 10%",
              }}
              onSubmit={handleSubmit}
            >
              <h4>Registration form for Menu items</h4>
              <TextField
                required
                label="Name"
                value={ProductName}
                onChange={(event) => setProductName(event.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <InputLabel>Choose Time</InputLabel>
              <Select
                onChange={(e) => setPreparationTime(e.target.value)}
                required
              >
                <MenuItem value={"lunch"}>Lunch</MenuItem>
                <MenuItem value={"dinner"}>Dinner</MenuItem>
                <MenuItem value={"breakfast"}>Breakfast</MenuItem>
              </Select>
              {/* 
              <div>
                <InputLabel>Choose image source</InputLabel>
                <Select
                  required
                  sx={{ width: "100%" }}
                  value={selectedOption}
                  onChange={handleOptionChange}
                >
                  <MenuItem value=""> </MenuItem>{" "}
                  <MenuItem value="url">Url</MenuItem>
                  <MenuItem value="imgFile">Img File</MenuItem>
                </Select>
                 
              </div>
              */}

              {/* {selectedOption == "url" && (
                <TextField
                  required
                  label="Image URL"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  fullWidth
                  margin="normal"
                />
              )  } */}
              <Input
                required
                sx={{ margin: `10px` }}
                type="file"
                onChange={handleFileChange}
              />

              <br />
              {!ShowProgressBar ? (
                <Button type="submit" variant="contained" color="primary">
                  Register
                </Button>
              ) : (
                <Button variant="contained" disabled>
                  Wait Processing...
                </Button>
              )}
            </form>
          </div>
        )}

        {selectedTab === 1 && (
          <div>
            {/* Content for Register Table Numbers tab */}
            {/* Add your table number registration form or component here */}
            <form
              onSubmit={(e) => {
                submitTableNumberForm(e);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                width: "75%",
                maxWidth: "300px",
                padding: "20px 10%",
              }}
            >
              <TextField
                label="Table Number /Name"
                onChange={(event) => setTableAdress(event.target.value)}
                fullWidth
                margin="normal"
              />
              <br />
              <Button type="submit" variant="contained">
                Register Table Number
              </Button>
            </form>
          </div>
        )}
      </div>

      {ShowProgressBar && <ProgressBar />}
    </div>
  );
}
