const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const tokenKey = process.env.backEndtokenKey;
const port = process.env.backendPort;
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// const uploadDir = path.join(__dirname, "uploads");
// Create a MySQL  pool pool
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "masetawoshacom_User",
//   password: "D4CvKs0j2=x,",
//   database: "masetawoshacom_HotelSerevant",
// });
pool.getConnection();
const upload = multer({ dest: "uploads/" }); // Set the destination folder for uploaded files
const generateUniqueFilename = (originalFilename) => {
  const fileExtension = path.extname(originalFilename);
  const uniqueFilename = `${Date.now()}${fileExtension}`;
  return uniqueFilename;
};
app.get("/", (req, res) => {
  res.json("it is working well");
});

app.post("/login", async (req, res) => {
  //console.log("@login req.body ", req.body);
  let { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM hotelServiceUsers WHERE phoneNumber='${username}'`
    );
    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ userId: user.id }, tokenKey),
          fullName = user.usersFullName,
          BuseinessName = user.BusinessName;
        res.json({ data: "success", token, fullName, BuseinessName });
      } else {
        res.json({ data: "WrongPassword" });
      }
    } else {
      res.json({ data: "unregisteredPhoneNumber" });
    }
  } catch (error) {
    res.json({ data: "error", error });
  } finally {
  }
});

app.get("/menu", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu_items");
    res.json({ data: rows });
  } catch (error) {
    console.error("Error while fetching menu items: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// const uploadDirectory = path.join(__dirname, "uploads");
app.post("/registerMenuItems", upload.single("file"), async (req, res) => {
  // Get the token from the headers
  const token = req.headers.authorization;
  if (token != null && token != "null" && token != undefined && token != "") {
    let { userId } = jwt.verify(token, tokenKey);
    let select = `select * from hotelServiceUsers where id='${userId}'`;
    let [results] = await pool.query(select);
    if (results.length > 0) {
      // Call the function to insert menu items into the table
      let fileName = "NoFile";
      if (req.file) {
        let originalFilename = req.file.originalname;
        let uniqueFilename = generateUniqueFilename(originalFilename);
        let filePath = path.join(req.file.destination, uniqueFilename);
        // console.log("uniqueFilename", uniqueFilename);
        fileName = uniqueFilename;
        // Rename the file with the unique filename
        fs.renameSync(req.file.path, filePath);
      }
      // Get the file name
      // console.log("fileName", fileName);
      // return;
      req.body.token = token;
      insertMenuItems([req.body], fileName, res);
    } else {
      res.json({
        data: "notUser",
        message: `you are not a registered user please login first`,
      });
    }
  } else {
    res.json({ data: "pleaseLoginFirst" });
  }
});

// Function to create the menu_items table
async function CreateTables() {
  try {
    // SQL query to create the table
    // ProductName, description, price, image;
    // payed;
    let createTable = `create table if not exists TableNumbers(TableId int AUTO_INCREMENT PRIMARY KEY,tableNumber varchar(900), ownerId int not null,OthersDetail varchar(300))`;
    let [results] = await pool.query(createTable);
    if (results) {
      console.log("TableNumbers created well");
    }
    let createOrderTable =
      "CREATE TABLE if not exists ordersTable (orderId INT AUTO_INCREMENT PRIMARY KEY,tableNumber varchar(900), outOfOursAddress varchar(900),orderBy int not null, hotelOwnerId int not null, orderContent VARCHAR(2555) NOT NULL,orderStatus VARCHAR(255) NOT NULL default 'ordered' )";
    [results] = await pool.query(createOrderTable);
    if (results) {
      //console.log("ordersTable created well");
    }
    const createTableQuery = `CREATE TABLE if not exists menu_items ( id INT AUTO_INCREMENT PRIMARY KEY, ProductName VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL, imageUrl VARCHAR(255) , filesName varchar(3000),ownerId VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL )`;
    let usersTable = `CREATE TABLE IF NOT EXISTS hotelServiceUsers ( id INT AUTO_INCREMENT PRIMARY KEY,  usersFullName VARCHAR(255) NOT NULL,  password VARCHAR(255) NOT NULL, PreparationTime varchar(90) not null, status VARCHAR(255) NOT NULL,  phoneNumber VARCHAR(255) NOT NULL, BusinessName varchar (60))`;

    [results] = await pool.query(usersTable);
    if (results) {
      //console.log("hotelServiceUsers created well");
    }
    await pool.query(createTableQuery);

    //console.log("menu_items table created successfully.");
  } catch (error) {
    console.error("Error creating menu_items table:", error);
  }
}
// Call the function to create the table
CreateTables();

const insertMenuItems = async (menuItem, fileName, res) => {
  try {
    //console.log("menuItem", menuItem);
    const {
      token,
      ProductName,
      description,
      price,
      imageUrl,
      ownerId,
      PreparationTime,
    } = menuItem[0];
    // const userId = jwt.verify(token, "@#3<lop>");
    if (token == "") return res.json({ data: "please login first" });
    const { userId } = jwt.verify(token, tokenKey);
    //console.log("userId", userId);
    // return;
    const verifySql = `select * from hotelServiceUsers where id='${userId}'`;
    let [results] = await pool.query(verifySql);
    //console.log("selectValues=selectValues", results);
    if (results.length == 0)
      return res.json({ data: "this phone number is not registerd before." });

    const query = `INSERT INTO menu_items (ProductName, description, price, imageUrl,filesName ,ownerId, PreparationTime,status)

               VALUES (?, ?, ?, ?, ?, ?,?,?)`;
    const values = [
      ProductName,
      description,
      price,
      imageUrl,
      fileName,
      userId,
      PreparationTime,
      "available",
    ];

    [results] = await pool.query(query, values);
    res.json({ message: "Menu item added successfully", results });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the  pool back to the pool
  }
};
app.get("/getMenuItems/:hotelName", async (req, res) => {
  const { hotelName } = req.params;
  // console.log("hotelName", hotelName);
  try {
    const token = req.headers.authorization;
    // console.log("req.headers.authorization", req.headers.authorization);
    // return;
    let query = "";
    let userId = 0;
    let isOwner = "NO";
    // to be seen later because why i write it
    // if (token != null && token != undefined && token != "" && token != "null") {
    //   userId = jwt.verify(token, tokenKey).userId;
    //   query = `SELECT * FROM menu_items where ownerId='${userId}'`;
    // }

    query = `SELECT * FROM menu_items,hotelServiceUsers where hotelServiceUsers.id=menu_items.ownerId and menu_items.status='available'`;

    if (hotelName !== undefined && hotelName !== "undefined") {
      query += ` and BusinessName='${hotelName}'`;
    }

    const [results] = await pool.query(query);
    // const token = jwt.sign({ userId: user.id }, tokenKey);
    let Copy = results.map((item) => {
      isOwner = "NO";
      const token = jwt.sign({ userId: item.ownerId }, tokenKey);
      if (userId == item.ownerId) {
        isOwner = "YES";
      }

      return {
        ...item,
        isOwner,
        ownerId: token,
      };
    });
    res.json(Copy);
    // Release the  pool back to the pool
    //console.log("Copy Copy Copy=", Copy);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the  pool back to the pool
  }
});

app.post("/registerUsers", async (req, res) => {
  try {
    const { fullName, password, phoneNumber } = req.body;

    let BusinessName = fullName.replace(/\s/g, "");

    const checkBusinessName = `SELECT * FROM hotelServiceUsers WHERE BusinessName = '${BusinessName}'`;
    const checkQuery = `SELECT phoneNumber FROM hotelServiceUsers WHERE phoneNumber = ?`;
    const insertQuery = `INSERT INTO hotelServiceUsers (usersFullName, password, status, phoneNumber, BusinessName) VALUES (?, ?, 'active', ?, ?)`;

    // Check if the phoneNumber already exists
    let [results] = await pool.query(checkQuery, [phoneNumber]);

    if (results.length > 0) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // Verify the uniqueness of the BusinessName
    let isBusinessNameUnique = false;
    while (!isBusinessNameUnique) {
      [results] = await pool.query(checkBusinessName);
      if (results.length > 0) {
        let randNumber = Math.floor(Math.random() * 1000000);
        BusinessName = fullName.replace(/\s/g, "") + randNumber;
      } else {
        isBusinessNameUnique = true;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user with the hashed password
    const [insertResults] = await pool.query(insertQuery, [
      fullName,
      hashedPassword,
      phoneNumber,
      BusinessName,
    ]);

    res.json(insertResults);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/updateMenueItems", async (req, res) => {
  try {
    const { id, token, ProductName, description, price, imageUrl } = req.body;
    const { userId } = jwt.verify(token, tokenKey);

    let updateQuery = `update menu_items set ProductName=?,description=?,price=?,imageUrl=? where id=? `;
    let updateValues = [ProductName, description, price, imageUrl, id];

    let [results] = await pool.query(updateQuery, updateValues);
    res.json({ data: results });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/orderToKitchen", async (req, res) => {
  try {
    const {
      OrderBasket,
      token,
      tableNumber,
      selectedAddress,
      phoneNumber,
      specificAddress,
    } = req.body;
    console.log(
      "OrderBasket, token, tableNumber,selectedAddress ,phoneNumber,specificAddress",
      // OrderBasket,
      // token,
      tableNumber,
      selectedAddress,
      phoneNumber,
      specificAddress
    );
    // return;
    let userId = 0;
    if ((token != null && token) != "null" && token != undefined && token != "")
      userId = jwt.verify(token, tokenKey).userId;
    let firstOrder = OrderBasket[0];
    //console.log("firstOrder.OwnerId", OrderBasket[0].ownerId);
    let OwnerId = jwt.verify(firstOrder.ownerId, tokenKey).userId;
    let sqlToInsert = `INSERT INTO ordersTable (orderBy, hotelOwnerId, orderContent,tableNumber) VALUES (?, ?, ?,?)`;
    let orderValues = [
      userId,
      OwnerId,
      JSON.stringify(OrderBasket),
      tableNumber,
    ];
    if (tableNumber == "Others") {
      orderValues = [
        userId,
        OwnerId,
        JSON.stringify(OrderBasket),
        tableNumber,
        JSON.stringify({ phoneNumber, specificAddress }),
      ];
      sqlToInsert = `INSERT INTO ordersTable (orderBy, hotelOwnerId, orderContent,tableNumber,outOfOursAddress) VALUES (?, ?, ?,?,?)`;
    }

    let [results] = await pool.query(sqlToInsert, orderValues);

    res.json({ data: "inserted", results });
  } catch (error) {
    console.error("Error inserting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/getRecivedOrders", async (req, res) => {
//   try {
//     const token = req.headers.authorization;
//     let userId = 0;
//     if (token != null && token != "null" && token != undefined && token != "")
//       userId = jwt.verify(token, tokenKey).userId;
//     // Process the token or perform any required actions
//     // Send the response
//     let select = `select * from ordersTable where hotelOwnerId='${userId}' and orderStatus='ordered'`;

//     let [results] = await pool.query(select);

//     res.json({ message: results });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// app.post("/getWaitingOrders", async (req, res) => {
//   try {
//     const token = req.body.token;
//     let savedOrders = JSON.parse(req.body.savedOrders);
//     let userId = 0;
//     if (token != "null" && token != null && token != undefined && token != "")
//       userId = jwt.verify(token, tokenKey).userId;
//     // console.log(" savedOrders", savedOrders[0]);
//     let bySavedOrders = "",
//       select = `SELECT * FROM ordersTable WHERE orderBy='${userId}'  AND orderStatus='ordered'`;
//     if (Array.isArray(savedOrders)) {
//       bySavedOrders = ` OR orderId IN (${savedOrders?.join(",")}))`;
//       select = `SELECT * FROM ordersTable WHERE (orderBy='${userId}' ${bySavedOrders}  AND orderStatus='ordered'`;
//     }

//     let [results] = await pool.query(select);

//     res.json({ message: results });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.get("/getRecivedOrders", async (req, res) => {
  try {
    const token = req.headers.authorization;
    let userId = 0;
    if (token != null && token != "null" && token != undefined && token != "")
      userId = jwt.verify(token, tokenKey).userId;
    // Process the token or perform any required actions
    // Send the response
    let select = `select * from ordersTable where hotelOwnerId=? and orderStatus='ordered'`;

    let [resultsOfOrderRecived] = await pool.query(select, [userId]);
    let savedOrders = req.query.savedOrders;
    // console.log("savedOrders", savedOrders);
    //Get my order requests to
    if (savedOrders != undefined && savedOrders != null && savedOrders != "")
      savedOrders = JSON.parse(req.query.savedOrders); //orders id saved in browser localstorages

    let bySavedOrders = "";
    select = `SELECT * FROM ordersTable WHERE orderBy='${userId}'  AND orderStatus='ordered'`;
    if (Array.isArray(savedOrders)) {
      bySavedOrders = ` OR orderId IN (${savedOrders?.join(",")}))`;
      select = `SELECT * FROM ordersTable WHERE (orderBy='${userId}' ${bySavedOrders}  AND orderStatus='ordered'`;
    }

    let [resultsOfOrderRequest] = await pool.query(select);
    // console.log(
    //   "resultsOfOrderRecived",
    //   resultsOfOrderRecived,
    //   "resultsOfOrderRequest",
    //   resultsOfOrderRequest
    // );
    res.json({
      message: resultsOfOrderRequest,
      resultsOfOrderRequest,
      resultsOfOrderRecived,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getMyprofile", async (req, res) => {
  try {
    let token = req.headers.authorization;
    let { userId } = jwt.verify(token, tokenKey);
    //console.log("userId", userId);

    // res.json({ data: req.headers.authorization });
    let select = `select * from hotelServiceUsers where id=${userId}`;
    let [results] = await pool.query(select);
    res.json({ data: results });

    // used to update user profiles
  } catch (error) {
    res.json({ data: error });
    console.log("error", error);
  }
});
app.put("/updateUsersProfile", async (req, res) => {
  try {
    let { usersFullName, OldPassword, phoneNumber, NewPassword, id } = req.body;

    let getSavedPassword = `select * from hotelServiceUsers where id='${id}'`;
    let [results] = await pool.query(getSavedPassword);
    let savedHashPassword = "";

    if (results.length > 0) {
      savedHashPassword = results[0].password;
    } else {
      return res.json({ data: "You are not a registered user" });
    }

    let sqlVerifyPhone = `select * from hotelServiceUsers where phoneNumber='${phoneNumber}'`;
    [results] = await pool.query(sqlVerifyPhone);

    if (results.length > 1 || results[0].id != id) {
      return res.json({
        data: "This Phone number is reserved by another user",
      });
    } else {
      bcrypt.compare(OldPassword, savedHashPassword, async (err, result) => {
        if (err) {
          return res.json({ data: "System error" });
        } else if (result) {
          let updateUsers = `update hotelServiceUsers set usersFullName='${usersFullName}', phoneNumber='${phoneNumber}' where id='${id}'`;

          if (
            NewPassword !== "" &&
            NewPassword !== null &&
            NewPassword !== undefined
          ) {
            const currentlyHashedPassword = await bcrypt.hash(NewPassword, 10);
            updateUsers = `update hotelServiceUsers set usersFullName='${usersFullName}', phoneNumber='${phoneNumber}',password='${currentlyHashedPassword}' where id='${id}'`;
          }

          await pool.query(updateUsers);
          res.json({
            data: "Data updated successfully",
            NewPassword: NewPassword,
          });
        } else {
          res.json({ data: "Wrong password" });
        }
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.put("/updateDeliverySuccess", async (req, res) => {
  try {
    let { orderId, orderStatus } = req.body.ORDEREDITEMS;
    let select = `update ordersTable set orderStatus='Delivered' where  orderId='${orderId}' and orderStatus='ordered'`;
    let response = await pool.query(select);
    res.json({ data: "SUCCESS", response });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/deleteMenueItem", async (req, res) => {
  try {
    let { token } = req.body.item;
    let { userId } = jwt.verify(token, tokenKey);

    let { id } = req.body.item;
    let sqlTodelete = `delete from menu_items where id='${id}'`;
    let [results] = await pool.query(sqlTodelete);
    //console.log("SELECT", results);
    let query = `SELECT * FROM menu_items where ownerId='${userId}'`;
    [results] = await pool.query(query);
    res.json({ data: results });
    {
      /** menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        ownerId VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL */
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the  pool back to the pool
  }
});
app.get("/searchBusiness", async (req, res) => {
  try {
    const targetedSearch = req.headers.searchquery;
    const select = `SELECT * FROM hotelServiceUsers WHERE usersFullName LIKE '${targetedSearch}%'`;

    const [results] = await pool.query(select);

    res.json({ data: results });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("tokenKey", tokenKey);
});
app.post("/insertTableNumbers", async (req, res) => {
  try {
    let { TableAdress, token } = req.body;
    let { userId } = jwt.verify(token, tokenKey);
    let insert = `INSERT INTO TableNumbers (tableNumber, ownerId) VALUES (?, ?)`;
    let values = [TableAdress, userId];
    let select = `SELECT * FROM TableNumbers WHERE tableNumber = ?`;
    let selectValues = [TableAdress];
    let [results] = await pool.query(select, selectValues);
    if (results.length > 0) {
      res.json({ data: "already registered before." });
    } else {
      let [ll] = await pool.query(insert, values);
      res.json({
        data: "registered successfully",
        ll,
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/getTableNumbers", async (req, res) => {
  let { userId } = jwt.verify(req.body.ownerId, tokenKey);
  let select = `select * from TableNumbers where ownerId=?`;
  let values = [userId];
  pool
    .query(select, values)
    .then(([result]) => {
      console.log(result);
      res.json({ data: result });
    })
    .catch((error) => {
      console.log(error);
    });
  // res.json({ data: req.body });
});
app.get("/getMyItems", (req, res) => {
  let token = req.headers.authorization;
  let { userId } = jwt.verify(token, tokenKey);
  let select = `select * from menu_items where ownerId='${userId}'`;
  pool
    .query(select)
    .then(([result]) => {
      res.json({ data: result });
    })
    .catch(() => {});
});

app.put("/editItem/:editItemId", upload.single("file"), (req, res) => {
  const uploadDir = path.join(__dirname, "uploads"); // Update the directory path accordingly
  console.log("uploadDir", uploadDir);
  // return;

  const editItemId = req.params.editItemId;
  const Token = req.headers.authorization;
  console.log("token", Token);
  if (Token == null && Token == "null" && Token == undefined) {
    return res.json({ data: `you haven't logged in please login first` });
  }
  let { userId } = jwt.verify(Token, tokenKey);
  let fileName = "NoFile";

  // Delete the previous file if it exists
  if (req.file)
    pool
      .query("SELECT filesName FROM menu_items WHERE id = ?", [editItemId])
      .then(([result]) => {
        const previousFileName = result[0].filesName;
        if (previousFileName !== "NoFile") {
          const previousFilePath = path.join(uploadDir, previousFileName);
          fs.unlinkSync(previousFilePath);
          console.log("Previous file deleted:", previousFileName);
        }
      })
      .catch((error) => {
        console.error("Error deleting previous file: ", error);
      });

  if (req.file) {
    let originalFilename = req.file.originalname;
    let uniqueFilename = generateUniqueFilename(originalFilename);
    let filePath = path.join(uploadDir, uniqueFilename);
    // console.log("uniqueFilename", uniqueFilename);
    fileName = uniqueFilename;
    // Rename the file with the unique filename
    fs.renameSync(req.file.path, filePath);
  }
  const { ProductName, description, imageUrl, price } = req.body;
  console.log("req.body", req.body);

  const query =
    "UPDATE menu_items SET ProductName=?,description=?,price=?,imageUrl=?,filesName=?,ownerId=? ,status=? WHERE id = ?";
  // `CREATE TABLE if not exists menu_items ( id INT AUTO_INCREMENT PRIMARY KEY, ProductName VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL, imageUrl VARCHAR(255) , filesName varchar(3000),ownerId VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL )`;
  pool
    .query(query, [
      ProductName,
      description,
      price,
      imageUrl,
      fileName,
      userId,
      "active",
      editItemId,
    ])
    .then((results) => {
      if (results.affectedRows === 0) {
        res.status(404).json({ data: "Item not found" });
      } else {
        res.json({ data: "Item updated successfully" });
      }
    })
    .catch((error) => {
      console.error("Error updating item: ", error);
      res.status(500).json({ data: "Error updating item" });
    });
});
// DELETE route to delete an item by ID
app.delete("/deleteItem/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log("itemId", itemId);
    // Construct the DELETE query
    const deleteQuery = "DELETE FROM menu_items WHERE id = ?";
    // Execute the DELETE query with the item ID parameter
    const results = await pool.query(deleteQuery, [itemId]);
    console.log("results", results[0]);
    // return;
    if (results[0].affectedRows > 0) {
      res.status(200).json({ data: "success" });
      // Successful deletion
    } else {
      res.status(404).json({ data: "notFound" }); // Item not found
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ data: "internal server error" });
  }
});
app.get("/GetTableNumbers", (req, res) => {
  let token = req.headers.authorization;
  let { userId } = jwt.verify(token, tokenKey);
  let get = `select * from TableNumbers where ownerId=${userId}`;
  pool
    .query(get)
    .then(([results]) => {
      res.json({ data: results });
    })
    .catch((error) => {
      res.json({ data: error });
    });
  // res.json({ data: req.headers.authorization });
});
app.put("/UpdateTable", (req, res) => {
  let token = req.headers.authorization;
  if (token == "null") {
    return res.json({ data: "you dont have autorization" });
  }
  let { userId } = jwt.verify(token, tokenKey);
  let { tableNumber, ownerId, TableId } = req.body;
  // res.json({ data: req.body });
  let Update = `update TableNumbers set tableNumber='${tableNumber}' where ownerId='${ownerId}' and TableId='${TableId}' and ownerId='${userId}'`;
  // return;
  pool
    .query(Update)
    .then(([results]) => {
      res.json({ data: "updated successfully" });
    })
    .catch((error) => {
      console.log("error on update table number is ", error);
      res.json({ data: "Error on updates." });
    });
  console.log("UpdateTable");
});
app.delete("/DeleteTable", (req, res) => {
  let token = req.headers.authorization;
  if (token == "" || token == null || token == "null") {
    return res.json({ data: "you haven't autority to do this operation" });
  }
  let tableId = req.body.tableId,
    { userId } = jwt.verify(token, tokenKey);
  let deleteNumbers = `delete from TableNumbers where TableId='${tableId}' and ownerId=${userId} `;
  pool
    .query(deleteNumbers)
    .then(([results]) => {
      if (results.affectedRows > 0) res.json({ data: "deleted successfully" });
      if (results.affectedRows == 0)
        res.json({ data: "this data is not available" });
    })
    .catch((error) => {
      res.json({ data: "error" });
    });
});
app.post("/updateMenueItemStatus", (req, res) => {
  // req.body({ data: "well" });
  let { token, item } = req.body,
    { id } = item;
  if (
    token == null ||
    token == "null" ||
    token == "" ||
    token == "undefined" ||
    token == undefined
  ) {
    console.log(req.body);
    return res.json({ data: "login first." });
  }
  let { userId } = jwt.verify(token, tokenKey),
    status = "available";
  if (item.status == "available") {
    status = "notAvailable";
  }
  let update = `update menu_items set status='${status}' where ownerId='${userId}' and id='${id}'`;
  pool
    .query(update)
    .then(([results]) => {
      console.log("results", results.affectedRows);
      let affectedRows = results.affectedRows;
      if (affectedRows > 0) {
        res.json({ data: `updated successfully` });
      } else {
        res.json({ data: `unable to updtae successfully`, update });
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
});
app.post("/cancelMyOrderRequest", (req, res) => {
  // res.json({ data: req.body });
  let { token, orderId } = req.body;
  if (token == null || token == undefined || token == "" || token == "null") {
    return res.json({ data: "unable to do" });
  }
  let update = `update ordersTable set orderStatus='canceled by user' where orderId='${orderId}' and orderStatus ='ordered'`;
  // affectedRows
  pool
    .query(update)
    .then(([results]) => {
      if (results.affectedRows >= 0) res.json({ data: "updated" });
    })
    .catch((error) => {
      console.log(error);
      res.json({ data: "data" });
    });
});
("CREATE TABLE if not exists ordersTable (orderId INT AUTO_INCREMENT PRIMARY KEY,tableNumber varchar(900), outOfOursAddress varchar(900),orderBy int not null, hotelOwnerId int not null, orderContent VARCHAR(2555) NOT NULL,orderStatus VARCHAR(255) NOT NULL default 'ordered' )");
