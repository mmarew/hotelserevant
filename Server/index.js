const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3001;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
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
// const bcrypt = require("bcrypt");

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
        const token = jwt.sign({ userId: user.id }, "@#3<lop>", {
          expiresIn: "1h",
        });
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

    let [results] = await connection.query(usersTable);
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
  console.log("menuItem", menuItem);
  // return;
  const { ProductName, description, price, imageUrl, ownerId } = menuItem[0];
  const connection = await pool.getConnection();
  const query = `INSERT INTO menu_items (ProductName, description, price, image, ownerId, status)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [ProductName, description, price, imageUrl, 1, "available"];

  try {
    await connection.query(query, values);
    res.json({ message: "Menu item added successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};
app.get("/getMenuItems", async (req, res) => {
  const connection = await pool.getConnection();
  let query = "SELECT * FROM menu_items";
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
