// app\models\userSchema.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: String,
    password: String,
    accountSetting: {
        personalInfo: {
            firstName: String,
            lastName: String,
            email: {
                type: String,
                unique: true
            },
            phone: String,
            dof: String,
            address: String
        },
        loginHistory: [{
            _id: false,
            dateTime: Date,
            userAgent: String
        }],
        resetToken: String,
        resetTokenExpiration: Date,
    }
});

module.exports = userSchema;