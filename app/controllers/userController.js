const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    userName: String,
    password: String,
    accountSetting: {
        personalInfo: {
            firstName: String,
            lastName: String,
            email: {
                type: String,
                unique:true
            },
            phone: String,
            dof: String,
            address: String
        },
        loginHistory: [{
            dateTime: Date,
            userAgent: String
        }]
    }
});

let User; //to be defined on new connection (see initialize)

function initialize () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_CONN_STR, { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

function register(userData) {
    return new Promise(function (resolve, reject) {
        // console.log(userData);
        if (userData.password !== userData.password2) {
            reject('Passwords do not match');
        }
        else {
            bcrypt.hash(userData.password, 10)
            .then((hash) => {
                let newUser = new User({
                    userName: (userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1)) + "." + userData.lastName[0].toUpperCase(),
                    password: hash,
                    accountSetting: {
                        personalInfo: {
                            firstName: userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1),
                            lastName: userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1),
                            email: userData.email,
                        },
                    },
                });

                newUser.save(newUser)
                .then(() => { resolve(); })
                .catch(err => { 
                    if (err.code == 11000) { reject('There is already a user with that email: ' + userData.email); } 
                    else { reject('There was an error creating the user: ' + err); }
                })
            })
            .catch((err) => {
                reject('There was an error creating the user: ' + err );
            })
        }
    });
};

function signIn(userData) {
    return new Promise((resolve, reject) => {

    });
};

module.exports = {
    initialize,
    register,
    signIn,
}