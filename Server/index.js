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
const { error, table } = require("console");
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
      res.json({ data: "unregisteredPhoneNumber", username });
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

    let usersTable = `CREATE TABLE IF NOT EXISTS hotelServiceUsers ( id INT AUTO_INCREMENT PRIMARY KEY,  usersFullName VARCHAR(255) NOT NULL,  password VARCHAR(255) NOT NULL, passwordResetPin int, PreparationTime varchar(90) not null, status VARCHAR(255) NOT NULL,  phoneNumber VARCHAR(255) NOT NULL, BusinessName varchar (60),Authority varchar(30))`;

    let createOrderTable = `CREATE TABLE IF NOT EXISTS ordersTable (  orderId INT AUTO_INCREMENT PRIMARY KEY,tableNumber VARCHAR(900),outOfOursAddress VARCHAR(900),  orderBy INT NOT NULL,hotelOwnerId INT NOT NULL,orderContent VARCHAR(99999) NOT NULL,orderedTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  deliveryTime DATETIME, servedByHotelSide int, orderStatus ENUM('ordered', 'Delivered', 'cancelled by user', 'cancelled by hotel') NOT NULL DEFAULT 'ordered',cancellationReason VARCHAR(255),cancellationTime DATETIME,cancellationInitiator ENUM('user', 'hotel owner'),cancellationNotificationSent ENUM('noNeed','prepared','sent','verified') NOT NULL DEFAULT 'noNeed')`;
    // servedByHotelSide is serevant id

    let Create = `CREATE TABLE IF NOT EXISTS employeesTable (jobId INT AUTO_INCREMENT PRIMARY KEY,  employeeId INT NOT NULL,  employerId INT NOT NULL,  TableNumbers VARCHAR(255),  status ENUM('active', 'waiting', 'fired'))`;
    pool
      .query(Create)
      .then((responces) => {
        console.log("employeesTable created well");
      })
      .catch((error) => console.log(error));
    let createTable = `create table if not exists TableNumbers(TableId int AUTO_INCREMENT PRIMARY KEY,tableNumber varchar(900), ownerId int not null,OthersDetail varchar(300))`;
    let [results] = await pool.query(createTable);
    if (results) {
      console.log("TableNumbers created well");
    }
    [results] = await pool.query(createOrderTable);
    if (results) {
      //console.log("ordersTable created well");
    }
    const createTableQuery = `CREATE TABLE if not exists menu_items ( id INT AUTO_INCREMENT PRIMARY KEY, ProductName VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL, imageUrl VARCHAR(255) , filesName varchar(3000),ownerId VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL )`;

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

    const query = `INSERT INTO menu_items (ProductName, description, price, imageUrl,filesName ,ownerId, PreparationTime,status) VALUES (?, ?, ?, ?, ?, ?,?,?)`;
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
  console.log("hotelName", hotelName);
  try {
    const token = req.headers.authorization;

    let query = "";
    let userId = 0;
    let isOwner = "NO";
    // to be seen later because why i write it
    // if (token != null && token != undefined && token != "" && token != "null") {
    //   userId = jwt.verify(token, tokenKey).userId;
    //   query = `SELECT * FROM menu_items where ownerId='${userId}'`;
    // }

    query = `SELECT * FROM menu_items,hotelServiceUsers where hotelServiceUsers.id=menu_items.ownerId and menu_items.status='available' and hotelServiceUsers.status='active' order by menu_items.id  limit 40 `;
    // available and notavailable is to menu_items
    // active vs disable is to hotelServiceUsers
    if (hotelName !== undefined && hotelName !== "undefined") {
      query = `SELECT * FROM menu_items,hotelServiceUsers where hotelServiceUsers.id=menu_items.ownerId and menu_items.status='available' and BusinessName='${hotelName}' order by menu_items.id`;
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
      orderDate,
    } = req.body;

    let userId = 0;
    if ((token != null && token) != "null" && token != undefined && token != "")
      userId = jwt.verify(token, tokenKey).userId;
    let firstOrder = OrderBasket[0];
    //console.log("firstOrder.OwnerId", OrderBasket[0].ownerId);
    let OwnerId = jwt.verify(firstOrder.ownerId, tokenKey).userId;
    let sqlToInsert = `INSERT INTO ordersTable (orderBy, hotelOwnerId, orderContent,tableNumber,orderedTime) VALUES (?,?,?,?,?)`;
    let orderValues = [
      userId,
      OwnerId,
      JSON.stringify(OrderBasket),
      tableNumber,
      orderDate,
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
app.get("/getRecivedAndSentOrders", async (req, res) => {
  try {
    const token = req.headers.authorization;
    let userId = 0;
    if (token != null && token != "null" && token != undefined && token != "")
      userId = jwt.verify(token, tokenKey).userId;
    // Process the token or perform any required actions
    // Send the response
    // let select = `select * from ordersTable where hotelOwnerId=? and (orderStatus='ordered' or (cancellationNotificationSent='prepared' and orderStatus='cancelled by user'))`;
    let getMyEmployyersTableNumbers = `select * from employeesTable where employeeId='${userId}' and status='active'`;
    let myData = [];
    await pool
      .query(getMyEmployyersTableNumbers)
      .then(([data]) => {
        // console.log(data);
        myData = data;
      })
      .catch((error) => {
        console.log(error);
      });
    let myTableNumbers = myData[0]?.TableNumbers;
    // Convert the array to a string in the desired format
    let tableNumberString = "",
      select = "";
    if (myTableNumbers) {
      // your business plus your employeers business
      myTableNumbers = JSON.parse(myTableNumbers);
      tableNumberString = `(${myTableNumbers
        .map((value) => `'${value}'`)
        .join(", ")})`;
      // console.log("tableNumberString", tableNumberString);
      select = `SELECT * FROM employeesTable, ordersTable WHERE ((employeeId = '${userId}' AND employerId = hotelOwnerId AND ordersTable.tableNumber IN ${tableNumberString}) OR hotelOwnerId = '${userId}' ) AND ( orderStatus = 'ordered' OR  (cancellationNotificationSent = 'prepared' AND orderStatus = 'cancelled by user') )`;
      // select = `select * from employeesTable,ordersTable where ((employeeId='${userId}' and employerId=hotelOwnerId and TableNumbers in ${tableNumberString}) or hotelOwnerId='${userId}') and (orderStatus='ordered' or (cancellationNotificationSent='prepared' and orderStatus='cancelled by user'))`;
    } else {
      //your business only
      select = `select * from ordersTable where hotelOwnerId='${userId}' and (orderStatus='ordered' or (cancellationNotificationSent='prepared' and orderStatus='cancelled by user'))`;
    }

    //  `CREATE TABLE IF NOT EXISTS employeesTable (jobId INT AUTO_INCREMENT PRIMARY KEY,  employeeId INT NOT NULL,  employerId INT NOT NULL,  TableNumbers VARCHAR(255),  status ENUM('active', 'waiting', 'fired'))`;
    let [resultsOfOrderRecived] = await pool.query(select);
    // console.log("resultsOfOrderRecived", resultsOfOrderRecived);
    let savedOrders = req.query.savedOrders;
    // console.log("savedOrders", savedOrders);
    //Get my order requests to
    if (savedOrders != undefined && savedOrders != null && savedOrders != "")
      savedOrders = JSON.parse(req.query.savedOrders); //orders id saved in browser localstorages

    let bySavedOrders = "";
    select = `SELECT * FROM ordersTable WHERE orderBy='${userId}'  AND (orderStatus='ordered' or (cancellationNotificationSent='prepared' and orderStatus='cancelled by hotel')  or orderStatus='Delivered')`;
    if (Array.isArray(savedOrders)) {
      bySavedOrders = ` OR orderId IN (${savedOrders?.join(",")}))`;
      select = `SELECT * FROM ordersTable WHERE (orderBy='${userId}' ${bySavedOrders} AND (orderStatus='ordered' or (cancellationNotificationSent='prepared' and orderStatus='cancelled by hotel') or orderStatus='Delivered')`;
    }
    let [resultsOfOrderRequest] = await pool.query(select);

    res.json({
      // message: resultsOfOrderRequest,
      resultsOfOrderRequest: resultsOfOrderRequest,
      resultsOfOrderRecived: resultsOfOrderRecived,
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
    let { orderId, orderStatus, deliveryTime, token } = req.body.ORDEREDITEMS;
    // lllllllllllllll
    if (token == "undefined") throw "login first";
    let serevantId = jwt.verify(token, tokenKey);
    let select = `update ordersTable set orderStatus='Delivered',deliveryTime='${deliveryTime}',servedByHotelSide='${serevantId}' where  orderId='${orderId}' and orderStatus='ordered'`;
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
    let searchByMenueItem = `SELECT * FROM  menu_items,hotelServiceUsers where  ProductName LIKE '${targetedSearch}%' and menu_items.ownerId=hotelServiceUsers.id`;
    const [SearchedByProducts] = await pool.query(searchByMenueItem);
    const [results] = await pool.query(select);
    2;
    res.json({ data: results, dataByProductName: SearchedByProducts });
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
app.get("/getTableNumbersByOwnersId", async (req, res) => {
  try {
    let token = req.query.ownerId;
    console.log("token is== ", token);
    if (
      token == "" ||
      token == "null" ||
      token == null ||
      token == undefined ||
      token == "undefined"
    ) {
      return res.json({ data: "not a valied token" });
    }
    let { userId } = jwt.verify(token, tokenKey);
    let select = `select * from TableNumbers where ownerId=?`;
    let values = [userId];
    pool
      .query(select, values)
      .then(([result]) => {
        // console.log(result);
        res.json({ data: result });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.json({ data: "error 67" });
  }
});
app.get("/getTableNumbers", async (req, res) => {
  try {
    let token = req.headers.authorization;
    // console.log("token is== ", token);
    if (
      token == "" ||
      token == "null" ||
      token == null ||
      token == undefined ||
      token == "undefined"
    ) {
      return res.json({ data: "not a valied token" });
    }
    let { userId } = jwt.verify(token, tokenKey);
    let select = `select * from TableNumbers where ownerId=?`;
    let values = [userId];
    pool
      .query(select, values)
      .then(([result]) => {
        // console.log(result);
        res.json({ data: result });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.json({ data: "error 67" });
  }
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

app.put("/editItem/:editItemId", upload.single("file"), async (req, res) => {
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

  let query =
      "UPDATE menu_items SET ProductName=?,description=?,price=?,imageUrl=?,filesName=?,ownerId=?  WHERE id = ?",
    queryValues = [
      ProductName,
      description,
      price,
      imageUrl,
      fileName,
      userId,
      editItemId,
    ];
  // Delete the previous file if it exists
  if (req.file)
    await pool
      .query("SELECT filesName FROM menu_items WHERE id = ?", [editItemId])
      .then(([result]) => {
        const previousFileName = result[0].filesName;
        if (
          previousFileName !== "NoFile" &&
          previousFileName != undefined &&
          previousFileName != "null" &&
          previousFileName != null &&
          req.file != "undefined"
        ) {
          const previousFilePath = path.join(uploadDir, previousFileName);
          fs.unlinkSync(previousFilePath);
          console.log("Previous file deleted:", previousFileName);
        }
      })
      .catch((error) => {
        console.error("Error deleting previous file: ", error);
      });
  else {
    query =
      "UPDATE menu_items SET ProductName=?,description=?,price=?,imageUrl=?,ownerId=?  WHERE id = ?";
    queryValues = [
      ProductName,
      description,
      price,
      imageUrl,
      userId,
      editItemId,
    ];
  }
  pool
    .query(query, queryValues)
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
  try {
    let { token, orderId, canceledBy, cancellationTime } = req.body;

    let update = `update ordersTable set orderStatus='${canceledBy}',cancellationTime='${cancellationTime}',cancellationNotificationSent='prepared' where orderId='${orderId}' and orderStatus ='ordered'`;
    if ((canceledBy = `cancelled by hotel`)) {
      if (
        token == null ||
        token == undefined ||
        token == "" ||
        token == "null"
      ) {
        // if login is nececcery enable the following data
        return res.json({ data: "Please login first." });
      }
      let { userId } = jwt.verify(token, tokenKey);
      update = `update ordersTable set orderStatus='${canceledBy}',cancellationTime='${cancellationTime}',
    	servedByHotelSide='${userId}'
    cancellationNotificationSent='prepared' where orderId='${orderId}' and orderStatus ='ordered'`;
    }

    pool
      .query(update)
      .then(([results]) => {
        if (results.affectedRows >= 0) res.json({ data: "updated" });
      })
      .catch((error) => {
        console.log(error);
        res.json({ data: "data" });
      });
  } catch (error) {
    console.log("error", error);
    res.json({ data: "error no 900" });
  }
});
// Route for generating reset code
app.post("/generate-code", async (req, res) => {
  const { phoneNumber } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000);
  try {
    // Store the reset code in the database  hotelServiceUsers passwordResetPin;
    await pool.query(
      "update hotelServiceUsers set passwordResetPin=? where phoneNumber=?",
      [resetCode, phoneNumber]
    );
    // TODO: Send the reset code to the user (e.g., via SMS or email)
    res.json({ message: "Reset code generated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});
// Route for verifying reset code
app.post("/verify-code", async (req, res) => {
  const { phoneNumber, resetCode } = req.body;

  try {
    // Check if the reset code matches the one stored in the database
    const [rows] = await pool.query(
      "SELECT * FROM hotelServiceUsers WHERE phoneNumber = ? AND passwordResetPin = ?",
      [phoneNumber, resetCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Invalid reset code." });
    }

    res.json({ message: "Reset code verified successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});

// Route for resetting password
app.post("/reset-password", async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  try {
    const currentlyHashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password in the database
    await pool.query(
      "UPDATE hotelServiceUsers SET password = ? WHERE phoneNumber= ?",
      [currentlyHashedPassword, phoneNumber]
    );

    // TODO: Perform additional password reset logic if needed

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});
app.get("/getUsers", (req, res) => {
  let token = req.headers.authorization;
  console.log("token", token);
  let { userId } = jwt.verify(token, tokenKey);
  let select = `select * from hotelServiceUsers where id='${userId}'`;
  pool
    .query(select)
    .then(([results]) => {
      let Authority = results[0]?.Authority;
      if (Authority == "Admin") {
        select = `select * from hotelServiceUsers`;
        pool
          .query(select)
          .then(([responces]) => {
            res.json({ data: responces });
          })
          .catch((error) => {
            console.log(error);
            res.json({ data: "Error on data" });
          });
      } else {
        res.json({ data: "sorry page not found" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
  // res.json({ data: [{ id: "opopopo", name: "mmm", email: "email" }] });
});
app.get("/getfoodItems", (req, res) => {
  let token = req.headers.authorization;
  console.log("token", token);
  let { userId } = jwt.verify(token, tokenKey);
  //  SELECT * FROM menu_items
  let select = `select * from hotelServiceUsers where id='${userId}'`;
  pool
    .query(select)
    .then(([results]) => {
      let Authority = results[0]?.Authority;
      if (Authority == "Admin") {
        select = `SELECT * FROM menu_items`;
        pool
          .query(select)
          .then(([responces]) => {
            res.json({ data: responces });
          })
          .catch((error) => {
            console.log(error);
            res.json({ data: "Error on data" });
          });
      } else {
        res.json({ data: "sorry page not found" });
      }
    })
    .catch((error) => {
      console.log(error);
    });

  // res.json({
  //   data: [
  //     {
  //       id: "opopopo",
  //       name: "mmm",
  //       description: "description description description",
  //     },
  //   ],
  // });
});
app.delete("/deleteUsers/:userId", (req, res) => {
  const userId = req.params.userId;
  let { action } = req.query;
  console.log(action);
  let update = `update hotelServiceUsers  set status='${action}' where id='${userId}'`;
  pool
    .query(update)
    .then(([results]) => {
      res.json({ data: results });
    })
    .catch((error) => {
      res.json({ data: "error" });
    });
});
app.delete("/deletefoodItems", (req, res) => {
  res.json({ data: "deletefoodItems" });
});
app.put("/verifyCancellationByUser", (req, res) => {
  // res.json({ data: req.body.orderItems });
  let { cancellationNotificationSent, orderId, token, hotelOwnerId } =
    req.body.orderItems;
  // console.groupEnd(token);
  let { userId } = jwt.verify(token, tokenKey);
  let updateOrders = `update ordersTable set cancellationNotificationSent='verified' where orderId='${orderId}' and cancellationNotificationSent='${cancellationNotificationSent}' and hotelOwnerId='${userId}'`;
  console.log("updateOrders", updateOrders);
  pool
    .query(updateOrders)
    .then(([results]) => {
      if (results.affectedRows > 0) {
        res.json({ data: "updated" });
      } else {
        res.json({ data: "data not found" });
      }
    })
    .catch((error) => {
      console.log("error is ", error);
      res.json({ data: "error" });
    });
});
app.put("/verifyCancellationByHotel", (req, res) => {
  // res.json({ data: req.body });
  let { token, item } = req.body,
    userId = 0,
    { orderId } = item;
  if (
    token != undefined &&
    token != "null" &&
    token != "" &&
    token != "undefined" &&
    token != null
  ) {
    userId = jwt.verify(token, tokenKey).userId;
    // res.json({ data: userId });
  } else {
    // return res.json({ data: "please login first" });
  }
  let update = `update ordersTable set cancellationNotificationSent='verified' where orderId='${orderId}' and orderBy='${userId}'`,
    { orderContent } = item;

  if (userId == 0) {
    update = `update ordersTable set cancellationNotificationSent='verified' where orderId='${orderId}' and orderContent='${orderContent}'`;
  }
  pool
    .query(update)
    .then(([data]) => {
      if (data.affectedRows > 0) res.json({ data: "updated" });
      else {
        res.json({ data: "not found" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.put("/verifyDeliveryofItemsByHotel", (req, res) => {
  console.log(req.body);
  let { item, token } = req.body,
    { orderId } = item;
  let userId = "";
  if (
    token !== "null" &&
    token !== null &&
    token !== "" &&
    token !== undefined &&
    token !== "undefined"
  ) {
    userId = jwt.verify(token, tokenKey);
  }

  // orderId: 21;
  // orderStatus: "Delivered";
  let Update = `update ordersTable set orderStatus='verified' where orderId='${orderId}'`;
  pool
    .query(Update)
    .then(([results]) => {
      if (results.affectedRows > 0) {
        res.json({ data: "updated" });
      } else {
        res.json({ data: "not found", Update });
      }
      console.log("results", results);
    })
    .catch((error) => {
      res.json({ data: "error" });
    });
});

// Route for getting a password reset PIN
app.get("/getPasswordResetPin", (req, res) => {
  // Check if the phone number exists in the database
  pool
    .query(
      "SELECT passwordResetPin, phoneNumber FROM hotelServiceUsers where passwordResetPin !='' && passwordResetPin !='password sent' ORDER BY id LIMIT 10"
    )
    .then(([results]) => {
      // console.log(results);
      if (results.length === 0) {
        console.error("No password reset PINS found.");
        res.status(404).json({ error: "No password reset PINS found." });
        return;
      }

      // Return the password reset PINS to the client
      let phoneNumber = results[0].phoneNumber,
        pinCode = results[0].passwordResetPin;
      res.json({ phoneNumber, pinCode });
    })
    .catch((error) => {
      console.error("Failed to get password reset PINS:", error);
      res.status(500).json({ error: "Failed to get password reset PINS." });
    });
});
app.get("/getMyTransaction", (req, res) => {
  console.log("req.query", req.query);
  let { fromDate, toDate } = req.query;
  let token = req.headers.authorization;
  if (token == null) return res.json({ data: "unable to login" });
  let { userId } = jwt.verify(token, tokenKey);
  let select = `SELECT * FROM ordersTable WHERE hotelOwnerId=${userId} AND orderedTime BETWEEN '${fromDate} 00:00:00' AND '${toDate} 00:00:00'`;
  console.log("select", select);
  pool
    .query(select)
    .then(([results]) => {
      if (results.length > 0) res.json({ data: results });
      else res.json({ data: "no data found" });
    })
    .catch((error) => {
      console.log("error", error);
      res.json({ data: "error" });
    });
});
app.get("/searchEmployees", (req, res) => {
  let NameOrPhone = req.query.NameOrPhone,
    token = req.headers.authorization;
  NameOrPhone = NameOrPhone.toString();
  NameOrPhone = NameOrPhone.replace(" ", "");
  console.log("NameOrPhone", typeof NameOrPhone);
  if (NameOrPhone.startsWith("0")) {
    NameOrPhone = NameOrPhone.substring(1);
  }
  if (
    token == "" ||
    token == "null" ||
    token == null ||
    token == undefined ||
    token == "undefined"
  ) {
    return res.json({ data: "loginFirst" });
  }
  let select = `select * from hotelServiceUsers where phoneNumber 
  like '%${NameOrPhone}%' or usersFullName like '%${NameOrPhone}%' or phoneNumber like '${NameOrPhone}%'`;
  pool
    .query(select)
    .then(([results]) => {
      let { userId } = jwt.verify(token, tokenKey);
      let get = `select * from employeesTable,hotelServiceUsers where employerId='${userId}' and id=employeeId `;
      // let get = `select * from employeesTable where employerId='${userId}'`;
      pool
        .query(get)
        .then(([data]) => {
          res.json({ data: results, myEmployees: data });
          // res.json({ data: data });
          // console.log(data);
        })
        .catch((error) => {
          res.json({ data: "error" });
          console.log(error);
        });
    })
    .catch((error) => {
      res.json({ data: "error" });
    });
  // res.json({ data: req.headers.authorization });
});
app.put("/addEmployees", (req, res) => {
  try {
    let { token, employee } = req.body;
    let { userId } = jwt.verify(token, tokenKey);
    let { id } = employee;
    console.log(userId);
    let select = `select * from employeesTable where employeeId='${id}' and employerId='${userId}'`;
    pool
      .query(select)
      .then(([responces]) => {
        if (responces.length > 0) {
          return res.json({ data: "already employee" });
        }
        let insert = `insert into employeesTable (employeeId, employerId, status) values(?,?,?)`,
          values = [id, userId, "active"];
        pool
          .query(insert, values)
          .then(([results]) => {
            if (results.affectedRows > 0) res.json({ data: "EmployeeAdded" });
            else res.json({ data: "unableToaddEmployees" });
          })
          .catch((error) => {
            console.log("error", error);
            res.json({ data: "error no 56" });
          });
      })
      .catch((error) => {
        console.log(error);
        res.json({ data: "error no 34" });
      });
  } catch (error) {
    res.json({ data: "error no 33" });
  }
});
app.get("/getMyEmployees", (req, res) => {
  let token = req.headers.authorization;
  console.log("token", token);
  // return;
  let { userId } = jwt.verify(token, tokenKey);
  let get = `select * from employeesTable,hotelServiceUsers where employerId='${userId}' and id=employeeId `;
  pool
    .query(get)
    .then(([data]) => {
      res.json({ data: data });
      console.log(data);
    })
    .catch((error) => {
      res.json({ data: "error" });
      console.log(error);
    });
  // res.json({ data: req.body });
});
app.delete("/removeMyemployee", (req, res) => {
  // console.log(first)
  console.log("req.body", req.body.token);
  let { employee, token } = req.body;
  if (
    token == "" ||
    token == "null" ||
    token == "undefined" ||
    token == null ||
    token == undefined
  ) {
    return res.json({ data: "login first" });
  }
  let { id } = employee;
  let { userId } = jwt.verify(token, tokenKey);
  let deleteSQL = `delete from employeesTable where employeeId='${id}' and   employerId='${userId}'`;
  pool
    .query(deleteSQL)
    .then(([data]) => {
      if (data.affectedRows > 0) {
        res.json({ data: "deleted succesfully" });
      } else res.json({ data: "no data found" });
    })
    .catch((error) => {});
  // res.json({ data: req.body });
});
app.put("/addTableNumbersToEmployee", (req, res) => {
  let { selectedTableNumbers, SelectedEmployee } = req.body;
  let { jobId } = SelectedEmployee;
  let update = `update employeesTable set TableNumbers='${JSON.stringify(
    selectedTableNumbers
  )}' where jobId='${jobId}'`;
  pool
    .query(update)
    .then(([data]) => {
      if (data.affectedRows > 0) res.json({ data: "updated successfully" });
      else res.json({ data: "data not found" });
      console.log(data);
    })
    .catch((error) => {
      res.json({ data: "error", error: "error" });
      console.log(error);
    });
});
