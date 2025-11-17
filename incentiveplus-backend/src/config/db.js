import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("DB_USER LIDO DO ENV:", process.env.DB_USER);
console.log("DB_NAME LIDO DO ENV:", process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
