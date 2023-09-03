import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Input,
  FormControl,
  Switch,
  Modal,
  Box,
} from "@mui/material";
import { ConsumeContext } from "./ContextProvider";
let path = process.env.REACT_APP_PATH;
function EditItems() {
  const [myItems, setMyItems] = useState([]);
  const [deleteModalOpen, setdeleteModalOpen] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [DeletableItem, setDeletableItem] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editItemImageUrl, setEditItemImageUrl] = useState("");
  const [editItemPrice, setEditItemPrice] = useState(""); // New state for price
  let Path = process.env.REACT_APP_PATH;
  const [SelectedFile, setSelectedFile] = useState();
  const handleDeleteItem = async (itemId) => {
    try {
      // Make an API call or perform any necessary actions to delete the item
      // using the provided itemId
      // Assuming you have an API endpoint to delete the item by ID
      const response = await axios.delete(
        `${Path}/deleteItem/${DeletableItem}`
      );
      setdeleteModalOpen(false);
      // Check the response or perform any additional logic
      console.log("Delete response", response.data);
      // Refresh the item list after successful deletion
      fetchItems();
    } catch (error) {
      setdeleteModalOpen(false);
      console.log(error);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(Path + "/getMyItems", {
        headers: { Authorization: `${token}` },
      });
      setMyItems(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditModalOpen = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.ProductName);
    setEditItemDescription(item.description);
    setEditItemPrice(item.price); // Set the price
    setEditItemImageUrl(item.imageUrl);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleEditSubmit = async () => {
    let formData = new FormData();
    formData.append("file", SelectedFile);
    formData.append("ProductName", editItemName);
    formData.append("description", editItemDescription);
    formData.append("price", editItemPrice); // Include the edited price
    formData.append("imageUrl", editItemImageUrl);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        Path + `/editItem/${editItemId}`,
        formData,
        {
          headers: { Authorization: `${token}` },
        }
      );
      let message = response.data.data;
      if (message == "Item updated successfully") {
        alert(message);
      }
      fetchItems();
      setEditModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };
  const [checked, setChecked] = useState(true);

  const [openSwitchModal, setopenSwitchModal] = useState({
    open: false,
    item: "",
  });
  const [{ token }, SETORDER] = ConsumeContext();
  let switchItemsAvaliablity = () => {
    let item = openSwitchModal.item;
    axios
      .post(path + "/updateMenueItemStatus", { token, item })
      .then((responce) => {
        let { data, update } = responce.data;

        alert(data);
        fetchItems();
      })
      .catch((error) => {
        console.log(error);
      });
    setopenSwitchModal({ open: false, item: "" });
  };
  return (
    <div>
      <br /> <br /> <br />
      <br /> <br />
      {isLoading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : myItems.length > 0 ? (
        <Grid container spacing={2}>
          {myItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card variant="outlined">
                <CardContent>
                  <img
                    src={
                      item.filesName == "" || item.filesName == "NoFile"
                        ? item.imageUrl
                        : path + "/uploads/" + item.filesName
                    }
                    alt={
                      item.filesName == "" || item.filesName == "NoFile"
                        ? item.imageUrl
                        : path + "/uploads/" + item.filesName
                    }
                    style={{ width: "100%", height: "300px" }}
                  />
                  <Typography variant="h5" component="div">
                    {item.ProductName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: {item.price}
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditModalOpen(item)}
                    >
                      Edit
                    </Button>
                    &nbsp; &nbsp;
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={(e) => {
                        setdeleteModalOpen(true);
                        setDeletableItem(item.id);
                      }}
                    >
                      Delete
                    </Button>
                    &nbsp;
                    <Button
                      onClick={() => {
                        setopenSwitchModal({ item: item, open: true });
                      }}
                    >
                      Available?
                      <Switch
                        label="is available"
                        checked={item.status == "available" ? true : false}
                      />
                    </Button>
                  </Box>
                  {item.status !== "available" && (
                    <Box>not available in stock</Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">No items available.</Typography>
      )}
      <Dialog open={editModalOpen} onClose={handleEditModalClose}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            required
            label="Item Name"
            value={editItemName}
            onChange={(e) => setEditItemName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            required
            label="Item Description"
            value={editItemDescription}
            onChange={(e) => setEditItemDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            required
            label="Price"
            value={editItemPrice}
            onChange={(e) => setEditItemPrice(e.target.value)}
            fullWidth
            margin="normal"
          />
          <br /> <br />
          {/* <FormControl fullWidth>
            <InputLabel>Edit Images</InputLabel>
            <Select
              required
              sx={{ width: "100%" }}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem> </MenuItem>
              <MenuItem value="URL">Use URL</MenuItem>
              <MenuItem value="imgFile">Choose file</MenuItem>
            </Select>
          </FormControl>
          <br /> <br /> */}
          {/* {selectedOption == "URL" && (
            <TextField
              required
              label="Image URL"
              value={editItemImageUrl}
              onChange={(e) => setEditItemImageUrl(e.target.value)}
              fullWidth
              margin="normal"
            />
          )} */}
          {/* {selectedOption == "imgFile" && ( )} */}
          <Input
            required
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteModalOpen} onClose={() => setdeleteModalOpen(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setdeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteItem} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <Modal
          open={openSwitchModal.open}
          onClose={() => {
            setopenSwitchModal({ open: false, item: "" });
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: 400,
              margin: "auto",
              backgroundColor: "#fff",
              padding: 16,
            }}
          >
            <Typography variant="h6">Modal Content</Typography>
            <Typography variant="body1">
              Do you want to switch this item?
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                switchItemsAvaliablity();
              }}
            >
              Verify
            </Button>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <Button
              variant="contained"
              color="warning"
              onClick={() => setopenSwitchModal({ open: false, item: "" })}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
export default EditItems;
