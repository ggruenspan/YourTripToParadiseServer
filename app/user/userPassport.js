// app\user\userPassport.js

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/userSchema.js') 

// Set options for JWT authentication strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_OR_KEY || 'your-trip-to-paradise'
};

// Export the passport configuration function
const passport_user = new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
    .then(user => {
        if(user){
            return done(null, user);
        }
            return done(null, false);
    })
    .catch(err => {
        throw new Error(err)
    });
});

module.exports = {
    passport_user
};