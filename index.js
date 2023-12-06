const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster.4a3qqlb.mongodb.net/registrationFormDB`);

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const registrationSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    password: String,
});

const Registration = mongoose.model('Registration', registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.redirect('/error');
        }

        // Check if the user already exists
        const existingUser = await Registration.findOne({ email: email });

        if (!existingUser) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // If the user does not exist, create a new registration
            const registrationData = new Registration({
                firstname,
                lastname,
                email,
                password: hashedPassword,
            });

            await registrationData.save();
            res.redirect('/success');
        } else {
            // If the user already exists, redirect to the error page
            console.log('User already exists');
            res.redirect('/existingUser');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.redirect('/error');
    }
});

app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/public/success.html');
});

app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/public/error.html');
});

app.get('/existingUser', (req, res) => {
    res.sendFile(__dirname + '/public/existingUser.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});