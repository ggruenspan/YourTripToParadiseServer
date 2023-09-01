// app\utility\jwtSign.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.jwtSign = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET_OR_KEY || 'your-trip-to-paradise', { expiresIn: '2h' }, (err, token) => {
            if(err) { reject(err); } 
            else { resolve(token); }
        });
    })
}