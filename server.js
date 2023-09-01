// server.js

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userService = require('./app/models/dbInitializer.js');
const passport_user = require('./app/user/userPassport.js');
const usersAPI = require('./app/user/userAPI.js');

// Middleware
var app = express();

app.use(cors({
    origin: 'http://localhost:8081',
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-trip-to-paradise',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());

// MongoDB setup
mongoose.connect(process.env.MONGODB_CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("open", () => {
    console.log('Connected to MongoDB');
});

// Routes
passport.use('passport_user', passport_user);
app.use('/api', usersAPI);

// Start the server
userService.initialize()
.then(() => {
    console.log ('Server Initialized');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch(function(err) {
    console.log(err);
});