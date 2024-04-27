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
            return response.status(400).json({ error: `<span class="text-secondary" style="font-size:16px">${email} already exists. Please choose a different email.</span>` });
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

        let passwordMatch = "";
        let isAdmin = false;

        if (!user) {
            // verify admin email
            const adminDB = client.db(config.DATABASE).collection('adminInfo');
            const adminEmail = await adminDB.findOne({ email });

            // verify admin password
            if (adminEmail) {
                passwordMatch = await bcrypt.compare(password, adminEmail.password);

                console.log(passwordMatch ? "admin signed in" : "wrong admin password");
                isAdmin = passwordMatch ? true : false;
            }
        } else { // verify member password
            passwordMatch = await bcrypt.compare(password, user.password);
            console.log("member signed in");
        } // wrong email || password goes to 500 error


        if (!passwordMatch) {
            return response.status(400).json({ error: `<span class="text-secondary" style="font-size:16px">Please re-enter your email or password.</span>` });
        }
        response.status(200).json({ success: `${email} logged in successfully!` });
    } catch (error) {
        console.error('Error during signin:', error);
        response.status(500).json({ error: `<span class="text-secondary" style="font-size:16px">Please re-enter your email or password.</span>` });
    }
});

memberController.post('/signout', (request, response) => {
    console.log('signing out')
    email = request.body.email
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