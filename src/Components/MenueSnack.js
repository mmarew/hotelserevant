import { Snackbar, SnackbarContent } from "@mui/material";
import React from "react";
function MenueSnack({ isUpdateSuccessful, setisUpdateSuccessful }) {
  // console.log("isUpdateSuccessful", isUpdateSuccessful);
  let handleCloseSnackbar = () => {
    setisUpdateSuccessful(false);
  };
  return (
    <Snackbar
      open={isUpdateSuccessful?.open}
      autoHideDuration={2000}
      onClose={handleCloseSnackbar}
    >
      <SnackbarContent
        message={isUpdateSuccessful?.message}
        sx={{
          color: "white",
          backgroundColor: "green",
        }}
      />
    </Snackbar>
  );
}

export default MenueSnack;
