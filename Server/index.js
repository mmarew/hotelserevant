const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3001;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const tokenKey = "@#3<lop>";
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "HotelSerevant",
});
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "masetawoshacom",
//   password: "D4CvKs0j2=x,",
//   database: "masetawoshacom_HotelSerevant	",
// });
// username: "masetawoshacom";
// password: "D4CvKs0j2=x,";
// const bcrypt = require("bcrypt");

app.get("/", (req, res) => {
  res.json("it is working well");
});

app.post("/login", async (req, res) => {
  const connection = await pool.getConnection();
  let { username, password } = req.body;
  try {
    const [rows] = await connection.query(
      `SELECT * FROM hotelServiceUsers WHERE phoneNumber='${username}'`
    );
    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ userId: user.id }, tokenKey);
        let fullName = user.usersFullName;
        res.json({ data: "success", token, fullName });
      } else {
        res.json({ data: "WrongPassword" });
      }
    } else {
      res.json({ data: "unregisteredPhoneNumber" });
    }
  } catch (error) {
    res.json({ data: "error", error });
  } finally {
    connection.release();
  }
});

app.get("/menu", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM menu_items");
    connection.release();
    res.json({ data: rows });
  } catch (error) {
    console.error("Error while fetching menu items: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/registerMenueItems", (req, res) => {
  // Example menu items data
  console.log("req.body", req.body);
  // return;
  // Call the function to insert menu items into the table
  insertMenuItems([req.body], res);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Function to create the menu_items table
async function CreateTables() {
  try {
    const connection = await pool.getConnection();
    // SQL query to create the table
    // ProductName, description, price, image;
    // payed;
    let createOrderTable =
      "CREATE TABLE if not exists ordersTable (orderId INT AUTO_INCREMENT PRIMARY KEY,orderBy int not null, hotelOwnerId int not null, orderContent VARCHAR(2555) NOT NULL,orderStatus VARCHAR(255) NOT NULL default 'ordered' )";
    let [results] = await connection.query(createOrderTable);
    if (results) {
      console.log("ordersTable created well");
    }
    const createTableQuery = `
      CREATE TABLE if not exists menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        ownerId VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL
      );
    `;
    let usersTable = `CREATE TABLE IF NOT EXISTS hotelServiceUsers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usersFullName VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(255) NOT NULL
)`;

    [results] = await connection.query(usersTable);
    if (results) {
      console.log("hotelServiceUsers created well");
    }
    await connection.query(createTableQuery);

    connection.release();

    console.log("menu_items table created successfully.");
  } catch (error) {
    console.error("Error creating menu_items table:", error);
  }
}
// Call the function to create the table
CreateTables();

const insertMenuItems = async (menuItem, res) => {
  const connection = await pool.getConnection();
  try {
    console.log("menuItem", menuItem);
    const { token, ProductName, description, price, imageUrl, ownerId } =
      menuItem[0];
    // const userId = jwt.verify(token, "@#3<lop>");
    if (token == "") return res.json({ data: "please login first" });
    const { userId } = jwt.verify(token, tokenKey);
    console.log("userId", userId);
    // return;
    const verifySql = `select * from hotelServiceUsers where id='${userId}'`;
    let [results] = await connection.query(verifySql);
    console.log("selectValues=selectValues", results);
    if (results.length == 0)
      return res.json({ data: "this phone number is not registerd before." });

    const query = `INSERT INTO menu_items (ProductName, description, price, imageUrl, ownerId, status)

               VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      ProductName,
      description,
      price,
      imageUrl,
      userId,
      "available",
    ];

    [results] = await connection.query(query, values);
    res.json({ message: "Menu item added successfully", results });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};
app.get("/getMenuItems", async (req, res) => {
  const token = req.headers.authorization;
  let { userId } = jwt.verify(token, tokenKey);
  // console.log("userId", userId, "token", token);
  // return;
  const connection = await pool.getConnection();
  let query = `SELECT * FROM menu_items where ownerId='${userId}'`;
  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});

app.post("/registerUsers", async (req, res) => {
  const { fullName, password, phoneNumber } = req.body;
  console.log(
    "fullName, password, phoneNumber",
    fullName,
    password,
    phoneNumber
  );
  const checkQuery = `
    SELECT phoneNumber FROM hotelServiceUsers WHERE phoneNumber = ?
  `;
  const insertQuery = `
    INSERT INTO hotelServiceUsers (usersFullName, password, status, phoneNumber)
    VALUES (?, ?, 'active', ?)
  `;

  try {
    const connection = await pool.getConnection();
    // Check if the phoneNumber already exists
    const [checkResults] = await connection.query(checkQuery, [phoneNumber]);
    console.log("checkResults", checkResults);
    if (checkResults.length > 0) {
      connection.release();
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user with the hashed password
    const [insertResults] = await connection.query(insertQuery, [
      fullName,
      hashedPassword,
      phoneNumber,
    ]);

    connection.release();
    res.json(insertResults);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/updateMenueItems", async (req, res) => {
  console.log("req.body", req.body);
  // return;
  const { id, token, ProductName, description, price, imageUrl } = req.body;
  const { userId } = jwt.verify(token, tokenKey);
  console.log("userId", userId);
  const connection = await pool.getConnection();
  let updateQuery = `update menu_items set ProductName=?,description=?,price=?,imageUrl=? where id=? `;
  let updateValues = [ProductName, description, price, imageUrl, id];

  let [results] = await connection.query(updateQuery, updateValues);
  res.json({ data: results });
  connection.release();
});

app.put("/orderToKitchen", async (req, res) => {
  try {
    const { OrderBasket, token } = req.body;
    const { userId } = jwt.verify(token, tokenKey);
    const sqlToInsert = `INSERT INTO ordersTable (orderBy, hotelOwnerId, orderContent) VALUES (?, ?, ?)`;
    const orderValues = [
      userId,
      OrderBasket[0].ownerId,
      JSON.stringify(OrderBasket),
    ];
    const connection = await pool.getConnection();
    await connection.query(sqlToInsert, orderValues);
    connection.release();
    res.json({ data: "inserted" });
  } catch (error) {
    console.error("Error inserting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getRecivedOrders", async (req, res) => {
  try {
    const token = req.headers.authorization;
    let { userId } = jwt.verify(token, tokenKey);
    // Process the token or perform any required actions
    // Send the response
    let select = `select * from ordersTable where hotelOwnerId='${userId}' and orderStatus='ordered'`;
    const connection = await pool.getConnection();
    let [results] = await connection.query(select);

    res.json({ message: results });
    connection.release();
  } catch (error) {}
});
app.get("/getWaitingOrders", async (req, res) => {
  try {
    const token = req.headers.authorization;
    let { userId } = jwt.verify(token, tokenKey);
    // Process the token or perform any required actions
    // Send the response
    let select = `select * from ordersTable where orderBy='${userId}' and orderStatus='ordered'`;
    const connection = await pool.getConnection();
    let [results] = await connection.query(select);

    // ordersTable (orderId INT AUTO_INCREMENT PRIMARY KEY,orderBy int not null, hotelOwnerId int not null, orderContent VARCHAR(2555) NOT NULL,orderStatus VARCHAR(255) NOT NULL default 'ordered' )";
    res.json({ message: results });
    connection.release();
  } catch (error) {}
});
app.get("/getMyprofile", async (req, res) => {
  try {
    let token = req.headers.authorization;
    let { userId } = jwt.verify(token, tokenKey);
    console.log("userId", userId);
    const connection = await pool.getConnection();
    // res.json({ data: req.headers.authorization });
    let select = `select * from hotelServiceUsers where id=${userId}`;
    let [results] = await connection.query(select);
    res.json({ data: results });
    connection.release();
    // used to update user profiles
  } catch (error) {
    console.log("error", error);
  }
});
app.put("/updateUsersProfile", async (req, res) => {
  let { usersFullName, OldPassword, phoneNumber, NewPassword, id } = req.body;
  const connection = await pool.getConnection();
  let getSavedPassword = `select * from hotelServiceUsers where id='${id}'`;
  let [results] = await connection.query(getSavedPassword);
  let savedHashPassword = "";
  // verify phoneNumber if it is reserved by other users
  if (results.length > 0) {
    savedHashPassword = results[0].password;
  } else {
    return res.json({ data: "You ar not a registered user" });
  }
  let sqlVerifyPhone = `select * from hotelServiceUsers where phoneNumber='${phoneNumber}'`;
  [results] = await connection.query(sqlVerifyPhone);
  if (results.length > 1 || results[0].id != id) {
    return res.json({ data: "This Phone number is reserved by other user" });
  } else
    bcrypt.compare(OldPassword, savedHashPassword, async (err, result) => {
      if (err) {
        return res.json({ data: "system error" });
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
        await connection.query(updateUsers);
        res.json({
          data: "Data updated successfully",
          NewPassword: NewPassword,
        });
      } else {
        res.json({ data: "wrong password" });
      }
    });
  connection.release();
  //  usersFullName VARCHAR(255) NOT NULL,
  // password VARCHAR(255) NOT NULL,
  // status VARCHAR(255) NOT NULL,
  // phoneNumber VARCHAR(255) NOT NULL
});
app.put("/updateDeliverySuccess", async (req, res) => {
  // orderId: 1;
  // orderStatus: "ordered";
  const connection = await pool.getConnection();
  try {
    let { orderId, orderStatus } = req.body.ORDEREDITEMS;
    let select = `update ordersTable set orderStatus='Delivered' where  orderId='${orderId}' and orderStatus='ordered'`;
    let responce = await connection.query(select);
    // ordersTable (orderId INT AUTO_INCREMENT PRIMARY KEY,orderBy int not null, hotelOwnerId int not null, orderContent VARCHAR(2555) NOT NULL,orderStatus VARCHAR(255) NOT NULL default 'ordered' )";
    res.json({ data: "SUCCESS", responce });
    connection.release();
  } catch (error) {
    console.log("errors are ", error);
    connection.release();
  }
});

app.post("/deleteMenueItem", async (req, res) => {
  console.log("req.body", req.body.item);
  // return;
  const connection = await pool.getConnection();
  try {
    let { token } = req.body.item;
    let { userId } = jwt.verify(token, tokenKey);

    let { id } = req.body.item;
    let sqlTodelete = `delete from menu_items where id='${id}'`;
    let [results] = await connection.query(sqlTodelete);
    console.log("SELECT", results);
    let query = `SELECT * FROM menu_items where ownerId='${userId}'`;
    [results] = await connection.query(query);
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
    connection.release();
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});
