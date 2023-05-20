const mysql = require("mysql2"); //require SQL for my database and queries
require("dotenv").config(); //require dot env to allow me to not write my login credentials in a file tracked by git

const employeeDB = mysql.createConnection({
  //connect using credentials in .env file
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = employeeDB; //all this to be used in other files when required in
