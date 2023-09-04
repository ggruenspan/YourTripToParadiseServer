// app\user\userController.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/userSchema.js')
const User = mongoose.model('users', userSchema);

const { jwtSign } = require('../utility/jwtSign.js');

function register(req, res) {
    // console.log('register', req.body);

    // Check if the passwords are the same
    if (req.body.password !== req.body.password2) {
        return res.status(400).json('Passwords do not match');
    }

    // Check if the email is already taken
    User.findOne({ "accountSetting.personalInfo.email": req.body.email })
    .then((user) => {
        if(user) {
            return res.status(400).json('There is already a user with that email: ' + req.body.email);
        }
        
        // Hashes the password
        bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            let newUser = new User({
                userName: (req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1)) + "." + req.body.lastName[0].toUpperCase(),
                password: hash,
                accountSetting: {
                    personalInfo: {
                        firstName: req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1),
                        lastName: req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1),
                        email: req.body.email,
                    },
                },
            });

            newUser.save()
            .then(() => { 
                res.status(201).json('User registered successfully');
            })
            .catch((err) => {
                // console.error(err);
                return res.status(500).json('An error occurred while registering');
            });
        })
        .catch(() => {
            // console.error(hashErr);
            return res.status(500).json('An error occurred while registering');
        })
    })
    .catch((err) => {
        // console.error(err);
        return res.status(500).json('An error occurred while registering');
    })
};

function signIn(req, res) {
    // console.log('signIn', req.body);

    // Check if the email is in the database
    User.findOne({ "accountSetting.personalInfo.email": req.body.email })
    .then((user) => {
        if(!user) {
            return res.status(400).json('Unable to find user with email: ' + req.body.email);
        }

        // Check if password is correct
        bcrypt.compare(req.body.password, user.password)
        .then((result) => {
            if (result === true) {
                const payload = {
                    id: user.id,
                    userName: user.userName,
                    email: user.accountSetting.personalInfo.email,
                }

                user.accountSetting.loginHistory.push({dateTime: new Date(), userAgent: req.get('User-Agent')});
                User.updateOne({ $set: { "accountSetting.loginHistory": user.accountSetting.loginHistory}})
                .then(() => {
                    jwtSign(payload)
                    .then((token) => {
                        res.cookie('token', token, { httpOnly: true });
                        res.status(200).json({ message: 'User signed in successfully', token: `Bearer ${token}` });
                    })
                    .catch((err) => {
                        // console.error(err);
                        return res.status(500).json('An error occurred while signing in');
                    })
                })
                .catch((err) => {
                    // console.error(err);
                    return res.status(500).json('An error occurred while signing in');
                })
            } else {
                // console.error(err);
                return res.status(400).json('Incorrect Password for user: ' + req.body.email);
            }
        })
        .catch((err) => {
            // console.error(err);
            return res.status(500).json('An error occurred while signing in');
        })
    })
    .catch((err) => {
        // console.error(err);
        return res.status(500).json('An error occurred while signing in');
    })
};

module.exports = {
    register,
    signIn,
}