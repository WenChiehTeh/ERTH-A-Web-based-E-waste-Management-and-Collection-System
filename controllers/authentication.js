import pool from "../config/database.js";
import bcrypt from "bcrypt";

//Number of times to salt each password
const saltRounds = 10;

//Query to insert users
export const insertUser = async (email, password) => {
  const client = await pool.connect();
  try {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log("Error hashing password:" , err)
      } else {
        const res = await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash]);
      }
    })
  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    client.release();
  }
};

//Authenticate users
export const checkPassword = async (email, loginPassword) => {
  try {
    const getUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (getUser.rows.length === 0) {
      return 0;
    } else {
      const user = getUser.rows[0];
      const storedPassword = user.password;

      const result = await bcrypt.compare(loginPassword, storedPassword);
      
      if (result) {
        return 1;
      } else {
        return 2;
      }
    }
  } catch (error) {
    console.error("Error checking password:", error);
    return -1;
  }
};