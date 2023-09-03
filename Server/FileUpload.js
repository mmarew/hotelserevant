const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" }); // Destination folder for uploaded files

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  // Do something with the file (e.g., save it to a database)

  res.json({ message: "File uploaded successfully" });
});

app.use("/uploads", express.static("uploads")); // Serve uploaded files
let PORT = 3002;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
