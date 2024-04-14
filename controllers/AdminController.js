const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const config = require("../server/config/config");
const utils = require("../server/utils");
const adminController = express.Router();

const uri = `mongodb+srv://${config.USERNAME}:${config.PASSWORD}@${config.SERVER}/${config.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);
module.exports = client;

// Middleware to authenticate admin
async function authenticateAdmin(req, res, next) {
    console.log("inside admin authenticate")
    try {
        const { email, password } = req.body;

        const collection = client.db(config.DATABASE).collection('adminInfo');
        const admin = await collection.findOne({ email });


        if (!admin) {
            return res.status(400).json({ error: `Admin not found for email: ${email}` });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Store admin information in the session for future requests
        req.session.admin = admin;

        next();
    } catch (error) {
        console.error('Error during admin authentication:', error);
        res.status(500).json({ error: 'Admin authentication failed' });
    }
}

// rerouted signin for admin
async function handleAdminSignin(req, res) {
    try {
        const { email, password } = req.body;
        // authenticate
        if (email === 'seanAS@yahoo.com' && password === 'password1234') {
            console.log("Admin logged in");
            res.status(200).json({ success: `${email} logged in successfully!` });
        } else {
            // If authentication fails, send error response
            console.log("Admin login failed");
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during admin signin:', error);
        res.status(500).json({ error: 'Admin signin failed' });
    }
}

module.exports = {
    handleAdminSignin: handleAdminSignin
};


// Routes for admin
adminController.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === 'seanAS@yahoo.com' && password === 'password1234') {
            console.log("Admin logged in");
            res.status(200).json({ success: `${email} logged in successfully!` });
        } else {
            console.log("Admin login failed");
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during admin signin:', error);
        res.status(500).json({ error: 'Admin signin failed' });
    }
});


// adminController.post('/createUser', authenticateAdmin, async (req, res) => {
//     try {
//         // Your logic to create a new user (e.g., add to MongoDB)
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ error: 'Failed to create user' });
//     }
// });

module.exports = adminController;
