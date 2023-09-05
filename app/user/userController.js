// app\user\userController.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/userSchema.js')
const User = mongoose.model('users', userSchema);
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        if (user) {
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
        if (!user) {
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

function forgotPassword(req, res) {
    // console.log('forgot password', req.body);

    // Check if the email is in the database
    User.findOne({ "accountSetting.personalInfo.email": req.body.email })
    .then((user) => {
        if (!user) {
            return res.status(400).json('Unable to find user with email: ' + req.body.email);
        }

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expirationTime = new Date();
        // console.log(expirationTime.toLocaleTimeString());
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);
        // console.log(expirationTime.toLocaleTimeString());
        

        // Store the reset token and expiration in the user's document
        user.accountSetting.resetToken = resetToken;
        user.accountSetting.resetTokenExpiration = expirationTime;

        // Save the updated user in the database
        user.save()
        .then(() => {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                to: user.accountSetting.personalInfo.email,
                subject: 'Password Reset',
                html: `
                    <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                    <p><a href="http://localhost:8081/reset-password/${resetToken}">Reset Password Link</a></p>
                    <p>This link is valid for 15 minutes. If you do not reset your password within this time, you will need to request another reset link.</p>
                    <p>If you did not request this, please ignore this email, and your password will remain unchanged.</p>
                `,
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    // console.error(error);
                    return res.status(500).json('An error occurred while sending the password reset email');
                }
                return res.status(200).json('Password reset email sent');
            });

        })
        .catch((error) => {
            // console.error(err);
            return res.status(500).json('An error occurred while saving the reset token');
        });

    })
    .catch((err) => {
        // console.error(err);
        return res.status(500).json('An error occurred while finding the user');
    });
};

function resetPassword(req, res) {
    // console.log('reset password', req.body);

    // Find the user by the reset token and check if it's still valid
    User.findOne({ "accountSetting.resetToken": req.params.token })
    .then((user) => {
        if(user.accountSetting.resetTokenExpiration.toLocaleTimeString() < new Date().toLocaleTimeString()) {
            return res.status(400).json('Invalid or expired token');
        }

        // Check if the new password is the same as the current password
        bcrypt.compare(req.body.password, user.password)
        .then((result) => {
            if(result === false) {
                if (req.body.password !== req.body.password2) {
                    return res.status(400).json('Passwords do not match');
                }

                bcrypt.hash(req.body.password, 10)
                .then((hash) => {
                    // Update the user's password and clear the reset token fields
                    user.password = hash;
                    user.accountSetting.resetToken = undefined;
                    user.accountSetting.resetTokenExpiration = undefined;

                    // Save the updated user in the database
                    user.save()
                    .then(() => {
                        res.status(200).json('Password reset successfully');
                    })
                    .catch((error) => {
                        // console.error(err);
                        return res.status(500).json('An error occurred while resetting you password in');
                    }); 
                })
                .catch((err) => {
                    // console.error(hashErr);
                    return res.status(500).json('An error occurred while resetting you password in');
                });
            } else {
                return res.status(400).json('You cannot use your current password as the new password');
            }
        })
        .catch((err) => {
            // console.error(err);
            return res.status(500).json('An error occurred while resetting you password in');
        });
    })
    .catch((err) => {
        // console.error(err);
        return res.status(500).json('An error occurred while finding the user');
    });
};

module.exports = {
    register,
    signIn,
    forgotPassword,
    resetPassword
}