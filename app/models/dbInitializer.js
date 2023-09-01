// app\models\dbInitializer.js

const mongoose = require('mongoose');
const userSchema = require('./userSchema');

function initialize() {
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
}

module.exports = {
    initialize,
};