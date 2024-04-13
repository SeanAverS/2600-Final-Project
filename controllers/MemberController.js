const { MongoClient } = require('mongodb');
const config = require(`${__dirname}/../server/config/config`)
const utils = require(`${__dirname}/../server/utils`)
const user = require(`${__dirname}/../models/user`)
const util = require('../models/util.js')
const express = require("express")
const bcrypt = require("bcrypt")
const memberController = express.Router()
let members = []
let authenticated = []

const uri = `mongodb+srv://${config.USERNAME}:${config.PASSWORD}@${config.SERVER}/${config.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
console.log("uri:" + uri)
const client = new MongoClient(uri);
module.exports = client;

// Route handler for signup
memberController.post('/signup', async (request, response) => {
    try {
        const { email, password } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Using 10 salt rounds

        // access mongoDb collection
        const collection = client.db(config.DATABASE).collection('userInfo');

        // check for existing user
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return response.status(400).json({ error: `${email} already exists. Choose a different email.` });
        }

        await collection.insertOne({ email, password: hashedPassword });

        response.status(201).json({ success: `${email} was added successfully to userInfo.` });
    } catch (error) {
        console.error('Error during signup:', error);
        response.status(500).json({ error: 'Signup failed' });
    }
});

memberController.post('/signin', async (request, response) => {
    try {
        console.log("signing in");
        const { email, password } = request.body;

        const collection = client.db(config.DATABASE).collection('userInfo');
        const user = await collection.findOne({ email });

        if (!user) {
            const adminController = require('./AdminController.js');
            return adminController.authenticateAdmin(req, res, next);
            // return response.status(400).json({ error: `User not found for email: ${email}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return response.status(400).json({ error: 'Invalid credentials' });
        }

        response.status(200).json({ success: `${email} logged in successfully!` });
    } catch (error) {
        console.error('Error during signin:', error);
        response.status(500).json({ error: 'Signin failed' });
    }
});

memberController.post('/signout', (request, response) => {
    console.log('inside /signout')
    email = request.body.email
    console.log("authenticated", authenticated)
    authenticated.splice(authenticated.indexOf(email), 1)
    console.log("authenticated", authenticated)
    response
        .status(200)
        .json({
            success: {
                email: email,
                message: `${email} logout successfully.`,
            },
        })
})
module.exports = memberController