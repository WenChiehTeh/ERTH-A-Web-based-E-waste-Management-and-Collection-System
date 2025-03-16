import pool from "../index.js";
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