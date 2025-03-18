import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const databasePassword = process.env.databasePassowrd;
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ERTH E-waste Management System",
  password: databasePassword,
  port: 5432,
});

export default pool;