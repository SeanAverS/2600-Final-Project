const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const config = require("../server/config/config");
const utils = require("../server/utils");
const adminController = express.Router();

const uri = `mongodb+srv://${config.USERNAME}:${config.PASSWORD}@${config.SERVER}/${config.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);
module.exports = client;

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


// rerouted signin for admin
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

module.exports = adminController;
