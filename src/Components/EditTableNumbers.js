import axios from "axios";
import React, { useEffect, useState } from "react";
import { Typography, Button, Modal, TextField, Box } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
function EditTableNumbers() {
  const [openDeleteModal, setopenDeleteModal] = useState("");
  const [TableList, setTableList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedTableNumber, setEditedTableNumber] = useState("");
  const [DeletableitemId, setDeletableitemId] = useState("");
  let Path = process.env.REACT_APP_PATH;
  let token = localStorage.getItem("token");

  const getTableNumbers = () => {
    axios
      .get(Path + "/GetTableNumbers", { headers: { authorization: token } })
      .then((response) => {
        console.log(response.data);
        setTableList(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditModalOpen = (table) => {
    setSelectedTable(table);
    setEditedTableNumber(table.tableNumber);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedTable(null);
    setEditedTableNumber("");
    setEditModalOpen(false);
  };

  const handleTableNumberChange = (event) => {
    setEditedTableNumber(event.target.value);
  };

  const handleEditTable = () => {
    // Make an API call to update the table number
    const updatedTable = { ...selectedTable, tableNumber: editedTableNumber };
    // Replace the API call with your actual implementation
    axios
      .put(Path + "/UpdateTable", updatedTable, {
        headers: { authorization: token },
      })
      .then((response) => {
        console.log(response.data);
        if ((response.data.data = `updated successfully`))
          alert("updated successfully");
        else {
          alert("error on update");
          return;
        }
        // return;
        // Update the table list with the updated table
        const updatedTableList = TableList.map((table) => {
          if (table.TableId === updatedTable.TableId) {
            return updatedTable;
          }
          return table;
        });
        setTableList(updatedTableList);
        handleEditModalClose();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteTable = (tableId) => {
    // alert(DeletableitemId);
    axios
      .delete(Path + "/DeleteTable", {
        data: { tableId: DeletableitemId },
        headers: { authorization: token },
      })
      .then((response) => {
        console.log(response.data);
        let data = response.data.data;
        //  ,
        setopenDeleteModal(false);
        if (data == "this data is not available") {
          alert(data);
        } else if (data == "deleted successfully") {
          alert(data);
        } else {
          alert("error to delete this data");
          return;
        }
        // Remove the deleted table from the table list
        const updatedTableList = TableList.filter(
          (table) => table.TableId !== tableId
        );
        setTableList(updatedTableList);
      })
      .catch((error) => {
        setopenDeleteModal(false);
        console.log(error);
      });
  };

  useEffect(() => {
    getTableNumbers();
  }, []);

  return (
    <div>
      <br /> <br /> <br /> <br />
      <Typography variant="h5">Table List</Typography>
      <Box
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {TableList.map((table) => (
          <Box
            sx={{
              margin: "auto",
              boxShadow: "0px 2px 4px rgba(10, 10, 200, 0.3)",
              display: "flex",
              flexDirection: "column",
              width: "fitContent",
              padding: "15px",
              margin: "5px",
            }}
            key={table.TableId}
          >
            <p> {`Table Number: ${table.tableNumber}`}</p>
            <div>
              <Button
                sx={{ marginRight: "10px" }}
                variant="contained"
                color="primary"
                onClick={() => handleEditModalOpen(table)}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setopenDeleteModal(true);
                  setDeletableitemId(table.TableId);
                }}
              >
                Delete
              </Button>
            </div>
          </Box>
        ))}
      </Box>
      <Modal open={editModalOpen} onClose={handleEditModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 400,
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5">Edit Table</Typography>
            <br />
            <TextField
              label="Table Number"
              value={editedTableNumber}
              onChange={handleTableNumberChange}
            />
            <br />
            <Button variant="contained" onClick={handleEditTable}>
              Save
            </Button>
          </div>
        </Box>
      </Modal>
      <Dialog open={openDeleteModal} onClose={() => setopenDeleteModal(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setopenDeleteModal(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteTable} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditTableNumbers;
