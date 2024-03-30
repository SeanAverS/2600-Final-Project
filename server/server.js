const express = require("express");
const cors = require("cors");
const axios = require("axios");
const config = require("./config/config");
const utils = require("./utils");

const app = express();

app.use(cors());
app.use(express.static(config.ROOT));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((request, response, next) => {
    utils.logRequest(request);
    next();
});

// Import homeController and memberController
const homeController = require(`${__dirname}/../controllers/homeController`);
const memberController = require(`${__dirname}/../controllers/memberController`);
app.use(homeController);
app.use(memberController);

// signup endpoint
app.post("/signup", async (req, res) => {
    try {
        // user input
        const { email, password } = req.body;

        // validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const hashedPassword = await utils.hashPassword(password);

        const newUser = await db.createUser(email, hashedPassword);

        res.status(201).json({ success: "User created successfully" });
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).json({ error: "Failed to sign up user" });
    }
});

// Endpoint to fetch nearby restaurants
app.get("/restaurants", async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        // axios
        const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
            params: {
                location: `${latitude},${longitude}`,
                radius: 5000, 
                type: "restaurant",
                key: config.GOOGLE_PLACES_API_KEY
            }
        });

        // restaurant data 
        const restaurants = response.data.results.map(result => ({
            name: result.name,
            address: result.vicinity,
        }));

        // nearby restaurants
        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching nearby restaurants:", error);
        res.status(500).json({ error: "Failed to fetch nearby restaurants" });
    }
});

// Start Node.js HTTP webapp
app.listen(config.PORT, "localhost", () => {
    console.log(`App listening on port ${config.PORT}`);
});
