import express from "express";
import dotenv from "dotenv"; 
import { validateAddress } from "../controllers/addressVerifier.js";
import Stripe from "stripe";
import pool from "../config/database.js";

const router = express.Router();

//load API keys
dotenv.config();
const stripeAPI = process.env.stripeAPI

//create Stripe object
const stripe = new Stripe(stripeAPI);

//route to make collection request page
router.get("/makeCollectionRequest", (req, res) => {
    const data = {
        points: req.user.points,
    };
    res.render("makeCollectionRequest.ejs", data);
});

//Card payment route
router.post("/paymentCard", async (req, res) => {
    try {
        //load all the items into memory
        const { item, quantity, date, firstName, lastName, phoneNo, addressLine1, addressLine2, postcode, area, state, payment } = req.body;
        var paymentMethod = [];
        paymentMethod.push(payment);

        //parse address
        var address = addressLine1 + "," + addressLine2 + "," + area;
        var addressSQL = addressLine1 + "," + addressLine2 + "," + postcode + "," + area + "," + state + ", Malaysia";

        //check if address is valid using Google Maps API
        let isValid = await validateAddress(address);

        //if is valid continue to payment
        if (isValid) {
            //create payment session with payment details
            const session = await stripe.checkout.sessions.create({
                payment_method_types: paymentMethod,
                mode: 'payment',
                line_items: [{
                    price_data: {
                        currency: 'myr',
                        product_data: {
                            name: "Pickup Fee"
                        },
                        unit_amount: 1000 
                    },
                    quantity: 1
                }],
                success_url: `http://localhost:3000/cardSuccess?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: "http://localhost:3000/responses/cardFail",
            });

            //try to insert new row in database
            try {
                //query to insert into collection request
                const insertRequest = await pool.query("INSERT INTO collectionRequests(sessionId, date, firstName, lastName, phoneNo, address, state, status, userId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id", [session.id, date, firstName, lastName, phoneNo, addressSQL, state, "payment", req.user.id]);

                //save the auto incremented id into memory
                const id = insertRequest.rows[0].id; 

                const updatePoints = await pool.query("UPDATE users SET points = points + 200 WHERE id = $1", [req.user.id]);

                //insert each item into collection request items
                for (var i = 0; i < item.length; i++) {
                    const insertItems = await pool.query("INSERT INTO collectionRequestsItems(item, quantity, requestId) VALUES ($1, $2, $3)", [item[i], quantity[i], id])
                } 
            } catch (e) {
                //catch any errors
                console.error("Error inserting new collection request:", e);
            }

            //redirect user to stripe payment gateway
            res.redirect(session.url);
        } else {
            //if user address is rejected by Google Maps API
            const data = {
                message : "address",
            };
            res.render("responses/requestFailed.ejs", data);
        }
    } catch (e) {
        //catch any errors when making payment
        console.error("Error in paymentCard route:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/cardFail", (req, res) => {
    res.render("responses/requestFailed.ejs");
});

router.post("/update-payment-status", async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: "Missing session ID" });
    }

    try {
        const result = await pool.query(
            "UPDATE collectionRequests SET status = $1 WHERE sessionId = $2 RETURNING *",
            ["pending", session_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Session ID not found" });
        }

        res.json({ success: true, redirectUrl: "/cardSuccess" });

    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/cardSuccess", (req, res) => {
    res.render("responses/paymentSuccess.ejs");
});

export default router;

